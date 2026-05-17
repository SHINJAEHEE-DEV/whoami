'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { WritingWizard, AnsweredQuestion } from '@/components/records/WritingWizard';
import { VisibilitySheet } from '@/components/records/VisibilitySheet';
import { recordService, Record } from '@/services/recordService';
import { questionService, Question } from '@/services/questionService';
import { AlertModal } from '@/components/common/AlertModal';

const STORAGE_KEY = 'whoami_onboarding_answers';

export default function NewRecordPage() {
  const router = useRouter();
  const [initialAnswers, setInitialAnswers] = useState<string[] | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Visibility Sheet State
  const [showVisibilitySheet, setShowVisibilitySheet] = useState(false);
  const [pendingAnswers, setPendingAnswers] = useState<AnsweredQuestion[] | null>(null);

  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, title?: string, message: string, type?: 'error' | 'success'}>({ isOpen: false, message: '' });

  // ... (init useEffect unchanged)
  useEffect(() => {
    const init = async () => {
      try {
        // 1. 기존 기록 확인 (중복 온보딩 방지)
        const hasRecords = await recordService.hasRecords();
        if (hasRecords) {
          router.replace('/');
          return;
        }

        // 2. 질문 목록 가져오기
        const questionsData = await questionService.getQuestions();
        
        // 배포 전까지 테스트를 위해 10개로 제한
        const limitedQuestions = questionsData.slice(0, 10);
        setQuestions(limitedQuestions);

        // 3. localStorage에서 이전 답변 불러오기
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            setInitialAnswers(JSON.parse(saved));
          } catch (e) {
            console.error('Failed to parse saved answers', e);
          }
        }
      } catch (e) {
        console.error('Initialization failed', e);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [router]);

  const handleProgressUpdate = useCallback((answers: string[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }, []);

  const handleWizardComplete = (answers: AnsweredQuestion[]) => {
    setPendingAnswers(answers);
    setShowVisibilitySheet(true);
  };

  const handleVisibilityPublish = async (visibility: string) => {
    if (!pendingAnswers || isSubmitting) return;
    
    setIsSubmitting(true);
    setShowVisibilitySheet(false);
    
    try {
      await recordService.createRecords(
        pendingAnswers.map(q => ({
          question: q.question,
          answer: q.answer,
          question_type: q.type
        })),
        visibility as Record['visibility']
      );
      
      // 성공 시 localStorage 비우기
      localStorage.removeItem(STORAGE_KEY);
      
      // 홈으로 이동 및 데이터 갱신
      router.replace('/');
      router.refresh();
    } catch (error) {
      const err = error as Error;
      console.error('Failed to save records:', err);
      setModalConfig({
        isOpen: true,
        title: '저장 실패',
        message: err.message || '저장에 실패했습니다. 다시 시도해주세요.',
        type: 'error'
      });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-svh bg-brand-warm flex items-center justify-center">
        <div className="animate-pulse font-bold text-brand-secondary">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-svh bg-brand-warm">
      <WritingWizard 
        questions={questions}
        onComplete={handleWizardComplete} 
        initialAnswers={initialAnswers || undefined}
        onProgressUpdate={handleProgressUpdate}
      />

      <VisibilitySheet 
        isOpen={showVisibilitySheet}
        onClose={() => setShowVisibilitySheet(false)}
        onPublish={handleVisibilityPublish}
        summary={{
          count: pendingAnswers?.length || 0
        }}
      />

      {isSubmitting && (
        <div className="fixed inset-0 z-[100] bg-black/20 flex items-center justify-center backdrop-blur-[2px]">
          <div className="bg-white px-8 py-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
            <p className="font-bold text-brand-primary">기록을 저장하고 있어요...</p>
          </div>
        </div>
      )}

      <AlertModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />
    </div>
  );
}

