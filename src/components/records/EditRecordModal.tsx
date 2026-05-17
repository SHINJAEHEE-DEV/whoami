import React, { useEffect, useState } from 'react';
import { Record, recordService } from '@/services/recordService';
import { questionService, Question } from '@/services/questionService';
import { groupService, Group } from '@/services/groupService';
import { X, Users, Check } from 'lucide-react';

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
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [questionOptions, setQuestionOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const init = async () => {
        setIsLoading(true);
        try {
          // 1. Fetch groups
          const groups = await groupService.getGroups();
          setUserGroups(groups);

          // 2. Fetch record group access if visibility is group
          if (record.visibility === 'group') {
            const access = await recordService.getRecordGroupAccess(record.id);
            setSelectedGroupIds(access);
          }

          // 3. Fetch question options if type is choice
          if (record.question_type === 'choice' && record.question_id) {
            const questions = await questionService.getQuestions();
            const q = questions.find(q => q.id === record.question_id);
            if (q && q.options) {
              setQuestionOptions(q.options);
            }
          }
        } catch (error) {
          console.error('Failed to initialize edit modal:', error);
        } finally {
          setIsLoading(false);
        }
      };
      init();
    }
  }, [isOpen, record]);

  if (!isOpen) return null;

  const visibilityOptions: { id: Record['visibility']; label: string; description: string }[] = [
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

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) return;
    if (visibility === 'group' && selectedGroupIds.length === 0) {
      alert('공개할 그룹을 하나 이상 선택해주세요.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await recordService.updateRecord(record.id, {
        question: question.trim(),
        answer: answer.trim(),
        visibility,
        groupIds: visibility === 'group' ? selectedGroupIds : []
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
      <div className="relative w-full max-w-lg bg-white rounded-[48px] p-10 shadow-mongle border border-brand-border animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="mb-8 flex justify-between items-start flex-shrink-0">
          <div>
            <h2 className="text-3xl font-black text-brand-primary mb-2 tracking-tight">기록 수정하기</h2>
            <p className="text-brand-secondary font-bold text-sm">소중한 기록의 내용을 다듬어보세요.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-brand-warm rounded-full transition-colors">
            <X size={24} className="text-brand-secondary" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
          </div>
        ) : (
          <div className="space-y-8 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
            {/* Question Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between ml-2">
                <label className="text-[11px] font-black text-brand-secondary uppercase tracking-widest">질문</label>
                <span className="text-[10px] font-black text-brand-secondary/60 tracking-widest uppercase bg-brand-warm px-2 py-0.5 rounded-full border border-brand-border/50">
                  {record.question_type}
                </span>
              </div>
              <div className="w-full p-5 rounded-[24px] border-2 border-brand-border bg-brand-warm/10 text-brand-primary font-bold">
                {record.question}
              </div>
            </div>

            {/* Answer Input */}
            <div className="space-y-3">
              <label className="text-[11px] font-black text-brand-secondary uppercase tracking-widest ml-2">나의 답변</label>
              {record.question_type === 'choice' && questionOptions.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {questionOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => setAnswer(option)}
                      className={`py-6 rounded-[32px] border-2 font-black transition-all duration-300 ${
                        answer === option
                          ? 'bg-brand-primary border-brand-primary text-white shadow-lg scale-[1.02]'
                          : 'bg-white border-brand-border text-brand-secondary hover:border-brand-primary hover:text-brand-primary'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              ) : (
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full h-40 p-6 rounded-[32px] border-2 border-brand-border bg-brand-warm/20 text-brand-primary font-medium focus:border-brand-primary outline-none transition-all resize-none leading-relaxed"
                  placeholder="당신의 이야기를 들려주세요..."
                />
              )}
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

            {/* Group Selection (Conditional) */}
            {visibility === 'group' && (
              <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center space-x-2 ml-2">
                  <Users size={14} className="text-brand-primary" />
                  <label className="text-[11px] font-black text-brand-primary uppercase tracking-widest">공개할 그룹 선택</label>
                </div>
                {userGroups.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {userGroups.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => handleGroupToggle(group.id)}
                        className={`px-5 py-2.5 rounded-full text-xs font-black border-2 transition-all flex items-center space-x-2 ${
                          selectedGroupIds.includes(group.id)
                            ? 'bg-brand-primary border-brand-primary text-white shadow-md'
                            : 'bg-white border-brand-border text-brand-secondary hover:border-brand-primary hover:text-brand-primary'
                        }`}
                      >
                        {selectedGroupIds.includes(group.id) && <Check size={12} strokeWidth={4} />}
                        <span>{group.name}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-brand-warm/20 rounded-[24px] border border-dashed border-brand-border">
                    <p className="text-[11px] font-bold text-brand-secondary leading-relaxed">
                      아직 생성된 그룹이 없습니다.<br/>
                      그룹 관리에서 그룹을 먼저 만들어주세요.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="mt-8 flex gap-4 flex-shrink-0">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-4 rounded-full font-black text-sm bg-white border-2 border-brand-border text-brand-secondary hover:bg-brand-border transition-all disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting || !question.trim() || !answer.trim() || (
              question === record.question && 
              answer === record.answer && 
              visibility === record.visibility && 
              (visibility !== 'group' || JSON.stringify(selectedGroupIds.sort()) === JSON.stringify((record as any).groupIds?.sort() || []))
            )}
            className="flex-[2] py-4 rounded-full font-black text-sm bg-brand-primary text-white shadow-xl hover-mongle disabled:opacity-50 disabled:hover:scale-100"
          >
            {isSubmitting ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>
    </div>
  );
};
