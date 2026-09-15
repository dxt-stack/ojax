// OjaX Mock Backend - Full featured in-memory API for demo/finished product
// Implements all /api/* endpoints used by frontend, with localStorage persistence

import { MOCK_USERS, MOCK_LISTINGS, MOCK_EVENTS, MOCK_REVIEWS, getSellerById, CATEGORIES, CONDITIONS, UNIVERSITIES } from "./mockData";

type User = typeof MOCK_USERS[0] & { avatarUrl?: string | null; orgName?: string | null; bio?: string; meetupSpot?: string | null; emailVerified?: boolean };
type Listing = typeof MOCK_LISTINGS[0];
type EventItem = typeof MOCK_EVENTS[0];

const LS_KEY = "ojax_mock_v2";

interface MockDB {
  users: User[];
  listings: Listing[];
  events: EventItem[];
  reviews: typeof MOCK_REVIEWS;
  cart: Record<string, { listingId: string; qty: number }[]>; // userId -> items
  favorites: Record<string, string[]>; // userId -> listingIds
  orders: any[];
  conversations: any[];
  rsvps: Record<string, string[]>; // userId -> eventIds
  currentUserId: string | null;
  nextId: number;
}

function loadDB(): MockDB {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // merge with latest mock data if version changed? keep user overrides
      return parsed;
    }
  } catch {}
  return {
    users: [...MOCK_USERS] as User[],
    listings: [...MOCK_LISTINGS] as Listing[],
    events: [...MOCK_EVENTS] as EventItem[],
    reviews: [...MOCK_REVIEWS],
    cart: {},
    favorites: {},
    orders: [
      {
        id: "o1", orderNo: "OJAX-2025-001", buyerId: "u1", status: "completed", fulfilment: "pickup",
        totals: { subtotalKobo: 32000000, shippingKobo: 0, serviceFeeKobo: 0, totalKobo: 32000000 },
        contact: { name: "Tunde Okonkwo", phone: "0803 123 4567", campusNote: "UNILAG Main Library" },
        createdAt: "2025-09-01T10:00:00Z", paidAt: "2025-09-01T10:05:00Z",
        items: [{ listingId: "l1", title: "iPhone 13 128GB - Midnight Black, Good Condition", imageUrl: MOCK_LISTINGS[0].coverUrl, unitPriceKobo: 32000000, quantity: 1, sellerId: "u2", orderItemId: "oi1", reviewed: true }],
        events: [{ to_status: "paid", created_at: "2025-09-01T10:05:00Z" }, { to_status: "completed", created_at: "2025-09-02T10:00:00Z" }],
      },
      {
        id: "o2", orderNo: "OJAX-2025-002", buyerId: "u1", status: "paid", fulfilment: "shipping",
        totals: { subtotalKobo: 6500000, shippingKobo: 250000, serviceFeeKobo: 0, totalKobo: 6750000 },
        contact: { name: "Tunde Okonkwo", phone: "0803 123 4567", address: "UNILAG Mariere Hall, Room 12" },
        createdAt: "2025-09-12T09:00:00Z", paidAt: "2025-09-12T09:05:00Z",
        items: [{ listingId: "l5", title: "JBL Charge 5 Bluetooth Speaker", imageUrl: MOCK_LISTINGS[4].coverUrl, unitPriceKobo: 6500000, quantity: 1, sellerId: "u2", orderItemId: "oi2", reviewed: false }],
        events: [{ to_status: "paid", created_at: "2025-09-12T09:05:00Z" }],
      },
    ],
    conversations: [
      {
        conversationId: "c1", listingId: "l1", listingTitle: "iPhone 13 128GB - Midnight Black", coverUrl: MOCK_LISTINGS[0].coverUrl,
        peer: { id: "u2", fullName: "Chiamaka Adeyemi", avatarUrl: null },
        participants: ["u1", "u2"],
        messages: [
          { id: "m1", sender_id: "u1", senderId: "u1", body: "Hi Chiamaka, is the iPhone still available?", kind: "text", created_at: "2025-09-12T10:00:00Z", createdAt: "2025-09-12T10:00:00Z", read_at: "2025-09-12T10:05:00Z" },
          { id: "m2", sender_id: "u2", senderId: "u2", body: "Yes it is! Still available. Are you on campus today? We can meet at library.", kind: "text", created_at: "2025-09-12T10:06:00Z", createdAt: "2025-09-12T10:06:00Z", read_at: "2025-09-12T10:10:00Z" },
          { id: "m3", sender_id: "u1", senderId: "u1", body: "Yes, I'm at Engineering faculty. Can we meet at library by 2pm?", kind: "text", created_at: "2025-09-12T10:12:00Z", createdAt: "2025-09-12T10:12:00Z", read_at: null },
        ],
        updatedAt: "2025-09-12T10:12:00Z", unread: 1,
      },
    ],
    rsvps: { "u1": ["e1", "e3"] },
    currentUserId: "u1", // auto-login as Tunde for demo
    nextId: 1000,
  };
}

