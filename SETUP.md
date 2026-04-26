# PuffMatch — Setup Guide

This guide walks through the manual steps you need to do *outside* the codebase before the app can run end-to-end against real services. The Firebase emulator + mock KYC flow already works without any of this.

> Before you start, install the prerequisites: Node 20+, npm, the Firebase CLI (`npm i -g firebase-tools`), and the Expo / EAS CLI (`npm i -g eas-cli`).

---

## 1. Firebase project — `puffmatch-prod`

You've already created it. Now wire it up locally.

### 1.1 Add iOS + Android apps in the Firebase console

In https://console.firebase.google.com/ → **puffmatch-prod** → ⚙️ Project settings → **Your apps**:

- **iOS bundle ID:** `com.puffmatch.app`
- **Android package name:** `com.puffmatch.app`

After registration, download:

- `GoogleService-Info.plist` → save to repo root **`GoogleService-Info.plist`**
- `google-services.json` → save to repo root **`google-services.json`**

Both files contain only public client config (no secrets). They're safe to commit. Run:

```bash
git add GoogleService-Info.plist google-services.json
git commit -m "chore: add Firebase native config"
```

### 1.2 Enable services

In the Firebase console:

- **Authentication** → Sign-in method → enable **Email/Password**
- **Firestore Database** → Create in production mode, region **`europe-west1`**
- **Storage** → Create, region **`europe-west1`**
- **Functions** → enable

### 1.3 Deploy rules + indexes

```bash
firebase use puffmatch-prod
firebase deploy --only firestore:rules,firestore:indexes,storage:rules
```

### 1.4 Bind EAS to the project

```bash
eas init
# Replace REPLACE_WITH_EAS_PROJECT_ID in app.config.ts with the printed projectId
```

---

## 2. Onfido sandbox — KYC

### 2.1 Create the account

Go to https://onfido.com/signup/ → choose **Sandbox**. Verification email arrives within minutes.

### 2.2 Get your API token

In the Onfido dashboard → **Settings → API tokens** → create a new sandbox token. Save it; we'll deploy it as a Firebase secret.

### 2.3 Create a Studio workflow

In **Studio → Create workflow**, build a workflow that requests:
- Document upload (passport / NL ID card / driving licence)
- Selfie liveness check

Set the **outcome** to "Approved" only when both succeed and the document country is **Netherlands**.

Once published, copy the **Workflow ID** from the URL (`/studio/workflows/<workflow-id>`).

### 2.4 Configure the webhook

In **Settings → Webhooks → Add webhook**:

- URL: `https://europe-west1-puffmatch-prod.cloudfunctions.net/onfidoWebhook` *(this URL exists after the first deploy — see step 2.6)*
- Events: `workflow_run.completed` (and any others you want surfaced)

Onfido shows a one-time **webhook token** — copy it; we'll deploy it as a secret too.

### 2.5 Deploy the secrets

```bash
firebase functions:secrets:set ONFIDO_API_TOKEN
firebase functions:secrets:set ONFIDO_WORKFLOW_ID
firebase functions:secrets:set ONFIDO_WEBHOOK_TOKEN
```

Each prompts for the value; paste and press enter. They're stored in Google Secret Manager and never appear in logs.

### 2.6 Deploy the functions

```bash
firebase deploy --only functions
```

The first deploy creates the `onfidoWebhook` HTTPS endpoint. Copy its URL (printed at the end of the deploy) back into Onfido's webhook config (step 2.4) if you didn't already.

---

## 3. Anthropic — AI icebreaker (Phase 4)

```bash
firebase functions:secrets:set ANTHROPIC_API_KEY
firebase deploy --only functions:generateIcebreaker
```

Get the key from https://console.anthropic.com/ → API keys.

---

## 4. Perspective API — chat moderation (Phase 6)

```bash
firebase functions:secrets:set PERSPECTIVE_API_KEY
firebase deploy --only functions:moderateMessage
```

Enable Perspective on your GCP project: https://developers.perspectiveapi.com/s/docs-get-started

---

## 5. Sentry (Phase 7) — optional but recommended

In Sentry → create project → grab the DSN. Then for production builds:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SENTRY_DSN --value "<your-dsn>"
```

In dev, leave the env var unset and Sentry stays a no-op.

---

## 6. Run end-to-end against real services

```bash
# Build a Dev Client once (native modules need EAS — Expo Go won't work)
eas build --profile development --platform ios     # or android

# Install the resulting build on your device, then start Metro:
npm run start
```

Sign up with email/password, fill in the age gate with **real** name + DOB, complete the Onfido flow in the in-app browser. Within ~5 seconds the webhook lands and the gate flips you to the (tabs).

If the webhook doesn't fire, check Cloud Functions logs:

```bash
firebase functions:log --only onfidoWebhook --lines 50
```

---

## 7. Submit to TestFlight + Internal Testing (Phase 7)

```bash
eas build --profile production --platform all
eas submit --profile production --platform ios       # or android
```

You'll need:
- Apple Developer account ($99/year) and the App Store Connect app set up
- Google Play Console account ($25 one-time) and the app created in Internal Testing track
- App Store Connect API key + Google Play service account JSON, both wired into `eas.json`

Final blockers before public release (not technical):
- Final Privacy Policy + Terms of Service from a Dutch lawyer (replace placeholders in `app/legal/`)
- Signed DPA with Firebase / Google Cloud (GDPR Article 28)
- App Store listing copy that complies with Apple Guideline 1.4.3 (positioning: "social discovery")
- Geo-restrict store availability to **Netherlands** in App Store Connect / Play Console
