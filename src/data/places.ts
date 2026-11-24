/**
 * Cities for the artist quiz. Artists can type any city in the world; this list only feeds
 * suggestions so common spellings stay consistent (which keeps the City filter tidy).
 * Honduran cities are stored by name alone, as before; cities elsewhere as "City, Country".
 */
export const featuredCities = ["Tegucigalpa", "San Pedro Sula", "Online"] as const;

const honduras = [
  "Tegucigalpa", "San Pedro Sula", "La Ceiba", "Choluteca", "Comayagua", "El Progreso", "Puerto Cortés", "Danlí",
  "Juticalpa", "Siguatepeque", "Santa Rosa de Copán", "Copán Ruinas", "Tela", "Roatán", "Utila", "Gracias",
  "Olanchito", "Catacamas", "Trujillo", "Yoro",
];

const world: [string, string][] = [
  // Central America and the Caribbean
  ["Guatemala City", "Guatemala"], ["Antigua Guatemala", "Guatemala"], ["Quetzaltenango", "Guatemala"],
  ["San Salvador", "El Salvador"], ["Santa Ana", "El Salvador"], ["Managua", "Nicaragua"], ["León", "Nicaragua"],
  ["Granada", "Nicaragua"], ["San José", "Costa Rica"], ["Panama City", "Panama"], ["Belize City", "Belize"],
  ["Havana", "Cuba"], ["Santo Domingo", "Dominican Republic"], ["San Juan", "Puerto Rico"], ["Kingston", "Jamaica"],
  // Mexico
  ["Mexico City", "Mexico"], ["Guadalajara", "Mexico"], ["Monterrey", "Mexico"], ["Oaxaca", "Mexico"],
  ["Mérida", "Mexico"], ["Puebla", "Mexico"], ["Tijuana", "Mexico"],
  // United States and Canada
  ["New York", "United States"], ["Los Angeles", "United States"], ["Miami", "United States"],
  ["Houston", "United States"], ["Chicago", "United States"], ["San Francisco", "United States"],
  ["New Orleans", "United States"], ["Washington", "United States"], ["Atlanta", "United States"],
  ["Dallas", "United States"], ["Austin", "United States"], ["Boston", "United States"], ["Seattle", "United States"],
  ["Philadelphia", "United States"], ["Charlotte", "United States"],
  ["Toronto", "Canada"], ["Montreal", "Canada"], ["Vancouver", "Canada"],
  // South America
  ["Bogotá", "Colombia"], ["Medellín", "Colombia"], ["Cali", "Colombia"], ["Cartagena", "Colombia"],
  ["Lima", "Peru"], ["Cusco", "Peru"], ["Quito", "Ecuador"], ["Guayaquil", "Ecuador"], ["Caracas", "Venezuela"],
  ["Santiago", "Chile"], ["Valparaíso", "Chile"], ["Buenos Aires", "Argentina"], ["Córdoba", "Argentina"],
  ["Montevideo", "Uruguay"], ["Asunción", "Paraguay"], ["La Paz", "Bolivia"], ["São Paulo", "Brazil"],
  ["Rio de Janeiro", "Brazil"],
  // Europe
  ["Madrid", "Spain"], ["Barcelona", "Spain"], ["Seville", "Spain"], ["Valencia", "Spain"], ["Lisbon", "Portugal"],
  ["Porto", "Portugal"], ["Paris", "France"], ["Lyon", "France"], ["London", "United Kingdom"],
  ["Manchester", "United Kingdom"], ["Edinburgh", "United Kingdom"], ["Dublin", "Ireland"],
  ["Amsterdam", "Netherlands"], ["Brussels", "Belgium"], ["Berlin", "Germany"], ["Munich", "Germany"],
  ["Hamburg", "Germany"], ["Vienna", "Austria"], ["Zurich", "Switzerland"], ["Rome", "Italy"], ["Milan", "Italy"],
  ["Florence", "Italy"], ["Naples", "Italy"], ["Venice", "Italy"], ["Athens", "Greece"], ["Copenhagen", "Denmark"],
  ["Stockholm", "Sweden"], ["Oslo", "Norway"], ["Helsinki", "Finland"], ["Warsaw", "Poland"],
  ["Prague", "Czechia"], ["Budapest", "Hungary"], ["Istanbul", "Türkiye"],
  // Africa and the Middle East
  ["Cairo", "Egypt"], ["Marrakesh", "Morocco"], ["Lagos", "Nigeria"], ["Accra", "Ghana"], ["Nairobi", "Kenya"],
  ["Cape Town", "South Africa"], ["Johannesburg", "South Africa"], ["Dakar", "Senegal"], ["Dubai", "United Arab Emirates"],
  ["Tel Aviv", "Israel"], ["Beirut", "Lebanon"],
  // Asia and Oceania
  ["Tokyo", "Japan"], ["Kyoto", "Japan"], ["Osaka", "Japan"], ["Seoul", "South Korea"], ["Beijing", "China"],
  ["Shanghai", "China"], ["Hong Kong", "China"], ["Taipei", "Taiwan"], ["Singapore", "Singapore"],
  ["Bangkok", "Thailand"], ["Hanoi", "Vietnam"], ["Ho Chi Minh City", "Vietnam"], ["Manila", "Philippines"],
  ["Jakarta", "Indonesia"], ["Mumbai", "India"], ["New Delhi", "India"], ["Bangalore", "India"],
  ["Sydney", "Australia"], ["Melbourne", "Australia"], ["Auckland", "New Zealand"],
];

/** Every suggested city, in the exact form it is stored. */
export const citySuggestions: string[] = [...honduras, "Online", ...world.map(([city, country]) => `${city}, ${country}`)];

const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Cleans what an artist typed. A known city (accents and capitals aside) becomes its suggested
 * spelling; anything else is kept as typed, trimmed, up to 80 characters.
 */
export function normalizeCity(raw: string): string {
  const text = raw.replace(/\s+/g, " ").trim().slice(0, 80);
  if (!text) return "";
  const key = fold(text);
  const exact = citySuggestions.find((c) => fold(c) === key);
  if (exact) return exact;
  // A bare name only snaps to a Honduran city; elsewhere "Granada" or "Valencia" could be several places,
  // so the country comes from the person (typed, or picked from the suggestions).
  const honduran = citySuggestions.find((c) => !c.includes(",") && fold(c) === key);
  return honduran ?? text;
}
