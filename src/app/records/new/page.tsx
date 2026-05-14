'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WritingWizard } from '@/components/records/WritingWizard';
import { VisibilitySheet } from '@/components/records/VisibilitySheet';
import { recordService } from '@/services/recordService';

export default function NewRecordPage() {
  const router = useRouter();
  const [isVisibilityOpen, setIsVisibilityOpen] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<any[]>([]);

  const handleWizardComplete = (answers: any[]) => {
    setAnsweredQuestions(answers);
    setIsVisibilityOpen(true);
  };

  const handlePublish = async (visibility: any) => {
    if (answeredQuestions.length === 0) return;
    
    try {
      await recordService.createRecords(
        answeredQuestions.map(q => ({
          question: q.question,
          answer: q.answer,
          visibility,
          question_type: q.type
        }))
      );
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Failed to publish records:', error);
      alert('저장에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <WritingWizard onComplete={handleWizardComplete} />
      
      {answeredQuestions.length > 0 && (
        <VisibilitySheet
          isOpen={isVisibilityOpen}
          onClose={() => setIsVisibilityOpen(false)}
          onPublish={handlePublish}
          summary={{ count: answeredQuestions.length }}
        />
      )}
    </div>
  );
}
