'use client';

import { useState, useRef } from 'react';
import { memberService, Profile } from '@/services/memberService';
import { storageService } from '@/services/storageService';
import { AlertModal } from '@/components/common/AlertModal';

interface EditProfileModalProps {
  profile: Profile;
  onClose: () => void;
  onUpdate: (updatedProfile: Profile) => void;
}

export default function EditProfileModal({ profile, onClose, onUpdate }: EditProfileModalProps) {
  const [username, setUsername] = useState(profile.username);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(profile.avatar_url);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, title?: string, message: string, type?: 'error' | 'success'}>({ isOpen: false, message: '' });
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(val);
    setError(null);
    if (val === profile.username) {
      setUsernameStatus('idle');
    } else if (usernameStatus !== 'idle') {
      setUsernameStatus('idle');
    }
  };

  const checkUsernameAvailability = async () => {
    if (!username.trim() || username === profile.username) return;
    if (username.length < 2) {
      setError('닉네임을 2자 이상 입력해주세요.');
      return;
    }

    setUsernameStatus('checking');
    setError(null);
    try {
      const isAvailable = await memberService.isUsernameAvailable(username);
      setUsernameStatus(isAvailable ? 'available' : 'taken');
      if (!isAvailable) {
        setError('이미 사용 중인 닉네임입니다.');
      }
    } catch (e) {
      console.error(e);
      setUsernameStatus('idle');
      setError('확인 중 오류가 발생했습니다.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('파일 크기는 2MB 이하여야 합니다.');
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSave = async () => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) return;

    if (trimmedUsername !== profile.username && usernameStatus !== 'available') {
      setError('닉네임 중복 확인이 필요합니다.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updates: { username?: string; avatar_url?: string } = {};
      
      if (trimmedUsername !== profile.username) {
        updates.username = trimmedUsername;
      }
      
      if (selectedFile) {
        const publicUrl = await storageService.uploadAvatar(selectedFile, profile.id);
        updates.avatar_url = publicUrl;
      }
      
      if (Object.keys(updates).length === 0) {
        onClose();
        return;
      }
      
      const updated = await memberService.updateProfile(updates);
      onUpdate(updated);
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
      setModalConfig({
        isOpen: true,
        title: '수정 실패',
        message: '프로필 업데이트에 실패했습니다.\n잠시 후 다시 시도해주세요.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="fixed inset-0" onClick={onClose} />
        <div className="relative w-full max-w-md bg-white rounded-[48px] p-12 shadow-mongle border border-brand-border animate-in zoom-in-95 duration-200">
          <h2 className="text-3xl font-black text-brand-primary mb-10 tracking-tight text-center">프로필 수정</h2>
          
          <div className="space-y-10">
            <div className="flex flex-col items-center gap-2">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative w-36 h-36 rounded-full overflow-hidden border-4 shadow-xl cursor-pointer group hover:scale-105 transition-all bg-brand-warm/50 ${error?.includes('파일') ? 'border-red-400' : 'border-white'}`}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-secondary bg-brand-warm/30">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
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
              <p className="text-[10px] font-black text-brand-secondary uppercase tracking-widest">Profile Photo</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end ml-2">
                <label className="text-[11px] font-black text-brand-secondary uppercase tracking-widest">Nickname</label>
                {usernameStatus === 'checking' && <span className="text-[10px] font-bold text-brand-primary animate-pulse">확인 중...</span>}
                {usernameStatus === 'available' && <span className="text-[10px] font-bold text-green-500">사용 가능!</span>}
                {usernameStatus === 'taken' && <span className="text-[10px] font-bold text-red-500">이미 사용 중이에요.</span>}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  className={`flex-1 px-6 py-4 rounded-full border-2 outline-none bg-brand-warm/20 font-bold text-lg transition-all ${
                    usernameStatus === 'available' ? 'border-green-400' : 
                    usernameStatus === 'taken' || (error && !error.includes('파일')) ? 'border-red-400' : 
                    'border-brand-border focus:border-brand-primary'
                  }`}
                  placeholder="새 닉네임"
                />
                {username !== profile.username && (
                  <button
                    type="button"
                    onClick={checkUsernameAvailability}
                    disabled={usernameStatus === 'checking' || !username.trim()}
                    className="px-5 py-2 bg-brand-warm border-2 border-brand-border text-brand-primary rounded-full font-black text-[11px] hover:bg-brand-border transition-all disabled:opacity-50 shadow-sm"
                  >
                    중복 확인
                  </button>
                )}
              </div>
              {error && <p className="text-[9px] font-bold text-red-500 ml-2">{error}</p>}
            </div>

            <div className="flex flex-col gap-4 pt-4">
              <button
                onClick={handleSave}
                disabled={isSubmitting || !username.trim() || (username !== profile.username && usernameStatus !== 'available')}
                className="w-full py-5 bg-brand-primary text-white rounded-full font-black text-lg shadow-xl hover-mongle disabled:opacity-50 disabled:hover:scale-100"
              >
                {isSubmitting ? '저장 중...' : '저장하기'}
              </button>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="w-full py-4 bg-white text-brand-secondary rounded-full font-black text-sm border-2 border-brand-border hover:bg-brand-border transition-all"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <AlertModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />
    </>
  );
}
