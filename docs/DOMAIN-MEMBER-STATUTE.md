# DOMAIN MEMBER STATUTE

## 1. 회원가입 및 프로필 생성 (Registration & Profile Creation)
- **Automatic Profile Creation**: 사용자가 Supabase Auth를 통해 회원가입하면, DB 트리거(`handle_new_user`)에 의해 `profiles` 테이블에 해당 사용자의 프로필이 자동으로 생성된다.
- **Username Policy**: 회원가입 시 `username`을 입력받으며, 입력되지 않은 경우 `user_[UUID_SHORT]` 형식으로 자동 생성된다.
- **Uniqueness**: `username`은 시스템 내에서 유일해야 한다.

## 2. 프로필 관리 (Profile Management)
- 사용자는 자신의 `username`, `avatar_url`, `is_discoverable` 상태를 수정할 수 있다.
- `id` (UUID)는 변경할 수 없으며, `auth.users`와 1:1 관계를 유지한다.

## 3. 지인 추천 (Discovery)
- `phone_hash`가 존재하고 `is_discoverable`이 `true`인 사용자만 연락처 기반 추천 시스템에 노출된다.
- 검색 기능을 통해 다른 사용자의 공개 프로필(`username`, `avatar_url`)을 조회할 수 있다.
