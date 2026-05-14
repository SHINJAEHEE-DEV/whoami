import React, { useState } from 'react';

interface VisibilitySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (visibility: string) => void;
  summary: {
    question: string;
    answer: string;
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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 transition-opacity">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-t-3xl p-6 animate-in slide-in-from-bottom duration-300">
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
        
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">기록 요약</h3>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <p className="text-sm font-bold text-gray-900 mb-1">{summary.question}</p>
            <p className="text-sm text-gray-600 line-clamp-2">{summary.answer}</p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-400 mb-4">공개 설정</h3>
          <div className="space-y-3">
            {visibilityOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setVisibility(option.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                  visibility === option.id
                    ? 'border-black bg-black text-white'
                    : 'border-gray-50 bg-gray-50 hover:border-gray-100'
                }`}
              >
                <div className="text-left">
                  <p className="font-bold text-sm">{option.label}</p>
                  <p className={`text-xs ${visibility === option.id ? 'text-gray-300' : 'text-gray-400'}`}>
                    {option.description}
                  </p>
                </div>
                {visibility === option.id && (
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-black rounded-full" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
          >
            취소
          </button>
          <button
            onClick={() => onPublish(visibility)}
            className="flex-[2] py-4 rounded-2xl font-bold bg-black text-white hover:bg-gray-900 transition-all"
          >
            기록하기
          </button>
        </div>
      </div>
    </div>
  );
};
