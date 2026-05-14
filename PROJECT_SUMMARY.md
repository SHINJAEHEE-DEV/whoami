# 🚀 whoami: Project Summary

"난 이런 사람이야!" - SNS형 디지털 자서전 서비스

---

## 1. 프로젝트 개요 (Planning)

### 🎯 목적
개인의 내면(좋아하는 것, 가치관, 콤플렉스 등)을 질문 기반으로 기록하고, '맞팔로우' 관계를 기반으로 신뢰하는 지인과 안전하게 공유하는 서비스입니다.

### 💎 핵심 가치
- **깊은 연결 (Deep Connection):** 단순 일상이 아닌 내면의 목소리를 공유합니다.
- **상호성 (Reciprocity):** 맞팔로우를 통해 정보 노출의 비대칭성을 해소합니다.
- **선택적 탐색 (Selective Discovery):** 연락처 기반으로 지인을 찾되, 노출은 스스로 통제합니다.

### 🛠 기술 스택
- **Frontend:** Next.js 14+ (App Router), Tailwind CSS, ShadCN UI
- **Backend:** Supabase (Auth, PostgreSQL, Storage, RLS)
- **Runtime:** Node.js 20+

---

## 2. 주요 기능 (MVP 및 Phase 1)

### 👥 관계 시스템
- **단방향 팔로우:** 인스타그램 스타일의 팔로우 모델.
- **맞팔로우 (Mutual Follow):** 양방향 팔로우 시 'Shared' 등급의 기록 접근 권한 부여.
- **연락처 기반 추천:** 지인을 쉽게 찾을 수 있도록 해시 처리된 연락처 매칭 제공.

### 📝 기록 및 공유 (Visibility)
- **질문 기반 기록:** 시스템이 제공하는 페르소나별 질문에 답변.
- **4단계 공개 범위 제어:**
  - `Private`: 나만 보기 (기본)
  - `Mutual`: 서로 팔로우한 관계에게만 공개
  - `Group`: 지정한 특정 그룹에게만 공개
  - `Public`: 모든 유저에게 공개 (전체 피드)

### 🏠 피드 및 탐색
- **홈 피드:** 팔로우 중인 유저들의 Public 기록 및 맞팔 유저의 Mutual 기록 모아보기.
- **탐색:** 인기 Public 기록 및 연락처 기반 추천 친구 탐색.

---

## 3. 데이터베이스 설계 (DB Design)

### 🗄️ 주요 테이블 구조
1. **`profiles`**: 사용자 기본 정보 (ID, 닉네임, 아바타, 노출 여부)
2. **`follows`**: 팔로우 관계 (follower_id, following_id, status: pending/accepted)
3. **`custom_groups`**: 사용자 정의 그룹 (owner_id, group_name)
4. **`group_members`**: 그룹별 소속 멤버 매핑
5. **`records`**: 자서전 기록 (질문, 답변, visibility)
6. **`record_group_access`**: 기록-그룹 간 공유 권한 매핑

---

## 4. 진행 현황 (Progress)

### ✅ 완료된 작업 (Done)
- [x] 프로젝트 문서 구조 및 환경 설정
- [x] 회원가입 및 프로필 자동 생성 기능 (DB 트리거 연동)
- [x] 회원가입/로그인 UI 구현 및 Supabase Auth 연동
- [x] 메인 홈 피드 UI 및 기본 기록 조회 기능

### ⏳ 진행 예정 작업 (Ready)
- [ ] Phase 1: 개인 -> Group 공유 도메인 모델 상세 설계
- [ ] Supabase 스키마 고도화 및 RLS(Row Level Security) 규칙 정의
- [ ] 회원 도메인(Member) 기본 서비스 레이어 구조 설계

### 🚩 Phase 1 목표
- 팔로우/맞팔로우 핵심 로직 및 RLS 구축
- 질문 답변 작성 및 4단계 권한 제어 시스템 완성
- 연락처 기반 지인 추천 로직 설계
