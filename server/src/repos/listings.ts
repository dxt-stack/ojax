import { query, queryOne, withTx } from "../db/pool.js";
import { HttpError } from "../lib/errors.js";
import { config } from "../config.js";
import { conditionLabel } from "../lib/catalog.js";

const MEDIA_PREFIX = "/uploads/";

export interface ListingDraft {
  title: string;
  description?: string;
  category: string;
  subcategory?: string | null;
  conditionCode?: string;
  priceKobo: number;
  negotiable?: boolean;
  quantity?: number;
  shipAvailable?: boolean;
  meetupLocation?: string | null;
  meetupNotes?: string | null;
}

export interface ListingRow {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string | null;
  condition_code: string;
  price_kobo: string | number;
  negotiable: boolean;
  quantity: number;
  status: string;
  ship_available: boolean;
  meetup_location: string | null;
  meetup_notes: string | null;
  views: number;
  is_featured: boolean;
  created_at: Date;
  updated_at: Date;
  sold_at: Date | null;
  deleted_at: Date | null;
}

const SELLER_SQL = `json_build_object(
  'id', s.id, 'fullName', s.full_name, 'avatarUrl', s.avatar_url, 'universityCode', s.university_code,
  'verified', s.verified, 'isOrg', s.is_org, 'orgName', s.org_name, 'level', s.level, 'department', s.department
)`;

export const LISTING_SELECT = `
  l.id, l.seller_id, l.title, l.description, l.category, l.subcategory, l.condition_code,
  l.price_kobo, l.negotiable, l.quantity, l.status, l.ship_available, l.meetup_location,
  l.meetup_notes, l.views, l.is_featured, l.created_at, l.updated_at, l.sold_at,
  ${SELLER_SQL} AS seller,
  coalesce((SELECT count(*) FROM favorites f WHERE f.listing_id = l.id), 0) AS favorite_count
`;

export const IMAGE_AGG_SQL = `
  json_agg(json_build_object(
    'full_key', u.full_key, 'thumb_key', u.thumb_key, 'position', li.position
  ) ORDER BY li.position) FILTER (WHERE u.id IS NOT NULL) AS image_rows
`;

export interface ImageUrlRow {
  full_key: string;
  thumb_key: string | null;
  position: number;
}

export function imageRowsToUrls(rows: ImageUrlRow[]) {
  return rows
    .sort((a, b) => a.position - b.position)
    .map((r) => ({
      fullUrl: `${MEDIA_PREFIX}${r.full_key}`,
      thumbUrl: r.thumb_key ? `${MEDIA_PREFIX}${r.thumb_key}` : `${MEDIA_PREFIX}${r.full_key}`,
      position: r.position,
    }));
}

export interface SellerJson {
  id: string;
  fullName: string;
  avatarUrl?: string | null;
  universityCode?: string | null;
  verified?: boolean;
  isOrg?: boolean;
  orgName?: string | null;
  department?: string | null;
  level?: string | null;
}

type ListedRow = ListingRow & {
  seller?: SellerJson | null;
  image_rows?: ImageUrlRow[] | null;
  my_fav?: boolean;
  favorite_count?: string | number;
};

export function serializeFull(l: ListedRow) {
  const imgs = imageRowsToUrls(l.image_rows ?? []);
  return {
    id: l.id,
    seller: l.seller ?? null,
    title: l.title,
    description: l.description,
    category: l.category,
    subcategory: l.subcategory,
    condition: l.condition_code,
    conditionLabel: conditionLabel(l.condition_code),
    priceKobo: Number(l.price_kobo),
    negotiable: l.negotiable,
    quantity: Number(l.quantity),
    status: l.status,
    shipAvailable: l.ship_available,
    meetupLocation: l.meetup_location,
    meetupNotes: l.meetup_notes,
    views: Number(l.views),
    featured: l.is_featured,
    favoriteCount: Number(l.favorite_count ?? 0),
    images: imgs,
    coverUrl: imgs[0]?.thumbUrl ?? null,
    createdAt: l.created_at,
    updatedAt: l.updated_at,
    soldAt: l.sold_at,
  };
}

