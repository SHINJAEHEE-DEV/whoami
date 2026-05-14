# DOMAIN COMMON STATUTE

## 1. 공유 레벨 (Visibility Levels)
- **Private**: 오직 작성자 본인만 접근 가능.
- **Mutual**: 서로 팔로우한 관계(맞팔로우)인 사용자에게 공개.
- **Group**: 작성자가 지정한 하나 이상의 커스텀 그룹에 속한 사용자에게 공개.
- **Public**: 서비스 내 모든 인증된 사용자에게 공개.

## 2. 관계성 규칙 (Relationship Rules)
- **Follow**: 한 사용자가 다른 사용자를 팔로우함. 상대방이 비공개 계정인 경우 `pending` 상태로 시작.
- **Mutual Follow (맞팔)**: 두 사용자가 서로 팔로우하고 있으며, 두 관계 모두 `accepted` 상태인 경우.
- **Unfollow**: 팔로우 관계 삭제 시, 즉시 `Mutual` 및 `Group` 공개 권한이 회수됨.

## 3. 그룹 공유 규칙 (Group Sharing Rules)
- 한 기록은 여러 그룹에 동시에 공유될 수 있다.
- 그룹 멤버십 변경은 해당 그룹에 공유된 모든 기록의 접근 권한에 즉시 반영된다.
