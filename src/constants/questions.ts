export type QuestionType = 'free-text' | 'choice';

export interface Question {
  id: string;
  category: '취향' | '가치관' | '컴플렉스' | '기타';
  type: QuestionType;
  text: string;
  options?: string[];
}

export const QUESTIONS: Question[] = [
  {
    id: 'fav-food',
    category: '취향',
    type: 'choice',
    text: '평생 한 가지만 먹어야 한다면?',
    options: ['짬뽕', '짜장면']
  },
  {
    id: 'dislike-food',
    category: '취향',
    type: 'free-text',
    text: '남들은 좋아하는데 나만 도저히 못 먹는 음식이 있다면?'
  },
  {
    id: 'complex-1',
    category: '컴플렉스',
    type: 'free-text',
    text: '남들에게 완벽해 보이고 싶어 노력했던 순간은 언제인가요?'
  },
  {
    id: 'value-success',
    category: '가치관',
    type: 'choice',
    text: "인생에서 '성공'보다 더 중요하다고 생각하는 가치는?",
    options: ['과정의 즐거움', '결과와 성취']
  }
];
