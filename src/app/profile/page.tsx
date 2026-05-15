'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { memberService, Profile } from '@/services/memberService';
import { authService } from '@/services/authService';
import Navbar from '@/components/Navbar';
import ProfileHeader from '@/components/profile/ProfileHeader';
import RelationshipTabs from '@/components/profile/RelationshipTabs';
import EditProfileModal from '@/components/profile/EditProfileModal';

export default function ProfileHubPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [following, setFollowing] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchProfileData = useCallback(async () => {
    try {
      const [myProfile, myFollowers, myFollowing] = await Promise.all([
        memberService.getMyProfile(),
        memberService.getMyFollowers(),
        memberService.getMyFollowing(),
      ]);

      if (!myProfile) {
        router.push('/login');
        return;
      }

      setProfile(myProfile);
      setFollowers(myFollowers);
      setFollowing(myFollowing);
    } catch (error) {
      console.error('Failed to fetch profile data:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Push data fetching to the next microtask to avoid synchronous setState lint error
    Promise.resolve().then(() => {
      fetchProfileData();
    });
  }, [fetchProfileData]);

  const handleUnfollow = async (userId: string) => {
    try {
      await memberService.unfollowUser(userId);
      setFollowing(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Failed to unfollow:', error);
      alert('언팔로우에 실패했습니다.');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      alert('로그아웃에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-warm">
        <div className="text-brand-primary font-black animate-pulse">프로필 로딩 중...</div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-brand-warm pb-24">
      <Navbar />
      <div className="max-w-md mx-auto px-4 pt-8 space-y-8">
        {/* Profile Header */}
        <ProfileHeader
          profile={profile}
          followerCount={followers.length}
          followingCount={following.length}
          onEditClick={() => setIsEditModalOpen(true)}
          isOwnProfile={true}
        />

        {/* Relationship Tabs */}
        <RelationshipTabs
          followers={followers}
          following={following}
          onUnfollow={handleUnfollow}
        />

        {/* Settings Menu */}
        <section className="bg-white rounded-[32px] p-6 border border-brand-border space-y-2">
          <h2 className="text-xs font-black text-brand-secondary px-2 mb-2 uppercase tracking-wider">Settings</h2>
          
          <button 
            disabled
            className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-brand-warm transition-colors text-brand-secondary opacity-50 cursor-not-allowed"
          >
            <span className="font-bold">비공개 설정</span>
            <span className="text-xs">Soon</span>
          </button>

          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-red-50 transition-colors text-red-500"
          >
            <span className="font-bold">로그아웃</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </section>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={(updated) => {
            setProfile(updated);
            setIsEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
}
