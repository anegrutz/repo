# PuffMatch

Social discovery for the 420-friendly lifestyle in the Netherlands. **NL-only**, production-track.

> Status: **Phase 4 — Chat + AI Icebreaker.** Real-time Firestore chat per match, AI icebreaker via Cloud Function (Anthropic `claude-opus-4-7` with prompt-cached system prompt + per-match personalization on Indica/Sativa + munchies). Real iDIN + social sign-in still pending Phase 1b.

## Stack

- Expo SDK 51 + Expo Router v3 + TypeScript (strict)
- NativeWind v4 (Tailwind), Dark Mode default
- Firebase (Auth, Firestore, Storage, Functions, App Check, Crashlytics) — `europe-west1`
- Zustand (UI state) + TanStack Query (server state)
- i18next (NL primary, EN fallback)
- Jest + React Native Testing Library; Detox for E2E (added in later phases)
- Sentry, EAS Build / Submit, GitHub Actions CI

## Getting started

```bash
# 1. Install
npm install

# 2. Cloud Functions deps
npm --prefix functions install

# 3. Run typechecks / lint / tests
npm run typecheck
npm run lint
npm test

# 4. Run app (Expo Dev Client required for Firebase native modules)
npm run start
```

### Firebase emulator suite (Phase 1a dev loop)

```bash
# In one terminal — emulators (auth + firestore + functions + storage + UI)
npm --prefix functions run build
firebase emulators:start

# In another terminal — point the app at emulators and start it
EXPO_PUBLIC_USE_FIREBASE_EMULATORS=true npm run start
```

Then in the app: **Welcome → Get started → Sign up** with any email + password,
then on the Age Gate screen tap **Mock verification (dev only)** to set the
`country: 'NL'` and `ageVerifiedAt` custom claims on your user. The redirect
logic in `app/index.tsx` will route you into the (tabs) placeholder.

`mockVerifyAge` hard-fails outside the emulator (`FUNCTIONS_EMULATOR=true`),
so it cannot accidentally ship to production.

Native dev builds use EAS:

```bash
eas build --profile development --platform ios   # or android
```

## Repository layout

```
app/                 Expo Router file-based routes
  (auth)/            Welcome, age gate, geo-block
  (onboarding)/      Vibe Check flow (added in Phase 2)
  (tabs)/            Pass-or-Ash / Matches / Map / Profile (added in Phase 3+)
  chat/[matchId].tsx Phase 4
src/
  components/        UI primitives + feature widgets
  features/          Domain logic per feature
  lib/               firebase, geofence, location, analytics
  stores/            Zustand stores
  hooks/             Reusable hooks
  types/             Global TS types
  i18n/              nl.json (primary) + en.json
functions/           Firebase Cloud Functions (TypeScript)
firestore.rules      Security rules with Firestore tests in Phase 7
firestore.indexes.json
storage.rules
e2e/                 Detox tests (added Phase 3+)
```

## Phased roadmap

| Phase | Scope |
|-------|-------|
| 0     | Foundation: tooling, structure, rules skeleton, CI ✅ |
| 1a    | Email/password auth, geo-fence, mock KYC, redirect gates ✅ |
| 1b    | iDIN webhook + Apple/Google sign-in + Detox E2E |
| 2     | Profile / Vibe Check + photo upload pipeline ✅ |
| 3     | Pass or Ash swipe + matching algorithm ✅ |
| 4     | Real-time chat + AI icebreaker (Anthropic) ✅ |
| 5     | Puff Map + Couch-Lock + Safe First Date |
| 6     | Safety & moderation (report/block/auto-mod) |
| 7     | Production hardening (rules tests, App Check, Sentry, store assets) |

After each phase: STOP and wait for explicit "Da, continuă" before proceeding.

## Compliance notes

- **Apple Guideline 1.4.3 / Google Restricted Content**: store metadata avoids any
  reference to consumption. Positioning is *social discovery*. Geo-restricted to NL.
- **GDPR**: Firebase region `europe-west1`; export and delete account flows shipped in
  Phase 6/7.
- **Privacy on the map**: location is never stored as raw GPS — only fuzzed (±200m)
  before write. Couch-Lock fully hides the marker.
