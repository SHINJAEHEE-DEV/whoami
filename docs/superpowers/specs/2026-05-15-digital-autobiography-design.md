# Digital Autobiography Design Spec

**Goal:** Transform the app into a personal digital autobiography where users answer a sequential questionnaire once, and the result is presented as a beautiful, private "Book" or "List" that can be selectively shared with private circles.

**Success Criteria:**
- Users must complete all onboarding questions before accessing the main view.
- Completed autobiography is viewable in two modes: Book (default) and List.
- Answers and visibility (private circles) can be edited per question.
- Social feed features are removed; the focus is entirely on the user's own autobiography.

---

### 1. User Experience (UX) Flow

#### 1.1. Onboarding (The Writing Wizard)
- **Dynamic Question Loading**: Questions are fetched from the `questions` table, ordered by `stage`.
- **Stage Transitions**: The 70 questions are divided into 5 stages. Each stage completion acts as a milestone:
    - **Encouragement Overlay**: When a stage is completed, show a full-screen or prominent overlay with a warm, encouraging message to motivate the user.
    - **Stage Messages**:
        - **Stage 1 (Taste) → 2**: "당신의 취향을 알아가는 즐거운 시간이었어요. 이제 일상 속의 당신은 어떤 모습인지 궁금해지네요."
        - **Stage 2 (Routine) → 3**: "소소한 일상들이 모여 지금의 당신을 만들었군요. 이제 조금 더 깊은 곳, 당신의 뿌리를 찾아가 볼까요?"
        - **Stage 3 (Past) → 4**: "소중한 기억들을 꺼내어 주셔서 감사해요. 그 경험들이 당신에게 어떤 단단한 가치관을 심어주었나요?"
        - **Stage 4 (Values) → 5**: "당신의 내면이 참 아름답고 단단하네요. 마지막으로, 당신이 꿈꾸는 미래와 진솔한 고백을 들려주세요."
        - **Final Completion**: "축하합니다! 당신의 소중한 인생 이야기가 한 권의 자서전으로 탄생했습니다."
    - **Gradual Depth**: Transition from light ice-breaking (Stage 1) to deep identity questions (Stage 5).
- **Sequential Flow**: Users answer all pre-defined questions in a wizard format.
- **Persistence**: Progress is saved to `localStorage` and synchronized with the DB only upon final completion.
- **Completion**: Once all questions are answered, the "Publish" action creates all records in the DB and marks the autobiography as complete.

#### 1.2. Main View (The Autobiography)
- **Home Page (`/`)**: Displays the user's own autobiography immediately after login.
- **Book Mode (Default)**:
  - Left page: Question Category + Question Text.
  - Right page: User Answer + Edit/Visibility buttons.
  - Interaction: Swipe or click side arrows to turn pages.
- **List Mode**:
  - A vertical feed of all [Question + Answer] pairs.
  - Quick scrolling for rapid review.
- **Toggle**: A prominent switch at the top to toggle between Book and List modes.

#### 1.3. Editing & Privacy
- **Edit Action**: Users can click an "Edit" button on any page/item to modify the answer.
- **Visibility Action**: Users can adjust who can see that specific page. Options include Private, Mutual, Group, and Public (though mainly focused on Private/Group circles).

---

### 2. Architecture & Data Flow

#### 2.1. Data Model
- **`records`**: Stores question, answer, and global visibility.
- **`custom_groups` & `group_members`**: Defines private circles (e.g., "Family").
- **`record_group_access`**: Maps specific autobiography pages to one or more private circles.

#### 2.2. API / Services
- **`recordService`**:
  - `hasRecords()`: Check if the user has started their autobiography.
  - `createRecords(batch)`: Bulk save the initial autobiography.
  - `updateRecord(id, updates)`: Edit answer or visibility.
- **`groupService`**:
  - Manage private circles for selective sharing.

#### 2.3. Security (RLS)
- **Owner Access**: Users have full CRUD access to their own records.
- **Circle Access**: Other users can only view records if they are members of a group that has been granted access to that specific record via `has_group_access` security function.

---

### 3. UI/UX Style (Threads x MOODA)
- **Theme**: Warm background (`#FCFBF8`), dark text (`#1C1C1C`), and amber accents (`#FFB347`).
- **Cards**: 24px corner radius for a soft, premium feel.
- **Typography**: Bold, high-contrast headings with readable, medium-weight body text.

---

### 4. Implementation Priorities (Phase 1 Refinement)
1. Remove Feed logic from `src/app/page.tsx`.
2. Implement the Book/List toggle and the Book Viewer component.
3. Update `recordService` to support single record updates (answer/visibility).
4. Refine the Onboarding Wizard to ensure a "Complete" state triggers the transition to the Book view.
