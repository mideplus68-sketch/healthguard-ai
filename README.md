# HealthGuard AI — working prototype

A non-diagnostic family health-record prototype for Android, iOS and web preview. It supports adult and child profiles with 3D avatar choices or a profile photo, a malaria-focused symptom check-in, manual temperature/note logging, recording laboratory-reported RDT or microscopy results, personal history, and a demo clinician review screen.

## Run it

1. Install Node.js 20.19+ (or a compatible current Node LTS) and enable pnpm with Corepack (`corepack enable pnpm`).
2. From this folder run `pnpm install --frozen-lockfile`.
3. Run `pnpm start`, then open the QR code with Expo Go, or press `w` for the web preview. Use `pnpm android` or `pnpm ios` with the matching simulator/device configured.

The web view is useful for a prototype walkthrough. Native device builds are the intended mobile experience. Without Supabase credentials, records persist in device/browser local storage. Clearing app/browser storage removes them. This is demo storage only: do not use real patient information or a shared device.

## Build an Android APK

The project is an Expo native app. To create an installable Android APK with Expo Application Services (EAS):

1. Sign in to an Expo account: `pnpm dlx eas-cli login`.
2. Link this repository to an EAS project: `pnpm dlx eas-cli build:configure`.
3. Start an internal Android APK build: `pnpm dlx eas-cli build --platform android --profile preview`.

EAS will guide you through Android signing setup. The `preview` profile creates an APK for direct device installation; `production` creates an Android App Bundle for Play Store distribution. EAS credentials are managed by Expo and should not be committed to this repository.

## Supabase connection

The app supports Supabase email/password accounts and cloud sync for profiles, temperature/notes, symptom check-ins, and laboratory-reported RDT/microscopy results. The schema enables Row Level Security and scopes each row to its authenticated owner. While cloud sync is unavailable, pending records are kept in owner-specific device/browser storage and retried after reconnect; this local storage is not encrypted by this prototype. The clinician review tab remains a local-only demonstration; it does not expose records to clinicians or other accounts.

1. Create a Supabase project, then copy `.env.example` to `.env`.
2. In the Supabase project dashboard, copy the Project URL and **publishable** key into `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Never put a `service_role` key in the app.
3. Apply [`supabase/migrations/202611070001_healthguard_schema.sql`](supabase/migrations/202611070001_healthguard_schema.sql) in the Supabase SQL Editor.
4. In Supabase Auth, enable email/password sign-in and set the redirect/site URL for your app/web preview as needed.
5. Restart Expo after changing `.env` with `pnpm start -- --clear`.

Existing device/browser records are not uploaded automatically when cloud auth is enabled. This avoids sending potentially sensitive health data to a new service without a separate, explicit migration step. Use synthetic records for this prototype; it has not undergone clinical validation or security/regulatory review.

## Prototype boundaries

- The app does not diagnose malaria or any other illness, interpret a test result, or recommend medication or treatment.
- Symptom selections are user-reported and are not a validated score. Only explicit warning-sign selections show fixed safety wording. Warning signs and all urgent-care/referral wording require clinician review before any pilot; this is an explicit release gate.
- Laboratory test type, result, date, and laboratory name are entered manually by the user. The app does not verify report authenticity or connect to a laboratory; keep the original report and confirm any uncertainty with the laboratory or a qualified clinician.
- The clinician screen is still a local demonstration view. There is no clinician account, patient sharing, or clinician remote access. Supabase account authentication is available only for the record owner.
- There is no clinical validation, laboratory integration, regulatory approval, or production security claim.

See [PRODUCT_AND_ARCHITECTURE.md](PRODUCT_AND_ARCHITECTURE.md) for the agreed scope, architecture, phased execution plan, and assumptions needing clinical/regulatory review.

