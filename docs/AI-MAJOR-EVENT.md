# 주요 사건 (AI Major Events)

- 2026-05-18: 로컬 개발 환경 포트 충돌 해결
  - 윈도우 환경에서 Supabase 기본 포트(54321)가 Hyper-V 등에 의해 점유/배제되어 발생하던 `ERR_CONNECTION_REFUSED` 에러를 해결하기 위해 포트를 44321 범위로 변경함.
  - 관련 파일: `supabase/config.toml`, `.env.local`
