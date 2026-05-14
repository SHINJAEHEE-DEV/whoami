'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WritingWizard } from '@/components/records/WritingWizard';
import { VisibilitySheet } from '@/components/records/VisibilitySheet';
import { recordService } from '@/services/recordService';

export default function NewRecordPage() {
  const router = useRouter();
  const [isVisibilityOpen, setIsVisibilityOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<{ question: string; answer: string; type: string } | null>(null);

  const handleWizardComplete = (question: string, answer: string, type: string) => {
    setCurrentRecord({ question, answer, type });
    setIsVisibilityOpen(true);
  };

  const handlePublish = async (visibility: any) => {
    if (!currentRecord) return;
    
    try {
      await recordService.createRecord(
        currentRecord.question,
        currentRecord.answer,
        visibility,
        currentRecord.type
      );
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Failed to publish record:', error);
      alert('저장에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <WritingWizard onComplete={handleWizardComplete} />
      
      {currentRecord && (
        <VisibilitySheet
          isOpen={isVisibilityOpen}
          onClose={() => setIsVisibilityOpen(false)}
          onPublish={handlePublish}
          summary={{ question: currentRecord.question, answer: currentRecord.answer }}
        />
      )}
    </div>
  );
}
