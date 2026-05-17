# Context

## 현재 상황
- 회원가입 시 `net::ERR_CONNECTION_REFUSED` 에러 발생 확인 및 해결 완료.
- 원인: 윈도우 환경의 포트 예약(Hyper-V/WinNAT)으로 인해 Supabase 기본 포트(54321)가 차단됨.
- 해결: Supabase 포트를 44321 범위로 변경하고 설정을 업데이트함.

## 설정 정보
- Supabase API: http://127.0.0.1:44321
- Supabase DB: 44322
- Supabase Studio: http://127.0.0.1:44323
- Supabase Inbucket: http://127.0.0.1:44324

## 다음 작업
- 변경된 포트 환경에서 회원가입 및 로그인 기능이 정상 작동하는지 사용자에게 확인 요청.
