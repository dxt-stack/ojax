// Shared API types (mirror of server responses)

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isOrg: boolean;
  orgName?: string | null;
  avatarUrl?: string | null;
  universityCode?: string | null;
  department?: string | null;
  level?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  bio?: string;
  meetupSpot?: string | null;
  verified: boolean;
  emailVerified?: boolean;
  joinedAt: string;
}

export interface SellerLite {
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

export interface ListingImage {
  fullUrl: string;
  thumbUrl: string;
  position: number;
}

export interface Listing {
  id: string;
  seller?: SellerLite | null;
  title: string;
  description: string;
  category: string;
  subcategory?: string | null;
  condition: string;
  conditionLabel?: string;
  priceKobo: number;
  negotiable: boolean;
  quantity: number;
  status: string;
  shipAvailable: boolean;
  meetupLocation?: string | null;
  meetupNotes?: string | null;
  views: number;
  featured?: boolean;
  favoriteCount: number;
  images: ListingImage[];
  coverUrl?: string | null;
  createdAt: string;
  soldAt?: string | null;
  isFavorite?: boolean;
  myListing?: boolean;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

export interface Category {
  code: string;
  label: string;
  icon: string;
  color: string;
  sub: { code: string; label: string }[];
}

export interface Condition {
  code: string;
  label: string;
  hint?: string;
}

export interface University {
  code: string;
  name: string;
  city: string;
  state: string;
}

export interface EventItem {
  id: string;
  org: { id: string; name: string; avatarUrl?: string | null; isOrg?: boolean };
  title: string;
  description: string;
  category: string;
  startsAt: string;
  endsAt?: string | null;
  venue: string;
  universityCode?: string | null;
  city?: string;
  isOnline?: boolean;
  onlineUrl?: string | null;
  capacity?: number | null;
  priceKobo: number;
  status: string;
  posterUrl?: string | null;
  rsvpCount: number;
  myRsvp: boolean;
  createdAt: string;
}

export interface CartLine {
  listingId: string;
  title: string;
  priceKobo: number;
  qty: number;
  stock: number;
  shipAvailable: boolean;
  sellerId: string;
  sellerName: string;
  coverUrl?: string | null;
  unavailable?: boolean;
  negotiable?: boolean;
}

export interface Totals {
  subtotalKobo: number;
  shippingKobo: number;
  totalKobo: number;
}

export interface Conversation {
  conversationId: string;
  listingId?: string | null;
  listingTitle?: string | null;
  coverUrl?: string | null;
  updatedAt: string;
  unread: number;
  peer: { id: string; fullName: string; avatarUrl?: string | null };
  lastMessage?: { body: string; senderId: string; createdAt: string } | null;
}

export interface Message {
  id: string;
  sender_id: string;
  senderId?: string;
  body: string;
  kind: string;
  created_at: string;
  createdAt?: string;
  read_at?: string | null;
}

export interface OrderItem {
  orderItemId?: string;
  listingId: string;
  title: string;
  imageUrl?: string | null;
  unitPriceKobo: number;
  quantity: number;
  sellerId: string;
  meetupLocation?: string | null;
  reviewed?: boolean;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  itemTitle?: string;
  createdAt: string;
  buyer: { id: string; fullName: string; avatarUrl?: string | null };
}

export interface RatingSummary {
  avg: number | null;
  count: number;
}

export interface Order {
  id: string;
  orderNo: string;
  status: "pending_payment" | "paid" | "processing" | "completed" | "cancelled";
  fulfilment: "pickup" | "shipping";
  totals: { subtotalKobo: number; shippingKobo: number; serviceFeeKobo: number; totalKobo: number };
  contact?: { name: string; phone: string; address?: string | null; campusNote?: string | null };
  paymentMethod?: string;
  createdAt: string;
  paidAt?: string | null;
  items: OrderItem[];
  events?: { to_status: string; note?: string; created_at: string }[];
  payments?: { provider: string; reference: string; status: string; amount_kobo: number; created_at: string }[];
  buyerName?: string;
}
