import {
  isProfileComplete,
  nextIncompleteStep,
  onboardingDraftSchema,
  profileSchema,
} from '@/features/profile/schema';

const validPhoto = (id: string) => ({
  id,
  storagePath: `users/u1/photos/${id}.jpg`,
  width: 1080,
  height: 1350,
});

describe('profile schema', () => {
  it('accepts a fully populated profile', () => {
    const profile = {
      uid: 'u1',
      displayName: 'Joep',
      bio: 'Amsterdam local',
      vibe: 'indica',
      munchies: ['pizza'],
      photos: [validPhoto('a'), validPhoto('b')],
      country: 'NL',
      ageVerifiedAt: 1700000000000,
      createdAt: 1700000000000,
      lastActiveAt: 1700000000000,
    };
    expect(isProfileComplete(profile)).toBe(true);
    expect(profileSchema.safeParse(profile).success).toBe(true);
  });

  it('rejects a profile with fewer than 2 photos', () => {
    const profile = {
      uid: 'u1',
      displayName: 'Joep',
      bio: '',
      vibe: 'sativa',
      munchies: ['pizza'],
      photos: [validPhoto('a')],
      country: 'NL',
      ageVerifiedAt: 1,
      createdAt: 1,
      lastActiveAt: 1,
    };
    expect(isProfileComplete(profile)).toBe(false);
  });

  it('rejects non-NL country', () => {
    const result = profileSchema.safeParse({
      uid: 'u1',
      displayName: 'Joep',
      bio: '',
      vibe: 'sativa',
      munchies: ['pizza'],
      photos: [validPhoto('a'), validPhoto('b')],
      country: 'DE',
      ageVerifiedAt: 1,
      createdAt: 1,
      lastActiveAt: 1,
    });
    expect(result.success).toBe(false);
  });
});

describe('nextIncompleteStep', () => {
  it('returns name when displayName is missing', () => {
    expect(nextIncompleteStep({})).toBe('name');
  });

  it('returns photos when fewer than 2 are present', () => {
    expect(nextIncompleteStep({ displayName: 'Joep', photos: [validPhoto('a')] })).toBe(
      'photos',
    );
  });

  it('returns vibe-check when photos are set but vibe is not', () => {
    expect(
      nextIncompleteStep({
        displayName: 'Joep',
        photos: [validPhoto('a'), validPhoto('b')],
      }),
    ).toBe('vibe-check');
  });

  it('returns munchies when vibe is set but munchies are empty', () => {
    expect(
      nextIncompleteStep({
        displayName: 'Joep',
        photos: [validPhoto('a'), validPhoto('b')],
        vibe: 'indica',
        munchies: [],
      }),
    ).toBe('munchies');
  });

  it('returns complete when everything is set', () => {
    expect(
      nextIncompleteStep({
        displayName: 'Joep',
        photos: [validPhoto('a'), validPhoto('b')],
        vibe: 'indica',
        munchies: ['pizza'],
      }),
    ).toBe('complete');
  });
});

describe('onboardingDraftSchema', () => {
  it('parses a valid draft and defaults bio to empty string', () => {
    const result = onboardingDraftSchema.safeParse({
      displayName: 'Joep',
      vibe: 'sativa',
      munchies: ['fastfood'],
      photos: [validPhoto('a'), validPhoto('b')],
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.bio).toBe('');
  });
});
