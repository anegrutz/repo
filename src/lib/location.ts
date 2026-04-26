const FUZZ_RADIUS_METERS = 200;
const EARTH_RADIUS = 6_371_000;

export type LatLng = { latitude: number; longitude: number };

export function fuzz(point: LatLng, radius = FUZZ_RADIUS_METERS): LatLng {
  const u = Math.random();
  const v = Math.random();
  const w = (radius / EARTH_RADIUS) * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const dLat = w * Math.cos(t);
  const dLon = (w * Math.sin(t)) / Math.cos((point.latitude * Math.PI) / 180);
  return {
    latitude: point.latitude + (dLat * 180) / Math.PI,
    longitude: point.longitude + (dLon * 180) / Math.PI,
  };
}

export function midpoint(a: LatLng, b: LatLng): LatLng {
  const φ1 = (a.latitude * Math.PI) / 180;
  const φ2 = (b.latitude * Math.PI) / 180;
  const λ1 = (a.longitude * Math.PI) / 180;
  const Δλ = ((b.longitude - a.longitude) * Math.PI) / 180;
  const Bx = Math.cos(φ2) * Math.cos(Δλ);
  const By = Math.cos(φ2) * Math.sin(Δλ);
  const φm = Math.atan2(
    Math.sin(φ1) + Math.sin(φ2),
    Math.sqrt((Math.cos(φ1) + Bx) ** 2 + By ** 2),
  );
  const λm = λ1 + Math.atan2(By, Math.cos(φ1) + Bx);
  return { latitude: (φm * 180) / Math.PI, longitude: (λm * 180) / Math.PI };
}
