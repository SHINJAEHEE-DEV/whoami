import React from 'react';

type ViewMode = 'book' | 'list';

interface ViewToggleProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const ViewToggle = ({ viewMode, setViewMode }: ViewToggleProps) => {
  return (
    <div className="flex justify-center my-8">
      <div className="bg-white/50 backdrop-blur-sm p-1 rounded-full border border-brand-border flex shadow-mongle">
        <button 
          onClick={() => setViewMode('book')}
          className={`px-6 py-2 rounded-full text-[12px] font-black transition-all ${viewMode === 'book' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-secondary hover:text-brand-primary'}`}
        >
          📖 책으로 보기
        </button>
        <button 
          onClick={() => setViewMode('list')}
          className={`px-6 py-2 rounded-full text-[12px] font-black transition-all ${viewMode === 'list' ? 'bg-brand-primary text-white shadow-md' : 'text-brand-secondary hover:text-brand-primary'}`}
        >
          📜 목록으로 보기
        </button>
      </div>
    </div>
  );
};
