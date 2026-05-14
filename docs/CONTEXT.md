# Project: whoami (Digital Autobiography App)

## Goal
- 개인의 내면을 기록하고, 단계별(Private/Group/Public)로 공유하는 서비스.

## Mission Constraints
1. **Document-Driven**: 모든 판단 근거는 `GEMINI.md`와 `docs/` 내 문서에 기반함.
2. **Design First**: 코드 작성 전 설계 문서 업데이트 및 승인 필수.
3. **Security First**: Supabase RLS 를 통한 개인정보 보호 최우선.
4. **Transparency**: 모든 결정과 작업은 `docs/AI-ACTION-LOGS.md` 및 `docs/AI-MAJOR-EVENT.md`에 기록.

## Current Phase: Phase 1 Initialization
- 단계적 공유 도입: 개인 -> Group

## Tech Stack
- Next.js (App Router)
- Tailwind CSS
- ShadCN UI
- Supabase (PostgreSQL, Auth, RLS)
