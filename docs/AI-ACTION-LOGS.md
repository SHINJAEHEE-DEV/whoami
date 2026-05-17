# AI Action Logs

- 2026-05-18: Fixed Supabase connection refusal error on Windows.
  - Reason: Default Supabase ports (54321, 54322, etc.) were in the Windows Hyper-V excluded port range.
  - Fix: Changed ports to 44321-44329 in `supabase/config.toml` and updated `.env.local`.
  - Verified: Confirmed auth health endpoint `http://127.0.0.1:44321/auth/v1/health` returns 200.
