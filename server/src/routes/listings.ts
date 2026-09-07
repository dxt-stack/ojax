import { Router } from "express";
import { z } from "zod";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { wrap, HttpError } from "../lib/errors.js";
import { upload } from "../lib/uploader.js";
import { persistImage, markUploadsAttached, deleteUploadsByIds } from "../lib/images.js";
import * as repo from "../repos/listings.js";
import { config } from "../config.js";
import { notify } from "../lib/notify.js";

export const listingsRouter = Router();
const listingSchema = z.object({
  title: z.string().trim().min(4).max(140),
  description: z.string().trim().max(8000).optional().default(""),
  category: z.string().min(2).max(40),
  subcategory: z.string().max(60).nullable().optional(),
  conditionCode: z.string().max(40).optional().default("used-good"),
  priceKobo: z.number().int().positive().max(100_000_000_00),
  negotiable: z.boolean().optional().default(false),
  quantity: z.number().int().min(1).max(999).optional().default(1),
  shipAvailable: z.boolean().optional().default(false),
  meetupLocation: z.string().max(200).nullable().optional(),
  meetupNotes: z.string().max(1000).nullable().optional(),
  imageIds: z.array(z.string().uuid()).max(config.maxListingPhotos).optional().default([]),
});

// ---- photos (upload before creating the listing, then pass ids) ----
listingsRouter.post(
  "/photos",
  requireAuth,
  upload.array("files", config.maxListingPhotos),
  wrap(async (req, res) => {
    const files = (req.files as Express.Multer.File[]) || [];
    if (!files.length) throw HttpError.badRequest("no_file", "Attach at least one photo.");
    const out = [];
    for (const f of files) {
      const img = await persistImage(f, req.user!.id, "listing");
      out.push({ id: img.id, fullUrl: img.fullUrl, thumbUrl: img.thumbUrl });
    }
    res.status(201).json({ images: out });
  }),
);

// delete an unattached upload (e.g. user removed it from the compose box)
listingsRouter.delete("/photos/:id", requireAuth, wrap(async (req, res) => {
  await deleteUploadsByIds([req.params.id], req.user!.id);
  res.json({ ok: true });
}));

// ---- CRUD ----
listingsRouter.post("/", requireAuth, wrap(async (req, res) => {
  const parsed = listingSchema.safeParse(req.body);
  if (!parsed.success) {
    throw HttpError.unprocessable("validation_error", "Please fix the highlighted fields.", parsed.error.flatten());
  }
  const d = parsed.data;
  await markUploadsAttached(d.imageIds, req.user!.id);
  const listing = await repo.createListing(req.user!.id, d, d.imageIds);
  res.status(201).json({ listing: repo.serializeFull(listing) });
}));

listingsRouter.get("/", optionalAuth, wrap(async (req, res) => {
  const q = req.query;
  const page = Math.max(1, Number(q.page ?? 1) || 1);
  const pageSize = Math.min(48, Number(q.pageSize ?? 24) || 24);
  const sort = (q.sort as string) || "newest";

  // "my listings" listing — needs ownership semantics
  if (q.mine === "1") {
    if (!req.user) throw HttpError.unauthorized();
    const status = (q.status as string) || undefined;
    const out = await repo.searchListings({ sellerId: req.user.id, status, page, pageSize, sort: "newest" });
    return res.json(out);
  }
  if (q.favorites === "1") {
    if (!req.user) throw HttpError.unauthorized();
    const out = await repo.listFavorites(req.user.id, page);
    return res.json({ ...out, page, pageSize });
  }

  const out = await repo.searchListings({
    q: (q.q as string) || undefined,
    category: (q.category as string) || undefined,
    subcategory: (q.subcategory as string) || undefined,
    condition: (q.condition as string) || undefined,
    minKobo: q.min ? Number(q.min) : undefined,
    maxKobo: q.max ? Number(q.max) : undefined,
    negotiable: q.negotiable === "1",
    ships: q.ships === "1",
    sort: sort as any,
    page,
    pageSize,
  });
  res.json(out);
}));

listingsRouter.get("/:id", optionalAuth, wrap(async (req, res) => {
  const listing = await repo.getListingById(req.params.id, req.user?.id, true);
  const related = await repo.relatedListings(req.params.id, listing.category, listing.seller?.id || "");
  res.json({ listing, related });
}));

listingsRouter.patch("/:id", requireAuth, wrap(async (req, res) => {
  const existing = await repo.assertListingOwned(req.params.id, req.user!.id);
  const patch = listingSchema.partial().safeParse({ ...req.body, priceKobo: req.body.priceKobo });
  if (!patch.success) {
    throw HttpError.unprocessable("validation_error", "Please fix the highlighted fields.", patch.error.flatten());
  }
  if (existing.status === "sold") {
    throw HttpError.conflict("item_sold", "Sold items can't be edited.");
  }
  const { imageIds, ...rest } = patch.data;
  const listing = await repo.updateListing(req.params.id, req.user!.id, rest as any, imageIds);
  res.json({ listing });
}));

listingsRouter.delete("/:id", requireAuth, wrap(async (req, res) => {
  await repo.deleteListing(req.params.id, req.user!.id);
  res.json({ ok: true });
}));

listingsRouter.post("/:id/pause", requireAuth, wrap(async (req, res) => {
  res.json(await repo.setListingStatus(req.params.id, req.user!.id, "paused"));
}));

listingsRouter.post("/:id/activate", requireAuth, wrap(async (req, res) => {
  res.json(await repo.setListingStatus(req.params.id, req.user!.id, "active"));
}));

listingsRouter.post("/:id/sold", requireAuth, wrap(async (req, res) => {
  const row = await repo.assertListingOwned(req.params.id, req.user!.id);
  if (row.status !== "sold") {
    await repo.updateListing(req.params.id, req.user!.id, { status: "sold" } as any);
  }
  res.json({ ok: true });
}));

// ---- favorites ----
listingsRouter.post("/:id/favorite", requireAuth, wrap(async (req, res) => {
  const out = await repo.toggleFavorite(req.params.id, req.user!.id);
  res.json(out);
}));
