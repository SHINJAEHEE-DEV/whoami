import { supabase } from '@/lib/supabase';

export interface Record {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  visibility: 'private' | 'mutual' | 'group' | 'public';
  question_type: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
}

const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');
  return user;
};

export const recordService = {
  /**
   * 홈 피드에 표시할 기록들을 가져옵니다.
   * RLS에 의해 사용자가 볼 수 있는 기록만 필터링되어 반환됩니다.
   */
  async getHomeFeed(): Promise<Record[]> {
    const { data, error } = await supabase
      .from('records')
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching home feed:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * 새로운 기록을 작성합니다.
   */
  async createRecord(
    question: string, 
    answer: string, 
    visibility: Record['visibility'] = 'private',
    question_type: string = 'free-text'
  ) {
    const user = await getCurrentUser();

    const { data, error } = await supabase
      .from('records')
      .insert({
        user_id: user.id,
        question,
        answer,
        visibility,
        question_type,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 여러 개의 새로운 기록을 한꺼번에 작성합니다.
   */
  async createRecords(records: { 
    question: string; 
    answer: string; 
    visibility: Record['visibility'];
    question_type: string;
  }[]) {
    const user = await getCurrentUser();

    const recordsWithUserId = records.map(r => ({
      ...r,
      user_id: user.id
    }));

    const { data, error } = await supabase
      .from('records')
      .insert(recordsWithUserId)
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * 내 기록들만 가져옵니다.
   */
  async getMyRecords(): Promise<Record[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('records')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * 현재 사용자가 작성한 기록이 있는지 확인합니다.
   */
  async hasRecords(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { count, error } = await supabase
      .from('records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error checking records existence:', error);
      throw error;
    }

    return (count || 0) > 0;
  }
};
