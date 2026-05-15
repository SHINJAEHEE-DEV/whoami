'use client';

import { useState } from 'react';
import { memberService, Profile } from '@/services/memberService';

interface EditProfileModalProps {
  profile: Profile;
  onClose: () => void;
  onUpdate: (updatedProfile: Profile) => void;
}

export default function EditProfileModal({ profile, onClose, onUpdate }: EditProfileModalProps) {
  const [username, setUsername] = useState(profile.username);
  const [avatarSeed, setAvatarSeed] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!username.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updates: { username?: string; avatar_url?: string } = { username };
      if (avatarSeed.trim()) {
        updates.avatar_url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed.trim())}`;
      }
      
      const updated = await memberService.updateProfile(updates);
      onUpdate(updated);
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('프로필 업데이트에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md bg-brand-warm rounded-[32px] p-8 shadow-2xl border border-brand-border animate-in zoom-in-95 duration-200">
        <h2 className="text-2xl font-black text-brand-primary mb-6">프로필 수정</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-black text-brand-secondary ml-1">닉네임</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-accent/50 bg-white font-bold"
              placeholder="새로운 닉네임을 입력하세요"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-brand-secondary ml-1">아바타 시드 (DiceBear)</label>
            <input
              type="text"
              value={avatarSeed}
              onChange={(e) => setAvatarSeed(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-accent/50 bg-white font-bold"
              placeholder="원하는 단어를 입력해보세요 (예: Felix, Aneka)"
            />
            <p className="text-xs text-brand-secondary font-medium ml-1">입력한 단어에 따라 새로운 아바타가 생성됩니다.</p>
          </div>

          <div className="flex flex-col space-y-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black hover:bg-opacity-90 transition-all disabled:opacity-50"
            >
              {isSubmitting ? '저장 중...' : '저장하기'}
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 bg-white text-brand-primary border border-brand-border rounded-2xl font-black hover:bg-brand-warm transition-all"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
