# PuffMatch

Social discovery for the 420-friendly lifestyle in the Netherlands. **NL-only**, production-track.

> Status: **Phase 7 — Production hardening.** Firestore rules unit tests (`@firebase/rules-unit-testing` against the emulator), GDPR account-delete + data-export Cloud Functions, Sentry init, Privacy + Terms placeholder screens. **All 8 phases of the original plan complete.** Pending external dependencies for go-live: Phase 1b (real iDIN + Apple/Google sign-in + Detox E2E), real Firebase project, Cloud Vision Safe Search, admin dashboard.

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
| 5     | Puff Map + Couch-Lock + Safe First Date ✅ |
| 6     | Safety & moderation (report/unmatch/auto-mod) ✅ |
| 7     | Production hardening (rules tests, GDPR, Sentry, legal) ✅ |

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

## Definition of Done — Phase 7

- [x] **Firestore rules unit tests** (`@firebase/rules-unit-testing`, run via `npm run test:rules` against the emulator) — covers users / swipes / matches / messages / reports with positive and negative cases (oversize messages, spoofed senderId, non-participant access, tampered claims, etc.)
- [x] **`deleteMyAccount` Cloud Function** — recursively deletes swipes, marks all matches as `unmatched`, deletes photos in Storage, deletes the user profile, then deletes the auth user (last so the irreversible step happens after data is cleared)
- [x] **`requestDataExport` Cloud Function** — returns a JSON snapshot of profile + swipes + matches + messages (GDPR Article 20)
- [x] **Sentry init** gated on `EXPO_PUBLIC_SENTRY_DSN` (no-op in dev/emulator runs)
- [x] **Privacy Policy + Terms of Service** placeholder screens (`app/legal/privacy.tsx`, `app/legal/terms.tsx`) with a clear disclaimer that final copy comes from legal counsel
- [x] **Profile tab Account section** — Export, Privacy, Terms, Sign out, Delete (in that order, with a destructive-style confirm on Delete)

## Go-live checklist (still required for App Store / Play Store submission)

These items are out of scope for the in-codebase phases and require either external accounts or final design / legal review:

- [ ] Real Firebase project (`puffmatch-prod`, region `europe-west1`) + `GoogleService-Info.plist` + `google-services.json`
- [ ] iDIN merchant account → wire real KYC webhook (replaces `mockVerifyAge`) — Phase 1b
- [ ] Apple Sign-In + Google Sign-In (bundle IDs registered) — Phase 1b
- [ ] Detox E2E happy-path: signup → KYC → Vibe Check → match → chat → map — Phase 1b
- [ ] App Check (`Play Integrity` on Android, `App Attest` on iOS)
- [ ] Cloud Vision Safe Search on `onPhotoUploaded` (graceful no-op already in place)
- [ ] Admin dashboard reading `/reports` + `/moderation_queue` (separate web project)
- [ ] Push notifications via Expo Notifications + token persistence
- [ ] App Store Connect + Play Console listing (screenshots, description, **NL-only** geo restriction in metadata)
- [ ] Final Privacy Policy + Terms of Service from legal counsel (replace placeholder copy)
- [ ] DPA signed with Firebase / Google Cloud (GDPR Article 28)
- [ ] Beta release: TestFlight + Internal Testing track — `eas submit --profile production`

## Definition of Done — Phase 6

- [x] Report a user from the chat header → `/reports/{auto}` doc with `reporterId`, `reportedId`, `reason`, optional `matchId` + `note`, status `pending`
- [x] Five canonical report reasons (`harassment`, `inappropriate_photos`, `underage`, `spam`, `other`) wired with i18n
- [x] Unmatch from the chat header → flips `match.status` to `unmatched` and pops back; existing rules already block writes to `users` so this passes
- [x] `moderateMessage` Cloud Function calls Perspective API on every new message — `TOXICITY` and `SEVERE_TOXICITY` summary scores combined; `scoreToAction` maps score → `allow | flag | block`
- [x] Block action redacts message text in place (`text` set to placeholder, `redactedText` preserves original) and logs to `moderation_queue`
- [x] Flag action keeps the text but stores `moderation: {score, action, scoredAt}` and queues it
- [x] Function gracefully no-ops when `PERSPECTIVE_API_KEY` is not configured (dev/test environments)
- [x] `scoreToAction` thresholds + reasons enum unit tested (47 tests across 7 suites)
- [ ] Phase 7: Cloud Vision Safe Search on `onPhotoUploaded`
- [ ] Phase 7: admin dashboard reading `/reports` + `/moderation_queue`
- [ ] Phase 7: rate-limit `reports` writes per reporter (anti-abuse)

## Definition of Done — Phase 5

- [x] `(tabs)/map.tsx` with `react-native-maps`, friend avatars (deterministic per-uid emoji), Couch-Lock toggle in the top-right
- [x] `updateMyLocation(raw)` always fuzzes via the Phase 0 `fuzz()` helper before writing — raw GPS never leaves the device into Firestore
- [x] Couch-Lock writes `location.couchLockMode = true` on the user doc; my marker switches to a couch emoji and friends with the flag are hidden from each other's maps
- [x] Tap a friend marker → `safeMeetForPair(myFuzzy, theirFuzzy)` computes the midpoint and the nearest curated NL coffeeshop; `SafeMeetSheet` surfaces the suggestion
- [x] Curated NL coffeeshop dataset (`Amsterdam`, `Rotterdam`, `Utrecht`, `Den Haag`, `Eindhoven`, `Groningen`, `Maastricht`) — Phase 7 swaps for Google Places or OSM Overpass
- [x] `haversine`, `nearestCoffeeshop`, `safeMeetForPair`, `avatarFor`, dataset uniqueness — all pure-helper unit tested
- [ ] Phase 6: report a friend / unmatch from a marker tap
- [ ] Phase 7: real coffeeshop API + production location-permission UX

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
