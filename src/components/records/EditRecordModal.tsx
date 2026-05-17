import React, { useState } from 'react';
import { Record, recordService } from '@/services/recordService';

interface EditRecordModalProps {
  record: Record;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export const EditRecordModal: React.FC<EditRecordModalProps> = ({
  record,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [question, setQuestion] = useState(record.question);
  const [answer, setAnswer] = useState(record.answer);
  const [visibility, setVisibility] = useState<Record['visibility']>(record.visibility);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const visibilityOptions: { id: Record['visibility']; label: string; description: string }[] = [
    { id: 'private', label: '나만 보기', description: '기록이 나에게만 공개됩니다.' },
    { id: 'mutual', label: '서로 공개', description: '서로 기록을 남긴 친구에게만 공개됩니다.' },
    { id: 'group', label: '그룹 공개', description: '내가 속한 그룹원들에게 공개됩니다.' },
    { id: 'public', label: '전체 공개', description: '누구나 내 기록을 볼 수 있습니다.' }
  ];

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) return;
    
    setIsSubmitting(true);
    try {
      await recordService.updateRecord(record.id, {
        question: question.trim(),
        answer: answer.trim(),
        visibility
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Failed to update record:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-[48px] p-10 shadow-mongle border border-brand-border animate-in zoom-in-95 duration-200">
        <div className="mb-10 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-black text-brand-primary mb-2 tracking-tight">기록 수정하기</h2>
            <p className="text-brand-secondary font-bold text-sm">소중한 기록의 내용을 다듬어보세요.</p>
          </div>
          <div className="px-3 py-1 bg-brand-warm rounded-full border border-brand-border">
            <span className="text-[10px] font-black text-brand-secondary tracking-widest uppercase">
              {record.question_type}
            </span>
          </div>
        </div>

        <div className="space-y-8 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
          {/* Question Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-brand-secondary uppercase tracking-widest ml-2">질문</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-5 rounded-[24px] border-2 border-brand-border bg-brand-warm/20 text-brand-primary font-bold focus:border-brand-primary outline-none transition-all"
              placeholder="질문을 입력하세요..."
            />
          </div>

          {/* Answer Input */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-brand-secondary uppercase tracking-widest ml-2">나의 답변</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full h-40 p-6 rounded-[32px] border-2 border-brand-border bg-brand-warm/20 text-brand-primary font-medium focus:border-brand-primary outline-none transition-all resize-none leading-relaxed"
              placeholder="당신의 이야기를 들려주세요..."
            />
          </div>

          {/* Visibility Selection */}
          <div className="space-y-4">
            <label className="text-[11px] font-black text-brand-secondary uppercase tracking-widest ml-2">공개 설정</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {visibilityOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setVisibility(option.id)}
                  className={`flex flex-col items-start p-4 rounded-[24px] border-2 transition-all duration-300 hover-mongle ${
                    visibility === option.id
                      ? 'border-brand-primary bg-white shadow-xl translate-y-[-2px]'
                      : 'border-transparent bg-brand-warm/40 hover:bg-white hover:border-brand-border'
                  }`}
                >
                  <span className="font-black text-brand-primary text-xs tracking-tight">{option.label}</span>
                  <span className="text-[10px] text-brand-secondary mt-1 leading-tight font-medium">{option.description}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex gap-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-4 rounded-full font-black text-sm bg-white border-2 border-brand-border text-brand-secondary hover:bg-brand-border transition-all disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting || !question.trim() || !answer.trim() || (question === record.question && answer === record.answer && visibility === record.visibility)}
            className="flex-[2] py-4 rounded-full font-black text-sm bg-brand-primary text-white shadow-xl hover-mongle disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSubmitting ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
};
