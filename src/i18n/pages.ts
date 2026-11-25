import { useTaxonomy } from "@/components/q/TaxonomyProvider";

/**
 * Copy for the home gallery and FAQ, the events search, maps, the About page additions and the
 * link checker. One object per language; Spanish uses vos.
 */
type Faq = [question: string, answer: string][];

const en = {
  join: { label: "Your next step", studio: "Go to your studio", findArt: "Find art" },
  home: {
    galleryKicker: "From the rooms",
    galleryTitle: "A wall of work",
    galleryNote: "A piece from every room. Tap one to step inside.",
    faqTitle: "Questions, answered",
    faq: [
      ["What is quadreria?", "An online gallery where every artist has a room of their own. You can buy original work and prints, hire artists for commissions, and get tickets to their classes and openings."],
      ["How do I buy a piece?", "Open the piece you like and add it to your cart. The artist packs it and ships it to you themselves."],
      ["Is my purchase protected?", "Yes. Every purchase has buyer protection, and the artist is paid after you confirm your piece arrived."],
      ["Can I hire an artist for something custom?", "Yes. Many artists take commissions or offer consults. Find them under Services, or in the artist's room."],
      ["What if I can't make it to an event?", "You get a full refund up to 48 hours before. After that, you can pass your ticket to a friend. If the artist cancels or moves the date, everyone gets a full refund."],
      ["Where are the artists?", "We're starting in Honduras, in Tegucigalpa and San Pedro Sula. Artists can join from any city in the world."],
    ] as Faq,
  },
  events: {
    search: "Search by city, event or artist",
    city: "City",
    type: "Type",
    count: (n: number) => (n === 1 ? "1 event" : `${n} events`),
    clear: "Clear filters",
  },
  maps: {
    title: "Getting there",
    open: "Open in Google Maps",
    frame: (place: string) => `Map of ${place}`,
  },
  about: {
    artistsCta: "Open your room",
    collectorsCta: "Start collecting",
    exampleKicker: "See it for yourself",
    exampleTitle: "Why every artist needs a room",
    exampleBody: "Social media scrolls past your work in a second. A room keeps everything in one place, hung the way you like, with one link you can share anywhere.",
    exampleListTitle: "Inside a room you'll find",
    exampleList: [
      "A work wall, hung salon style",
      "A shop with prices, sizes and stock",
      "Commissions and services people can book",
      "Classes, openings and markets",
      "The artist's story, links and answers to common questions",
    ],
    exampleCta: "Come in, see an example room",
    founderKicker: "Meet the founder",
    founderTitle: "Hi, I'm Luciana",
    founderBody: [
      "I started quadreria because artists deserve to earn a living from their work, and because finding and buying art should be easy.",
      "quadreria was founded by LGBTQ+ women, starting at home in Honduras.",
    ],
    founderPhoto: "Luciana, founder of quadreria",
    faqTitle: "Questions, answered",
    faq: [
      ["What does quadreria mean?", "It comes from the Italian quadro, a painting. A quadreria is a gallery of paintings: the rooms in old palaces where pictures hung wall to wall."],
      ["Who started quadreria?", "quadreria was founded by LGBTQ+ women, starting in Honduras."],
      ["How much does it cost to open a room?", "Opening a room is free. A Pro plan with extra tools is coming soon."],
      ["How do artists get paid?", "Artists are paid every two weeks, after the collector confirms their order arrived."],
      ["Who ships the work?", "Artists pack and ship their own work and set their own shipping rates."],
      ["Is every piece reviewed?", "An artist's first three pieces are reviewed by our team before they go live. After that, artists publish on their own."],
      ["Can I join from outside Honduras?", "Yes. Artists and collectors can join from any city in the world."],
    ] as Faq,
  },
  links: {
    goesTo: "Goes to",
    check: "Check",
    checkLabel: (url: string) => `Open ${url} in a new tab to check it`,
    invalid: "That doesn't look like a username or link for this site.",
  },
};

