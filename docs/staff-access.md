# Central staff access

ATLAS uses AMPLIFY's Supabase Auth project. Configure `AMPLIFY_SUPABASE_URL` and `AMPLIFY_SUPABASE_ANON_KEY` as server-side variables for local development and in every Vercel environment. No service-role key is required or accepted in ATLAS.

Staff authorization requires the exact server-managed `app_metadata.staff_access: true` flag, checked using Supabase `auth.getUser()` for protected requests. The editable user metadata and AMPLIFY's separate admin email allowlist do not grant ATLAS staff access.

An authorized Supabase project administrator provisions Auth users and sets or removes `staff_access` through the Auth Admin API in a trusted server environment. Preserve other `app_metadata` fields when updating the role. Never place service-role credentials in ATLAS, browser code, Git, or a client-side environment variable.

Users sign in at `/staff/login`. On first sign-in in a browser, existing unscoped ATLAS training progress is moved to that user's localStorage namespace; language preference remains device-wide.
