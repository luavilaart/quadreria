/** Google Maps links for an event's place, built from the venue, address and city. No API key needed. */
export function placeQuery(parts: (string | null | undefined)[]): string {
  const seen = new Set<string>();
  return parts
    .map((p) => (p ?? "").trim())
    .filter((p) => p && p !== "Online" && !seen.has(p.toLowerCase()) && seen.add(p.toLowerCase()))
    .join(", ");
}
export const mapsSearchUrl = (place: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
export const mapsEmbedUrl = (place: string) => `https://maps.google.com/maps?q=${encodeURIComponent(place)}&z=15&output=embed`;
