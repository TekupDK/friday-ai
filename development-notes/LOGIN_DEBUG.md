# Login Debugging Guide (Development)

This guide collects the steps to validate and debug the login flow in Friday AI when developing locally.

Steps to validate cookie/session flow:

1. Ensure environment
   - Copy `.env.dev.template` to `.env.dev` and fill in the following values:
     - `SUPABASE_URL=https://<your-supabase-project>.supabase.co`
     - `SUPABASE_SERVICE_ROLE_KEY=<service_role_secret>`

1. Start dev server
   - Run `npm run dev`.

1. Begin login attempt (Google)
   - Open `http://localhost:3000` in your browser and click "Sign in with Google".

1. Inspect network calls
   - Open DevTools → Network. Find the call:
     - `POST /api/auth/supabase/complete` → should return `200`.
     - Under Response Headers → `Set-Cookie: app_session_id=...` should be visible.

1. Inspect Cookies
   - DevTools → Application → Cookies → `http://localhost:3000`:
     - There should be an `app_session_id` entry.
     - It must not be `Secure` (unless using https) so check the `Secure` column.

1. Verify tRPC sends cookie
   - In Network, find `POST /api/trpc/auth.me`.
     - Under Request Headers → Cookie → should include `app_session_id=...`.
     - The response should include a user object.

1. Dev-login fallback
   - If Google bridging fails, test the dev-login flow:
     - Open `http://localhost:3000/api/auth/login` (dev-login)
     - This should set the cookie and redirect to `/`.

1. Common issues & fixes
   - `POST /api/auth/supabase/complete` returns 500 with `Supabase not configured on server`:
     - Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.dev`.
   - No `Set-Cookie` header:
     - If `SameSite=None` and `Secure=false` mismatch or cookie flagged secure.
     - For local development, secure must be `false` and `SameSite=lax`.
   - Browser rejects the cookie:
     - Confirm cookie has `HttpOnly`, `path=/`, `SameSite=lax` (dev) and `Secure=false`.

1. Helpful logs
   - The server logs additional info during auth completion:
     - Look for `[AUTH/SUPABASE] Session cookie set:` logs.
     - They show sameSite & secure flags used by the server.

1. If still blocked

- Check Supabase redirect URLs in your Supabase project to include `http://localhost:3000/`.
- Check your browser extension settings. Some security or privacy third-party extensions can prevent cross-site cookies.

With these steps you should be able to identify which part of the chain fails and adjust environment or server config accordingly.
