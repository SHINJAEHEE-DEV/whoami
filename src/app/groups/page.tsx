'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Group, groupService } from '@/services/groupService';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { CreateGroupWizard } from '@/components/groups/CreateGroupWizard';

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | undefined>(undefined);
  const router = useRouter();

  const fetchGroups = useCallback(async () => {
    try {
      const data = await groupService.getGroups();
      setGroups(data);
    } catch (error) {
      console.error('Failed to fetch groups:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        await fetchGroups();
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session) {
        fetchGroups();
      } else {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, fetchGroups]);

  const handleEditGroup = (group: Group) => {
    setEditingGroup(group);
    setShowCreateWizard(true);
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('정말로 이 그룹을 삭제하시겠습니까?')) return;
    
    try {
      await groupService.deleteGroup(groupId);
      setGroups(groups.filter(g => g.id !== groupId));
    } catch (error) {
      console.error('Failed to delete group:', error);
      alert('그룹 삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-warm">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-brand-warm pb-20">
      <Navbar />
      
      <main className="max-w-4xl mx-auto py-12 px-4">
        <div className="space-y-12">
          <header className="flex justify-between items-end">
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-brand-primary tracking-tight">나의 그룹</h1>
              <p className="text-brand-secondary font-bold">자서전을 함께 나누고 싶은 사람들의 모임입니다.</p>
            </div>
            <button 
              onClick={() => {
                setEditingGroup(undefined);
                setShowCreateWizard(true);
              }}
              className="w-14 h-14 bg-brand-primary text-white rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg hover:scale-110 active:scale-95 transition-all"
              title="새 그룹 만들기"
            >
              +
            </button>
          </header>

          {groups.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groups.map((group) => (
                <div 
                  key={group.id} 
                  className="bg-brand-card p-8 rounded-[2rem] border border-brand-border shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start relative z-10">
                    <div>
                      <h3 className="text-2xl font-black text-brand-primary leading-tight">{group.name}</h3>
                      <p className="text-brand-secondary font-bold text-sm mt-2 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-accent"></span>
                        멤버 {group.member_count}명
                      </p>
                    </div>
                    <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditGroup(group)}
                        className="text-brand-accent p-2.5 hover:bg-orange-50 rounded-2xl active:scale-90"
                        title="그룹 수정"
                      >
                        <EditIcon />
                      </button>
                      <button 
                        onClick={() => handleDeleteGroup(group.id)}
                        className="text-red-400 p-2.5 hover:bg-red-50 rounded-2xl active:scale-90"
                        title="그룹 삭제"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 flex -space-x-3 relative z-10">
                    {group.members?.slice(0, 5).map((member) => (
                      <Link 
                        key={member.id} 
                        href={`/profile/${member.id}`}
                        className="w-10 h-10 rounded-full bg-brand-warm border-2 border-white flex items-center justify-center text-xs font-black overflow-hidden shadow-sm hover:scale-110 hover:z-20 transition-all"
                        title={member.username}
                      >
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt={member.username} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-brand-secondary">{member.username?.[0]?.toUpperCase() || '?'}</span>
                        )}
                      </Link>
                    ))}
                    {(group.member_count || 0) > 5 && (
                      <div className="w-10 h-10 rounded-full bg-brand-border border-2 border-white flex items-center justify-center text-xs font-black text-brand-secondary shadow-sm">
                        +{group.member_count! - 5}
                      </div>
                    )}
                  </div>

                  {/* Decorative background element */}
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-warm rounded-full opacity-50 group-hover:scale-110 transition-transform"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-brand-card rounded-[2.5rem] border border-brand-border shadow-sm px-6">
              <div className="w-20 h-20 bg-brand-warm rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">
                👥
              </div>
              <h2 className="text-2xl font-black text-brand-primary mb-2">아직 생성된 그룹이 없습니다</h2>
              <p className="text-brand-secondary font-bold mb-8">첫 번째 그룹을 만들고 친구들을 초대해보세요.</p>
              <button 
                onClick={() => setShowCreateWizard(true)}
                className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-black shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                새 그룹 만들기
              </button>
            </div>
          )}
        </div>
      </main>

      {showCreateWizard && (
        <CreateGroupWizard 
          group={editingGroup}
          onClose={() => setShowCreateWizard(false)} 
          onSuccess={() => {
            setShowCreateWizard(false);
            fetchGroups();
          }} 
        />
      )}
    </div>
  );
}

function EditIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
