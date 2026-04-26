import { fuzz, midpoint } from '@/lib/location';

describe('location utils', () => {
  describe('fuzz', () => {
    it('keeps the fuzzed point within the requested radius (~1m tolerance)', () => {
      const origin = { latitude: 52.3676, longitude: 4.9041 };
      const radius = 200;
      for (let i = 0; i < 50; i++) {
        const f = fuzz(origin, radius);
        const dLat = ((f.latitude - origin.latitude) * Math.PI) / 180;
        const dLon = ((f.longitude - origin.longitude) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos((origin.latitude * Math.PI) / 180) *
            Math.cos((f.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) ** 2;
        const meters = 2 * 6_371_000 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        expect(meters).toBeLessThanOrEqual(radius + 1);
      }
    });
  });

  describe('midpoint', () => {
    it('returns a point roughly between two coordinates', () => {
      const a = { latitude: 52.3676, longitude: 4.9041 }; // Amsterdam
      const b = { latitude: 51.9244, longitude: 4.4777 }; // Rotterdam
      const m = midpoint(a, b);
      expect(m.latitude).toBeGreaterThan(b.latitude);
      expect(m.latitude).toBeLessThan(a.latitude);
      expect(m.longitude).toBeGreaterThan(b.longitude);
      expect(m.longitude).toBeLessThan(a.longitude);
    });
  });
});
