import { z } from 'zod';

export const VIBES = ['indica', 'sativa'] as const;
export const MUNCHIES = ['pizza', 'sweets', 'fastfood', 'snacks', 'asian'] as const;

export const MIN_PHOTOS = 2;
export const MAX_PHOTOS = 6;
export const MIN_NAME = 2;
export const MAX_NAME = 24;
export const MIN_BIO = 0;
export const MAX_BIO = 280;

export const photoSchema = z.object({
  id: z.string(),
  storagePath: z.string(),
  width: z.number().positive(),
  height: z.number().positive(),
});

export type Photo = z.infer<typeof photoSchema>;

export const profileSchema = z.object({
  uid: z.string(),
  displayName: z.string().min(MIN_NAME).max(MAX_NAME),
  bio: z.string().max(MAX_BIO),
  vibe: z.enum(VIBES),
  munchies: z.array(z.enum(MUNCHIES)).min(1),
  photos: z.array(photoSchema).min(MIN_PHOTOS).max(MAX_PHOTOS),
  country: z.literal('NL'),
  ageVerifiedAt: z.number().int().positive(),
  createdAt: z.number().int().positive(),
  lastActiveAt: z.number().int().positive(),
});

export type Profile = z.infer<typeof profileSchema>;

export const onboardingDraftSchema = profileSchema
  .omit({
    uid: true,
    country: true,
    ageVerifiedAt: true,
    createdAt: true,
    lastActiveAt: true,
  })
  .extend({
    bio: z.string().max(MAX_BIO).optional().default(''),
  });

export type OnboardingDraft = z.infer<typeof onboardingDraftSchema>;

export type OnboardingStep = 'name' | 'photos' | 'vibe-check' | 'munchies';

export function nextIncompleteStep(
  draft: Partial<OnboardingDraft>,
): OnboardingStep | 'complete' {
  if (!draft.displayName || draft.displayName.length < MIN_NAME) return 'name';
  if (!draft.photos || draft.photos.length < MIN_PHOTOS) return 'photos';
  if (!draft.vibe) return 'vibe-check';
  if (!draft.munchies || draft.munchies.length === 0) return 'munchies';
  return 'complete';
}

export function isProfileComplete(profile: unknown): profile is Profile {
  return profileSchema.safeParse(profile).success;
}
