# UI 비율 최적화 및 프로필 기능 강화 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 탐색 페이지의 유저 리스트 UI를 슬림하게 개선하고, 프로필 페이지에 '책으로 보기' 기능을 추가하며 타인 프로필의 명단 노출을 제한한다.

**Architecture:** 
- 탐색 페이지는 인라인 스타일 수정을 통해 UI 비율을 조정한다.
- 프로필 페이지는 `viewMode` 로컬 상태를 도입하고, 기존 `BookViewer` 및 `ListViewer` 컴포넌트를 재사용하여 컨텐츠를 렌더링한다.
- `isOwnProfile` 플래그를 활용하여 `RelationshipTabs`의 노출 여부를 조건부 렌더링한다.

**Tech Stack:** Next.js (App Router), Tailwind CSS, Lucide React (아이콘 필요 시), Supabase

---

### Task 1: 탐색(Discover) 페이지 UI 정밀 조정

**Files:**
- Modify: `src/app/discover/page.tsx`

- [ ] **Step 1: 리스트 아이템 스타일 수정**
`src/app/discover/page.tsx` 파일에서 검색 결과 리스트 아이템의 패딩과 곡률을 수정한다.
`p-8` -> `p-5`, `rounded-[40px]` -> `rounded-3xl`

- [ ] **Step 2: 아바타 높이 버그 수정**
아바타 컨테이너의 잘못된 높이 값을 수정한다.
`h-124` -> `h-16`

- [ ] **Step 3: 레이아웃 균형 조정**
아바타와 유저네임 사이의 간격을 최적화하고 우측에 '프로필 보기'를 암시하는 텍스트나 아이콘을 추가할 공간을 확인한다.

```tsx
// src/app/discover/page.tsx 수정 예시
<div
  key={profile.id}
  className="flex items-center justify-between p-5 bg-white rounded-3xl border border-brand-border shadow-mongle hover-mongle cursor-pointer"
  onClick={() => router.push(`/profile/${profile.id}`)}
>
  <div className="flex items-center space-x-4">
    <div className="w-16 h-16 bg-brand-warm rounded-full flex items-center justify-center border-2 border-brand-border overflow-hidden relative shadow-inner">
      {/* ... 이미지 로직 ... */}
    </div>
    <div>
      <h3 className="text-lg font-black text-brand-primary">@{profile.username}</h3>
      <p className="text-xs font-bold text-brand-secondary">프로필 보기</p>
    </div>
  </div>
  <div className="text-brand-secondary">
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
    </svg>
  </div>
</div>
```

- [ ] **Step 4: 변경 사항 확인**
탐색 페이지에서 검색을 수행하고 아이템의 세로 높이가 줄어들었는지, 아바타가 정상적인 원형으로 보이는지 확인한다.

- [ ] **Step 5: Commit**
`git add src/app/discover/page.tsx && git commit -m "style: refine discover user list item proportions"`

---

### Task 2: 프로필 페이지 뷰 모드 및 토글 UI 추가

**Files:**
- Modify: `src/app/profile/[id]/page.tsx`

- [ ] **Step 1: viewMode 상태 추가**
`ProfilePage` 컴포넌트 상단에 `viewMode` 상태를 추가한다. 기본값은 `'book'`으로 설정한다.

```tsx
const [viewMode, setViewMode] = useState<'book' | 'list'>('book');
```

- [ ] **Step 2: 뷰 전환 토글 UI 이식**
`src/app/page.tsx`에 있는 토글 버튼 코드를 가져와 `ProfileHeader` 하단에 배치한다.

```tsx
{/* View Toggle */}
<div className="flex justify-center my-8">
  <div className="bg-white/50 backdrop-blur-sm p-1 rounded-full border border-brand-border flex shadow-mongle">
    <button 
      onClick={() => setViewMode('book')}
      className={`px-6 py-2 rounded-full text-[12px] font-black transition-all ${viewMode === 'book' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-secondary hover:text-brand-primary'}`}
    >
      📖 책으로 보기
    </button>
    <button 
      onClick={() => setViewMode('list')}
      className={`px-6 py-2 rounded-full text-[12px] font-black transition-all ${viewMode === 'list' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-secondary hover:text-brand-primary'}`}
    >
      📜 목록으로 보기
    </button>
  </div>
</div>
```

- [ ] **Step 3: 컴포넌트 임포트 확인**
`BookViewer` 컴포넌트가 임포트되어 있는지 확인한다.

- [ ] **Step 4: Commit**
`git add src/app/profile/[id]/page.tsx && git commit -m "feat: add view mode toggle to profile page"`

---

### Task 3: 프로필 페이지 자서전 렌더링 로직 구현

**Files:**
- Modify: `src/app/profile/[id]/page.tsx`

- [ ] **Step 1: 조건부 렌더링 적용**
기존에 `ListViewer`만 직접 렌더링하던 부분을 `viewMode`에 따라 분기 처리한다.

```tsx
<div className="mt-8">
  {records.length > 0 ? (
    viewMode === 'book' ? (
      <BookViewer records={records} onEdit={() => {}} />
    ) : (
      <ListViewer records={records} />
    )
  ) : (
    <div className="text-center py-12 bg-white rounded-3xl border border-brand-border">
      <p className="text-brand-secondary font-bold">작성된 기록이 없습니다.</p>
    </div>
  )}
</div>
```

- [ ] **Step 2: 타인 프로필 시 수정 권한 비활성화**
타인 프로필인 경우 `BookViewer`의 `onEdit` 콜백을 넘기지 않거나, 내부적으로 편집 버튼이 안 뜨도록 한다. (이미 설계상 `onEdit`이 없으면 안 뜨게 되어 있는지 확인 필요)

- [ ] **Step 3: 동작 확인**
자신의 프로필과 타인의 프로필에서 각각 토글이 정상 작동하고, 책 뷰에서 페이지가 잘 넘어가는지 확인한다.

- [ ] **Step 4: Commit**
`git add src/app/profile/[id]/page.tsx && git commit -m "feat: implement book/list view rendering in profile"`

---

### Task 4: 프로필 접근 권한 제어 (명단 숨기기)

**Files:**
- Modify: `src/app/profile/[id]/page.tsx`
- Modify: `src/components/profile/RelationshipTabs.tsx` (필요 시)

- [ ] **Step 1: 본인 여부 확인 로직 점검**
이미 존재하는 `isOwnProfile` (또는 `currentUser?.id === profile?.id`) 로직을 확인한다.

- [ ] **Step 2: RelationshipTabs 조건부 노출**
타인 프로필인 경우 팔로워 명단(`RelationshipTabs`)이 렌더링되지 않도록 수정한다.

```tsx
{/* 명단은 본인 프로필일 때만 노출 */}
{isOwnProfile && (
  <div className="mt-12 pt-12 border-t border-brand-border">
    <h2 className="text-xl font-black text-brand-primary mb-6">나의 인맥</h2>
    <RelationshipTabs 
      followers={followers} 
      following={following} 
      onUnfollow={handleUnfollow} 
    />
  </div>
)}
```

- [ ] **Step 3: 최종 검증**
1. 로그아웃 상태 또는 다른 계정으로 타인 프로필 접속 시 하단에 팔로워 명단이 보이지 않는지 확인.
2. 팔로워 숫자는 여전히 상단 헤더에 보이는지 확인.
3. 본인 프로필에서는 여전히 명단이 보이는지 확인.

- [ ] **Step 4: Commit**
`git add src/app/profile/[id]/page.tsx && git commit -m "security: restrict follower list visibility to profile owner only"`
