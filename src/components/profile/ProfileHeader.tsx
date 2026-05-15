'use client';

import { Profile } from '@/services/memberService';

interface ProfileHeaderProps {
  profile: Profile;
  followerCount: number;
  followingCount: number;
  onEditClick: () => void;
  isOwnProfile: boolean;
}

export default function ProfileHeader({ 
  profile, 
  followerCount, 
  followingCount, 
  onEditClick,
  isOwnProfile 
}: ProfileHeaderProps) {
  const avatarUrl = profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`;

  return (
    <header className="bg-white rounded-[40px] p-8 border border-brand-border shadow-sm flex flex-col items-center space-y-6">
      <div className="w-24 h-24 bg-brand-warm rounded-full flex items-center justify-center border-2 border-brand-border overflow-hidden relative">
        <img
          src={avatarUrl}
          alt={profile.username}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-brand-primary">@{profile.username}</h1>
        <div className="flex items-center justify-center space-x-4 text-sm font-bold text-brand-secondary">
          <span>팔로워 {followerCount}명</span>
          <span>팔로잉 {followingCount}명</span>
        </div>
      </div>

      {isOwnProfile && (
        <button
          onClick={onEditClick}
          className="px-12 py-3 bg-brand-warm text-brand-primary border border-brand-border rounded-2xl font-black transition-all transform active:scale-95 hover:bg-brand-border"
        >
          프로필 수정
        </button>
      )}
    </header>
  );
}
