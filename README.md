# whoami (나의 디지털 자서전)

70개의 정교한 질문을 통해 나의 인생을 기록하고, 소중한 사람들과 깊게 나누는 디지털 자서전 공간입니다.

---

# 프로젝트 개요
- **프로젝트 목적**: 사용자가 자신의 인생을 체계적으로 회고하고, 기록된 소중한 기억들을 원하는 대상(팔로워, 특정 그룹 등)과 안전하게 공유하도록 돕는 플랫폼입니다.
- **주요 기능 설명**: 
  - 5단계 로드맵(70개 질문)을 통한 자서전 작성
  - 실제 책을 넘기는 듯한 인터랙티브 뷰어
  - 팔로워 및 커스텀 그룹 단위의 정교한 공개 범위 설정
  - 유저 검색 및 소셜 관계 관리
- **어떤 문제를 해결하는지**: 자서전을 쓰고 싶지만 어디서부터 시작할지 모르는 막막함을 해결하고, SNS의 과도한 노출에서 벗어나 선택된 지인과만 깊은 이야기를 나눌 수 있는 안전한 환경을 제공합니다.
- **프로젝트 진행 배경**: 나 자신을 깊이 있게 들여다보는 '자기 성찰'의 시간을 디지털 기술을 통해 더 쉽고 즐거운 경험으로 만들고자 기획되었습니다.

---

# 기술 스택
## Frontend
- **Next.js 15 / React 19**
- **TypeScript**
- **TailwindCSS**
- **Framer Motion** (애니메이션)
- **Lucide React** (아이콘)

## Backend
- **Supabase** (Auth, Database, Storage)

## AI Agent
- **Gemini CLI (Auto-Edit Mode)**
- **Subagent-Driven Development** (전문 에이전트 협업)

---

# 주요 기능
- **📖 5단계 자서전 로드맵**: 취향, 일상, 뿌리, 가치관, 미래로 이어지는 70개의 질문 가이드 제공
- **✨ 스마트 뷰어 시스템**: '책으로 보기' 모드와 '목록으로 보기' 모드를 실시간 전환하여 감상
- **🔒 정교한 공개 범위 제어**: 나만 보기 / 팔로워 전체 공개 / 특정 그룹 지정 공개 설정 지원
- **🔍 유저 탐색 및 관계 구축**: 유저네임 검색을 통한 팔로우 기능 및 상호 팔로워 통계 노출
- **🛡️ 데이터 보호 트리거**: 시스템 질문 70개 보호 및 기록 수정 시 질문 무결성 유지

---

# 프로젝트 구조
```text
src/
 ├── app/              # Next.js App Router (페이지 및 레이아웃)
 ├── components/       # 재사용 가능한 UI 컴포넌트 (records, profile, common)
 ├── services/         # Supabase API 연동 및 서비스 레이어 (auth, record, member, group)
 ├── lib/              # 외부 라이브러리 설정 (supabase client)
 ├── constants/        # 정적 데이터 (70개 질문 세트)
 └── tests/            # Vitest 로직 검증 테스트 코드
```

---

# 실행 방법
## 1. 프로젝트 설치
```bash
npm install
```
## 2. 환경변수 설정
`.env.local`
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
## 3. 실행
```bash
npm run dev
```

---

# Supabase 설정
- **Authentication**: 이메일/비밀번호 인증 방식을 사용하며, 가입 시 `profiles` 테이블과 자동 연동되는 트리거 설정.
- **사용한 테이블**:
  - `profiles`: 사용자 기본 정보
  - `records`: 자서전 답변 데이터
  - `questions`: 70개 시스템 질문
  - `follows`: 사용자 간 관계
  - `custom_groups` & `group_members`: 그룹 및 멤버 관리
  - `record_group_access`: 기록별 그룹 접근 권한 매핑
- **주요 정책 (RLS)**: `is_mutual_follower` 및 `has_group_access` SQL 함수를 정의하여 가시성 등급(`public`, `follower`, `group`, `private`)에 따른 동적 접근 제어를 구현함.
- **Storage**: `avatars` 버킷을 생성하여 프로필 이미지 저장 및 조회.

---

# AI 에이전트 활용 방식
- **사용 도구**: Gemini CLI (Auto-Edit 모드)
- **작업 내용**:
  - **설계 및 기획**: 명세서(Spec) 및 구현 계획(Plan) 자동 수립
  - **컴포넌트 생성**: WritingWizard, EditRecordModal 등 대형 UI 컴포넌트 구현
  - **데이터베이스**: 복잡한 RLS 정책 SQL 및 무결성 트리거 작성
  - **데이터 세딩**: 40명 규모의 고품질 더미 데이터 생성 스크립트 작성 및 실행
- **프롬프트 전략**: '문서 기반 작업' 원칙을 통해 `GEMINI.md`, `CONTEXT.md`를 지속적으로 갱신하며 에이전트의 작업 맥락 유지.
- **코드 검증 방식**: 서브 에이전트를 통한 2단계 리뷰(명세 준수, 코드 품질) 수행 및 `npm run build`를 통한 최종 무결성 검증.

---

# 트러블 슈팅
## 1. 로컬 환경 포트 충돌
- **문제**: Supabase 구동 시 `ERR_CONNECTION_REFUSED` 발생.
- **원인**: 윈도우 Hyper-V/WinNAT 예약 포트 범위와 기본 포트(54321) 충돌.
- **해결**: `config.toml` 수정을 통해 포트를 44321 범위로 변경하여 해결.

## 2. 한글 인코딩 깨짐
- **문제**: DB 주입 시 한글이 `???`로 표시됨.
- **원인**: PowerShell 파이프 통과 시 UTF-8 인코딩 손실 발생.
- **해결**: `docker cp` 후 컨테이너 내부에서 파일을 직접 실행하여 해결.

## 3. Vercel 배포 404 에러
- **문제**: 배포 후 특정 경로에서 404 에러 발생.
- **원인**: 오타가 포함된 디렉토리(`[id`)와 PWA 설정의 충돌.
- **해결**: 불필요한 폴더 삭제 및 `vercel.json` 설정을 통한 라우팅 최적화.

---

# 회고
- **어려웠던 점**: 다중 그룹 선택 기능을 DB 수준의 관계와 UI의 실시간 상태 사이에서 동기화하는 로직이 까다로웠습니다.
- **개선하고 싶은 점**: 향후 자서전 내용을 바탕으로 AI가 요약 리포트를 만들어주는 기능을 추가하고 싶습니다.
- **새롭게 배운 점**: Supabase RLS의 강력함과 SQL 트리거를 활용한 데이터 무결성 보장 기법을 깊이 있게 배웠습니다.
- **AI 사용 소감**: 단순한 보조를 넘어 설계와 트러블슈팅을 함께 수행하는 '파트너'로서의 효용을 크게 느꼈으며, 특히 대규모 데이터 세딩 시의 생산성이 압도적이었습니다.

---

# 참고 자료
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
