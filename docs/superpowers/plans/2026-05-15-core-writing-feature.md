# Core Writing Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a focused writing wizard for autobiography entries with support for choice-based questions and a final visibility setting step.

**Architecture:** Use a state-driven wizard UI that handles different question types based on metadata. Implement a two-step flow: 1) Answer Question, 2) Set Visibility.

**Tech Stack:** Next.js (App Router), Tailwind CSS, Supabase (Auth/DB), ShadCN UI (Button, Card, Textarea).

---

### Task 1: Data Model and Constants

**Files:**
- Create: `src/constants/questions.ts`
- Modify: `supabase/migrations/20260515000000_add_question_type.sql`

- [ ] **Step 1: Create a migration to add `question_type` to `records` table**

```sql
ALTER TABLE public.records ADD COLUMN question_type text DEFAULT 'free-text';
```

- [ ] **Step 2: Run migration**

Run: `npx supabase migration new add_question_type` (if using local supabase) or apply via dashboard.

- [ ] **Step 3: Define question constants and types**

```typescript
// src/constants/questions.ts
export type QuestionType = 'free-text' | 'choice';

export interface Question {
  id: string;
  category: '취향' | '가치관' | '컴플렉스' | '기타';
  type: QuestionType;
  text: string;
  options?: string[];
}

export const QUESTIONS: Question[] = [
  {
    id: 'fav-food',
    category: '취향',
    type: 'choice',
    text: '평생 한 가지만 먹어야 한다면?',
    options: ['짬뽕', '짜장면']
  },
  {
    id: 'complex-1',
    category: '컴플렉스',
    type: 'free-text',
    text: '남들에게 완벽해 보이고 싶어 노력했던 순간은 언제인가요?'
  }
  // ... more questions from brainstorming
];
```

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations src/constants/questions.ts
git commit -m "feat: add question metadata and types"
```

---

### Task 2: Update `recordService`

**Files:**
- Modify: `src/services/recordService.ts`

- [ ] **Step 1: Update `createRecord` signature and implementation**

```typescript
// src/services/recordService.ts
async createRecord(
  question: string, 
  answer: string, 
  visibility: Record['visibility'] = 'private',
  question_type: string = 'free-text'
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const { data, error } = await supabase
    .from('records')
    .insert({
      user_id: user.id,
      question,
      answer,
      visibility,
      question_type,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async hasRecords(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { count, error } = await supabase
    .from('records')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (error) throw error;
  return (count || 0) > 0;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/recordService.ts
git commit -m "feat: update recordService with question_type and hasRecords"
```

---

### Task 3: Writing Wizard UI Components

**Files:**
- Create: `src/components/records/WritingWizard.tsx`
- Create: `src/components/records/VisibilitySheet.tsx`

- [ ] **Step 1: Create `WritingWizard` component**
Implement the UI with state for `currentQuestion`, `answer`, and `isComplete`. Handle `choice` vs `free-text` rendering.

- [ ] **Step 2: Create `VisibilitySheet` component**
A modal or bottom sheet that takes the final answer and lets user select visibility. Calls `recordService.createRecord` on final submit.

- [ ] **Step 3: Commit**

```bash
git add src/components/records/
git commit -m "feat: implement WritingWizard and VisibilitySheet components"
```

---

### Task 4: New Record Page and Onboarding Redirect

**Files:**
- Create: `src/app/records/new/page.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create the new record page**
Compose `WritingWizard` and `VisibilitySheet`.

- [ ] **Step 2: Implement onboarding redirect in Home page**
Use `recordService.hasRecords()` to check on mount.

```typescript
// src/app/page.tsx
useEffect(() => {
  const checkOnboarding = async () => {
    const hasAny = await recordService.hasRecords();
    if (!hasAny) {
      router.push('/records/new');
    }
  };
  checkOnboarding();
}, []);
```

- [ ] **Step 3: Commit**

```bash
git add src/app/records/new/page.tsx src/app/page.tsx
git commit -m "feat: add writing page and onboarding redirect logic"
```

---

### Task 5: Verification

- [ ] **Step 1: Manual test signup -> redirect to /records/new**
- [ ] **Step 2: Complete a choice question -> check DB for correct type/visibility**
- [ ] **Step 3: Complete a text question -> check DB**
- [ ] **Step 4: Verify Home page loads normally after at least one record exists**
