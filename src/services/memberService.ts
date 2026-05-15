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
  },

  /**
   * 다른 사용자를 팔로우합니다.
   */
  async followUser(targetUserId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('로그인이 필요합니다.');
    
    const { error } = await supabase
      .from('follows')
      .insert({ 
        follower_id: user.id, 
        following_id: targetUserId, 
        status: 'accepted' 
      });
      
    if (error) throw error;
  },

  /**
   * 언팔로우합니다.
   */
  async unfollowUser(targetUserId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('로그인이 필요합니다.');
    
    const { error } = await supabase
      .from('follows')
      .delete()
      .match({ 
        follower_id: user.id, 
        following_id: targetUserId 
      });
      
    if (error) throw error;
  },

  /**
   * 두 사용자 간의 관계 상태를 확인합니다.
   */
  async checkRelationship(targetUserId: string): Promise<'none' | 'following' | 'mutual'> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 'none';
    
    // 내가 상대방을 팔로우하고 있는지 확인
    const { data: iFollow } = await supabase
      .from('follows')
      .select('status')
      .match({ 
        follower_id: user.id, 
        following_id: targetUserId 
      })
      .maybeSingle();
      
    if (!iFollow) return 'none';
    
    // 상대방이 나를 팔로우하고 있는지 확인
    const { data: theyFollow } = await supabase
      .from('follows')
      .select('status')
      .match({ 
        follower_id: targetUserId, 
        following_id: user.id 
      })
      .maybeSingle();
      
    return theyFollow ? 'mutual' : 'following';
  }
};
