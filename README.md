# quadreria

Build the first version of **quadreria** (quadreria.com), an online gallery and marketplace where every artist gets a page that feels like walking into their own room. Collectors can buy art (originals, prints, stickers, anything physical), hire the artist for services, and buy tickets to their events (classes, openings, markets, online sessions). Tagline: "Hire the artist, not the gig." Two roles only: **Artist** and **Collector** (never "buyer", "seller", "vendor", "listing" or "gig").

This first pass is the front end only, phone-first, with clearly fake sample data. No auth, database or payments yet; we'll add those next. Make every page work beautifully at 390px wide, then scale up to desktop.

## Brand (follow exactly)
- Logo: the word "quadreria" in lowercase Fraunces (Google Fonts, weight 600, letter-spacing -0.02em). The dot of the "i" is replaced by a small tilted square (about 0.19em, rotated 12°, slightly rounded corners) in Tomato. Build it as a reusable `<Wordmark />` component (use a dotless ı plus an absolutely positioned square). Icon/favicon: a cream lowercase "q" in Fraunces on a Tomato rounded square.
- Fonts: Fraunces for the logo, headlines, artist names and piece titles. Jost for body, buttons, prices, labels. Labels are small uppercase with wide letter-spacing.
- Colors (add as Tailwind/CSS tokens):
  - Wall #FAF6F0 (page background, ~70% of any screen)
  - Ink #1F1B16 (text, ~22%)
  - Tomato #E4572E (the i-dot, primary buttons, highlights, ~8% max)
  - Sun #F2B134 (the i-dot when the logo sits on Tomato)
  - Deep tomato #C2431C (links and small orange text)
  - Stone #6B6258 (secondary text)
  - Line #E6DDD0 (borders, dividers)
  - Card #FFFDF9 (card backgrounds)
- Contrast rules: primary buttons are Tomato with **Ink text** (never cream text on Tomato at small sizes). Tomato text only at large sizes.
- Room colors (the wall color each artist picks for their page): Cream #FAF6F0, Blush #F6DCD2, Butter #F7E8B8, Sage #D3E0C9, Sky #D2E3EE, Lilac #E0D9EF, Ink #1F1B16 (with cream text).
- Feel: warm, fresh, modern, calm. Big margins, rounded corners (16px cards, pill buttons), no gradients, no heavy shadows, one accent per screen. The art is always the loudest thing; never crop artwork, keep its real proportions. Voice: warm, curious, a little playful, short sentences.
- A decorative "frame molding" strip (a thin repeating SVG pattern like a Greek key line in Ink) can be used once in the home hero under the wordmark, sliding slowly to the right.

## Pages for this version
1. **Home** (`/`): hero with wordmark, tagline and two buttons ("Find art" and "Open your room"); browse-by-medium chips (Painting, Illustration, Photography, Ceramics, Textiles & crochet, Prints, Stickers, Graphic design, Video); featured artists as room cards (each card uses the artist's room color); "Hire an artist" strip with service cards; "This week" events strip; short "How it works" for Artists and Collectors; footer (About, How it works, Fees, Refunds, Help, Terms, Privacy).
2. **Discover** (`/discover`): grid of pieces with filters for medium, price and city; tabs for Art, Artists, Services, Events.
3. **Artist room** (`/a/:handle`), the most important page. A fixed template the artist fills in, with sections in this order: Entrance (hero with name in Fraunces, one-line tagline, photo, room color as background); Work wall (salon-style or tidy grid of pieces); Shop with collections and tags; Services (e.g. "Logo design – $X", "Custom painting – Book a $20 consult"); Events (upcoming events with date, place or "Online", price or "Free", spots left); About (bio, studio photo, a few "things I love" chips); Links (social links, Linktree style); FAQ (accordion); Contact. On phones, a sticky bottom bar with "Hire me" and "Shop". Make 3 sample artists with different room colors so the template's range shows.
4. **Piece page** (`/a/:handle/p/:id`): large image at true proportions, title, price, size, medium, ships-from and shipping note, Add to cart, and "More from this room".
5. **Event page** (`/a/:handle/e/:id`): cover, date and time, in person (address, city) or online, price or free, spots left, what to bring, "Get ticket" or "Join waitlist" when full, and the refund rule: full refund up to 48 hours before; after that, tickets can be transferred to a friend; if the artist cancels or moves the date, everyone gets a full refund.
6. **Events calendar** (`/events`): list grouped by date, filters for city (Tegucigalpa, San Pedro Sula, Online) and type (Class, Opening, Market, Online session).
7. **Sign-up quiz** (`/join`): dating-app style, one question per full-screen card with a progress bar and big tappable answers. Step 1: "I'm here as…" Artist / Collector. Artist path: name and handle → profile photo upload (UI only) → mediums (multi-select chips) → what you want (multi-select: Sell my art, Show my portfolio, Offer services, Host events) → pick your room color (the 7 swatches) → short bio → links → finish screen showing a preview of their room. Collector path: name → what you love (mediums) → city → done.
8. **Artist studio** (`/studio`): a simple dashboard shell with tabs for Edit room, Products, Collections, Services, Events (with attendee list and a "Check in" QR button), Orders, Payouts. Placeholder content is fine.

## Sample data
Use invented artists and pieces, and mark them as sample data. For artwork images use simple abstract placeholders (solid blocks or soft shapes in the room colors at varied aspect ratios such as 4:5, 1:1, 3:2) rather than stock photos. Prices in USD. Include at least one crochet class, one gallery opening and one online drawing session.

## Notes for later (don't build yet)
Later we will add Lovable Cloud auth and a database, Stripe or PayPal for payments and payouts, a 20% platform fee breakdown page, a magazine section, and English/Spanish language switching. Structure the code so content and copy are easy to translate.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://quadreria.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/1bf1873b-52c4-4ec6-baab-42272bb9e9a4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
