import React, { useEffect, useState } from 'react';

interface StageTransitionOverlayProps {
  stage: number;
  message: string;
  onNext: () => void;
}

export const StageTransitionOverlay: React.FC<StageTransitionOverlayProps> = ({ stage, message, onNext }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setIsVisible(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={`fixed inset-0 z-[110] bg-brand-warm flex items-center justify-center transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="max-w-md w-full px-8 text-center flex flex-col items-center gap-10">
        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-1000">
          <span className="px-4 py-1 bg-brand-accent/20 text-brand-accent text-xs font-black rounded-full tracking-widest uppercase">
            Stage {stage} Complete
          </span>
          <div className="text-4xl">✨</div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-brand-primary leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
          {message}
        </h2>

        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onNext, 700);
          }}
          className="mt-4 px-10 py-5 bg-brand-primary text-white rounded-2xl font-bold text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-700 fill-mode-both"
        >
          다음 단계로 가기
        </button>
      </div>
    </div>
  );
};
