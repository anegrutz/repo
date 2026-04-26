import { deriveGate } from '@/features/auth/store';

describe('deriveGate', () => {
  it('reports loading until the auth listener fires', () => {
    expect(deriveGate({ kind: 'loading' })).toBe('loading');
  });

  it('reports unauthenticated when there is no user', () => {
    expect(deriveGate({ kind: 'unauthenticated' })).toBe('unauthenticated');
  });

  it('blocks users without an NL country claim', () => {
    expect(
      deriveGate({
        kind: 'authenticated',
        uid: 'u1',
        email: 'a@b.nl',
        claims: { country: 'DE', ageVerifiedAt: Date.now() },
      }),
    ).toBe('wrong-country');
  });

  it('blocks users without an ageVerifiedAt claim', () => {
    expect(
      deriveGate({
        kind: 'authenticated',
        uid: 'u1',
        email: 'a@b.nl',
        claims: { country: 'NL', ageVerifiedAt: null },
      }),
    ).toBe('age-unverified');
  });

  it('allows NL + age-verified users into the app', () => {
    expect(
      deriveGate({
        kind: 'authenticated',
        uid: 'u1',
        email: 'a@b.nl',
        claims: { country: 'NL', ageVerifiedAt: 1700000000000 },
      }),
    ).toBe('allowed');
  });
});
