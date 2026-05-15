# Mobile-First UI Refinement Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Writing Wizard to a mobile-first, full-screen layout with sticky navigation and touch-optimized elements.

**Architecture:** Update `WritingWizard` to use a flex-column layout that fills the viewport. Implement a fixed progress bar and a sticky bottom action bar. Ensure typography and spacing are optimized for small screens.

**Tech Stack:** Next.js, Tailwind CSS.

---

### Task 1: Mobile-First Global Layout Update

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/records/new/page.tsx`

- [ ] **Step 1: Ensure root container allows full-height layout**

```css
/* src/app/globals.css - add utility if needed, but Tailwind 4 'h-svh' is preferred */
html, body {
  height: 100%;
  overflow-x: hidden;
}
```

- [ ] **Step 2: Update `NewRecordPage` container classes**
Remove large padding and desktop-centric constraints.

```tsx
// src/app/records/new/page.tsx
return (
  <div className="min-h-svh bg-brand-warm">
    <WritingWizard onComplete={handleWizardComplete} />
    {/* ... VisibilitySheet ... */}
  </div>
);
```

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css src/app/records/new/page.tsx
git commit -m "style: prepare global layout for mobile-first writing experience"
```

---

### Task 2: Refactor `WritingWizard` for Mobile

**Files:**
- Modify: `src/components/records/WritingWizard.tsx`

- [ ] **Step 1: Implement full-screen mobile layout with sticky components**
Use `flex flex-col h-svh` for the container.

```tsx
// src/components/records/WritingWizard.tsx structure
return (
  <div className="flex flex-col h-svh max-w-md mx-auto bg-brand-warm relative">
    {/* Fixed Top Progress */}
    <div className="absolute top-0 left-0 w-full h-1 bg-[#F0EBE1] z-50">
      <div className="bg-brand-accent h-full transition-all duration-300" style={{ width: `${progress}%` }} />
    </div>

    {/* Header */}
    <header className="px-6 pt-6 pb-2 flex justify-between items-center">
      <h1 className="text-lg font-extrabold tracking-tight">whoami</h1>
      <span className="text-xs font-bold text-brand-secondary">{currentIndex + 1} / {QUESTIONS.length}</span>
    </header>

    {/* Scrollable Content */}
    <main className="flex-1 px-6 pt-4 pb-12 overflow-y-auto">
      <div className="mb-6">
        <span className="inline-block px-3 py-1 text-[10px] font-black bg-[#FFF5E6] text-[#E68A00] rounded-full uppercase tracking-wider">
           {/* icon + category */}
        </span>
      </div>
      
      <h2 className="text-2xl font-black leading-tight mb-8 tracking-tight">
        {currentQuestion.text}
      </h2>

      <div className="w-full">
        {currentQuestion.type === 'choice' ? (
          <div className="grid grid-cols-1 gap-3">
            {/* Full-width choice buttons */}
          </div>
        ) : (
          <textarea 
            className="w-full h-[40vh] bg-transparent border-none focus:ring-0 p-0 text-lg leading-relaxed placeholder:text-gray-300 outline-none resize-none"
            placeholder="편하게 당신의 마음을 적어주세요..."
          />
        )}
      </div>
    </main>

    {/* Sticky Bottom Nav */}
    <footer className="p-6 pb-8 bg-brand-warm border-t border-brand-border flex gap-3">
      <button className="flex-1 py-4 bg-[#F5F3EF] rounded-2xl font-bold text-gray-600">이전</button>
      <button className="flex-[2] py-4 bg-brand-primary text-white rounded-2xl font-bold shadow-lg shadow-black/10">
        {isLast ? '작성 완료' : '다음'}
      </button>
    </footer>
  </div>
);
```

- [ ] **Step 2: Commit**

```bash
git add src/components/records/WritingWizard.tsx
git commit -m "style: implement mobile-first WritingWizard with sticky nav"
```

---

### Task 3: Refactor `VisibilitySheet` for Mobile

**Files:**
- Modify: `src/components/records/VisibilitySheet.tsx`

- [ ] **Step 1: Ensure bottom sheet feels native on mobile**
Use `fixed inset-x-0 bottom-0` with a backdrop blur and smooth slide-up animation.

- [ ] **Step 2: Commit**

```bash
git add src/components/records/VisibilitySheet.tsx
git commit -m "style: optimize VisibilitySheet for mobile-first experience"
```

---

### Task 4: Verification

- [ ] **Step 1: Run `npm run build`**
- [ ] **Step 2: Verify viewport height handling (`h-svh`)**
- [ ] **Step 3: Verify sticky footer behavior on long questions**
