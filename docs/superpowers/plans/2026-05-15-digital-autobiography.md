# Digital Autobiography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the app into a personal digital autobiography with Book/List views, removing social feeds, and allowing per-record editing.

**Architecture:** Refactor the home page to display personal records instead of a feed. Implement a `BookViewer` and `ListViewer` with a toggle. Update `recordService` to support single-record updates.

**Tech Stack:** Next.js (App Router), Tailwind CSS, Supabase.

---

### Task 1: Update `recordService` for Single Record Management

**Files:**
- Modify: `src/services/recordService.ts`

- [x] **Step 1: Add `updateRecord` method**

```typescript
// src/services/recordService.ts
export const recordService = {
  // ... existing methods ...
  async updateRecord(id: string, updates: { answer?: string; visibility?: Record['visibility'] }) {
    const { data, error } = await supabase
      .from('records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
```

- [x] **Step 2: Commit**

```bash
git add src/services/recordService.ts
git commit -m "feat: add updateRecord to recordService"
```

---

### Task 2: Create Autobiography View Components

**Files:**
- Create: `src/components/records/BookViewer.tsx`
- Create: `src/components/records/ListViewer.tsx`

- [x] **Step 1: Implement `BookViewer` with flip logic**
Use simple state for `currentPage`.

```tsx
// src/components/records/BookViewer.tsx
import React, { useState } from 'react';
import { Record } from '@/services/recordService';

export const BookViewer = ({ records, onEdit }: { records: Record[], onEdit: (r: Record) => void }) => {
  const [page, setPage] = useState(0);
  const current = records[page];

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto px-4">
      <div className="relative w-full aspect-[3/4] sm:aspect-[4/3] bg-white rounded-3xl shadow-xl border border-brand-border flex flex-col sm:flex-row overflow-hidden">
        {/* Left Page (Question) */}
        <div className="flex-1 p-8 sm:p-12 border-b sm:border-b-0 sm:border-r border-brand-border bg-[#FAFAFA] flex flex-col justify-center">
          <span className="text-xs font-black text-brand-secondary mb-4 uppercase tracking-widest">{current.question_type}</span>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-primary leading-tight">
            {current.question}
          </h2>
        </div>
        {/* Right Page (Answer) */}
        <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center relative">
          <p className="text-lg sm:text-xl font-medium text-brand-primary leading-relaxed italic whitespace-pre-wrap">
            "{current.answer}"
          </p>
          <button 
            onClick={() => onEdit(current)}
            className="absolute bottom-6 right-6 p-3 bg-brand-warm rounded-full hover:bg-gray-100 transition-colors"
          >
            ✏️
          </button>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex items-center gap-6">
        <button 
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className="w-12 h-12 rounded-full border border-brand-border flex items-center justify-center disabled:opacity-30"
        >
          ←
        </button>
        <span className="font-bold text-brand-secondary">{page + 1} / {records.length}</span>
        <button 
          onClick={() => setPage(p => Math.min(records.length - 1, p + 1))}
          disabled={page === records.length - 1}
          className="w-12 h-12 rounded-full border border-brand-border flex items-center justify-center disabled:opacity-30"
        >
          →
        </button>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Implement `ListViewer`**

```tsx
// src/components/records/ListViewer.tsx
import React from 'react';
import { Record } from '@/services/recordService';

export const ListViewer = ({ records, onEdit }: { records: Record[], onEdit: (r: Record) => void }) => (
  <div className="w-full max-w-md mx-auto space-y-6 px-4 pb-20">
    {records.map((r) => (
      <div key={r.id} className="bg-white p-6 rounded-[24px] shadow-sm border border-brand-border">
        <div className="flex justify-between items-start mb-4">
          <span className="text-[10px] font-black text-brand-secondary uppercase">{r.question_type}</span>
          <button onClick={() => onEdit(r)} className="text-xs font-bold text-brand-accent">수정</button>
        </div>
        <h3 className="text-lg font-black text-brand-primary mb-3">Q. {r.question}</h3>
        <p className="text-brand-primary leading-relaxed opacity-80 whitespace-pre-wrap">{r.answer}</p>
      </div>
    ))}
  </div>
);
```

- [ ] **Step 3: Commit**

```bash
git add src/components/records/BookViewer.tsx src/components/records/ListViewer.tsx
git commit -m "feat: implement BookViewer and ListViewer components"
```

---

### Task 3: Refactor Home Page for Personal Autobiography

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Remove feed logic and add View Toggle**
Update `fetchFeed` to `fetchMyRecords`. Add `viewMode` state.

```tsx
// src/app/page.tsx summary
// ... imports ...
export default function Home() {
  const [viewMode, setViewMode] = useState<'book' | 'list'>('book');
  const [records, setRecords] = useState<Record[]>([]);
  // ... session check calls fetchMyRecords ...

  const fetchMyRecords = async () => {
    const data = await recordService.getMyRecords();
    setRecords(data);
  };

  return (
    <div className="min-h-svh bg-brand-warm">
      <Navbar />
      <main className="pt-8 pb-12">
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-2xl border border-brand-border flex shadow-sm">
            <button 
              onClick={() => setViewMode('book')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'book' ? 'bg-brand-primary text-white' : 'text-brand-secondary'}`}
            >
              📖 책으로 보기
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'list' ? 'bg-brand-primary text-white' : 'text-brand-secondary'}`}
            >
              📜 목록으로 보기
            </button>
          </div>
        </div>

        {viewMode === 'book' ? (
          <BookViewer records={records} onEdit={handleEdit} />
        ) : (
          <ListViewer records={records} onEdit={handleEdit} />
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: refactor Home to display personal autobiography with Book/List toggle"
```

---

### Task 4: Implement Edit/Visibility Modal

**Files:**
- Create: `src/components/records/EditRecordModal.tsx`

- [ ] **Step 1: Create Modal for editing answer and visibility**

- [ ] **Step 2: Integrate Modal with Home page**

- [ ] **Step 3: Commit**

```bash
git add src/components/records/EditRecordModal.tsx src/app/page.tsx
git commit -m "feat: add EditRecordModal and integrate with Home page"
```

---

### Task 5: Verification

- [ ] **Step 1: Verify redirect from `/` to `/records/new` for new users**
- [ ] **Step 2: Verify Book View functionality (navigation, flip)**
- [ ] **Step 3: Verify List View toggle**
- [ ] **Step 4: Verify editing a record updates the view immediately**
