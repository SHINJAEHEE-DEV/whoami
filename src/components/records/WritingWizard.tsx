import React, { useState } from 'react';
import { QUESTIONS } from '@/constants/questions';

interface AnsweredQuestion {
  question: string;
  answer: string;
  type: string;
}

interface WritingWizardProps {
  onComplete: (answers: AnsweredQuestion[]) => void;
}

export const WritingWizard: React.FC<WritingWizardProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(QUESTIONS.length).fill(''));
  
  const currentQuestion = QUESTIONS[currentIndex];
  const currentAnswer = answers[currentIndex];
  const progress = ((currentIndex + 1) / QUESTIONS.length) * 100;

  const handleNext = () => {
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
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
  };

  const isCurrentAnswered = currentAnswer.trim().length > 0;
  const isAllAnswered = answers.every(a => a.trim().length > 0);

  return (
    <div className="max-w-lg mx-auto p-4 sm:p-6">
      {/* Header & Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold tracking-tight">whoami</h1>
          <span className="text-sm font-medium text-gray-400">
            {currentIndex + 1} / {QUESTIONS.length}
          </span>
        </div>
        <div className="w-full bg-[#F0EBE1] h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-[#FFB347] h-full transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Question Card */}
      <div className="bg-white rounded-[24px] border border-[#F5F3EF] shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-8 sm:p-10 mb-6">
        <div className="text-center mb-8">
          <span className="inline-block px-4 py-1.5 text-xs font-bold bg-[#FFF5E6] text-[#E68A00] rounded-full mb-4">
            {currentQuestion.category === '취향' ? '🍩' : 
             currentQuestion.category === '컴플렉스' ? '✨' : 
             currentQuestion.category === '가치관' ? '💎' : '📝'} {currentQuestion.category}
          </span>
          <h2 className="text-2xl font-bold leading-tight tracking-tight text-[#1C1C1C]">
            {currentQuestion.text}
          </h2>
        </div>

        {/* Input Section */}
        {currentQuestion.type === 'choice' ? (
          <div className="grid grid-cols-2 gap-4">
            {currentQuestion.options?.map((opt) => (
              <button
                key={opt}
                onClick={() => updateAnswer(opt)}
                className={`flex flex-col items-center justify-center p-8 rounded-[20px] border-2 transition-all duration-200 ${
                  currentAnswer === opt 
                    ? 'border-[#1C1C1C] bg-white shadow-[0_4px_12px_rgba(0,0,0,0.04)]' 
                    : 'border-transparent bg-[#FAFAFA] hover:bg-[#F5F3EF]'
                }`}
              >
                <span className="text-lg font-bold">{opt}</span>
              </button>
            ))}
          </div>
        ) : (
          <textarea
            value={currentAnswer}
            onChange={(e) => updateAnswer(e.target.value)}
            placeholder="편하게 당신의 마음을 적어주세요..."
            className="w-full h-48 p-5 bg-[#FAFAFA] rounded-[16px] border-none focus:bg-white focus:ring-1 focus:ring-[#E0DCD3] outline-none resize-none text-lg leading-relaxed transition-all"
          />
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center px-2">
        <button 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`px-6 py-3 rounded-full font-bold text-sm transition-all ${
            currentIndex === 0 
              ? 'text-gray-200 cursor-not-allowed' 
              : 'bg-[#F5F3EF] text-[#666666] hover:bg-[#EBE7DF]'
          }`}
        >
          이전
        </button>
        
        {currentIndex === QUESTIONS.length - 1 ? (
          <button
            disabled={!isAllAnswered}
            onClick={() => {
              const formattedAnswers = QUESTIONS.map((q, i) => ({
                question: q.text,
                answer: answers[i],
                type: q.type
              }));
              onComplete(formattedAnswers);
            }}
            className={`px-10 py-3 rounded-full font-bold text-sm shadow-lg transition-all ${
              isAllAnswered ? 'bg-[#1C1C1C] text-white hover:scale-105 active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            작성 완료
          </button>
        ) : (
          <button
            disabled={!isCurrentAnswered}
            onClick={handleNext}
            className={`px-10 py-3 rounded-full font-bold text-sm shadow-lg transition-all ${
              isCurrentAnswered ? 'bg-[#1C1C1C] text-white hover:scale-105 active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            다음
          </button>
        )}
      </div>
    </div>
  );
};
