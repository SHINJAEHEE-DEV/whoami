# AI Action Logs

- 2026-05-18: Fixed Supabase connection refusal error on Windows.
  - Reason: Default Supabase ports (54321, 54322, etc.) were in the Windows Hyper-V excluded port range.
  - Fix: Changed ports to 44321-44329 in `supabase/config.toml` and updated `.env.local`.
  - Verified: Confirmed auth health endpoint `http://127.0.0.1:44321/auth/v1/health` returns 200.

- 2026-05-18: Protected base questions from modification and deletion.
  - Fix: Added `is_system` column to `questions` table and implemented database triggers.
  - Business Rules:
    - ALL questions are now uneditable once created (`UPDATE` blocked).
    - Base questions (`is_system = true`) cannot be deleted (`DELETE` blocked).
  - Migration: `supabase/migrations/20260518000000_protect_questions.sql`

- 2026-05-18: Restricted record updates to 'answer' and 'visibility' columns only.
  - Fix: Implemented database trigger `tr_restrict_record_updates` on `records` table.
  - Business Rules:
    - Users can now only modify their answers and visibility settings.
    - Modification of `question`, `user_id`, `created_at`, or `question_type` is strictly blocked to maintain data integrity.
  - Migration: `supabase/migrations/20260518000001_restrict_record_updates.sql`

- 2026-05-18: Performed full data reset and 40-user seeding.
  - Action: Cleared all data for `asjh011969@gmail.com` and recreated 70 high-quality autobiography records.
  - Action: Deleted all other users and created 40 new dummy users with unique profiles, records, and groups.
  - Relationships: Established complex follow networks, ensuring 25 users follow the target account.
  - Script: `supabase/snippets/reset_and_seed_40_users.sql`
