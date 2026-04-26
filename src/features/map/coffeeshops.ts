/**
 * Curated list of well-known Dutch coffeeshops for "Safe First Date"
 * suggestions. Hard-coded for Phase 5 — Phase 7 swaps this for either
 * Google Places (paid, accurate) or the OpenStreetMap Overpass API
 * (free, variable quality). Coordinates are approximate; do not
 * navigate by them.
 */
export type Coffeeshop = {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
};

export const COFFEESHOPS: readonly Coffeeshop[] = [
  // Amsterdam
  { id: 'cs_grey_area', name: 'The Grey Area', city: 'Amsterdam', latitude: 52.3722, longitude: 4.8836 },
  { id: 'cs_bulldog_palace', name: 'The Bulldog Palace', city: 'Amsterdam', latitude: 52.3683, longitude: 4.8951 },
  { id: 'cs_barneys', name: "Barney's Coffeeshop", city: 'Amsterdam', latitude: 52.3791, longitude: 4.8841 },
  { id: 'cs_dampkring', name: 'Dampkring', city: 'Amsterdam', latitude: 52.3686, longitude: 4.8918 },
  { id: 'cs_paradox', name: 'Paradox', city: 'Amsterdam', latitude: 52.3737, longitude: 4.8810 },
  { id: 'cs_abraxas', name: 'Abraxas', city: 'Amsterdam', latitude: 52.3737, longitude: 4.8919 },
  { id: 'cs_boerejongens_west', name: 'Boerejongens West', city: 'Amsterdam', latitude: 52.3754, longitude: 4.8593 },
  // Rotterdam
  { id: 'cs_pluto', name: 'Coffeeshop Pluto', city: 'Rotterdam', latitude: 51.9215, longitude: 4.4798 },
  { id: 'cs_baba_rotterdam', name: 'Baba', city: 'Rotterdam', latitude: 51.9166, longitude: 4.4729 },
  // Utrecht
  { id: 'cs_basjoe', name: 'Basjoe', city: 'Utrecht', latitude: 52.0916, longitude: 5.1184 },
  { id: 'cs_de_zen', name: 'De Zen', city: 'Utrecht', latitude: 52.0876, longitude: 5.1158 },
  // Den Haag
  { id: 'cs_t_wapen', name: "'t Wapen van Amsterdam", city: 'Den Haag', latitude: 52.0795, longitude: 4.3137 },
  // Eindhoven
  { id: 'cs_kosbor', name: 'Kosbor', city: 'Eindhoven', latitude: 51.4416, longitude: 5.4697 },
  // Groningen
  { id: 'cs_de_vliegende_hollander', name: 'De Vliegende Hollander', city: 'Groningen', latitude: 53.2186, longitude: 6.5663 },
  // Maastricht
  { id: 'cs_kanna', name: 'Coffeeshop Mississippi', city: 'Maastricht', latitude: 50.8514, longitude: 5.6913 },
];
