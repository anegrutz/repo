import { avatarFor, COUCH_LOCK_AVATAR } from '@/features/map/avatars';
import { COFFEESHOPS, type Coffeeshop } from '@/features/map/coffeeshops';
import { haversine, nearestCoffeeshop, safeMeetForPair } from '@/features/map/safeMeet';

const AMSTERDAM = { latitude: 52.3676, longitude: 4.9041 };
const ROTTERDAM = { latitude: 51.9244, longitude: 4.4777 };

describe('haversine', () => {
  it('returns ~0 for identical points', () => {
    expect(haversine(AMSTERDAM, AMSTERDAM)).toBeLessThan(1);
  });

  it('returns the known distance Amsterdam ↔ Rotterdam (~57km)', () => {
    const d = haversine(AMSTERDAM, ROTTERDAM);
    expect(d).toBeGreaterThan(55_000);
    expect(d).toBeLessThan(60_000);
  });
});

describe('nearestCoffeeshop', () => {
  it('returns null for an empty list', () => {
    expect(nearestCoffeeshop(AMSTERDAM, [])).toBeNull();
  });

  it('picks an Amsterdam shop when standing in Amsterdam', () => {
    const result = nearestCoffeeshop(AMSTERDAM);
    expect(result).not.toBeNull();
    expect(result!.shop.city).toBe('Amsterdam');
  });

  it('picks a Rotterdam shop when standing in Rotterdam', () => {
    const result = nearestCoffeeshop(ROTTERDAM);
    expect(result).not.toBeNull();
    expect(result!.shop.city).toBe('Rotterdam');
  });

  it('picks the closer of two candidates', () => {
    const close: Coffeeshop = {
      id: 'close',
      name: 'Close',
      city: 'Amsterdam',
      latitude: 52.3676,
      longitude: 4.9041,
    };
    const far: Coffeeshop = {
      id: 'far',
      name: 'Far',
      city: 'Maastricht',
      latitude: 50.85,
      longitude: 5.69,
    };
    const result = nearestCoffeeshop(AMSTERDAM, [far, close]);
    expect(result!.shop.id).toBe('close');
  });
});

describe('safeMeetForPair', () => {
  it('puts the suggested midpoint between two cities, with a coffeeshop nearby', () => {
    const result = safeMeetForPair(AMSTERDAM, ROTTERDAM);
    expect(result).not.toBeNull();
    expect(result!.midpoint.latitude).toBeGreaterThan(ROTTERDAM.latitude);
    expect(result!.midpoint.latitude).toBeLessThan(AMSTERDAM.latitude);
    expect(result!.shop.city).toMatch(/Amsterdam|Rotterdam|Den Haag|Utrecht/);
  });
});

describe('avatarFor', () => {
  it('is deterministic for the same uid', () => {
    expect(avatarFor('user-1')).toBe(avatarFor('user-1'));
  });

  it('returns one of the configured emoji', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 50; i++) {
      seen.add(avatarFor(`user-${i}`));
    }
    expect(seen.size).toBeGreaterThan(1);
    for (const a of seen) {
      expect(a).not.toBe(COUCH_LOCK_AVATAR);
    }
  });
});

describe('COFFEESHOPS dataset', () => {
  it('has at least one entry per major city', () => {
    const cities = new Set(COFFEESHOPS.map((s) => s.city));
    expect(cities.has('Amsterdam')).toBe(true);
    expect(cities.has('Rotterdam')).toBe(true);
    expect(cities.has('Utrecht')).toBe(true);
  });

  it('has unique IDs', () => {
    const ids = COFFEESHOPS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
