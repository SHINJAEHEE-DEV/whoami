# ARCHITECTURE STATUTE

## 1. Database Schema (Phase 1)

### Profiles & Auth
- `profiles`: 사용자 기본 정보. `id`는 `auth.users`를 참조.
- `phone_hash`: 연락처 기반 추천을 위한 SHA-256 해시값 저장.

### Relations
- `follows`: 단방향 팔로우 관계. 맞팔로우는 양방향 레코드 존재 여부로 판단.
  - `follower_id`, `following_id`, `status` ('pending', 'accepted')

### Groups
- `custom_groups`: 사용자가 정의한 팔로워 그룹.
- `group_members`: 그룹에 속한 사용자 매핑.

### Content & Visibility
- `records`: 질문 및 답변 기록.
- `record_group_access`: 기록과 공유 그룹 간의 다대다(M:N) 매핑 테이블.

## 2. RLS (Row Level Security) Rules

### Records SELECT Policy
기록 조회는 다음 조건 중 하나를 만족해야 함:
- 작성자 본인 (`user_id = auth.uid()`)
- `visibility = 'public'`
- `visibility = 'mutual'` AND `is_mutual_follower(auth.uid(), user_id)`
- `visibility = 'group'` AND `EXISTS (SELECT 1 FROM record_group_access rga JOIN group_members gm ON rga.group_id = gm.group_id WHERE rga.record_id = records.id AND gm.user_id = auth.uid())`

## 3. SQL Functions & Triggers
- `is_mutual_follower(user_a, user_b)`: 두 사용자가 서로 팔로우 중인지 확인하는 보안 함수.
- `handle_new_user()`: `auth.users` 삽입 시 자동으로 `profiles` 레코드를 생성하는 트리거 함수.

## 4. Implementation Services
- `authService`: 회원가입, 로그인, 로그아웃 등 인증 로직 담당.
- `memberService`: 프로필 조회, 업데이트, 검색 등 회원 도메인 로직 담당.
