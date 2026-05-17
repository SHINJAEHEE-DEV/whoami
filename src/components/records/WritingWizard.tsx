import React, { useState } from 'react';
import { Question } from '@/services/questionService';
import { StageTransitionOverlay } from './StageTransitionOverlay';

export interface AnsweredQuestion {
  question: string;
  answer: string;
  type: string;
}

interface WritingWizardProps {
  questions: Question[];
  onComplete: (answers: AnsweredQuestion[]) => void;
  initialAnswers?: string[];
  onProgressUpdate?: (answers: string[]) => void;
}

const STAGE_MESSAGES: Record<number, string> = {
  1: "당신의 취향을 알아가는 즐거운 시간이었어요. 이제 일상 속의 당신은 어떤 모습인지 궁금해지네요.",
  2: "소소한 일상들이 모여 지금의 당신을 만들었군요. 이제 조금 더 깊은 곳, 당신의 뿌리를 찾아가 볼까요?",
  3: "소중한 기억들을 꺼내어 주셔서 감사해요. 그 경험들이 당신에게 어떤 단단한 가치관을 심어주었나요?",
  4: "당신의 내면이 참 아름답고 단단하네요. 마지막으로, 당신이 꿈꾸는 미래와 진솔한 고백을 들려주세요.",
  5: "드디어 마지막 단계까지 오셨네요! 당신의 진솔한 이야기들이 자서전의 마지막 페이지를 장식할 거예요."
};

