# Spec: Core Writing Feature (Focused Wizard)

"나는 누구인가"에 대한 질문에 답변하고, 단계별로 공유 범위를 설정하는 핵심 작성 기능을 구현합니다.

## 1. 목적 (Purpose)
- 사용자가 시스템이 제공하는 질문에 답변함으로써 자신의 내면을 기록함.
- 작성 몰입도를 높이기 위해 '집중형 위저드' 스타일의 UI를 제공함.
- 신규 사용자의 경우 서비스 진입 시 최소 1개 이상의 기록 작성을 유도함 (온보딩).

## 2. 주요 기능 (Features)

### 2.1. 질문 작성 위저드 (Writing Wizard)
- **질문 유형 지원 (Option A):** 
  - `free-text`: 주관식 답변 (Textarea)
  - `choice`: 선택형 답변 (A vs B, OX 등)
- **작성 흐름:**
  - 한 번에 하나의 질문만 노출.
  - '다른 질문 보기' 버튼으로 질문 랜덤 교체 가능.
  - 답변 입력/선택 완료 시 '작성 완료' 버튼 활성화.

### 2.2. 공개 범위 설정 (Visibility Setting)
- 작성 완료 후 최종 발행 전 공개 범위를 선택하는 단계 제공.
- **공개 단계:** `Private` (나만 보기), `Mutual` (맞팔 공개), `Group` (그룹 공개), `Public` (전체 공개).

### 2.3. 온보딩 리다이렉트 (Onboarding Redirect)
- 로그인 성공 후, 작성된 `records`가 하나도 없는 경우 자동으로 `/records/new` (작성 페이지)로 리다이렉트.

## 3. 기술적 설계 (Technical Design)

### 3.1. 데이터 모델 확장
- `records` 테이블: `question_type` (text, choice) 컬럼 추가 고려 (또는 질문 데이터에서 관리).
- 질문 상수 데이터 구조:
  ```typescript
  interface Question {
    id: string;
    category: '취향' | '가치관' | '컴플렉스' | '기타';
    type: 'free-text' | 'choice';
    text: string;
    options?: string[]; // choice 타입일 경우 사용
  }
  ```

### 3.2. 프론트엔드 구성
- **Page:** `/records/new` (작성 위저드 페이지)
- **Components:**
  - `WritingWizard`: 질문 로드 및 답변 입력 처리.
  - `VisibilitySheet`: 최종 발행 전 공개 범위 선택 바텀 시트/모달.
- **Middleware/Guard:** 홈 페이지(`src/app/page.tsx`)에서 기록 존재 여부 체크 후 리다이렉트 로직 추가.

### 3.3. API/Service
- `recordService.createRecord`: `visibility` 및 선택형 답변 저장 대응.
- `recordService.hasRecords`: 현재 사용자의 기록 존재 여부 확인 함수 추가.

## 4. 성공 기준 (Success Criteria)
- 사용자가 질문에 답변하고 성공적으로 저장할 수 있음.
- 저장된 데이터가 설정한 `visibility`에 따라 피드에서 정상적으로 필터링됨 (RLS 작동 확인).
- 기록이 없는 신규 사용자가 로그인 시 작성 페이지로 정상 이동함.
