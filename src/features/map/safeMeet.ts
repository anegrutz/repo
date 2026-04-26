import type { LatLng } from '@/lib/location';
import { midpoint } from '@/lib/location';

import type { Coffeeshop } from './coffeeshops';
import { COFFEESHOPS } from './coffeeshops';

const EARTH_RADIUS = 6_371_000;

export function haversine(a: LatLng, b: LatLng): number {
  const φ1 = (a.latitude * Math.PI) / 180;
  const φ2 = (b.latitude * Math.PI) / 180;
  const dφ = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dλ = ((b.longitude - a.longitude) * Math.PI) / 180;
  const h = Math.sin(dφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(dλ / 2) ** 2;
  return 2 * EARTH_RADIUS * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function nearestCoffeeshop(
  point: LatLng,
  shops: readonly Coffeeshop[] = COFFEESHOPS,
): { shop: Coffeeshop; distanceMeters: number } | null {
  if (shops.length === 0) return null;
  let best = shops[0];
  if (!best) return null;
  let bestDistance = haversine(point, best);
  for (let i = 1; i < shops.length; i++) {
    const candidate = shops[i];
    if (!candidate) continue;
    const d = haversine(point, candidate);
    if (d < bestDistance) {
      best = candidate;
      bestDistance = d;
    }
  }
  return { shop: best, distanceMeters: bestDistance };
}

export type SafeMeet = {
  midpoint: LatLng;
  shop: Coffeeshop;
  distanceFromMidpointMeters: number;
};

export function safeMeetForPair(
  a: LatLng,
  b: LatLng,
  shops: readonly Coffeeshop[] = COFFEESHOPS,
): SafeMeet | null {
  const m = midpoint(a, b);
  const nearest = nearestCoffeeshop(m, shops);
  if (!nearest) return null;
  return {
    midpoint: m,
    shop: nearest.shop,
    distanceFromMidpointMeters: nearest.distanceMeters,
  };
}
