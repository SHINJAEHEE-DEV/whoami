# Core Writing & Saving Finalization Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure the end-to-end flow of answering the questionnaire and saving to the database is 100% robust, type-safe, and user-friendly.

**Architecture:** Verify the Supabase schema, refine the `recordService` error handling, and polish the `NewRecordPage` transition effects.

**Tech Stack:** Next.js, Tailwind CSS, Supabase, Vitest.

---

### Task 1: Verify and Sync Supabase Schema

**Files:**
- Modify: `supabase/migrations/20260515000000_add_question_type.sql` (if incomplete)
- Check: `src/constants/questions.ts`

- [ ] **Step 1: Ensure `question_type` column exists with a default value**
Check the migration file and ensure it correctly alters the `records` table.

- [ ] **Step 2: Review `QUESTIONS` constant**
Ensure we have a diverse set of questions for the first-time user experience.

---

### Task 2: Enhance `recordService` with Robust Error Handling

**Files:**
- Modify: `src/services/recordService.ts`

- [ ] **Step 1: Add validation before insertion**
Ensure no empty answers or invalid visibility levels are sent to the DB.

- [ ] **Step 2: Implement a timeout or retry logic (optional but good for UX)**
For now, focus on clear error messages.

---

### Task 3: Polish `NewRecordPage` UX and Transitions

**Files:**
- Modify: `src/app/records/new/page.tsx`
- Modify: `src/components/records/WritingWizard.tsx`

- [ ] **Step 1: Add a loading state during 'Publishing'**
Show a spinner or "저장 중..." message when `handlePublish` is active.

- [ ] **Step 2: Add a "Save Progress" safety net (Local Storage)**
(Optional) If a user accidentally closes the browser, they shouldn't lose their answers.

- [ ] **Step 3: Improve redirect UX**
Use `router.replace` instead of `router.push` for the final redirect to prevent back-button loops.

---

### Task 4: End-to-End Integration Verification

- [ ] **Step 1: Create a temporary verification script or manual test checklist**
- [ ] **Step 2: Verify: User with no records is redirected to `/records/new`**
- [ ] **Step 3: Verify: Wizard handles Choice and Free-text correctly**
- [ ] **Step 4: Verify: All records appear on Home Feed after saving**

---

### Task 5: Final Documentation and Handover

- [ ] **Step 1: Update `docs/AI-ACTION-LOGS.md`**
- [ ] **Step 2: Update `docs/TODO-DONE.md`**
