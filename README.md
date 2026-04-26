# PuffMatch

Social discovery for the 420-friendly lifestyle in the Netherlands. **NL-only**, production-track.

> Status: **Phase 1a — Auth + Age Gate.** Email/password auth, geo-fence, and a dev-only mock KYC are wired against the Firebase emulator suite. Real iDIN webhook + social sign-in land in Phase 1b.

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
| 2     | Profile / Vibe Check + photo upload pipeline |
| 3     | Pass or Ash swipe + matching algorithm |
| 4     | Real-time chat + AI icebreaker (Anthropic) |
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