function saveDB(db: MockDB) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(db));
  } catch {}
}

let db = loadDB();

function genId(prefix = "id") {
  db.nextId += 1;
  return `${prefix}${db.nextId}`;
}

function currentUser() {
  if (!db.currentUserId) return null;
  return db.users.find(u => u.id === db.currentUserId) || null;
}

function toPublicUser(u: User) {
  return {
    id: u.id, email: u.email, fullName: u.fullName, role: u.role, isOrg: u.isOrg,
    orgName: (u as any).orgName || null, avatarUrl: u.avatarUrl || null,
    universityCode: u.universityCode || null, department: u.department || null, level: u.level || null,
    phone: u.phone || null, whatsapp: (u as any).whatsapp || null, bio: u.bio || "", meetupSpot: u.meetupSpot || null,
    verified: u.verified, emailVerified: true, joinedAt: u.joinedAt,
  };
}

function toListingResponse(l: Listing, forUserId?: string | null) {
  const seller = getSellerById(l.sellerId);
  return {
    id: l.id,
    seller: seller ? {
      id: seller.id, fullName: seller.fullName, avatarUrl: seller.avatarUrl,
      universityCode: seller.universityCode, verified: seller.verified, isOrg: seller.isOrg,
      orgName: (seller as any).orgName, department: seller.department, level: seller.level,
    } : null,
    title: l.title, description: l.description, category: l.category, subcategory: l.subcategory,
    condition: l.condition, conditionLabel: l.conditionLabel, priceKobo: l.priceKobo,
    negotiable: l.negotiable, quantity: l.quantity, status: l.status,
    shipAvailable: l.shipAvailable, meetupLocation: l.meetupLocation, meetupNotes: l.meetupNotes,
    views: l.views, featured: (l as any).featured, favoriteCount: l.favoriteCount,
    images: l.images, coverUrl: l.coverUrl, createdAt: l.createdAt, soldAt: l.status === "sold" ? l.createdAt : null,
    isFavorite: forUserId ? (db.favorites[forUserId]?.includes(l.id) || false) : false,
    myListing: forUserId ? l.sellerId === forUserId : false,
  };
}

function toEventResponse(e: EventItem, forUserId?: string | null) {
  const org = getSellerById(e.orgId);
  return {
    id: e.id,
    org: { id: e.orgId, name: org?.orgName || org?.fullName || "Campus Org", avatarUrl: org?.avatarUrl || null, isOrg: true },
    title: e.title, description: e.description, category: e.category,
    startsAt: e.startsAt, endsAt: e.endsAt, venue: e.venue, universityCode: e.universityCode,
    city: e.city, isOnline: e.isOnline, onlineUrl: (e as any).onlineUrl || null,
    capacity: e.capacity, priceKobo: e.priceKobo, status: e.status, posterUrl: e.posterUrl,
    rsvpCount: e.rsvpCount, myRsvp: forUserId ? (db.rsvps[forUserId]?.includes(e.id) || false) : false,
    createdAt: e.createdAt,
  };
}

