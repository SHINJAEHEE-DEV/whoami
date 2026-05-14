import React, { useState } from 'react';

interface VisibilitySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (visibility: string) => void;
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

  if (!isOpen) return null;

  const visibilityOptions = [
    { id: 'private', label: '나만 보기', description: '기록이 나에게만 공개됩니다.' },
    { id: 'mutual', label: '서로 공개', description: '서로 기록을 남긴 친구에게만 공개됩니다.' },
    { id: 'group', label: '그룹 공개', description: '내가 속한 그룹원들에게 공개됩니다.' },
    { id: 'public', label: '전체 공개', description: '누구나 내 기록을 볼 수 있습니다.' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 transition-opacity backdrop-blur-sm">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-[#FCFBF8] rounded-t-[32px] p-6 sm:p-8 animate-in slide-in-from-bottom duration-300 border-t border-[#F5F3EF]">
        <div className="w-12 h-1.5 bg-[#E0DCD3] rounded-full mx-auto mb-8" />
        
        <div className="mb-8 text-center">
          <h2 className="text-xl font-bold tracking-tight text-[#1C1C1C] mb-2">공개 범위 설정</h2>
          <p className="text-sm text-[#9E9E9E]">작성하신 {summary.count}개의 답변을 누구와 나눌까요?</p>
        </div>

        <div className="mb-10">
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
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-full font-bold text-sm bg-[#F5F3EF] text-[#666666] hover:bg-[#EBE7DF] transition-all"
          >
            취소
          </button>
          <button
            onClick={() => onPublish(visibility)}
            className="flex-[2] py-4 rounded-full font-bold text-sm bg-[#1C1C1C] text-white hover:scale-[1.02] active:scale-[0.98] shadow-lg transition-all"
          >
            기록하기
          </button>
        </div>
      </div>
    </div>
  );
};
