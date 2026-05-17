# 디자인 명세서: 가시성 고도화 및 UX 품질 개선

## 1. 개요
기록의 공개 범위를 팔로워 및 특정 그룹별로 세분화하고, 질문 타입에 맞는 일관된 수정 경험을 제공한다. 또한 긴 리스트에서의 내비게이션 편의를 위한 '상단 이동 버튼'을 추가하고 더미 데이터의 시각적 품질을 높인다.

## 2. 상세 변경 사항

### 2.1 가시성(Visibility) 옵션 및 로직 고도화
- **팔로워 전체 공개**: 
    - 기존 `mutual`(맞팔) 로직을 `follower`(나를 팔로우하는 모든 사람) 로직으로 변경.
    - DB RLS 정책 수정: `follower_id = auth.uid()` 조건을 확인하도록 변경.
- **그룹별 공개 (중복 선택)**:
    - `EditRecordModal` 및 `VisibilitySheet`에서 '그룹 공개' 선택 시 사용자의 그룹 목록 노출.
    - 체크박스 또는 칩(Chip) 형태로 여러 그룹을 동시에 선택 가능.
    - `record_group_access` 테이블을 통해 선택된 그룹 ID들과 레코드 ID를 매핑 저장.

### 2.2 질문 타입별 수정 UI 분기
- **대상**: `EditRecordModal`
- **로직**:
    - `record.question_type === 'choice'`인 경우:
        - `question_id`를 기반으로 `questions.options`를 조회.
        - 기존 텍스트 입력창 대신 옵션 버튼 목록을 노출.
        - 사용자는 버튼을 클릭하여 답변을 변경.
    - `record.question_type !== 'choice'`인 경우:
        - 기존처럼 `textarea`를 통한 자유 입력 제공.

### 2.3 상단 이동(Scroll to Top) 버튼
- **컴포넌트**: `src/components/common/ScrollToTop.tsx` 생성.
- **기능**:
    - 사용자가 300px 이상 스크롤 시 우측 하단에 플로팅 버튼 노출.
    - 클릭 시 `window.scrollTo({ top: 0, behavior: 'smooth' })` 수행.
- **디자인**: `bg-white`, `shadow-mongle`, `rounded-full` 스타일의 둥근 버튼.

### 2.4 더미 데이터 아바타 다양화
- **대상**: `supabase/snippets/reset_and_seed_40_users.sql`
- **수정**: 
    - DiceBear 스타일 배열(`avataaars`, `lorelei`, `notionists`, `adventurer`, `fun-emoji`, `icons`) 사용.
    - 유저마다 랜덤하게 스타일과 시드를 배정하여 시각적 다양성 확보.

## 3. 기술적 고려 사항
- **데이터베이스 마이그레이션**: RLS 정책 업데이트를 위한 SQL 파일 생성 필요.
- **상태 관리**: 레코드 수정 모달에서 선택된 그룹 ID들을 배열 상태로 관리.
- **한글 인코딩**: SQL 실행 시 UTF-8 환경을 보장하기 위해 `docker cp` 방식 유지.

## 4. 성공 기준
- '그룹 공개' 선택 시 실제 본인의 그룹들이 목록에 뜨고, 저장 후 해당 그룹원에게만 기록이 노출됨.
- 2지선다 질문 수정 시 텍스트 입력이 차단되고 선택지만 나타남.
- 긴 페이지에서 상단 이동 버튼이 정상적으로 나타나고 작동함.
- 더미 데이터 유저들의 사진이 서로 겹치지 않고 다양하게 생성됨.