// Main mock fetch handler
export async function mockFetch(path: string, opts: any = {}): Promise<{ ok: boolean; status: number; json: () => any }> {
  const method = (opts.method || "GET").toUpperCase();
  const url = new URL(path, "http://localhost");
  const pathname = url.pathname;
  const search = url.searchParams;
  const user = currentUser();
  const uid = user?.id || null;

  // Simulate network delay
  await new Promise(r => setTimeout(r, 180 + Math.random() * 250));

  const json = (data: any, status = 200) => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  });

  const err = (code: string, message: string, status = 400) => ({
    ok: false,
    status,
    json: async () => ({ error: { code, message } }),
  });

  // Auth endpoints
  if (pathname === "/api/auth/me") {
    return json({ user: user ? toPublicUser(user) : null });
  }
  if (pathname === "/api/auth/login" && method === "POST") {
    const body = JSON.parse(opts.body || "{}");
    const found = db.users.find(u => u.email.toLowerCase() === body.email?.toLowerCase());
    if (!found) return err("invalid_credentials", "Invalid email or password", 401);
    // Accept any password for demo, but check if it's demo password
    db.currentUserId = found.id;
    saveDB(db);
    return json({ accessToken: "mock-token-" + found.id, user: toPublicUser(found) });
  }
  if (pathname === "/api/auth/register" && method === "POST") {
    const body = JSON.parse(opts.body || "{}");
    if (db.users.some(u => u.email.toLowerCase() === body.email?.toLowerCase())) {
      return err("email_taken", "Email already registered", 409);
    }
    const newUser: User = {
      id: genId("u"), email: body.email, fullName: body.fullName, role: "student",
      isOrg: !!body.isOrg, avatarUrl: null, universityCode: body.universityCode || "UNILAG",
      department: body.department || "", level: body.level || "100L",
      phone: "", bio: "", meetupSpot: "", verified: true, joinedAt: new Date().toISOString(),
      orgName: body.orgName || null,
    } as any;
    db.users.push(newUser);
    db.currentUserId = newUser.id;
    saveDB(db);
    return json({ accessToken: "mock-token-" + newUser.id, user: toPublicUser(newUser) });
  }
  if (pathname === "/api/auth/logout" && method === "POST") {
    db.currentUserId = null;
    saveDB(db);
    return json({ ok: true });
  }
  if (pathname === "/api/auth/refresh" && method === "POST") {
    if (!user) return err("unauthorized", "No session", 401);
    return json({ accessToken: "mock-token-" + user.id });
  }
  if (pathname === "/api/auth/change-password" && method === "POST") {
    return json({ ok: true });
  }
  if (pathname === "/api/auth/forgot-password" && method === "POST") {
    return json({ ok: true, token: "demo-token-123" });
  }
  if (pathname === "/api/auth/reset-password" && method === "POST") {
    return json({ ok: true });
  }

  // Meta
  if (pathname === "/api/meta" || pathname === "/api/meta/catalog") {
    return json({ categories: CATEGORIES, conditions: CONDITIONS, eventCategories: [
      { code: "career", label: "Career & Networking" },
      { code: "academic", label: "Academic & Seminars" },
      { code: "hackathons", label: "Hackathons & Tech" },
      { code: "socials", label: "Socials & Parties" },
      { code: "sports-events", label: "Sports & Games" },
      { code: "arts", label: "Arts, Music & Culture" },
      { code: "community", label: "Community & Volunteering" },
      { code: "religious", label: "Religious & Fellowship" },
    ]});
  }
  if (pathname === "/api/meta/universities") {
    return json({ universities: UNIVERSITIES });
  }

  // Listings
  if (pathname === "/api/listings" && method === "GET") {
    let items = [...db.listings];
    const q = search.get("q")?.toLowerCase();
    const cat = search.get("category");
    const sub = search.get("subcategory");
    const mine = search.get("mine");
    const favOnly = search.get("favorites");
    const sellerId = search.get("sellerId");
    const sort = search.get("sort") || "newest";
    const min = search.get("min") ? Number(search.get("min")) : null;
    const max = search.get("max") ? Number(search.get("max")) : null;

    if (q) items = items.filter(l => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q));
    if (cat) items = items.filter(l => l.category === cat);
    if (sub) items = items.filter(l => l.subcategory === sub);
    if (mine && uid) items = items.filter(l => l.sellerId === uid);
    if (favOnly && uid) {
      const favs = db.favorites[uid] || [];
      items = items.filter(l => favs.includes(l.id));
    }
    if (sellerId) items = items.filter(l => l.sellerId === sellerId);
    if (min !== null) items = items.filter(l => l.priceKobo >= min);
    if (max !== null) items = items.filter(l => l.priceKobo <= max);

    // Filter active only unless mine or seller
    if (!mine && !sellerId && !favOnly) {
      items = items.filter(l => l.status === "active");
    }

    if (sort === "price_asc") items.sort((a, b) => a.priceKobo - b.priceKobo);
    else if (sort === "price_desc") items.sort((a, b) => b.priceKobo - a.priceKobo);
    else if (sort === "popular") items.sort((a, b) => b.views - a.views);
    else items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const page = Number(search.get("page") || "1");
    const pageSize = Number(search.get("pageSize") || "20");
    const total = items.length;
    const pages = Math.ceil(total / pageSize);
    const slice = items.slice((page - 1) * pageSize, page * pageSize);

    return json({ items: slice.map(l => toListingResponse(l, uid)), total, page, pageSize, pages });
  }

  if (pathname.startsWith("/api/listings/") && method === "GET") {
    const id = pathname.split("/")[3];
    if (id === "photos") return json({ images: [] });
    const listing = db.listings.find(l => l.id === id);
    if (!listing) return err("not_found", "Listing not found", 404);
    // increment views if not owner
    if (uid !== listing.sellerId) listing.views += 1;
    saveDB(db);
    const related = db.listings.filter(l => l.category === listing.category && l.id !== listing.id && l.status === "active").slice(0, 4).map(l => toListingResponse(l, uid));
    return json({ listing: toListingResponse(listing, uid), related });
  }

  if (pathname === "/api/listings" && method === "POST") {
    if (!user) return err("unauthorized", "Sign in required", 401);
    const body = JSON.parse(opts.body || "{}");
    const newListing: Listing = {
      id: genId("l"), sellerId: user.id, title: body.title, description: body.description,
      category: body.category, subcategory: body.subcategory || null, condition: body.conditionCode,
      conditionLabel: CONDITIONS.find(c => c.code === body.conditionCode)?.label || body.conditionCode,
      priceKobo: body.priceKobo, negotiable: !!body.negotiable, quantity: body.quantity || 1,
      status: "active", shipAvailable: !!body.shipAvailable, meetupLocation: body.meetupLocation || null,
      meetupNotes: body.meetupNotes || null, views: 0, favoriteCount: 0,
      images: body.imageIds?.map((id: string, i: number) => ({ fullUrl: `https://picsum.photos/seed/${id}/600/600`, thumbUrl: `https://picsum.photos/seed/${id}/200/200`, position: i })) || [{ fullUrl: `https://picsum.photos/seed/${Date.now()}/600/600`, thumbUrl: `https://picsum.photos/seed/${Date.now()}/200/200`, position: 0 }],
      coverUrl: `https://picsum.photos/seed/${Date.now()}/600/600`, createdAt: new Date().toISOString(),
    } as any;
    db.listings.unshift(newListing);
    saveDB(db);
    return json({ listing: toListingResponse(newListing, uid) }, 201);
  }

  if (pathname.match(/^\/api\/listings\/[^/]+\/favorite$/) && method === "POST") {
    if (!uid) return err("unauthorized", "Sign in required", 401);
    const id = pathname.split("/")[3];
    if (!db.favorites[uid]) db.favorites[uid] = [];
    const idx = db.favorites[uid].indexOf(id);
    let fav = true;
    if (idx >= 0) { db.favorites[uid].splice(idx, 1); fav = false; }
    else db.favorites[uid].push(id);
    saveDB(db);
    return json({ favorite: fav });
  }

  if (pathname === "/api/listings/photos" && method === "POST") {
    // Mock upload
    const fakeId = genId("img");
    return json({ images: [{ id: fakeId, fullUrl: `https://picsum.photos/seed/${fakeId}/600/600`, thumbUrl: `https://picsum.photos/seed/${fakeId}/200/200` }] });
  }

  // Cart & Orders
  if (pathname === "/api/orders/cart" && method === "GET") {
    if (!uid) return err("unauthorized", "Sign in required", 401);
    const cartItems = db.cart[uid] || [];
    const items = cartItems.map(ci => {
      const listing = db.listings.find(l => l.id === ci.listingId);
      if (!listing) return null;
      const seller = getSellerById(listing.sellerId);
      return {
        listingId: listing.id, title: listing.title, priceKobo: listing.priceKobo, qty: ci.qty,
        stock: listing.quantity, shipAvailable: listing.shipAvailable, sellerId: listing.sellerId,
        sellerName: seller?.fullName || "Seller", coverUrl: listing.coverUrl, unavailable: listing.status !== "active",
      };
    }).filter(Boolean);
    const subtotal = items.reduce((s, it: any) => s + it.priceKobo * it.qty, 0);
    const shipping = subtotal >= 2000000 ? 0 : (items.length ? 250000 : 0);
    return json({ items, totals: { subtotalKobo: subtotal, shippingKobo: shipping, totalKobo: subtotal + shipping }, rules: { shippingKobo: 250000, freeAboveKobo: 2000000 } });
  }

  if (pathname === "/api/orders/cart" && method === "POST") {
    if (!uid) return err("unauthorized", "Sign in required", 401);
    const body = JSON.parse(opts.body || "{}");
    const listing = db.listings.find(l => l.id === body.listingId);
    if (!listing) return err("not_found", "Item not found", 404);
    if (listing.sellerId === uid) return err("own_item", "You can't buy your own item", 400);
    if (!db.cart[uid]) db.cart[uid] = [];
    const existing = db.cart[uid].find(c => c.listingId === body.listingId);
    if (existing) existing.qty = Math.min(listing.quantity, existing.qty + (body.quantity || 1));
    else db.cart[uid].push({ listingId: body.listingId, qty: body.quantity || 1 });
    saveDB(db);
    return json({ count: db.cart[uid].length });
  }

  if (pathname.startsWith("/api/orders/cart/") && (method === "PATCH" || method === "DELETE")) {
    if (!uid) return err("unauthorized", "Sign in required", 401);
    const id = pathname.split("/")[4];
    if (method === "DELETE") {
      db.cart[uid] = (db.cart[uid] || []).filter(c => c.listingId !== id);
    } else {
      const body = JSON.parse(opts.body || "{}");
      const item = (db.cart[uid] || []).find(c => c.listingId === id);
      if (item) item.qty = body.quantity;
    }
    saveDB(db);
    return json({ ok: true });
  }

  if (pathname === "/api/orders/checkout" && method === "POST") {
    if (!uid) return err("unauthorized", "Sign in required", 401);
    const body = JSON.parse(opts.body || "{}");
    const cartItems = db.cart[uid] || [];
    if (!cartItems.length) return err("empty_cart", "Cart is empty", 400);
    const orderId = genId("o");
    const items = cartItems.map(ci => {
      const l = db.listings.find(li => li.id === ci.listingId)!;
      return { listingId: l.id, title: l.title, imageUrl: l.coverUrl, unitPriceKobo: l.priceKobo, quantity: ci.qty, sellerId: l.sellerId, orderItemId: genId("oi") };
    });
    const subtotal = items.reduce((s, it) => s + it.unitPriceKobo * it.quantity, 0);
    const shipping = body.fulfilment === "shipping" ? (subtotal >= 2000000 ? 0 : 250000) : 0;
    const order = {
      id: orderId, orderNo: `OJAX-2025-${String(db.nextId).padStart(3, "0")}`, buyerId: uid, status: "pending_payment",
      fulfilment: body.fulfilment, totals: { subtotalKobo: subtotal, shippingKobo: shipping, serviceFeeKobo: 0, totalKobo: subtotal + shipping },
      contact: { name: body.contactName, phone: body.contactPhone, address: body.deliveryAddress, campusNote: body.campusNote },
      createdAt: new Date().toISOString(), reservedUntilMinutes: 90,
      items, events: [{ to_status: "pending_payment", created_at: new Date().toISOString() }],
    };
    db.orders.push(order);
    db.cart[uid] = [];
    saveDB(db);
    return json({ order, totals: order.totals, paymentMethods: ["sandbox", "paystack"] });
  }

  if (pathname.match(/^\/api\/orders\/[^/]+\/pay-sandbox$/) && method === "POST") {
    const id = pathname.split("/")[3];
    const order = db.orders.find(o => o.id === id);
    if (!order) return err("not_found", "Order not found", 404);
    order.status = "paid";
    order.paidAt = new Date().toISOString();
    saveDB(db);
    return json({ order: { id: order.id, status: "paid" }, reference: "MOCK-" + id });
  }

  if (pathname === "/api/orders" && method === "GET") {
    if (!uid) return err("unauthorized", "Sign in required", 401);
    const scope = search.get("scope") || "buyer";
    let orders = [];
    if (scope === "buyer") orders = db.orders.filter(o => o.buyerId === uid);
    else orders = db.orders.filter(o => o.items.some((it: any) => db.listings.find(l => l.id === it.listingId)?.sellerId === uid || it.sellerId === uid));
    // Map to expected shape
    const mapped = orders.map((o: any) => ({
      ...o,
      buyerName: scope === "seller" ? db.users.find(u => u.id === o.buyerId)?.fullName : undefined,
      payments: o.status !== "pending_payment" ? [{ provider: "sandbox", reference: "MOCK-" + o.id, status: "success", amount_kobo: o.totals.totalKobo, created_at: o.paidAt || o.createdAt }] : [],
    })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return json({ orders: mapped });
  }

  if (pathname.match(/^\/api\/orders\/[^/]+\/confirm-delivery$/) && method === "POST") {
    const id = pathname.split("/")[3];
    const order = db.orders.find(o => o.id === id);
    if (order) { order.status = "completed"; saveDB(db); }
    return json({ ok: true });
  }

  if (pathname.match(/^\/api\/orders\/[^/]+\/cancel$/) && method === "POST") {
    const id = pathname.split("/")[3];
    const order = db.orders.find(o => o.id === id);
    if (order) { order.status = "cancelled"; saveDB(db); }
    return json({ ok: true });
  }

  // Users
  if (pathname.match(/^\/api\/users\/[^/]+$/) && method === "GET") {
    const id = pathname.split("/")[3];
    if (id === "me") {
      // dashboard stats
      if (pathname === "/api/users/me/dashboard") {
        const uidListings = db.listings.filter(l => l.sellerId === uid);
        const favs = db.favorites[uid || ""]?.length || 0;
        const cartCount = db.cart[uid || ""]?.length || 0;
        const unread = db.conversations.reduce((s, c: any) => s + (c.participants.includes(uid) ? (c.unread || 0) : 0), 0);
        const sales = db.orders.filter(o => o.items.some((it: any) => it.sellerId === uid)).length;
        return json({ stats: { activeListings: uidListings.filter(l => l.status === "active").length, soldItems: uidListings.filter(l => l.status === "sold").length, favorites: favs, unreadMessages: unread, cartItems: cartCount, salesCount: sales, salesRevenueKobo: 12500000 } });
      }
    }
    const targetId = id === "me" ? uid : id;
    const u = db.users.find(x => x.id === targetId);
    if (!u) return err("not_found", "User not found", 404);
    const listings = db.listings.filter(l => l.sellerId === u.id);
    const reviews = db.reviews.filter(r => r.sellerId === u.id);
    const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;
    return json({ user: toPublicUser(u), stats: { activeListings: listings.filter(l => l.status === "active").length, soldItems: listings.filter(l => l.status === "sold").length }, rating: { avg, count: reviews.length } });
  }

  if (pathname === "/api/users/me" && method === "PATCH") {
    if (!uid) return err("unauthorized", "Sign in required", 401);
    const body = JSON.parse(opts.body || "{}");
    const u = db.users.find(x => x.id === uid)!;
    Object.assign(u, body);
    saveDB(db);
    return json({ user: toPublicUser(u) });
  }

  if (pathname === "/api/users/me/avatar" && method === "POST") {
    if (!uid) return err("unauthorized", "Sign in required", 401);
    return json({ avatarUrl: `https://picsum.photos/seed/avatar${uid}/200/200` });
  }

  if (pathname === "/api/users/me/dashboard" && method === "GET") {
    if (!uid) return err("unauthorized", "Sign in required", 401);
    const uidListings = db.listings.filter(l => l.sellerId === uid);
    const favs = db.favorites[uid]?.length || 0;
    const cartCount = db.cart[uid]?.length || 0;
    return json({ stats: { activeListings: uidListings.filter(l => l.status === "active").length, soldItems: uidListings.filter(l => l.status === "sold").length, favorites: favs, unreadMessages: 2, cartItems: cartCount, salesCount: 3, salesRevenueKobo: 12500000 } });
  }

  // Events
  if (pathname === "/api/events" && method === "GET") {
    let items = [...db.events];
    const mode = search.get("mode") || "upcoming";
    const cat = search.get("category");
    const mine = search.get("mine");
    if (cat) items = items.filter(e => e.category === cat);
    if (mine && uid) items = items.filter(e => e.orgId === uid);
    const now = Date.now();
    if (mode === "upcoming") items = items.filter(e => new Date(e.startsAt).getTime() >= now - 86400000);
    else if (mode === "past") items = items.filter(e => new Date(e.startsAt).getTime() < now);
    items.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
    return json({ items: items.map(e => toEventResponse(e, uid)) });
  }

  if (pathname.startsWith("/api/events/") && method === "GET") {
    const id = pathname.split("/")[3];
    const ev = db.events.find(e => e.id === id);
    if (!ev) return err("not_found", "Event not found", 404);
    return json({ event: toEventResponse(ev, uid) });
  }

  if (pathname.match(/^\/api\/events\/[^/]+\/rsvp$/) && method === "POST") {
    if (!uid) return err("unauthorized", "Sign in required", 401);
    const id = pathname.split("/")[3];
    const ev = db.events.find(e => e.id === id);
    if (!ev) return err("not_found", "Event not found", 404);
    if (!db.rsvps[uid]) db.rsvps[uid] = [];
    if (!db.rsvps[uid].includes(id)) { db.rsvps[uid].push(id); ev.rsvpCount += 1; }
    saveDB(db);
    return json({ ok: true });
  }

  if (pathname.match(/^\/api\/events\/[^/]+\/rsvp$/) && method === "DELETE") {
    if (!uid) return err("unauthorized", "Sign in required", 401);
    const id = pathname.split("/")[3];
    const ev = db.events.find(e => e.id === id);
    if (ev && db.rsvps[uid]?.includes(id)) {
      db.rsvps[uid] = db.rsvps[uid].filter(x => x !== id);
      ev.rsvpCount = Math.max(0, ev.rsvpCount - 1);
      saveDB(db);
    }
    return json({ ok: true });
  }

  // Messages
  if (pathname === "/api/messages/conversations" && method === "GET") {
    if (!uid) return err("unauthorized", "Sign in required", 401);
    const convs = db.conversations.filter((c: any) => c.participants.includes(uid)).map((c: any) => ({
      conversationId: c.conversationId, listingId: c.listingId, listingTitle: c.listingTitle, coverUrl: c.coverUrl,
      updatedAt: c.updatedAt, unread: c.unread, peer: c.peer,
      lastMessage: c.messages[c.messages.length - 1] ? { body: c.messages[c.messages.length - 1].body, senderId: c.messages[c.messages.length - 1].sender_id, createdAt: c.messages[c.messages.length - 1].created_at } : null,
    }));
    return json({ conversations: convs });
  }

  if (pathname.startsWith("/api/messages/conversations/") && method === "GET") {
    const id = pathname.split("/")[3];
    const conv = db.conversations.find((c: any) => c.conversationId === id);
    if (!conv) return err("not_found", "Conversation not found", 404);
    // mark read
    conv.messages.forEach((m: any) => { if (m.sender_id !== uid) m.read_at = new Date().toISOString(); });
    conv.unread = 0;
    saveDB(db);
    return json({ conversation: { id: conv.conversationId, listingId: conv.listingId, listingTitle: conv.listingTitle, coverUrl: conv.coverUrl }, messages: conv.messages });
  }

  if (pathname.startsWith("/api/messages/conversations/") && pathname.endsWith("/messages") && method === "POST") {
    if (!uid) return err("unauthorized", "Sign in required", 401);
    const id = pathname.split("/")[3];
    const conv = db.conversations.find((c: any) => c.conversationId === id);
    if (!conv) return err("not_found", "Conversation not found", 404);
    const body = JSON.parse(opts.body || "{}");
    const msg = { id: genId("m"), sender_id: uid, senderId: uid, body: body.body, kind: "text", created_at: new Date().toISOString(), createdAt: new Date().toISOString(), read_at: null };
    conv.messages.push(msg);
    conv.updatedAt = new Date().toISOString();
    saveDB(db);
    return json({ message: msg });
  }

  if (pathname === "/api/messages/start" && method === "POST") {
    if (!uid) return err("unauthorized", "Sign in required", 401);
    const body = JSON.parse(opts.body || "{}");
    const listing = db.listings.find(l => l.id === body.listingId);
    if (!listing) return err("not_found", "Listing not found", 404);
    if (listing.sellerId === uid) return err("own_item", "Can't chat your own listing", 400);
    let conv = db.conversations.find((c: any) => c.listingId === body.listingId && c.participants.includes(uid) && c.participants.includes(listing.sellerId));
    if (!conv) {
      const seller = getSellerById(listing.sellerId);
      conv = {
        conversationId: genId("c"), listingId: listing.id, listingTitle: listing.title, coverUrl: listing.coverUrl,
        peer: { id: seller?.id || listing.sellerId, fullName: seller?.fullName || "Seller", avatarUrl: seller?.avatarUrl || null },
        participants: [uid, listing.sellerId], messages: [], updatedAt: new Date().toISOString(), unread: 0,
      };
      db.conversations.push(conv);
    }
    if (body.message) {
      conv.messages.push({ id: genId("m"), sender_id: uid, senderId: uid, body: body.message, kind: "text", created_at: new Date().toISOString(), createdAt: new Date().toISOString(), read_at: null });
      conv.updatedAt = new Date().toISOString();
    }
    saveDB(db);
    return json({ conversationId: conv.conversationId });
  }

  // Reviews
  if (pathname.startsWith("/api/reviews/seller/") && method === "GET") {
    const sellerId = pathname.split("/")[4];
    const reviews = db.reviews.filter(r => r.sellerId === sellerId).map(r => ({
      id: r.id, rating: r.rating, comment: r.comment, itemTitle: r.itemTitle, createdAt: r.createdAt,
      buyer: { id: r.buyerId, fullName: db.users.find(u => u.id === r.buyerId)?.fullName || "Buyer", avatarUrl: null },
    }));
    return json({ reviews });
  }

  if (pathname.startsWith("/api/reviews/order/") && method === "POST") {
    if (!uid) return err("unauthorized", "Sign in required", 401);
    const orderId = pathname.split("/")[4];
    const body = JSON.parse(opts.body || "{}");
    const order = db.orders.find(o => o.id === orderId);
    if (!order) return err("not_found", "Order not found", 404);
    if (order.status !== "completed") return err("not_completed", "Order not completed yet", 400);
    // check already reviewed
    const item = order.items.find((it: any) => it.orderItemId === body.orderItemId);
    if (item?.reviewed) return err("already_reviewed", "Already reviewed", 409);
    if (item) item.reviewed = true;
    db.reviews.push({ id: genId("r"), sellerId: item.sellerId, buyerId: uid, orderId, rating: body.rating, comment: body.comment || "", itemTitle: item.title, createdAt: new Date().toISOString() } as any);
    saveDB(db);
    return json({ ok: true });
  }

  // Notifications
  if (pathname === "/api/notifications" && method === "GET") {
    return json({ unread: 3, items: [
      { id: "n1", type: "order", title: "Order confirmed", body: "Your order OJAX-2025-002 is confirmed", createdAt: new Date(Date.now() - 3600000).toISOString(), read: false },
      { id: "n2", type: "message", title: "New message", body: "Chiamaka replied to your iPhone inquiry", createdAt: new Date(Date.now() - 7200000).toISOString(), read: false },
      { id: "n3", type: "event", title: "Event reminder", body: "TechTrek 2025 starts in 3 days", createdAt: new Date(Date.now() - 86400000).toISOString(), read: true },
    ]});
  }

  if (pathname === "/api/notifications/read" && method === "POST") {
    return json({ ok: true });
  }

  // Fallback
  return err("not_found", `Mock: ${method} ${pathname} not implemented`, 404);
}

export function resetMockDB() {
  localStorage.removeItem(LS_KEY);
  db = loadDB();
  location.reload();
}

export function getMockDB() { return db; }
