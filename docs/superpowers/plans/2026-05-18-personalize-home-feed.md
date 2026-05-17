# 홈 피드 개인화 및 노출 제한 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 홈 화면에서 타인의 기록을 제외하고 오직 자신의 자서전 기록(70개 등)만 보이도록 제한한다. 타인의 기록은 해당 유저의 프로필 페이지에서만 볼 수 있도록 한다.

**Architecture:** 
- `recordService.getHomeFeed` API 호출 시 현재 사용자 ID로 필터링을 수행한다.
- UI 텍스트를 '나의 이야기' 중심으로 변경한다.

**Tech Stack:** Next.js, Supabase

---

### Task 1: recordService.getHomeFeed 필터링 강화

**Files:**
- Modify: `src/services/recordService.ts`

- [ ] **Step 1: getHomeFeed 내 user_id 필터 추가**
현재 RLS에 의존하여 전체를 가져오던 로직을 현재 사용자 ID로 명시적 필터링하도록 수정한다.

```typescript
  async getHomeFeed(): Promise<Record[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('records')
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq('user_id', user.id) // 자신의 기록만 필터링
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching home feed:', error);
      throw error;
    }

    return data || [];
  },
```

- [ ] **Step 2: 동작 확인**
홈 화면 접속 시 총 레코드 수가 205개가 아닌 본인의 기록 수(70개)로 표시되는지 확인한다.

- [ ] **Step 3: Commit**
`git add src/services/recordService.ts && git commit -m "feat: restrict home feed to current user's records"`

---

### Task 2: 홈 화면 UI 문구 및 레이아웃 조정

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: 타이틀 및 설명 수정**
공유 피드 느낌의 문구를 개인 자서전 공간 느낌으로 변경한다.

```tsx
<header className="text-center space-y-2">
  <h1 className="text-4xl font-black text-brand-primary tracking-tighter">나의 이야기</h1>
  <p className="text-base font-bold text-brand-secondary">한 페이지씩 채워가는 나만의 디지털 자서전</p>
</header>
```

- [ ] **Step 2: Commit**
`git add src/app/page.tsx && git commit -m "style: update home page text to reflect personal focus"`
