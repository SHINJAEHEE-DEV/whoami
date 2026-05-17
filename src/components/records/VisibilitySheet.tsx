import React, { useEffect, useState } from 'react';
import { Record } from '@/services/recordService';
import { groupService, Group } from '@/services/groupService';
import { Users, Check } from 'lucide-react';

interface VisibilitySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (visibility: string, groupIds?: string[]) => void;
  summary: {
    count: number;
    question?: string;
    answer?: string;
  };
}

export const VisibilitySheet: React.FC<VisibilitySheetProps> = ({
  isOpen,
  onClose,
  onPublish,
  summary
}) => {
  const [visibility, setVisibility] = useState('private');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchGroups = async () => {
        setIsLoadingGroups(true);
        try {
          const groups = await groupService.getGroups();
          setUserGroups(groups);
        } catch (error) {
          console.error('Failed to fetch groups for visibility sheet:', error);
        } finally {
          setIsLoadingGroups(false);
        }
      };
      fetchGroups();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const visibilityOptions = [
    { id: 'private', label: '나만 보기', description: '기록이 나에게만 공개됩니다.' },
    { id: 'mutual', label: '팔로워 전체 공개', description: '나를 팔로우하는 모든 사람에게 공개됩니다.' },
    { id: 'group', label: '그룹 공개', description: '내가 선택한 특정 그룹원들에게만 공개됩니다.' },
    { id: 'public', label: '전체 공개', description: '누구나 내 기록을 볼 수 있습니다.' }
  ];

  const handleGroupToggle = (groupId: string) => {
    setSelectedGroupIds(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId) 
        : [...prev, groupId]
    );
  };

  const handlePublish = () => {
    if (visibility === 'group' && selectedGroupIds.length === 0) {
      alert('공개할 그룹을 하나 이상 선택해주세요.');
      return;
    }
    onPublish(visibility, visibility === 'group' ? selectedGroupIds : []);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 transition-opacity backdrop-blur-sm">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-[#FCFBF8] rounded-t-[32px] p-6 sm:p-8 animate-in slide-in-from-bottom duration-300 border-t border-[#F5F3EF] flex flex-col max-h-[90vh]">
        <div className="w-12 h-1.5 bg-[#E0DCD3] rounded-full mx-auto mb-8 flex-shrink-0" />
        
        <div className="mb-8 text-center flex-shrink-0">
          <h2 className="text-xl font-bold tracking-tight text-[#1C1C1C] mb-2">공개 범위 설정</h2>
          <p className="text-sm text-[#9E9E9E]">작성하신 {summary.count}개의 답변을 누구와 나눌까요?</p>
        </div>

        <div className="mb-10 overflow-y-auto pr-1 custom-scrollbar flex-1">
          <div className="space-y-3">
            {visibilityOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setVisibility(option.id)}
                className={`w-full flex items-center justify-between p-5 rounded-[20px] border-2 transition-all duration-200 ${
                  visibility === option.id
                    ? 'border-[#1C1C1C] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.04)]'
                    : 'border-transparent bg-[#FAFAFA] hover:bg-[#F5F3EF]'
                }`}
              >
                <div className="text-left">
                  <p className="font-bold text-[#1C1C1C]">{option.label}</p>
                  <p className="text-xs text-[#9E9E9E] mt-0.5">
                    {option.description}
                  </p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  visibility === option.id 
                    ? 'border-[#1C1C1C] bg-[#1C1C1C]' 
                    : 'border-[#E0DCD3]'
                }`}>
                  {visibility === option.id && (
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Group Selection (Conditional) */}
          {visibility === 'group' && (
            <div className="mt-6 space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center space-x-2 ml-1">
                <Users size={14} className="text-brand-primary" />
                <label className="text-[11px] font-black text-brand-primary uppercase tracking-widest">공개할 그룹 선택</label>
              </div>
              
              {isLoadingGroups ? (
                <div className="py-4 flex justify-center">
                  <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : userGroups.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {userGroups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => handleGroupToggle(group.id)}
                      className={`px-4 py-2 rounded-full text-xs font-bold border-2 transition-all flex items-center space-x-2 ${
                        selectedGroupIds.includes(group.id)
                          ? 'bg-[#1C1C1C] border-[#1C1C1C] text-white'
                          : 'bg-white border-[#E0DCD3] text-[#666666] hover:border-[#1C1C1C]'
                      }`}
                    >
                      {selectedGroupIds.includes(group.id) && <Check size={10} strokeWidth={4} />}
                      <span>{group.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-5 text-center bg-[#FAFAFA] rounded-[20px] border border-dashed border-[#E0DCD3]">
                  <p className="text-[11px] font-bold text-[#9E9E9E] leading-relaxed">
                    아직 생성된 그룹이 없습니다.<br/>
                    그룹 관리에서 그룹을 먼저 만들어주세요.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-full font-bold text-sm bg-[#F5F3EF] text-[#666666] hover:bg-[#EBE7DF] transition-all"
          >
            취소
          </button>
          <button
            onClick={handlePublish}
            className="flex-[2] py-4 rounded-full font-bold text-sm bg-[#1C1C1C] text-white hover:scale-[1.02] active:scale-[0.98] shadow-lg transition-all"
          >
            기록하기
          </button>
        </div>
      </div>
    </div>
  );
};
