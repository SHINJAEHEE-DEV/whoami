import { supabase } from '@/lib/supabase';

export type QuestionType = 'essay' | 'choice' | 'short';

export interface Question {
  id: string;
  stage: number;
  type: QuestionType;
  question_text: string;
  options: string[];
}

export const questionService = {
  /**
   * 모든 질문 목록을 가져옵니다. (stage 순으로 정렬)
   */
  async getQuestions(): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('stage', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * 특정 단계의 질문들만 가져옵니다.
   */
  async getQuestionsByStage(stage: number): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('stage', stage)
      .order('created_at', { ascending: true });

    if (error) {
      console.error(`Error fetching questions for stage ${stage}:`, error);
      throw error;
    }

    return data || [];
  }
};
