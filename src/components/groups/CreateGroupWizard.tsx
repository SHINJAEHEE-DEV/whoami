import React, { useState, useEffect } from 'react';
import { memberService, Profile } from '@/services/memberService';
import { groupService, Group } from '@/services/groupService';

interface Props {
  group?: Group; // Provide this for edit mode
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateGroupWizard: React.FC<Props> = ({ group, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState(group?.name || '');
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(group?.members?.map(m => m.id) || []));
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = !!group;

  useEffect(() => {
    memberService.getMyFollowers().then(setFollowers).catch(console.error);
  }, []);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      if (isEditMode && group) {
        await groupService.updateGroup(group.id, name, Array.from(selectedIds));
      } else {
        await groupService.createGroup(name, Array.from(selectedIds));
      }
      onSuccess();
    } catch (e) {
      console.error(e);
      alert(isEditMode ? '그룹 수정 실패' : '그룹 생성 실패');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex flex-col justify-end sm:justify-center items-center sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md flex flex-col h-[80vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        <header className="p-4 flex justify-between items-center border-b border-gray-100">
          <button onClick={step === 2 ? () => setStep(1) : onClose} className="p-2 text-gray-500">
            {step === 2 ? '← 뒤로' : '취소'}
          </button>
          <span className="font-bold text-sm text-brand-primary">
            {isEditMode ? '그룹 수정하기' : '새 그룹 만들기'} ({step}/2)
          </span>
          <div className="w-12"></div> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {step === 1 ? (
            <div className="flex flex-col h-full justify-center">
              <label className="text-xl font-black text-brand-primary mb-4">그룹의 이름을<br/>정해주세요</label>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 우리 가족, 대학교 동창"
                className="w-full text-2xl font-bold border-b-2 border-brand-primary focus:outline-none py-2 placeholder:text-gray-300"
              />
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-black text-brand-primary mb-4">함께할 멤버를<br/>선택해주세요</h3>
              <div className="space-y-2">
                {followers.map(f => (
                  <label key={f.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl cursor-pointer">
                    <div className="flex items-center gap-3">
                      {f.avatar_url && (
                        <img src={f.avatar_url} alt={f.username} className="w-8 h-8 rounded-full bg-gray-100" />
                      )}
                      <span className="font-bold text-brand-primary">@{f.username}</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(f.id)}
                      onChange={() => toggleSelect(f.id)}
                      className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                    />
                  </label>
                ))}
                {followers.length === 0 && <p className="text-gray-500 text-sm py-10 text-center">아직 팔로워가 없습니다.</p>}
              </div>
            </div>
          )}
        </main>

        <footer className="p-4 border-t border-gray-100">
          {step === 1 ? (
            <button 
              onClick={() => setStep(2)} 
              disabled={!name.trim()}
              className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl disabled:bg-gray-300 transition-colors"
            >
              다음
            </button>
          ) : (
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl disabled:bg-gray-300 transition-colors"
            >
              {isSaving ? '저장 중...' : isEditMode ? '수정 완료' : '완료'}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};
