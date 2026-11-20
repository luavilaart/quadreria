import { accountCopy } from "./accounts";
// All UI copy lives here so a Spanish file can be added later with the same shape.
export const en = {
  account: accountCopy,
  tagline: "Hire the artist, not the gig.",
  sample: "Sample data",
  nav: { discover: "Discover", events: "Events", join: "Join", studio: "Studio" },
  home: {
    intro: "An online gallery where every artist has a room. Walk in, look around, take something home.",
    findArt: "Find art",
    openRoom: "Open your room",
    byMedium: "Browse by medium",
    featured: "Step into a room",
    hire: "Hire an artist",
    hireSub: "Real people, real taste. Book them directly.",
    thisWeek: "This week",
    how: "How it works",
    forArtists: "For Artists",
    forCollectors: "For Collectors",
    artistSteps: ["Pick a wall color and fill your room.", "Sell work, offer services, host events.", "Get paid. Keep doing your thing."],
    collectorSteps: ["Wander through rooms you like.", "Buy a piece, book a service or grab a ticket.", "Support the artist directly."],
  },
  footer: ["About", "How it works", "Fees", "Refunds", "Help", "Terms", "Privacy"],
  room: {
    work: "Work wall", shop: "Shop", services: "Services", events: "Events", about: "About",
    love: "Things I love", links: "Links", faq: "FAQ", contact: "Say hello", hire: "Hire me",
    send: "Send message", all: "All", tidy: "Tidy", salon: "Salon",
  },
  piece: { add: "Add to cart", more: "More from this room", size: "Size", medium: "Medium", ships: "Ships from" },
  event: {
    get: "Get ticket", waitlist: "Join waitlist", spots: "spots left", full: "Full", free: "Free", online: "Online",
    bring: "What to bring", refundTitle: "Refunds, plainly",
    refund: [
      "Full refund up to 48 hours before the event.",
      "After that, you can transfer your ticket to a friend.",
      "If the artist cancels or moves the date, everyone gets a full refund.",
    ],
  },
};
export const t = en;
