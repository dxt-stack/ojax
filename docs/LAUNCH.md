# OjaX — Launch playbook (UNILAG pilot → national)

## Positioning
**OjaX = the trusted student marketplace + campus events hub.** The trust angle is the moat:
every profile shows a real university/dept/level, chats stay on-platform, meetups happen on campus.
Everything else (Jumia-style browsing, delivery) is table stakes — safety is what students actually need.

## Pilot (Weeks 0–4): one campus, two communities
1. **Pick the beachhead:** UNILAG (Lagos density + event scene). Then UI/OAU/LASU quickly after.
2. **Inventory supply first, not demand.** A marketplace dies with empty shelves — pre-list 60–100
   quality items with student "ambassadors" who earn ₦500/item sold through their referral listing.
3. **Winning categories on campus:** textbooks (semester start), electronics after grads move out
   (Jan/Jul), fashion & gadgets year-round, services (tutoring/gigs) as an always-on category.
4. **Launch events with day-1 partners:** NACOSS, JCI, hall associations post their first events on
   OjaX → instant demand-side traffic + PR ("your campus events now in one app").

## Trust & safety operations
- **Verification:** during pilot, manual "officer" step (screenshot of student ID + portal page)
  sets `verified=true`. Bulk email verification (`.edu.ng` + institution domain lists) later.
- **Moderation:** every listing/event passes a lightweight review queue at launch; grow to
  automated filters (scam phrases, price anomalies, brand-new accounts selling high-value items).
- **Abuse loops:** report buttons on chats/listings → admin inbox (build the admin panel in v1.1);
  evidence = conversation log + order snapshots (already snapshotted).
- **Escrow:** already designed — money is held until "confirm delivery" (sandbox now, Paystack split
  in launch). Use it as the headline trust feature.

## Commercial model
| Phase | Listing | Sell | Buyer delivery |
|---|---|---|---|
| Launch (0–6 mo) | Free | 0% | ₦2,500 flat (free ≥₦20k) |
| Scale | Free | 2.5% | ₦2,500 flat |
| Later | Promoted listings | 3% | + courier partnerships, on-campus locker pickup |

Event side: free for orgs → sponsored placements, ticket tooling (% on paid RSVPs later).

## Roadmap (next builds)
- Admin console (moderation, verification queue, fraud flags, payout dashboard).
- Push/WebSocket chat, email + SMS digests, event reminders.
- ~~Reviews & ratings post-delivery~~ ✅ **shipped** (v1.1): buyers rate sellers after confirmed delivery,
  one per purchase; shown on item pages & profiles.
- Paystack split payments: buyer pays → platform holds → seller payout on delivery confirm.
- Favourites-to-cart bundles, price-drop alerts.
- Mobile app (React Native wrapper around the same API).
- National expansion: universities registry already includes 27 schools; add onboarding flows per campus.
