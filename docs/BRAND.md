# OjaX — Brand & product brief (for the team)

## Name
**OjaX** — *ojà* (Yoruba: market) + *X* (exchange / the crossroads where campus meets market).

## Tagline
**Your campus, one market.**

## Voice
Confident, warm, Nigerian. No corporate jargon. Speaks like a senior student who has your back:
> "No strangers. No wahala." — "Meet at the library gate, not a lonely car park."

## Visual identity (v1)
- **Colour:** Market Orange `#FF5A1F` → `#FF8A00` gradient (energy of a busy market day);
  deep ink `#101828` for text/nav contrast; soft peach tint `#FFF0E8` for active states.
- **Logo:** market-stall awning over an "O" (in `client/public/favicon.svg`, `LogoMark` in code) —
  the awning = safety + commerce, the O = OjaX.
- **Type:** Inter everywhere (system stack in CSS).
- **Layout language:** Jumia-style dense card grid + category rail — familiar to every Nigerian
  shopper — but with cleaner cards, campus-first copy and orange personality.

## Page inventory (v1 shipped)
Home (rails: fresh/popular/events/how-it-works) · Browse (filters/sort/search) · Item detail
(gallery, buybox, seller card, related) · Sell (photo upload up to 8) · Cart/Checkout/Pay ·
Dashboard (overview, listings, orders, sales, favorites, events, settings) · Messages ·
Events browse/detail · Profile · Auth (student/org) · About/Safety/Help/Contact.

## Content guardrails
- All prices in ₦; never promise "delivery by X" until a courier contract exists.
- Safety content is always concrete (public spots, no advance payments, on-platform chat).
- Demo/seed data must never leak into production (see DEPLOYMENT.md).
