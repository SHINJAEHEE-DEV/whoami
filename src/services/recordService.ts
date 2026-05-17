import { supabase } from '@/lib/supabase';

export interface Record {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  visibility: 'private' | 'mutual' | 'group' | 'public';
  question_type: string;
  question_id?: string;
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
   * 현재 자신의 기록만 가져오도록 명시적으로 필터링합니다.
   */
  async getHomeFeed(): Promise<Record[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('records')
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq('user_id', user.id) // 자신의 기록만 필터링하도록 eq 필터 추가
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching home feed:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * 새로운 기록을 작성합니다.
   * 작성 시에는 항상 'private'으로 저장되며, 이후에 공개 범위를 수정할 수 있습니다.
   */
  async createRecord(
    question: string, 
    answer: string, 
    question_type: string = 'free-text'
  ) {
    const user = await getCurrentUser();

    const { data, error } = await supabase
      .from('records')
      .insert({
        user_id: user.id,
        question,
        answer,
        visibility: 'private',
        question_type,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * 여러 개의 새로운 기록을 한꺼번에 생성합니다.
   * visibility가 제공되지 않으면 기본적으로 'private'으로 저장됩니다.
   */
  async createRecords(
    records: { 
      question: string; 
      answer: string; 
      question_type: string;
    }[], 
    visibility: Record['visibility'] = 'private',
    groupIds?: string[]
  ) {
    const user = await getCurrentUser();

    for (const record of records) {
      if (!record.question || record.question.trim() === '') {
        throw new Error('질문 내용이 비어있습니다.');
      }
      if (!record.answer || record.answer.trim() === '') {
        throw new Error('답변 내용이 비어있는 항목이 있습니다.');
      }
    }

    const recordsWithUserId = records.map(r => ({
      ...r,
      user_id: user.id,
      visibility,
      answer: r.answer.trim(),
      question: r.question.trim()
    }));

    const { data: createdRecords, error: insertError } = await supabase
      .from('records')
      .insert(recordsWithUserId)
      .select();

    if (insertError) {
      console.error('Error inserting records:', insertError);
      throw new Error(insertError.message || '기록 저장 중 오류가 발생했습니다.');
    }

    // Handle group access if visibility is 'group'
    if (visibility === 'group' && groupIds && groupIds.length > 0 && createdRecords) {
      const accessData = createdRecords.flatMap(record => 
        groupIds.map(gid => ({
          record_id: record.id,
          group_id: gid
        }))
      );
      const { error: groupError } = await supabase.from('record_group_access').insert(accessData);
      if (groupError) {
        console.error('Error setting group access:', groupError);
        // We don't rollback records because they are already created, but we log the error
      }
    }

    return createdRecords;
  },

    /**
    * 특정 사용자의 기록들을 가져옵니다.
    * RLS에 의해 사용자가 볼 수 있는 기록만 필터링되어 반환됩니다.
    */
    async getUserRecords(userId: string): Promise<Record[]> {
    const { data, error } = await supabase
      .from('records')
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user records:', error);
      throw error;
    }

    return data || [];
    },

    /**
    * 특정 기록을 삭제합니다.

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
  },

  /**
   * 기록을 수정합니다.
   */
  async updateRecord(
    id: string, 
    updates: { 
      question?: string; 
      answer?: string; 
      visibility?: Record['visibility'];
      groupIds?: string[];
    }
  ) {
    const { groupIds, ...rest } = updates;

    // 1. Update record basics
    const { data, error } = await supabase
      .from('records')
      .update(rest)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating record:', error);
      throw error;
    }

    // 2. Update group access if visibility is 'group' or if groupIds provided
    if (updates.visibility === 'group' && groupIds) {
      // Sync group access
      await supabase.from('record_group_access').delete().eq('record_id', id);
      if (groupIds.length > 0) {
        const accessData = groupIds.map(gid => ({
          record_id: id,
          group_id: gid
        }));
        await supabase.from('record_group_access').insert(accessData);
      }
    } else if (updates.visibility && updates.visibility !== 'group') {
      // Clear access if visibility changed from group to something else
      await supabase.from('record_group_access').delete().eq('record_id', id);
    }

    return data;
  },

  /**
   * 특정 기록에 접근 가능한 그룹 ID 목록을 가져옵니다.
   */
  async getRecordGroupAccess(recordId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('record_group_access')
      .select('group_id')
      .eq('record_id', recordId);

    if (error) {
      console.error('Error fetching record group access:', error);
      throw error;
    }

    return data?.map(row => row.group_id) || [];
  }
};
