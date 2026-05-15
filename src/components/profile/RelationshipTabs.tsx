'use client';

import { useState } from 'react';
import { Profile } from '@/services/memberService';

interface RelationshipTabsProps {
  followers: Profile[];
  following: Profile[];
  onUnfollow: (userId: string) => Promise<void>;
}

export default function RelationshipTabs({ followers, following, onUnfollow }: RelationshipTabsProps) {
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');

  const list = activeTab === 'followers' ? followers : following;

  return (
    <div className="w-full space-y-6">
      <div className="flex border-b border-brand-border">
        <button
          onClick={() => setActiveTab('followers')}
          className={`flex-1 py-4 text-sm font-black transition-colors border-b-2 ${
            activeTab === 'followers'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-secondary hover:text-brand-primary'
          }`}
        >
          팔로워 {followers.length}
        </button>
        <button
          onClick={() => setActiveTab('following')}
          className={`flex-1 py-4 text-sm font-black transition-colors border-b-2 ${
            activeTab === 'following'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-brand-secondary hover:text-brand-primary'
          }`}
        >
          팔로잉 {following.length}
        </button>
      </div>

      <ul className="space-y-4">
        {list.length > 0 ? (
          list.map((user) => (
            <li key={user.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-brand-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-brand-warm border border-brand-border overflow-hidden relative">
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="font-bold text-brand-primary">@{user.username}</span>
              </div>
              
              {activeTab === 'following' && (
                <button
                  onClick={() => onUnfollow(user.id)}
                  className="px-4 py-1.5 text-xs font-black text-brand-secondary border border-brand-border rounded-xl hover:bg-brand-warm hover:text-brand-primary transition-colors"
                >
                  언팔로우
                </button>
              )}
            </li>
          ))
        ) : (
          <li className="py-12 text-center text-brand-secondary font-bold">
            {activeTab === 'followers' ? '아직 팔로워가 없습니다.' : '아직 팔로우하는 사용자가 없습니다.'}
          </li>
        )}
      </ul>
    </div>
  );
}