export async function serializeListing(l: ListedRow) {
  return serializeFull(l);
}

// ---------------------------------------------------------------- create

export async function createListing(sellerId: string, d: ListingDraft, uploadIds: string[]): Promise<ListedRow> {
  if (!d.title.trim()) throw HttpError.badRequest("title_required", "Give your item a short, clear title.");
  if (d.priceKobo <= 0) throw HttpError.badRequest("price_required", "Set a price greater than zero.");
  if (d.priceKobo > 100_000_000_00) throw HttpError.badRequest("price_too_high", "That price is beyond our allowed range.");
  if (uploadIds.length > config.maxListingPhotos) {
    throw HttpError.badRequest("too_many_photos", `You can attach up to ${config.maxListingPhotos} photos.`);
  }
  const id = crypto.randomUUID();

  await withTx(async (q) => {
    const rows = await q(
      `INSERT INTO listings
         (id, seller_id, title, description, category, subcategory, condition_code, price_kobo,
          negotiable, quantity, ship_available, meetup_location, meetup_notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id`,
      [
        id, sellerId, d.title.trim(), d.description?.trim() ?? "", d.category, d.subcategory || null,
        d.conditionCode || "used-good", d.priceKobo, !!d.negotiable, d.quantity || 1,
        !!d.shipAvailable, d.meetupLocation || null, d.meetupNotes || null,
      ],
    );
    const listingId = rows[0].id as string;
    for (let i = 0; i < uploadIds.length; i++) {
      await q(
        `INSERT INTO listing_images (listing_id, upload_id, position) VALUES ($1,$2,$3)`,
        [listingId, uploadIds[i], i],
      );
      await q(`UPDATE uploads SET attached = TRUE WHERE id = $1::uuid AND owner_id = $2`, [uploadIds[i], sellerId]);
    }
  });

  return (await fetchListingRow(id)) as ListedRow;
}

async function fetchListingRow(id: string, viewerId?: string | null) {
  const row = await queryOne<ListedRow>(
    `SELECT ${LISTING_SELECT}, ${IMAGE_AGG_SQL},
            coalesce((SELECT TRUE FROM favorites fv WHERE fv.listing_id = l.id AND ($2::uuid IS NOT NULL AND fv.user_id = $2::uuid)), FALSE) AS my_fav
       FROM listings l
       JOIN users s ON s.id = l.seller_id
       LEFT JOIN listing_images li ON li.listing_id = l.id
       LEFT JOIN uploads u ON u.id = li.upload_id
      WHERE l.id = $1 AND l.deleted_at IS NULL
      GROUP BY l.id, s.id`,
    [id, viewerId || null],
  );
  return row;
}

// ---------------------------------------------------------------- search

export interface ListingFilters {
  q?: string;
  category?: string;
  subcategory?: string;
  condition?: string;
  minKobo?: number;
  maxKobo?: number;
  negotiable?: boolean;
  ships?: boolean;
  sellerId?: string;
  status?: string;
  sort?: "newest" | "price_asc" | "price_desc" | "popular";
  page?: number;
  pageSize?: number;
  excludeSellerId?: string;
  onlyFavoritesFor?: string;
  myDrafts?: boolean;
}

