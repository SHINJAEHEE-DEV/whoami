# 가시성 고도화 및 UX 품질 개선 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 가시성 설정을 팔로워 및 그룹 단위로 고도화하고, 2지선다 수정 제한 및 상단 이동 버튼 추가로 UX 품질을 높인다.

**Architecture:** 
- DB 레벨에서 RLS 정책을 수정하여 '팔로워 가시성'을 구현한다.
- `EditRecordModal` 내부에 상태 기반의 조건부 렌더링을 적용하여 질문 타입에 맞는 UI를 제공한다.
- 그룹 선택 정보를 `record_group_access` 테이블과 동기화하기 위한 서비스 메서드를 보완한다.

**Tech Stack:** Next.js, Supabase, Tailwind CSS, Lucide React

---

### Task 1: 데이터베이스 RLS 및 더미 데이터 고도화

**Files:**
- Create: `supabase/migrations/20260518000002_enhance_visibility_rls.sql`
- Modify: `supabase/snippets/reset_and_seed_40_users.sql`

- [ ] **Step 1: RLS 정책 수정 마이그레이션 작성**
`mutual` 가시성을 `follower`(단방향) 로직으로 변경하는 SQL을 작성한다.
```sql
-- Viewable based on visibility level 정책 수정
DROP POLICY IF EXISTS "Viewable based on visibility level" ON public.records;
CREATE POLICY "Viewable based on visibility level" ON public.records FOR SELECT
  USING (
    (visibility = 'public') OR 
    ((visibility = 'mutual') AND EXISTS (SELECT 1 FROM follows WHERE follower_id = auth.uid() AND following_id = user_id AND status = 'accepted')) OR 
    ((visibility = 'group') AND has_group_access(id, auth.uid())) OR
    (auth.uid() = user_id)
  );
```

- [ ] **Step 2: 더미 데이터 스크립트 아바타 스타일 추가**
`supabase/snippets/reset_and_seed_40_users.sql`에서 다양한 DiceBear 스타일을 사용하도록 수정한다.

- [ ] **Step 3: DB 반영 및 검증**
`docker cp` 및 `psql`을 통해 마이그레이션과 시드 데이터를 재주입한다.

---

### Task 2: ScrollToTop 공통 컴포넌트 구현 및 적용

**Files:**
- Create: `src/components/common/ScrollToTop.tsx`
- Modify: `src/app/layout.tsx` (또는 개별 페이지)

- [ ] **Step 1: ScrollToTop 컴포넌트 제작**
스크롤 위치 감지(`window.scrollY > 300`) 및 `smooth` 스크롤 기능 구현.

- [ ] **Step 2: 디자인 적용**
Lucide의 `ArrowUp` 아이콘을 사용한 둥근 플로팅 버튼 스타일링.

---

### Task 3: EditRecordModal 2지선다 및 그룹 선택 구현

**Files:**
- Modify: `src/components/records/EditRecordModal.tsx`
- Modify: `src/services/recordService.ts`

- [ ] **Step 1: 2지선다 수정 UI 분기**
`record.question_id`를 사용하여 `questions` 테이블에서 `options`를 fetch하거나, 기존 props로 전달받아 버튼 UI 렌더링.

- [ ] **Step 2: 다중 그룹 선택 UI 추가**
`visibility === 'group'`일 때 사용자의 소유 그룹 목록을 불러와 다중 선택 가능하도록 구현.

- [ ] **Step 3: 서비스 레이어 수정**
`updateRecord` 시 `record_group_access` 테이블의 데이터를 함께 갱신하는 로직 추가.

---

### Task 4: VisibilitySheet 고도화 (기록 작성 마무리)

**Files:**
- Modify: `src/components/records/VisibilitySheet.tsx`
- Modify: `src/components/records/WritingWizard.tsx`

- [ ] **Step 1: VisibilitySheet에 그룹 선택 UI 이식**
작성 완료 후 저장 시에도 특정 그룹들을 선택할 수 있도록 UI 보완.

- [ ] **Step 2: 최종 연동 테스트**
기록 생성 -> 그룹 지정 -> 해당 그룹원 계정으로 접속하여 가시성 확인.
