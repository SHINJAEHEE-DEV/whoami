import React, { useState } from 'react';
import { Question, QUESTIONS } from '@/constants/questions';

interface WritingWizardProps {
  onComplete: (question: string, answer: string, type: string) => void;
}

export const WritingWizard: React.FC<WritingWizardProps> = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  
  const currentQuestion = QUESTIONS[currentIndex];

  const handleNextQuestion = () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * QUESTIONS.length);
    } while (nextIndex === currentIndex);
    setCurrentIndex(nextIndex);
    setAnswer('');
  };

  const isAnswered = answer.trim().length > 0;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="mb-4">
        <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">
          [{currentQuestion.category}]
        </span>
      </div>
      
      <h2 className="text-xl font-bold mb-8 text-gray-900">{currentQuestion.text}</h2>
      
      {currentQuestion.type === 'choice' ? (
        <div className="grid grid-cols-2 gap-4 mb-8">
          {currentQuestion.options?.map((opt) => (
            <button
              key={opt}
              onClick={() => setAnswer(opt)}
              className={`p-4 rounded-xl border-2 transition-all ${
                answer === opt 
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
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="당신의 이야기를 들려주세요..."
          className="w-full h-40 p-4 mb-8 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-black focus:outline-none resize-none transition-all"
        />
      )}
      
      <div className="flex justify-between items-center">
        <button 
          onClick={handleNextQuestion}
          className="text-gray-400 hover:text-gray-600 text-sm font-medium"
        >
          다른 질문 보기
        </button>
        <button
          disabled={!isAnswered}
          onClick={() => onComplete(currentQuestion.text, answer, currentQuestion.type)}
          className={`px-8 py-3 rounded-full font-bold transition-all ${
            isAnswered ? 'bg-black text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          작성 완료
        </button>
      </div>
    </div>
  );
};
