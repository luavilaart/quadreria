// SAMPLE DATA — invented artists, pieces and events for the first design pass.
export type RoomColor = "cream" | "blush" | "butter" | "sage" | "sky" | "lilac" | "ink";
export const roomColors: { id: RoomColor; name: string }[] = [
  { id: "cream", name: "Cream" }, { id: "blush", name: "Blush" }, { id: "butter", name: "Butter" },
  { id: "sage", name: "Sage" }, { id: "sky", name: "Sky" }, { id: "lilac", name: "Lilac" }, { id: "ink", name: "Ink" },
];
export const mediums = ["Painting", "Illustration", "Photography", "Ceramics", "Textiles & crochet", "Prints", "Stickers", "Graphic design", "Video"];
export const cities = ["Tegucigalpa", "San Pedro Sula", "Online"];
export const eventTypes = ["Class", "Opening", "Market", "Online session"] as const;

export type Piece = {
  id: string; artist: string; title: string; price: number; ratio: number; // width / height
  medium: string; size: string; tone: RoomColor; shape: number; collection: string; tags: string[]; city: string;
};
export type Service = { id: string; artist: string; title: string; price: string; note: string };
export type Event = {
  id: string; artist: string; title: string; type: (typeof eventTypes)[number]; date: string; time: string;
  city: string; address?: string; price: number; spots: number; capacity: number; bring: string[]; blurb: string; tone: RoomColor;
};
export type Artist = {
  handle: string; name: string; tagline: string; room: RoomColor; city: string; mediums: string[];
  bio: string; loves: string[]; links: { label: string; url: string }[]; faq: { q: string; a: string }[];
};

export const artists: Artist[] = [
  {
    handle: "mara", name: "Mara Quintero", tagline: "Big quiet paintings about small loud afternoons.", room: "blush",
    city: "San Pedro Sula", mediums: ["Painting", "Prints"],
    bio: "I paint in a converted garage with the door open. Most of my work starts as a color I saw on a bus. (Sample artist.)",
    loves: ["Mango season", "Rothko", "Radio novelas", "Terracotta"],
    links: [{ label: "Instagram", url: "#" }, { label: "Newsletter", url: "#" }, { label: "Studio playlist", url: "#" }],
    faq: [{ q: "Do you take commissions?", a: "Yes. Book a $20 consult and we'll talk size, color and timing." }, { q: "How are paintings shipped?", a: "Rolled in a tube or crated, depending on size. Always insured." }],
  },
  {
    handle: "tito", name: "Tito Reyes", tagline: "Crochet, but make it architecture.", room: "sage",
    city: "Tegucigalpa", mediums: ["Textiles & crochet", "Ceramics"],
    bio: "My grandmother taught me one stitch. I've been showing off ever since. I teach small classes every week. (Sample artist.)",
    loves: ["Wool from Intibucá", "Bauhaus", "Coffee at 6am", "Patience"],
    links: [{ label: "Instagram", url: "#" }, { label: "TikTok", url: "#" }, { label: "Pattern shop", url: "#" }],
    faq: [{ q: "Are classes beginner friendly?", a: "Very. If you can hold a pencil, you can crochet." }, { q: "Can I order a custom color?", a: "Of course. Message me before ordering." }],
  },
  {
    handle: "lu", name: "Lu Ferrer", tagline: "Stickers, posters and drawings with opinions.", room: "ink",
    city: "Online", mediums: ["Illustration", "Stickers", "Graphic design"],
    bio: "Illustrator and designer. I draw tiny creatures with big feelings and logos for people starting something. (Sample artist.)",
    loves: ["Risograph", "Cats", "Comic shops", "Neon signs"],
    links: [{ label: "Instagram", url: "#" }, { label: "Behance", url: "#" }, { label: "YouTube", url: "#" }],
    faq: [{ q: "How long does a logo take?", a: "About three weeks, with two rounds of changes." }, { q: "Do stickers ship worldwide?", a: "Yes, in a flat envelope with a little surprise." }],
  },
];