export const WritingWizard: React.FC<WritingWizardProps> = ({ 
  questions, 
  onComplete,
  initialAnswers,
  onProgressUpdate
}) => {
  const [currentIndex, setCurrentIndex] = useState(() => {
    if (initialAnswers && questions && initialAnswers.length === questions.length) {
      const lastAnswered = initialAnswers.findLastIndex(a => a.trim() !== '');
      if (lastAnswered !== -1 && lastAnswered < questions.length - 1) {
        return lastAnswered + 1;
      } else if (lastAnswered === questions.length - 1) {
        return lastAnswered;
      }
    }
    return 0;
  });

  const [answers, setAnswers] = useState<string[]>(() => {
    if (initialAnswers && questions && initialAnswers.length === questions.length) {
      return initialAnswers;
    }
    return new Array(questions.length).fill('');
  });

  const [showTransition, setShowTransition] = useState(false);
  const [completedStage, setCompletedStage] = useState<number | null>(null);

  if (questions.length === 0 || (answers.length === 0 && !initialAnswers)) return null;

  // Final fallback for answers if initialization was skipped
  const currentAnswers = answers.length === questions.length ? answers : new Array(questions.length).fill('');
  
  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentAnswers[currentIndex] || '';
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleNext = () => {
    const nextIndex = currentIndex + 1;

    // 단계 전환 체크
    if (nextIndex < questions.length) {
      const nextQuestion = questions[nextIndex];
      if (nextQuestion.stage > currentQuestion.stage) {
        setCompletedStage(currentQuestion.stage);
        setShowTransition(true);
        return;
      }
      setCurrentIndex(nextIndex);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const updateAnswer = (val: string) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = val;
    setAnswers(newAnswers);
    onProgressUpdate?.(newAnswers);
  };

  const isCurrentAnswered = currentAnswer.trim().length > 0;
  const isAllAnswered = answers.every(a => a && a.trim().length > 0);

  return (
    <div className="flex flex-col h-svh max-w-md mx-auto bg-brand-warm relative">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-border z-50">
        <div 
          className="bg-brand-accent h-full transition-all duration-700 ease-out rounded-r-full shadow-[0_0_10px_rgba(255,179,71,0.5)]" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      {/* Header */}
      <header className="px-6 pt-6 pb-2 flex justify-between items-center">
        <h1 className="text-xl font-black tracking-tighter text-brand-primary">whoami</h1>
        <div className="flex flex-col items-end">
          <div className="px-2 py-0.5 bg-white rounded-full border border-brand-border shadow-sm mb-0.5">
            <span className="text-[9px] font-black text-brand-secondary tracking-widest uppercase">Stage {currentQuestion.stage}</span>
          </div>
          <span className="text-[10px] font-black text-brand-secondary/60">
            {currentIndex + 1} <span className="mx-0.5">/</span> {questions.length}
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-6 pt-4 pb-6 overflow-y-auto custom-scrollbar">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 text-[9px] font-black bg-white text-brand-accent rounded-full border-2 border-brand-accent/20 shadow-sm uppercase tracking-wider">
            {currentQuestion.stage === 1 ? '🍩 취향' : 
             currentQuestion.stage === 2 ? '🏠 일상' : 
             currentQuestion.stage === 3 ? '🌿 뿌리' : 
             currentQuestion.stage === 4 ? '💎 가치' : '✨ 미래'}
          </span>
        </div>

        <h2 className="text-2xl font-black leading-tight mb-6 tracking-tight text-brand-primary">
          {currentQuestion.question_text}
        </h2>

        <div className="w-full">
          {currentQuestion.type === 'choice' ? (
            <div className="grid grid-cols-1 gap-3">
              {(currentQuestion.options as string[])?.map((opt) => (
                <button
                  key={opt}
                  onClick={() => updateAnswer(opt)}
                  className={`w-full p-4 rounded-[24px] border-2 text-left transition-all duration-300 hover-mongle ${
                    currentAnswer === opt 
                      ? 'border-brand-primary bg-white shadow-lg translate-y-[-1px]' 
                      : 'border-brand-border bg-white/40 hover:bg-white'
                  }`}
                >
                  <span className="text-base font-black text-brand-primary">{opt}</span>
                </button>
              ))}
            </div>
          ) : (
            <textarea 
              value={currentAnswer}
              onChange={(e) => updateAnswer(e.target.value)}
              className="w-full h-[35vh] bg-white/10 border-none focus:ring-0 p-0 text-xl font-bold leading-relaxed placeholder:text-brand-secondary/30 outline-none resize-none text-brand-primary"
              placeholder="편하게 당신의 마음을 적어주세요..."
            />
          )}
        </div>
      </main>

      {/* Sticky Footer */}
      <footer className="p-6 pb-8 bg-brand-warm/80 backdrop-blur-sm border-t border-brand-border flex gap-3">
        <button 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`flex-1 py-4 rounded-[20px] font-black text-sm transition-all ${
            currentIndex === 0 ? 'bg-transparent text-transparent pointer-events-none' : 'bg-white border-2 border-brand-border text-brand-secondary hover:bg-brand-border'
          }`}
        >
          이전
        </button>
        <button 
          onClick={currentIndex === questions.length - 1 ? () => {
            const formattedAnswers = questions.map((q, i) => ({
              question: q.question_text,
              answer: answers[i],
              type: q.type
            }));
            onComplete(formattedAnswers);
          } : handleNext}
          disabled={currentIndex === questions.length - 1 ? !isAllAnswered : !isCurrentAnswered}
          className={`flex-[2.5] py-4 rounded-full font-black text-sm shadow-lg transition-all hover-mongle ${
            (currentIndex === questions.length - 1 ? isAllAnswered : isCurrentAnswered)
              ? 'bg-brand-primary text-white' 
              : 'bg-brand-border text-brand-secondary/40 cursor-not-allowed'
          }`}
        >
          {currentIndex === questions.length - 1 ? '✨ 작성 완료' : '다음 이야기'}
        </button>
      </footer>

      {showTransition && completedStage !== null && (
        <StageTransitionOverlay 
          stage={completedStage}
          message={STAGE_MESSAGES[completedStage] || "잘하고 계세요! 다음 단계로 넘어가 볼까요?"}
          onNext={() => {
            setShowTransition(false);
            setCurrentIndex(currentIndex + 1);
          }}
        />
      )}
    </div>
  );
};

