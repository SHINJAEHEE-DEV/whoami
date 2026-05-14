import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  is_discoverable: boolean;
  phone_hash: string | null;
  updated_at: string;
}

export const memberService = {
  /**
   * 현재 로그인한 사용자의 프로필 정보를 가져옵니다.
   */
  async getMyProfile(): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  },

  /**
   * 프로필 정보를 업데이트합니다.
   */
  async updateProfile(id: string, updates: Partial<Profile>) {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * 사용자 이름을 기반으로 프로필을 검색합니다.
   */
  async searchProfileByUsername(username: string): Promise<Profile[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${username}%`)
      .limit(10);

    if (error) throw error;
    return data || [];
  }
};
