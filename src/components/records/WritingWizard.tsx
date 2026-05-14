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
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-1.5 rounded-full mb-6 overflow-hidden">
        <div 
          className="bg-black h-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between items-center mb-4">
        <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">
          [{currentQuestion.category}]
        </span>
        <span className="text-xs text-gray-400 font-medium">
          {currentIndex + 1} / {QUESTIONS.length}
        </span>
      </div>
      
      <h2 className="text-xl font-bold mb-8 text-gray-900">{currentQuestion.text}</h2>
      
      {currentQuestion.type === 'choice' ? (
        <div className="grid grid-cols-2 gap-4 mb-8">
          {currentQuestion.options?.map((opt) => (
            <button
              key={opt}
              onClick={() => updateAnswer(opt)}
              className={`p-4 rounded-xl border-2 transition-all ${
                currentAnswer === opt 
                  ? 'border-black bg-black text-white' 
                  : 'border-gray-100 hover:border-gray-200 bg-gray-50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      ) : (
        <textarea
          value={currentAnswer}
          onChange={(e) => updateAnswer(e.target.value)}
          placeholder="당신의 이야기를 들려주세요..."
          className="w-full h-40 p-4 mb-8 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-black focus:outline-none resize-none transition-all"
        />
      )}
      
      <div className="flex justify-between items-center mt-8">
        <button 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`text-sm font-medium ${currentIndex === 0 ? 'text-gray-200 cursor-not-allowed' : 'text-gray-400 hover:text-gray-600'}`}
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
            className={`px-8 py-3 rounded-full font-bold transition-all ${
              isAllAnswered ? 'bg-black text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            작성 완료
          </button>
        ) : (
          <button
            disabled={!isCurrentAnswered}
            onClick={handleNext}
            className={`px-8 py-3 rounded-full font-bold transition-all ${
              isCurrentAnswered ? 'bg-black text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            다음
          </button>
        )}
      </div>
    </div>
  );
};
