export type QuestionType = 'free-text' | 'choice';

export interface Question {
  id: string;
  category: string;
  stage: number;
  type: QuestionType;
  text: string;
  options?: string[];
}

export const QUESTIONS: Question[] = [
  // [Stage 1] 취향 탐색 (아이스브레이킹)
  { id: '1', stage: 1, category: '취향', type: 'choice', text: '찍먹 vs 부먹', options: ['찍먹', '부먹'] },
  { id: '2', stage: 1, category: '취향', type: 'choice', text: '짜장면 vs 짬뽕', options: ['짜장면', '짬뽕'] },
  { id: '3', stage: 1, category: '취향', type: 'free-text', text: "나의 '소울 푸드'와 그 음식에 얽힌 추억은" },
  { id: '4', stage: 1, category: '취향', type: 'free-text', text: '죽기 전 마지막 한 끼를 먹는다면 무엇을 먹을까요' },
  { id: '5', stage: 1, category: '취향', type: 'choice', text: '민초(민트초코) 호 vs 불호', options: ['호', '불호'] },
  { id: '6', stage: 1, category: '취향', type: 'choice', text: '강아지 vs 고양이', options: ['강아지', '고양이'] },
  { id: '7', stage: 1, category: '취향', type: 'free-text', text: '내가 가장 좋아하는 시간대는 언제인가요' },
  { id: '8', stage: 1, category: '취향', type: 'choice', text: '아침형 인간 vs 저녁형 인간', options: ['아침형', '저녁형'] },
  { id: '9', stage: 1, category: '취향', type: 'free-text', text: '나를 대표하는 색깔은 무엇이라고 생각하나요' },
  { id: '10', stage: 1, category: '취향', type: 'choice', text: '산 vs 바다', options: ['산', '바다'] },

  // [Stage 2] 일상과 휴식
  { id: '11', stage: 2, category: '일상', type: 'choice', text: '전화 vs 문자', options: ['전화', '문자'] },
  { id: '12', stage: 2, category: '일상', type: 'free-text', text: "나를 숨 쉬게 하는 나만의 '케렌시아(안식처)'는 어디인가요" },
  { id: '13', stage: 2, category: '일상', type: 'free-text', text: '요즘 나를 가장 설레게 하는 것은 무엇인가요' },
  { id: '14', stage: 2, category: '일상', type: 'choice', text: '여행 스타일: 계획적 vs 무계획', options: ['계획적', '무계획'] },
  { id: '15', stage: 2, category: '일상', type: 'free-text', text: '인생 영화 3편을 꼽는다면' },
  { id: '16', stage: 2, category: '일상', type: 'choice', text: '계절: 봄/여름 vs 가을/겨울', options: ['봄/여름', '가을/겨울'] },
  { id: '17', stage: 2, category: '일상', type: 'free-text', text: '비 오는 날이면 생각나는 노래나 활동은' },
  { id: '18', stage: 2, category: '일상', type: 'choice', text: '휴식 방식: 집순이/집돌이 vs 야외 활동', options: ['집순이/집돌이', '야외 활동'] },
  { id: '19', stage: 2, category: '일상', type: 'free-text', text: '나만의 스트레스 해소법이 있다면' },
  { id: '20', stage: 2, category: '일상', type: 'free-text', text: '수집하고 있는 물건이나 수집하고 싶은 것이 있나요' },

  // [Stage 3] 나의 뿌리 (과거)
  { id: '21', stage: 3, category: '과거', type: 'free-text', text: '나의 어린 시절을 한 단어로 표현한다면' },
  { id: '22', stage: 3, category: '과거', type: 'choice', text: '나는 어릴 때: 골목대장형 vs 혼자놀기형', options: ['골목대장형', '혼자놀기형'] },
  { id: '23', stage: 3, category: '과거', type: 'free-text', text: '어릴 적 가장 좋아했던 장난감이나 물건은 무엇인가요' },
  { id: '24', stage: 3, category: '과거', type: 'free-text', text: '부모님으로부터 물려받은 가장 좋은 습관은' },
  { id: '25', stage: 3, category: '과거', type: 'choice', text: '학창 시절의 나는: 모범생 vs 자유영혼', options: ['모범생', '자유영혼'] },
  { id: '26', stage: 3, category: '과거', type: 'free-text', text: '나를 가장 잘 설명해주는 어린 시절의 에피소드는' },
  { id: '27', stage: 3, category: '과거', type: 'free-text', text: '학창 시절, 나는 어떤 학생으로 기억되고 싶었나요' },
  { id: '28', stage: 3, category: '과거', type: 'choice', text: '다시 돌아간다면: 초등학생 vs 고등학생', options: ['초등학생', '고등학생'] },
  { id: '29', stage: 3, category: '과거', type: 'free-text', text: '나에게 가장 큰 영향을 준 선생님이나 멘토가 있다면' },
  { id: '30', stage: 3, category: '과거', type: 'free-text', text: "어릴 적 꿈꿨던 '어른의 모습'과 지금의 나는 얼마나 닮아있나요" },

  // [Stage 4] 가치관과 관계
  { id: '31', stage: 4, category: '가치관', type: 'choice', text: '결과가 중요 vs 과정이 중요', options: ['결과', '과정'] },
  { id: '32', stage: 4, category: '가치관', type: 'free-text', text: '삶에서 가장 중요하게 생각하는 가치 순위 TOP 3는' },
  { id: '33', stage: 4, category: '가치관', type: 'free-text', text: "내가 생각하는 '멋진 어른'의 기준은 무엇인가요" },
  { id: '34', stage: 4, category: '가치관', type: 'choice', text: '고민이 있을 때: 혼자 해결 vs 주변에 조언', options: ['혼자 해결', '주변 조언'] },
  { id: '35', stage: 4, category: '가치관', type: 'free-text', text: '내가 절대 타협할 수 없는 신념이 있다면' },
  { id: '36', stage: 4, category: '가치관', type: 'free-text', text: '타인에게 들었을 때 가장 기분 좋은 칭찬은' },
  { id: '37', stage: 4, category: '가치관', type: 'choice', text: '인간관계: 좁고 깊게 vs 넓고 얕게', options: ['좁고 깊게', '넓고 얕게'] },
];