const es: typeof en = {
  join: { label: "Tu siguiente paso", studio: "Ir a tu estudio", findArt: "Buscar arte" },
  home: {
    galleryKicker: "Desde las salas",
    galleryTitle: "Un muro de obra",
    galleryNote: "Una pieza de cada sala. Tocá una para entrar.",
    faqTitle: "Preguntas frecuentes",
    faq: [
      ["¿Qué es quadreria?", "Una galería en línea donde cada artista tiene su propia sala. Podés comprar obra original e impresiones, contratar artistas para encargos y conseguir entradas a sus clases e inauguraciones."],
      ["¿Cómo compro una pieza?", "Abrí la pieza que te gusta y agregala a tu carrito. El artista la empaca y te la envía."],
      ["¿Mi compra está protegida?", "Sí. Toda compra tiene protección al comprador, y el artista recibe el pago cuando confirmás que tu pieza llegó."],
      ["¿Puedo contratar a un artista para algo a la medida?", "Sí. Muchos artistas aceptan encargos u ofrecen consultas. Los encontrás en Servicios o en la sala de cada artista."],
      ["¿Y si no puedo ir a un evento?", "Te devolvemos todo hasta 48 horas antes. Después de eso, podés pasarle tu entrada a alguien. Si el artista cancela o cambia la fecha, todos reciben su dinero de vuelta."],
      ["¿Dónde están los artistas?", "Empezamos en Honduras, en Tegucigalpa y San Pedro Sula. Los artistas se pueden unir desde cualquier ciudad del mundo."],
    ],
  },
  events: {
    search: "Buscá por ciudad, evento o artista",
    city: "Ciudad",
    type: "Tipo",
    count: (n: number) => (n === 1 ? "1 evento" : `${n} eventos`),
    clear: "Quitar filtros",
  },
  maps: {
    title: "Cómo llegar",
    open: "Abrir en Google Maps",
    frame: (place: string) => `Mapa de ${place}`,
  },
  about: {
    artistsCta: "Abrí tu sala",
    collectorsCta: "Empezá a coleccionar",
    exampleKicker: "Miralo por vos",
    exampleTitle: "Por qué todo artista necesita una sala",
    exampleBody: "En redes sociales tu obra pasa en un segundo. Una sala guarda todo en un solo lugar, colgado a tu manera, con un enlace que podés compartir donde sea.",
    exampleListTitle: "Dentro de una sala encontrás",
    exampleList: [
      "Un muro de obra, colgado estilo salón",
      "Una tienda con precios, medidas y existencias",
      "Encargos y servicios para reservar",
      "Clases, inauguraciones y mercados",
      "La historia del artista, sus enlaces y respuestas a preguntas comunes",
    ],
    exampleCta: "Pasá, mirá una sala de ejemplo",
    founderKicker: "Conocé a la fundadora",
    founderTitle: "Hola, soy Luciana",
    founderBody: [
      "Empecé quadreria porque los artistas merecen vivir de su obra, y porque encontrar y comprar arte debería ser fácil.",
      "quadreria fue fundada por mujeres LGBTQ+, empezando en casa, en Honduras.",
    ],
    founderPhoto: "Luciana, fundadora de quadreria",
    faqTitle: "Preguntas frecuentes",
    faq: [
      ["¿Qué significa quadreria?", "Viene del italiano quadro, una pintura. Una quadreria es una galería de pinturas: las salas de los palacios antiguos donde los cuadros colgaban de pared a pared."],
      ["¿Quién fundó quadreria?", "quadreria fue fundada por mujeres LGBTQ+, empezando en Honduras."],
      ["¿Cuánto cuesta abrir una sala?", "Abrir una sala es gratis. Pronto habrá un plan Pro con más herramientas."],
      ["¿Cómo reciben su pago los artistas?", "Los artistas reciben su pago cada dos semanas, cuando quien compró confirma que su pedido llegó."],
      ["¿Quién envía la obra?", "Cada artista empaca y envía su propia obra, y pone sus propias tarifas de envío."],
      ["¿Se revisa cada pieza?", "Nuestro equipo revisa las primeras tres piezas de cada artista antes de publicarlas. Después, cada artista publica por su cuenta."],
      ["¿Me puedo unir desde fuera de Honduras?", "Sí. Artistas y coleccionistas se pueden unir desde cualquier ciudad del mundo."],
    ],
  },
  links: {
    goesTo: "Lleva a",
    check: "Probar",
    checkLabel: (url: string) => `Abrir ${url} en otra pestaña para probarlo`,
    invalid: "Eso no parece un usuario o enlace de este sitio.",
  },
};

export const pagesCopy = { en, es };
export type PagesCopy = typeof en;
export const usePagesCopy = (): PagesCopy => pagesCopy[useTaxonomy().lang];

/** schema.org FAQPage data, so search engines and AI answers can quote the questions. */
export const faqJsonLd = (faq: Faq) => JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
});
