# quadreria: build brief (v1.1)

As of 2026-11-20. Owner: Luciana. Domain: **quadreria.art**. Live app: Lovable project `1bf1873b-52c4-4ec6-baab-42272bb9e9a4`, synced to GitHub and continued in Claude Code.

v1.1 records Luciana's answers to the open questions (section 18) and the voseo decision for Spanish.

quadreria is an online gallery and marketplace. Every artist gets a page that feels like walking into their own room. Collectors buy physical art, hire artists for services, and buy tickets to artists' events. Tagline: **"Hire the artist, not the gig."** Spanish: **"Contratá al artista, no la chamba."** Launch in Honduras (Tegucigalpa, San Pedro Sula), then international.

---

## 1. Decisions at a glance

| Area | Decision |
| --- | --- |
| Roles | Artist and Collector only. Admin is a separate internal role. |
| Artist entry | Anyone can sign up; an admin approves the room **and the artist's first 3 pieces** before they go public. |
| Verification | Email + phone/WhatsApp to publish; government ID check (**Persona**) before first payout. |
| Free plan | Same room template for everyone. Free can change wall color (7), upload a custom background image, and hide/show sections. **Cap: 12 pieces.** |
| Pro plan (later) | Unlimited pieces, full room design (reorder sections, fonts, layouts, animated entrance), analytics, featured spots, artist-to-collector newsletters, "special" perks. |
| Languages | Spanish and English from day one, with a switch. **Spanish uses voseo (vos).** |
| Currency | Artist sets each price in their chosen currency; collectors can view prices converted into any currency (display estimate, clearly labeled). |
| Shipping | Artist ships their own work and sets flat rates by zone: Honduras, Central America, US/Canada, Rest of world. |
| Services | Artist chooses per service: fixed-price package (pay upfront) or request → quote → deposit. $20 consult option stays. |
| Events | Artists only. In person and online. Free sign-up or paid ticket, capacity, waitlist, QR check-in. One refund policy (below). |
| Contact | In-app messages (keeps deals and payments on platform). |
| Work wall default | Salon wall (mixed sizes, gallery style). Tidy grid stays as a toggle. |
| Reviews | Yes, only from verified collectors after a completed purchase, service or attended event. Stars + short note. |
| Collector extras | Wishlist (save pieces) and follow artists. |
| Fees | 8% products; 10% services, consults and paid tickets; plus payment processing. **Paid by the artist** (deducted from payout). |
| Payouts | Earned once the collector confirms receipt; **paid out biweekly**. |
| Disputes | Artist decides, plus a **minimum buyer-protection rule** (to be written; see section 13). |
| Payments provider | **Not decided.** Build checkout and payouts behind a provider-agnostic layer (Stripe Connect or PayPal). |
| Admin users | Just the owner for now. |
| Blog + newsletter | Blog written in quadreria's admin; email signups sync to Klaviyo, which sends the monthly newsletter. |
| Workflow | Lovable synced to GitHub; bigger features built in Claude Code; Lovable for quick visual tweaks. |

## 2. Roles and accounts

- **Collector:** browse, wishlist, follow, message artists, buy, book services, get tickets, review.
- **Artist:** everything a Collector can do, plus a room, studio dashboard, pieces, services, events, orders, payouts.
- **Admin (owner only for now):** everything in section 11. Roles live in their own table, never editable from the browser.
- Sign-up = the dating-app-style quiz at `/join`. Email + password or Google. Phone/WhatsApp verification before an artist can submit for approval.

## 3. Artist onboarding and approval

1. Quiz: role → name + handle → photo → mediums → what you want (sell, portfolio, services, events) → wall color → bio → links → account.
2. Artist lands in Studio with a checklist: verify phone, add at least 3 pieces, write bio, set shipping zones, submit for review.
3. Room status: `draft` → `in_review` → `approved` (public) or `changes_requested` (admin note shown in Studio).
4. An artist's **first 3 pieces always need admin approval**. After that, new pieces publish immediately (admin can still hide them).
5. ID check (Persona) required before the first payout; payouts held until done.

## 4. The artist room (`/a/:handle`)

Section order: Entrance (hero) → Work wall → Shop (collections, tags) → Services → Events → About (bio, studio photo, "things I love") → Links → FAQ → Reviews → Contact (opens in-app message). Phone: sticky bottom bar with "Hire me" and "Shop".

| Customization | Free | Pro |
| --- | --- | --- |
| Wall color (7) | Yes | Yes |
| Custom background image | Yes | Yes |
| Hide/show sections | Yes | Yes |
| Reorder sections | No | Yes |
| Fonts, layouts, animated entrance | No | Yes |
| Pieces | 12 max | Unlimited |
| Analytics, featured spots | No | Yes |
| Newsletter to their collectors | No | Yes |

