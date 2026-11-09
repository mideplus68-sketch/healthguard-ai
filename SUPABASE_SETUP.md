# Supabase setup for HealthGuard AI

The prototype writes owner-scoped records to Supabase when the app is configured. In the absence of environment variables, it stays in local demo mode.

## What is connected

- Email/password sign-up and sign-in via Supabase Auth.
- `profiles`, `measurements`, `symptom_checkins`, and `lab_results` tables.
- Row Level Security policies that permit an authenticated user to access rows where `owner_id = auth.uid()`.
- Local persistence of the selected profile only; record data is stored in Supabase when configured.

The client uses only the project URL and publishable key. Never put a service-role/secret key or the database password in the mobile/web app. RLS is mandatory because a publishable key is visible to client applications.

## Connect the project

1. Copy `.env.example` to `.env` in the repository root.
2. Set `EXPO_PUBLIC_SUPABASE_URL` to the project's URL and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to the project's publishable key.
3. Open Supabase **SQL Editor** and run `supabase/migrations/202611070001_healthguard_schema.sql`.
4. To enable saved 3D avatars for signed-in accounts, run `supabase/migrations/202611070002_profile_avatars.sql` in the SQL Editor.
5. To enable real profile photos, run `supabase/migrations/202611070003_private_profile_photos.sql` in the SQL Editor. This creates an owner-scoped private storage bucket limited to JPEG, PNG, and WebP files up to 2 MB.
6. Leave email/password enabled in **Authentication → Sign In / Providers**. For sign-up confirmation, use the link in the confirmation email, then sign into the app.
7. Restart Expo so the public environment variables are loaded: `pnpm start -- --clear`.

## Email sign-in troubleshooting

- The app trims and lowercases email addresses, validates their format, explains common sign-in errors, and offers to resend confirmation after an unconfirmed sign-in attempt.
- When Supabase returns an explicit duplicate-address error, the app directs the person to sign in. With email confirmation enabled, Supabase deliberately hides whether some addresses already have confirmed accounts; the app therefore gives neutral guidance after a no-session sign-up response instead of claiming the email is new or already registered.
- Supabase's built-in email sender is for testing and only delivers to addresses belonging to members of the project's organization. To send confirmation messages to other addresses, configure a custom SMTP provider in **Authentication → SMTP Settings**. Delivery is also rate-limited when using the built-in sender.
- Do not disable email confirmation just to make sign-up appear to work. Keep verification enabled and configure SMTP for broader testing.

## Security and clinical assumptions

- Tables contain user-entered data. Laboratory results are records of what the lab reported; the app does not interpret them.
- Child and adult profiles belong to the signed-in account owner. No sharing or clinician access policy is included.
- The clinician view remains device-local and is not a secure clinician portal.
- Profile photos are stored in a private Supabase Storage bucket with account-owner path policies and time-limited display URLs. The local demo mode stores the selected image in local browser/device storage; avoid shared devices.
- Profile photos are personal information. Only upload photos with the profile owner's consent; local browser/device storage is not encrypted by this prototype.
- Do not put real patient information into this prototype. No clinical validation, privacy review, penetration testing, or regulatory approval is claimed.
- Existing local records are deliberately not auto-uploaded. A future migration/import must be separately specified and confirmed by the owner.
- Supabase hosting region determines the project's primary data location. This project was planned for Frankfurt at the user's request; assess data residency, privacy, and health-data requirements before production use.

