# Visual Design Update: Threads x MOODA

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the Threads (clean, text-centric) and MOODA (warm, soft) visual style to the Writing Wizard and global layout.

**Architecture:** Update global CSS for the warm background and define utility classes or direct Tailwind styles for the new design system. Refactor `WritingWizard` and `VisibilitySheet` to use the new visual elements.

**Tech Stack:** Next.js, Tailwind CSS.

---

### Task 1: Global Theme & Layout Update

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update `globals.css` with warm theme colors**

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  --color-brand-warm: #FCFBF8;
  --color-brand-accent: #FFB347;
  --color-brand-primary: #1C1C1C;
  --color-brand-secondary: #9E9E9E;
  --color-brand-card: #FFFFFF;
  --color-brand-border: #F5F3EF;
}

body {
  background-color: var(--color-brand-warm);
  color: var(--color-brand-primary);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "style: add Threads x MOODA theme colors to global CSS"
```

---

### Task 2: Update `WritingWizard` Component Design

**Files:**
- Modify: `src/components/records/WritingWizard.tsx`

- [ ] **Step 1: Apply the new visual style to `WritingWizard`**
Update padding, border-radius (24px), shadows, and colors to match the mockup.

```tsx
// src/components/records/WritingWizard.tsx snippet
// ...
  return (
    <div className="max-w-lg mx-auto p-4 sm:p-6">
      {/* Header & Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold tracking-tight">whoami</h1>
          <span className="text-sm font-medium text-gray-400">
            {currentIndex + 1} / {QUESTIONS.length}
          </span>
        </div>
        <div className="w-full bg-[#F0EBE1] h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-[#FFB347] h-full transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-[24px] border border-[#F5F3EF] shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-8 sm:p-10 mb-6">
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 text-xs font-bold bg-[#FFF5E6] text-[#E68A00] rounded-full mb-4">
            {currentQuestion.category === '취향' ? '🍩' : 
             currentQuestion.category === '컴플렉스' ? '✨' : 
             currentQuestion.category === '가치관' ? '💎' : '📝'} {currentQuestion.category}
          </span>
          <h2 className="text-2xl font-bold leading-tight tracking-tight text-[#1C1C1C]">
            {currentQuestion.text}
          </h2>
        </div>

        {/* Input Section */}
        {currentQuestion.type === 'choice' ? (
          <div className="grid grid-cols-2 gap-4">
            {currentQuestion.options?.map((opt) => (
              <button
                key={opt}
                onClick={() => updateAnswer(opt)}
                className={`flex flex-col items-center justify-center p-8 rounded-[20px] border-2 transition-all duration-200 ${
                  currentAnswer === opt 
                    ? 'border-[#1C1C1C] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.04)]' 
                    : 'border-transparent bg-[#FAFAFA] hover:bg-[#F5F3EF]'
                }`}
              >
                <span className="text-lg font-bold">{opt}</span>
              </button>
            ))}
          </div>
        ) : (
          <textarea
            value={currentAnswer}
            onChange={(e) => updateAnswer(e.target.value)}
            placeholder="편하게 당신의 마음을 적어주세요..."
            className="w-full h-48 p-5 bg-[#FAFAFA] rounded-[16px] border-none focus:bg-white focus:ring-1 focus:ring-[#E0DCD3] outline-none resize-none text-lg leading-relaxed transition-all"
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center px-2">
        <button 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${
            currentIndex === 0 
              ? 'text-gray-200 cursor-not-allowed' 
              : 'bg-[#F5F3EF] text-[#666666] hover:bg-[#EBE7DF]'
          }`}
        >
          이전
        </button>
        
        {currentIndex === QUESTIONS.length - 1 ? (
          <button
            disabled={!isAllAnswered}
            onClick={() => { /* ... format and complete ... */ }}
            className={`px-10 py-3 rounded-full font-bold text-sm shadow-lg transition-all ${
              isAllAnswered ? 'bg-[#1C1C1C] text-white hover:scale-105 active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            작성 완료
          </button>
        ) : (
          <button
            disabled={!isCurrentAnswered}
            onClick={handleNext}
            className={`px-10 py-3 rounded-full font-bold text-sm shadow-lg transition-all ${
              isCurrentAnswered ? 'bg-[#1C1C1C] text-white hover:scale-105 active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            다음
          </button>
        )}
      </div>
    </div>
  );
// ...
```

- [ ] **Step 2: Commit**

```bash
git add src/components/records/WritingWizard.tsx
git commit -m "style: apply Threads x MOODA design to WritingWizard"
```

---

### Task 3: Update `VisibilitySheet` Component Design

**Files:**
- Modify: `src/components/records/VisibilitySheet.tsx`

- [ ] **Step 1: Apply the new visual style to `VisibilitySheet`**
Ensure it uses the warm background, rounded corners, and clean typography.

- [ ] **Step 2: Commit**

```bash
git add src/components/records/VisibilitySheet.tsx
git commit -m "style: apply Threads x MOODA design to VisibilitySheet"
```

---

### Task 4: Verification

- [ ] **Step 1: Run `npm run build` to ensure no styling conflicts or type errors**
- [ ] **Step 2: Manually check the visual appearance of the Writing page**
- [ ] **Step 3: Verify the background color is consistently warm across pages**
