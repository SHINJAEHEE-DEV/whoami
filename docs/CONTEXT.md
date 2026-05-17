# Context

## 현재 상황
- 회원가입 시 `net::ERR_CONNECTION_REFUSED` 에러 발생 확인 및 해결 완료.
- 질문 데이터 보호 조치 완료 (수정 불가, 기본 70개 삭제 불가).

## 설정 정보
- Supabase API: http://127.0.0.1:44321
- Supabase DB: 44322
- Supabase Studio: http://127.0.0.1:44323
- Supabase Inbucket: http://127.0.0.1:44324

## 비즈니스 규칙
- **질문(Questions)**:
  - 한번 생성된 질문은 수정할 수 없음 (DB Trigger).
  - 기본 시스템 질문 70개는 삭제할 수 없음 (DB Trigger).
  - 모든 사용자는 기본 질문 70개를 공통으로 사용함.

## 다음 작업
- 보호된 질문 데이터가 앱에서 정상적으로 조회되는지 확인.
