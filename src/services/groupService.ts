import { supabase } from '@/lib/supabase';
import { Profile } from './memberService';

export interface Group {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  member_count?: number;
  members?: Profile[];
}

const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');
  return user;
};

export const groupService = {
  async getGroups(): Promise<Group[]> {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('custom_groups')
      .select(`
        *,
        members:group_members(
          profile:user_id(id, username, avatar_url)
        )
      `)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((g: any) => ({
      ...g,
      member_count: g.members?.length || 0,
      members: g.members?.map((m: any) => m.profile) || [],
    }));
  },

  async createGroup(name: string, memberIds: string[]): Promise<Group> {
    const user = await getCurrentUser();

    // 1. Create group
    const { data: group, error: groupError } = await supabase
      .from('custom_groups')
      .insert({ owner_id: user.id, name })
      .select()
      .single();

    if (groupError) throw groupError;

    // 2. Add members if any
    if (memberIds.length > 0) {
      const memberData = memberIds.map(id => ({
        group_id: group.id,
        user_id: id
      }));
      const { error: memberError } = await supabase
        .from('group_members')
        .insert(memberData);
        
      if (memberError) {
        // Rollback on failure (simplified)
        await this.deleteGroup(group.id);
        throw memberError;
      }
    }

    return group;
  },

  async deleteGroup(groupId: string): Promise<void> {
    await getCurrentUser(); // Verify auth
    const { error } = await supabase
      .from('custom_groups')
      .delete()
      .eq('id', groupId);

    if (error) throw error;
  }
};