- **18+ verification**: real KYC provider (iDIN / Yoti / Onfido) — chosen in Phase 1.
- **Moderation**: Perspective API (text) + Cloud Vision Safe Search (images), wired in
  Phase 6.

## Definition of Done — Phase 4

- [x] Chat screen at `app/chat/[matchId].tsx` with real-time Firestore subscription
- [x] `sendMessage(matchId, text)` writes to `matches/{matchId}/messages` and bumps `lastMessageAt`
- [x] Auto-scroll to latest message; KeyboardAvoidingView for the composer
- [x] Matches tab navigates to chat on tap
- [x] AI icebreaker callable Cloud Function — `claude-opus-4-7`, system prompt cached via `cache_control: {type: "ephemeral"}`, personalization from both users' Indica/Sativa + munchies
- [x] Function verifies the caller is a participant of an `active` match before generating
- [x] Cache-hit telemetry logged (`cache_read_input_tokens` / `cache_creation_input_tokens`)
- [x] `formatTime` + `side` helper unit tests
- [ ] Phase 6: report a chat / unmatch from inside the chat
- [ ] Phase 6: text moderation pipeline (Perspective API) wired to `moderateMessage` Firestore trigger
- [ ] Phase 7: production: store `ANTHROPIC_API_KEY` via `firebase functions:secrets:set`

## Definition of Done — Phase 3

- [x] `SwipeCard` (Reanimated 3 + `Gesture.Pan`) with right / left / up gestures, threshold + velocity, fly-off animation
- [x] `CardStack` shows top + next card with stack offset; previous fades back when top flies off
- [x] `fetchDiscoveryDeck()` queries `users` (`country == 'NL'`, ordered by `lastActiveAt`), excludes self + already-swiped
- [x] `recordSwipe(uid, direction)` writes `/swipes/{uid}/targets/{targetUid}` → fires `computeMatch` Cloud Function trigger
- [x] `useMatches()` subscribes to `matches where users array-contains me, status == 'active'` in real time
- [x] `(tabs)` layout: Discover / Matches / Profile
- [x] `computeMatchId` + direction-to-firestore mapping unit tests
- [ ] Phase 4: real chat opens when tapping a match
- [ ] Phase 6: report / unmatch / block on the Matches list

## Definition of Done — Phase 2

- [x] Onboarding screens: name / photos / vibe-check / munchies, with `StepHeader`
- [x] `pickAndUploadPhoto` — image picker + 1080px client-side compression + upload to Storage (`users/{uid}/photos/{photoId}.jpg`)
- [x] Cloud Function `onPhotoUploaded` (sharp) writes `_preview.jpg` (256px) + `_display.jpg` (1080px) variants and skips its own outputs
- [x] `profileSchema` (zod) + `nextIncompleteStep` selector with unit tests
- [x] `useProfile()` (TanStack Query) → `loading | missing | incomplete | complete`
- [x] `app/index.tsx` redirects to the right onboarding step based on profile state
- [x] (tabs) home shows a profile snapshot
- [ ] Phase 6: photo verification (selfie liveness), report/block, auto-moderation
- [ ] Phase 7: audited Firestore rules tests for the new write surface

## Definition of Done — Phase 1a

- [x] Welcome / Sign up / Sign in / Age gate / Geo-block screens wired with i18n
- [x] Email/password auth via `@react-native-firebase/auth` (emulator-ready)
- [x] Auth state machine + `deriveGate` selector with unit tests
- [x] `app/index.tsx` redirects on `loading | unauthenticated | wrong-country | age-unverified | allowed`
- [x] `mockVerifyAge` callable function sets `country` + `ageVerifiedAt` claims, refuses outside emulator
- [x] Tabs placeholder for verified users (with sign-out)
- [x] `npm run typecheck`, `npm run lint`, `npm test` all green
- [ ] Phase 1b: replace `mockVerifyAge` with real iDIN webhook flow
- [ ] Phase 1b: Apple + Google sign-in + Detox E2E happy-path test

## License

Proprietary — all rights reserved (until decided otherwise).
