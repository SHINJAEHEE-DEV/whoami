# Sequential Writing Wizard Refinement Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the Writing Wizard to follow a sequential flow through all questions, show a progress bar, and allow batch submission only after all questions are answered.

**Architecture:** Update `WritingWizard` to manage an array of answers. Add batch insert support to `recordService`. Update the writing page to handle the final batch submission.

**Tech Stack:** Next.js, Tailwind CSS, Supabase.

---

### Task 1: Batch Record Creation in `recordService`

**Files:**
- Modify: `src/services/recordService.ts`

- [ ] **Step 1: Add `createRecords` method for batch insertion**

```typescript
// src/services/recordService.ts
async createRecords(records: { 
  question: string; 
  answer: string; 
  visibility: Record['visibility'];
  question_type: string;
}[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');

  const recordsWithUserId = records.map(r => ({
    ...r,
    user_id: user.id
  }));

  const { data, error } = await supabase
    .from('records')
    .insert(recordsWithUserId)
    .select();

  if (error) throw error;
  return data;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/recordService.ts
git commit -m "feat: add createRecords batch insertion method"
```

---

### Task 2: Refine `WritingWizard` Component

**Files:**
- Modify: `src/components/records/WritingWizard.tsx`

- [ ] **Step 1: Update state to track all answers and sequential navigation**
Remove random selection. Add `prev` button. Add progress bar.

```typescript
// src/components/records/WritingWizard.tsx
// ... imports ...

interface AnsweredQuestion {
  question: string;
  answer: string;
  type: string;
}

interface WritingWizardProps {
  onComplete: (answers: AnsweredQuestion[]) => void;
}

export const WritingWizard: React.FC<WritingWizardProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(QUESTIONS.length).fill(''));
  
  const currentQuestion = QUESTIONS[currentIndex];
  const currentAnswer = answers[currentIndex];
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;

  const handleNext = () => {
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const updateAnswer = (val: string) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = val;
    setAnswers(newAnswers);
  };

  const isCurrentAnswered = currentAnswer.trim().length > 0;
  const isAllAnswered = answers.every(a => a.trim().length > 0);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-1.5 rounded-full mb-6 overflow-hidden">
        <div 
          className="bg-black h-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">
          [{currentQuestion.category}]
        </span>
        <span className="text-xs text-gray-400 font-medium">
          {currentIndex + 1} / {QUESTIONS.length}
        </span>
      </div>
      
      {/* ... Question Text and Input (Choice/Free-text) ... */}
      {/* Update onClick/onChange to call updateAnswer(val) */}

      <div className="flex justify-between items-center mt-8">
        <button 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`text-sm font-medium ${currentIndex === 0 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'}`}
        >
          이전
        </button>
        
        {currentIndex === QUESTIONS.length - 1 ? (
          <button
            disabled={!isAllAnswered}
            onClick={() => {
              const formattedAnswers = QUESTIONS.map((q, i) => ({
                question: q.text,
                answer: answers[i],
                type: q.type
              }));
              onComplete(formattedAnswers);
            }}
            className={`px-8 py-3 rounded-full font-bold transition-all ${
              isAllAnswered ? 'bg-black text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            작성 완료
          </button>
        ) : (
          <button
            disabled={!isCurrentAnswered}
            onClick={handleNext}
            className={`px-8 py-3 rounded-full font-bold transition-all ${
              isCurrentAnswered ? 'bg-black text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            다음
          </button>
        )}
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/records/WritingWizard.tsx
git commit -m "feat: make WritingWizard sequential with progress bar"
```

---

### Task 3: Update Writing Page for Batch Submission

**Files:**
- Modify: `src/app/records/new/page.tsx`
- Modify: `src/components/records/VisibilitySheet.tsx`

- [ ] **Step 1: Update `VisibilitySheet` to show multiple items summary (optional, or just first one)**
If there are many questions, maybe just show a count in the summary.

- [ ] **Step 2: Update `NewRecordPage` to handle array of answers**

```typescript
// src/app/records/new/page.tsx
// ...
const [answeredQuestions, setAnsweredQuestions] = useState<any[]>([]);

const handleWizardComplete = (answers: any[]) => {
  setAnsweredQuestions(answers);
  setIsVisibilityOpen(true);
};

const handlePublish = async (visibility: any) => {
  if (answeredQuestions.length === 0) return;
  
  try {
    await recordService.createRecords(
      answeredQuestions.map(q => ({
        ...q,
        visibility,
        question_type: q.type
      }))
    );
    router.push('/');
    router.refresh();
  } catch (error) {
    // ...
  }
};
```

- [ ] **Step 3: Commit**

```bash
git add src/app/records/new/page.tsx src/components/records/VisibilitySheet.tsx
git commit -m "feat: support batch submission in writing page"
```

---

### Task 4: Verification

- [ ] **Step 1: Verify sequential flow (Q1 -> Q2 -> Q3)**
- [ ] **Step 2: Verify progress bar updates correctly**
- [ ] **Step 3: Verify "작성 완료" only enabled after all questions are filled**
- [ ] **Step 4: Verify all records are saved in DB after final publish**
