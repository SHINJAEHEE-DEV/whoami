# Vercel 및 Supabase Cloud 배포 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 로컬 개발 환경에서 구현된 `whoami` 애플리케이션을 Vercel(Frontend)과 Supabase Cloud(Backend)에 배포하여 누구나 접속 가능한 상태로 만든다.

**Architecture:** 
- Frontend: Vercel (Next.js App Router)
- Backend/DB: Supabase Cloud (PostgreSQL, Auth, Storage)
- Local CLI를 사용하여 클라우드 데이터베이스의 스키마와 데이터를 동기화한다.

**Tech Stack:** Next.js, Vercel, Supabase CLI

---

### Task 1: Supabase Cloud 프로젝트 연결 및 스키마 이전

**Files:**
- Modify: `supabase/config.toml` (CLI 연동 시 자동 수정됨)

- [ ] **Step 1: Supabase Login**
터미널에서 Supabase 계정에 로그인한다.
```bash
npx supabase login
```

- [ ] **Step 2: 프로젝트 연결 (Link)**
새로 생성한 클라우드 프로젝트의 Reference ID(프로젝트 주소의 `XXXX...` 부분)를 확인하고 로컬과 연결한다. (DB 비밀번호 입력 필요)
```bash
npx supabase link --project-ref <YOUR_PROJECT_REFERENCE_ID>
```

- [ ] **Step 3: 스키마 푸시 (Push)**
로컬의 마이그레이션 파일들을 클라우드 DB에 적용한다.
```bash
npx supabase db push
```

- [ ] **Step 4: 확인**
Supabase 대시보드(클라우드)의 Table Editor에서 테이블들이 정상적으로 생성되었는지 확인한다.

---

### Task 2: 기본 질문 데이터(70개) 및 보안 정책 적용

**Files:**
- Modify: `supabase/seed.sql`

- [ ] **Step 1: seed.sql 업데이트 확인**
현재 로컬 DB에 반영된 70개 기본 질문과 보호 트리거 로직이 `supabase/migrations` 또는 `seed.sql`에 포함되어 있는지 확인한다.

- [ ] **Step 2: 데이터 주입 (Seed/Restore)**
클라우드 DB에 기본 질문 데이터를 주입한다. (가장 확실한 방법은 psql을 통한 실행)
```bash
# Reference ID와 패스워드 필요
cat supabase/migrations/20260515000001_create_questions_table.sql | npx supabase db query --linked
cat supabase/migrations/20260518000000_protect_questions.sql | npx supabase db query --linked
```

- [ ] **Step 3: 확인**
클라우드 DB의 `questions` 테이블에 70개의 데이터가 있고, 수정이 불가능한지 테스트한다.

---

### Task 3: Vercel 환경 변수 설정 및 배포

**Files:**
- N/A (Vercel Dashboard 작업)

- [ ] **Step 1: Vercel 프로젝트 생성**
GitHub 저장소를 Vercel에 연결하여 새로운 프로젝트를 생성한다.

- [ ] **Step 2: 환경 변수(Environment Variables) 입력**
Vercel 대시보드 > Settings > Environment Variables 메뉴에 다음 항목을 추가한다.
  - `NEXT_PUBLIC_SUPABASE_URL`: (클라우드 프로젝트 URL)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (클라우드 프로젝트 Anon Key)

- [ ] **Step 3: 재배포 (Redeploy)**
환경 변수 적용 후 배포가 완료될 때까지 기다린다.

---

### Task 4: 인증(Authentication) 및 보안 마무리

**Files:**
- N/A (Supabase Cloud Dashboard 작업)

- [ ] **Step 1: Site URL 설정**
Supabase 대시보드 > Authentication > URL Configuration에서 `Site URL`을 실제 배포된 Vercel 주소(예: `https://whoami-xxx.vercel.app`)로 변경한다.

- [ ] **Step 2: Redirect URLs 추가**
같은 메뉴의 `Redirect URLs`에 `https://whoami-xxx.vercel.app/auth/callback`을 추가한다.

- [ ] **Step 3: 스토리지 버킷 생성 (필요 시)**
로컬에서 사용하던 `avatars` 등 스토리지 버킷이 클라우드에도 존재하는지 확인하고, 없다면 생성 후 Public 권한을 설정한다.