export const pieces: Piece[] = [
  { id: "p1", artist: "mara", title: "Siesta en rosa", price: 640, ratio: 4 / 5, medium: "Painting", size: "60 × 75 cm", tone: "butter", shape: 0, collection: "Afternoons", tags: ["original", "acrylic"], city: "San Pedro Sula" },
  { id: "p2", artist: "mara", title: "Bus window, 4pm", price: 420, ratio: 3 / 2, medium: "Painting", size: "90 × 60 cm", tone: "sky", shape: 1, collection: "Afternoons", tags: ["original"], city: "San Pedro Sula" },
  { id: "p3", artist: "mara", title: "Mango study", price: 45, ratio: 1, medium: "Prints", size: "30 × 30 cm", tone: "cream", shape: 2, collection: "Prints", tags: ["print", "edition of 50"], city: "San Pedro Sula" },
  { id: "p4", artist: "mara", title: "Two chairs", price: 380, ratio: 4 / 5, medium: "Painting", size: "40 × 50 cm", tone: "lilac", shape: 3, collection: "Interiors", tags: ["original"], city: "San Pedro Sula" },
  { id: "p5", artist: "tito", title: "Arch I", price: 180, ratio: 4 / 5, medium: "Textiles & crochet", size: "40 × 50 cm", tone: "cream", shape: 1, collection: "Arches", tags: ["wall hanging", "wool"], city: "Tegucigalpa" },
  { id: "p6", artist: "tito", title: "Little cup, big hug", price: 38, ratio: 1, medium: "Ceramics", size: "9 cm tall", tone: "blush", shape: 2, collection: "Cups", tags: ["stoneware"], city: "Tegucigalpa" },
  { id: "p7", artist: "tito", title: "Arch II", price: 210, ratio: 2 / 3, medium: "Textiles & crochet", size: "40 × 60 cm", tone: "butter", shape: 3, collection: "Arches", tags: ["wall hanging"], city: "Tegucigalpa" },
  { id: "p8", artist: "tito", title: "Grid blanket", price: 260, ratio: 3 / 2, medium: "Textiles & crochet", size: "120 × 80 cm", tone: "sky", shape: 0, collection: "Home", tags: ["cotton"], city: "Tegucigalpa" },
  { id: "p9", artist: "lu", title: "Grumpy moth sticker", price: 4, ratio: 1, medium: "Stickers", size: "7 × 7 cm", tone: "butter", shape: 2, collection: "Stickers", tags: ["vinyl", "waterproof"], city: "Online" },
  { id: "p10", artist: "lu", title: "Night bus poster", price: 28, ratio: 2 / 3, medium: "Illustration", size: "A3", tone: "lilac", shape: 1, collection: "Posters", tags: ["riso"], city: "Online" },
  { id: "p11", artist: "lu", title: "Sticker pack: Feelings", price: 12, ratio: 3 / 2, medium: "Stickers", size: "6 stickers", tone: "blush", shape: 0, collection: "Stickers", tags: ["pack"], city: "Online" },
  { id: "p12", artist: "lu", title: "Cat committee", price: 35, ratio: 4 / 5, medium: "Prints", size: "A4", tone: "sage", shape: 3, collection: "Posters", tags: ["giclée"], city: "Online" },
];

export const services: Service[] = [
  { id: "s1", artist: "mara", title: "Custom painting", price: "Book a $20 consult", note: "Your wall, your colors. 4–6 weeks." },
  { id: "s2", artist: "mara", title: "Color consult for your home", price: "$60", note: "One hour, video or in person." },
  { id: "s3", artist: "tito", title: "Private crochet lesson", price: "$25 / hour", note: "At your place or my studio." },
  { id: "s4", artist: "lu", title: "Logo design", price: "$350", note: "Three concepts, two rounds of changes." },
  { id: "s5", artist: "lu", title: "Pet portrait illustration", price: "$80", note: "Digital, ready to print." },
];

export const events: Event[] = [
  { id: "e1", artist: "tito", title: "Crochet for absolute beginners", type: "Class", date: "2026-11-24", time: "5:00 – 7:30 pm", city: "Tegucigalpa", address: "Casa Taller, Col. Palmira", price: 30, spots: 4, capacity: 10, bring: ["Nothing! Yarn and hooks included", "A snack to share, if you like"], blurb: "Learn the chain, the single stitch and how to not panic. You'll leave with a coaster.", tone: "sage" },
  { id: "e2", artist: "mara", title: "Afternoons — opening night", type: "Opening", date: "2026-11-26", time: "7:00 – 10:00 pm", city: "San Pedro Sula", address: "Galería Barrio Río de Piedras", price: 0, spots: 60, capacity: 80, bring: ["Friends", "Opinions about pink"], blurb: "Twelve new paintings, one very long table and horchata.", tone: "blush" },
  { id: "e3", artist: "lu", title: "Draw-along: tiny creatures", type: "Online session", date: "2026-11-25", time: "6:00 – 7:00 pm (CST)", city: "Online", price: 8, spots: 0, capacity: 40, bring: ["Paper and a pen", "Camera optional"], blurb: "We draw five creatures in one hour. No talent required, only curiosity.", tone: "lilac" },
  { id: "e4", artist: "tito", title: "Sunday makers market", type: "Market", date: "2026-11-29", time: "9:00 am – 2:00 pm", city: "Tegucigalpa", address: "Paseo Liquidámbar", price: 0, spots: 200, capacity: 200, bring: ["A tote bag"], blurb: "Twenty artists, one sunny plaza. Come say hi.", tone: "butter" },
];

export const artistBy = (h: string) => artists.find((a) => a.handle === h);
export const piecesBy = (h: string) => pieces.filter((p) => p.artist === h);
export const servicesBy = (h: string) => services.filter((s) => s.artist === h);
export const eventsBy = (h: string) => events.filter((e) => e.artist === h);
export const usd = (n: number) => (n === 0 ? "Free" : `$${n.toLocaleString("en-US")}`);
export const fmtDate = (d: string, opts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }) =>
  new Date(d + "T12:00:00").toLocaleDateString("en-US", opts);