export async function searchListings(f: ListingFilters) {
  const page = Math.max(1, f.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, f.pageSize ?? 24));
  const where: string[] = ["l.deleted_at IS NULL", "l.status <> 'deleted'"];
  const params: unknown[] = [];
  const p = (v: unknown) => {
    params.push(v);
    return `$${params.length}`;
  };

  if (f.q?.trim()) {
    const like = `%${f.q.trim()}%`;
    where.push(`(l.title ILIKE ${p(like)} OR l.description ILIKE ${p(like)})`);
  }
  if (f.category) where.push(`l.category = ${p(f.category)}`);
  if (f.subcategory) where.push(`l.subcategory = ${p(f.subcategory)}`);
  if (f.condition) where.push(`l.condition_code = ${p(f.condition)}`);
  if (f.minKobo !== undefined) where.push(`l.price_kobo >= ${p(f.minKobo)}`);
  if (f.maxKobo !== undefined) where.push(`l.price_kobo <= ${p(f.maxKobo)}`);
  if (f.negotiable) where.push(`l.negotiable = TRUE`);
  if (f.ships) where.push(`l.ship_available = TRUE`);
  if (f.sellerId) where.push(`l.seller_id = ${p(f.sellerId)}`);
  if (f.status) where.push(`l.status = ${p(f.status)}`);
  if (f.excludeSellerId) where.push(`l.seller_id <> ${p(f.excludeSellerId)}`);
  if (f.onlyFavoritesFor) {
    where.push(`l.status = 'active'`);
    where.push(`EXISTS (SELECT 1 FROM favorites fv WHERE fv.listing_id = l.id AND fv.user_id = ${p(f.onlyFavoritesFor)})`);
  }
  if (f.myDrafts) {
    where.push(`l.status IN ('active','paused')`);
  }

  const order =
    f.sort === "price_asc" ? "l.price_kobo ASC"
    : f.sort === "price_desc" ? "l.price_kobo DESC"
    : f.sort === "popular"
      ? `(l.views + (SELECT count(*) FROM favorites f WHERE f.listing_id = l.id) * 10) DESC`
      : "l.created_at DESC";

  const whereSql = where.join(" AND ");
  const totalRow = await queryOne<{ count: string }>(
    `SELECT count(*)::text AS count FROM listings l WHERE ${whereSql}`, params);
  const total = Number(totalRow?.count ?? 0);

  const rows = await query<ListedRow>(
    `SELECT ${LISTING_SELECT}, ${IMAGE_AGG_SQL}
       FROM listings l
       JOIN users s ON s.id = l.seller_id
       LEFT JOIN listing_images li ON li.listing_id = l.id
       LEFT JOIN uploads u ON u.id = li.upload_id
      WHERE ${whereSql}
      GROUP BY l.id, s.id
      ORDER BY ${order}
      LIMIT ${p(pageSize)} OFFSET ${p((page - 1) * pageSize)}`,
    params,
  );

  const items = rows.map((r) => {
    const imgs = imageRowsToUrls(r.image_rows ?? []);
    return {
      id: r.id,
      seller: r.seller ?? null,
      title: r.title,
      category: r.category,
      subcategory: r.subcategory,
      condition: r.condition_code,
      priceKobo: Number(r.price_kobo),
      negotiable: r.negotiable,
      quantity: Number(r.quantity),
      status: r.status,
      shipAvailable: r.ship_available,
      meetupLocation: r.meetup_location,
      featured: r.is_featured,
      views: Number(r.views),
      favoriteCount: Number(r.favorite_count ?? 0),
      coverUrl: (imageRowsToUrls(r.image_rows ?? [])[0]?.thumbUrl) ?? null,
      createdAt: r.created_at,
    };
  });

  return { items, total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

// ---------------------------------------------------------------- get / update / delete

export async function getListingById(id: string, viewerId?: string | null, increment = false) {
  const listing = await fetchListingRow(id, viewerId || null);
  if (!listing) throw HttpError.notFound("This listing could not be found.");
  if (increment && (!viewerId || viewerId !== listing.seller_id)) {
    await query(`UPDATE listings SET views = views + 1 WHERE id = $1`, [id]);
    await query(`INSERT INTO listing_view_events (listing_id, viewer_id) VALUES ($1,$2)`, [id, viewerId || null]).catch(() => {});
    listing.views = Number(listing.views) + 1;
  }
  const ser = serializeFull(listing);
  return {
    ...ser,
    isFavorite: !!listing.my_fav,
    myListing: !!viewerId && viewerId === listing.seller_id,
  };
}

export async function assertListingOwned(listingId: string, userId: string): Promise<ListingRow> {
  const row = await queryOne<ListingRow>(
    `SELECT * FROM listings WHERE id = $1 AND seller_id = $2 AND deleted_at IS NULL`, [listingId, userId]);
  if (!row) throw HttpError.notFound("Listing not found or you don't own it.");
  return row;
}

export async function updateListing(
  listingId: string,
  userId: string,
  d: Partial<ListingDraft> & { status?: "active" | "paused" },
  newUploadIds?: string[],
) {
  await assertListingOwned(listingId, userId);
  const sets: string[] = [];
  const vals: unknown[] = [];
  const add = (col: string, v: unknown) => {
    sets.push(`${col} = $${vals.length + 1}`);
    vals.push(v);
  };
  if (d.title !== undefined) add("title", d.title.trim());
  if (d.description !== undefined) add("description", d.description?.trim() ?? "");
  if (d.category !== undefined) add("category", d.category);
  if (d.subcategory !== undefined) add("subcategory", d.subcategory || null);
  if (d.conditionCode !== undefined) add("condition_code", d.conditionCode);
  if (d.priceKobo !== undefined) add("price_kobo", d.priceKobo);
  if (d.negotiable !== undefined) add("negotiable", d.negotiable);
  if (d.quantity !== undefined) add("quantity", d.quantity);
  if (d.shipAvailable !== undefined) add("ship_available", d.shipAvailable);
  if (d.meetupLocation !== undefined) add("meetup_location", d.meetupLocation || null);
  if (d.meetupNotes !== undefined) add("meetup_notes", d.meetupNotes || null);
  if (d.status !== undefined) add("status", d.status);
  if (!sets.length && !newUploadIds) throw HttpError.badRequest("nothing_to_update", "Nothing to update.");

  await withTx(async (q) => {
    if (sets.length) {
      vals.push(listingId);
      await q(`UPDATE listings SET ${sets.join(", ")} WHERE id = $${vals.length}`, vals);
    }
    if (newUploadIds) {
      if (newUploadIds.length > config.maxListingPhotos) throw HttpError.badRequest("too_many_photos", `Max ${config.maxListingPhotos} photos.`);
      const cur = await q<{ upload_id: string }>(`SELECT upload_id FROM listing_images WHERE listing_id = $1`, [listingId]);
      const curIds = cur.map((r) => r.upload_id);
      const drop = curIds.filter((c) => !newUploadIds.includes(c));
      if (drop.length) {
        await q(`DELETE FROM listing_images WHERE listing_id = $1 AND upload_id = ANY($2::uuid[])`, [listingId, drop]);
        await q(`DELETE FROM uploads WHERE id = ANY($1::uuid[])`, [drop]);
      }
      await q(`DELETE FROM listing_images WHERE listing_id = $1`, [listingId]);
      for (let i = 0; i < newUploadIds.length; i++) {
        await q(`INSERT INTO listing_images (listing_id, upload_id, position) VALUES ($1,$2,$3)`, [listingId, newUploadIds[i], i]);
        await q(`UPDATE uploads SET attached = TRUE WHERE id = $1::uuid AND owner_id = $2`, [newUploadIds[i], userId]);
      }
    }
  });

  const fresh = await fetchListingRow(listingId);
  return serializeFull(fresh as ListedRow);
}

export async function deleteListing(listingId: string, userId: string) {
  const row = await assertListingOwned(listingId, userId);
  if (row.status === "sold") {
    throw HttpError.conflict("item_sold", "This item was already sold — it stays on your seller records.");
  }
  const imgs = await query<{ upload_id: string }>(`SELECT upload_id FROM listing_images WHERE listing_id = $1`, [listingId]);
  await withTx(async (q) => {
    await q(`UPDATE listings SET status = 'deleted', deleted_at = now() WHERE id = $1`, [listingId]);
    await q(`DELETE FROM listing_images WHERE listing_id = $1`, [listingId]);
    await q(`DELETE FROM uploads WHERE id = ANY($1::uuid[])`, [imgs.map((i) => i.upload_id)]);
    await q(`DELETE FROM favorites WHERE listing_id = $1`, [listingId]);
    await q(`DELETE FROM cart_items WHERE listing_id = $1`, [listingId]);
  });
}

export async function setListingStatus(listingId: string, userId: string, status: "active" | "paused") {
  await assertListingOwned(listingId, userId);
  await query(`UPDATE listings SET status = $1 WHERE id = $2`, [status, listingId]);
  return { ok: true, status };
}

// ---------------------------------------------------------------- favorites

export async function toggleFavorite(listingId: string, userId: string) {
  const exists = await queryOne(
    `SELECT 1 FROM listings WHERE id = $1 AND status = 'active' AND deleted_at IS NULL`, [listingId]);
  if (!exists) throw HttpError.notFound("Listing not found.");
  const row = await queryOne(`SELECT 1 FROM favorites WHERE user_id = $1 AND listing_id = $2`, [userId, listingId]);
  if (row) {
    await query(`DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2`, [userId, listingId]);
    return { favorite: false };
  }
  await query(`INSERT INTO favorites (user_id, listing_id) VALUES ($1,$2)`, [userId, listingId]);
  return { favorite: true };
}

export async function listFavorites(userId: string, page = 1) {
  const pageSize = 24;
  const totalRow = await queryOne<{ count: string }>(
    `SELECT count(*)::text AS count FROM favorites fv JOIN listings l ON l.id = fv.listing_id AND l.deleted_at IS NULL
      WHERE fv.user_id = $1`, [userId]);
  const rows = await query<ListedRow>(
    `SELECT ${LISTING_SELECT}, ${IMAGE_AGG_SQL}
       FROM favorites fv
       JOIN listings l ON l.id = fv.listing_id AND l.deleted_at IS NULL
       JOIN users s ON s.id = l.seller_id
       LEFT JOIN listing_images li ON li.listing_id = l.id
       LEFT JOIN uploads u ON u.id = li.upload_id
      WHERE fv.user_id = $1
      GROUP BY l.id, s.id
      ORDER BY fv.created_at DESC
      LIMIT $2 OFFSET $3`,
    [userId, pageSize, (page - 1) * pageSize],
  );
  const items = rows.map((r) => {
    const cover = imageRowsToUrls(r.image_rows ?? [])[0]?.thumbUrl ?? null;
    return {
      id: r.id, title: r.title, priceKobo: Number(r.price_kobo), status: r.status,
      coverUrl: cover, createdAt: r.created_at, seller: r.seller ?? null, negotiable: r.negotiable,
    };
  });
  return { items, total: Number(totalRow?.count ?? 0) };
}

export async function relatedListings(listingId: string, category: string, sellerId: string, limit = 8) {
  const rows = await query<ListedRow>(
    `SELECT ${LISTING_SELECT}, ${IMAGE_AGG_SQL}
       FROM listings l
       JOIN users s ON s.id = l.seller_id
       LEFT JOIN listing_images li ON li.listing_id = l.id
       LEFT JOIN uploads u ON u.id = li.upload_id
      WHERE l.id <> $1 AND l.seller_id <> $2 AND l.category = $3
        AND l.status = 'active' AND l.deleted_at IS NULL
      GROUP BY l.id, s.id
      ORDER BY l.created_at DESC
      LIMIT $4`, [listingId, sellerId, category, limit]);
  return rows.map((r) => {
    const cover = imageRowsToUrls(r.image_rows ?? [])[0]?.thumbUrl ?? null;
    return {
      id: r.id, title: r.title, priceKobo: Number(r.price_kobo),
      coverUrl: cover, createdAt: r.created_at, seller: r.seller ?? null,
    };
  });
}