Background image rule: text must stay readable; apply a Wall-colored panel behind text sections on top of custom backgrounds.

## 5. Pieces, shop and currency

- Fields: title, images (several, first is cover), price + currency, medium, size, year, collection, tags, ratio, edition (original / print / edition of N), quantity, ships from, shipping zone rates, status (available, sold, hidden).
- Never crop artwork; always true proportions.
- Currency: price stored in the artist's currency. Collector picks a display currency (remembered); show "≈ L 1,560" style estimates from a daily exchange-rate source, labeled as estimates. Checkout charges in the artist's currency (or the provider's settlement currency) and states it plainly.
- Shipping: artist sets a flat rate per zone; can mark a zone "no shipping" or "free". Order shows tracking number field for the artist.

## 6. Services

- Two types, chosen per service:
  - **Package:** fixed price, paid upfront, delivery time, revisions included.
  - **Quote:** collector sends a request (brief, budget, deadline, files) → artist replies with a quote in messages → collector pays a deposit (default 50%) → balance on delivery.
- **Consult:** $20, bookable on any artist who enables it.
- Service templates artists can opt into (editable price): Logo design, Branding kit, Custom painting, Portrait, Illustration, Mural, Photo session, Video edit, Private class.

## 7. Events and tickets

- Types: Class, Opening, Market, Online session. Fields: title, cover, date, start/end, city, address or online link (sent 24 h before), price (0 = free), capacity, what to bring, status.
- Tickets: reserved, waitlist, checked in, cancelled, transferred. Waitlist auto-promotes when a spot frees up. QR code per ticket; artist scans or taps to check in.
- **Refund policy (all events):** full refund up to 48 h before; after that no refund, but tickets can be transferred; if the artist cancels or moves the date, full refund including the platform fee.

## 8. Messages

- One thread per collector–artist pair, with optional context (a piece, a service request, an event).
- Text + images + file attachments; quote cards and "pay deposit" buttons appear inside the thread for quote-type services.
- Email notification for new messages (WhatsApp notifications are a later option).
- Admin can read a thread only when it is reported.

## 9. Collector features

- Wishlist (heart on every piece), Follow artists (notified of new pieces and events), My orders, My tickets, My bookings, Messages, Reviews they wrote.
- Reviews: after a delivered order, completed service or checked-in event. 1–5 stars + short note; artist can reply once.

## 10. Home page and discovery

- **Hero:** an animated sequence of art rooms through history (salons, cabinets of curiosities, galleries, studios), with **"quadreria" in negative space**: the wordmark is knocked out of a Wall-colored panel so the room images show through the letters. Luciana will supply the stock images (confirm licenses allow web use). Must respect reduced-motion (show one still image) and load fast on phones (compressed video or image sequence, not a heavy GIF).
- Below the hero: browse by medium chips, featured rooms, hire an artist, this week's events, magazine/blog picks, how it works, newsletter signup.
- Discover: tabs for Art, Artists, Services, Events; filters for medium, price, city, currency display.

## 11. Admin backend (`/admin`, owner only)

| Area | What it does |
| --- | --- |
| Review queue | Approve, reject or request changes on new rooms and each artist's first 3 pieces, with a note to the artist. |
| Curation | Pick featured artists, homepage order, collections, magazine picks. |
| Homepage | Swap hero media, banners and announcements. |
| Reports | Flagged pieces, rooms, reviews and messages; hide or remove. |
| Orders and disputes | See every order and its status; view the artist's decision on disputes; override in exceptional cases. |
| Payouts | See pending and paid payouts; place or lift a payout hold on an artist. |
| Money and stats | Sales, fees earned, payouts, signups, active artists, top artists and mediums, events and tickets. |
| Taxonomy | Add/rename mediums, tags, cities, event types, service templates (Spanish and English names). |
| Settings | Fee percentages, free piece cap, Pro plan features and price, refund policy text. |
| Blog | Write, schedule and publish bilingual posts (title, cover, body, featured artists). |
| Newsletter | Klaviyo connection; sync signups and lists (Collectors, Artists, by city); pull latest posts and featured rooms into the monthly email. |
| Users | Search users, see role and status, suspend accounts. |

## 12. Payments and payouts (provider not chosen)

- Build a `payments` service with one interface: create checkout, capture, refund, create payout, payout status. First adapter can be Stripe Connect or PayPal once the US company and bank are set up.
- Ledger table records every charge, fee, refund and payout so the numbers never depend on the provider.
- A sale becomes payable when the collector taps "Received". Services: on delivery accepted. Events: after the event date. Payable balances are paid out **every two weeks**.
- ID check (Persona) before first payout; admin holds can pause payouts.

## 13. Risks to resolve

- **Disputes:** "artist decides" is simple, but card disputes (chargebacks) land on quadreria as the merchant. Keep the admin override and write the minimum buyer-protection rule (decided: yes; wording still to write, e.g. item never arrived with no tracking = refund).
- **Delivery confirmation:** payouts depend on the collector tapping "Received". A collector who never confirms still blocks the artist. Decide a fallback (for example, count as received N days after tracking shows delivered).
- **Currency estimates:** label converted prices as estimates; charge in one stated currency.
- **Legal:** terms, privacy, refund policy and fee page need review by a lawyer in Honduras and the US.

## 14. Data model additions (on top of the current Lovable Cloud schema)

Existing (round 2): profiles, user roles, rooms, pieces, services, events, tickets, storage buckets.

Add: `room_status` + admin notes; `verifications` (email, phone, ID); `shipping_zones` per artist; `piece_images`; `currencies` + `exchange_rates`; `service_requests`, `quotes`; `orders`, `order_items`, `shipments`; `ledger_entries`, `payouts`, `payout_holds`; `threads`, `messages`, `attachments`; `wishlists`, `follows`; `reviews`; `reports`; `featured_slots`, `banners`; `blog_posts` (es/en); `newsletter_signups`; `taxonomy` (mediums, tags, cities, event types, service templates, with es/en names); `settings` (fees, caps, plan features); `plans` + `subscriptions` (Pro, later).

All tables use row-level security. Admin checks go through the roles table, never a profile field.

## 15. Brand reference

- Fraunces (logo, headlines, names, titles) + Jost (body, buttons, prices).
- Wall #FAF6F0, Ink #1F1B16, Tomato #E4572E, Sun #F2B134, Deep tomato #C2431C, Stone #6B6258, Line #E6DDD0, Card #FFFDF9. About 70% Wall, 22% Ink, 8% Tomato.
- Primary buttons: Tomato with Ink text. Room colors: Cream, Blush, Butter, Sage, Sky, Lilac, Ink.
- Wordmark: lowercase "quadreria", i-dot is a tilted Tomato square (Sun on Tomato). Icon: cream "q" on a Tomato rounded square.
- Words: studio, room, pieces, commission. Never: listing, vendor, seller, buyer, gig.
- Spanish words: estudio, sala, piezas, encargo, Artista, Coleccionista. Voseo throughout.

## 16. Tech and workflow

- Current stack (from Lovable): React + TypeScript, TanStack Start with file routes (`src/routes`), Tailwind v4 with custom utilities in `src/styles.css`, Lovable Cloud (Supabase: Postgres, auth, storage).
- Copy in `src/i18n` (`en.ts`, `es.ts`); see `docs/i18n.md`. Sample data in `src/data/sample.ts`, being replaced by database queries.
- Database schema changes go through Lovable (see AGENTS.md), not hand-written migrations.
- Workflow: connect the Lovable project to GitHub → clone in Claude Code → feature branches and pull requests → Lovable pulls changes back for visual tweaks. Avoid editing the same files in both at once.

## 17. Build order

1. **Foundation (in progress in Lovable):** auth, quiz sign-up, database, studio editing, free tickets, domain fix.
2. **Approval and limits:** room status flow, phone verification, 12-piece cap, first-3-pieces review, free vs Pro styling rules, admin review queue.
3. **Spanish + English:** `es.ts`, language switch, bilingual fields for blog and taxonomy. *(UI done on branch `feature/i18n-es`; bilingual DB fields wait for those tables.)*
4. **Messages + services:** threads, service requests, quotes, consult booking.
5. **Commerce:** shipping zones, currency display, cart, orders, provider-agnostic checkout, ledger, delivery confirmation, biweekly payouts.
6. **Admin backend:** curation, homepage, reports, money and stats, settings, users.
7. **Community:** wishlist, follow, reviews, notifications.
8. **Content:** blog, Klaviyo sync, new home hero with negative-space wordmark.
9. **Pro plan:** subscriptions, room designer, analytics, artist newsletters.

## 18. Open questions

| Question | Status |
| --- | --- |
| Payment provider (Stripe Connect vs PayPal vs both) | Open, waiting on the US company and bank account. |
| ID verification provider | **Persona.** Still to decide which Honduran documents count. |
| Payout timing | **Biweekly payouts after the collector confirms receipt.** Fallback for collectors who never confirm is still open (section 13). |
| Minimum buyer-protection rule | **Yes.** Wording still to write. |
| Exchange-rate source for currency estimates | Answered "updated"; the specific source still needs naming. |
| Should artists' first 3 pieces always need approval? | **Yes.** |
| Pro plan price and exact perks | Open. |
| Home hero stock images, licenses, number of rooms | Open. |
| Klaviyo account and list structure | Open. |
