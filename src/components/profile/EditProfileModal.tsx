'use client';

import { useState, useRef } from 'react';
import { memberService, Profile } from '@/services/memberService';
import { storageService } from '@/services/storageService';

interface EditProfileModalProps {
  profile: Profile;
  onClose: () => void;
  onUpdate: (updatedProfile: Profile) => void;
}

export default function EditProfileModal({ profile, onClose, onUpdate }: EditProfileModalProps) {
  const [username, setUsername] = useState(profile.username);
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile.avatar_url);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 용량 제한 (2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('파일 크기는 2MB 이하여야 합니다.');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      alert('닉네임을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updates: { username?: string; avatar_url?: string } = { username };
      
      // 이미지가 새로 선택되었다면 업로드 진행
      if (selectedFile) {
        const publicUrl = await storageService.uploadAvatar(selectedFile, profile.id);
        updates.avatar_url = publicUrl;
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
        <h2 className="text-2xl font-black text-brand-primary mb-8">프로필 수정</h2>
        
        <div className="space-y-8">
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center gap-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md cursor-pointer group hover:opacity-90 transition-all bg-gray-100"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-brand-secondary bg-gray-50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <span className="text-white text-xs font-black">사진 변경</span>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest">Profile Photo</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-brand-secondary uppercase tracking-widest ml-1">Nickname</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border-2 border-brand-border focus:border-brand-primary outline-none bg-white font-bold text-lg transition-all"
              placeholder="새로운 닉네임을 입력하세요"
            />
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black text-base shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSubmitting ? '저장 중...' : '저장하기'}
            </button>
            <button
              onClick={onClose}
              className="w-full py-4 bg-white text-brand-secondary rounded-2xl font-black text-sm hover:bg-brand-border transition-all"
            >
              취소
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
