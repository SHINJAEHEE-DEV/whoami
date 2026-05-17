import React, { useState } from 'react';
import { Record } from '@/services/recordService';

export const BookViewer = ({ records, onEdit }: { records: Record[], onEdit?: (r: Record) => void }) => {
  const [page, setPage] = useState(0);
  const current = records[page];

  if (!current) return <div className="text-center p-20 text-brand-secondary">기록이 없습니다.</div>;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto px-4">
      <div className="relative w-full aspect-[3/4] sm:aspect-[4/3] bg-white rounded-3xl shadow-xl border border-brand-border flex flex-col sm:flex-row overflow-hidden">
        {/* Left Page (Question) */}
        <div className="flex-1 p-8 sm:p-12 border-b sm:border-b-0 sm:border-r border-brand-border bg-[#FAFAFA] flex flex-col justify-center">
          <span className="text-xs font-black text-brand-secondary mb-4 uppercase tracking-widest">{current.question_type}</span>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-primary leading-tight">
            {current.question}
          </h2>
        </div>
        {/* Right Page (Answer) */}
        <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center relative">
          <p className="text-lg sm:text-xl font-medium text-brand-primary leading-relaxed italic whitespace-pre-wrap">
            &quot;{current.answer}&quot;
          </p>
          {onEdit && (
            <button 
              onClick={() => onEdit(current)}
              className="absolute bottom-6 right-6 p-3 bg-brand-warm rounded-full hover:bg-gray-100 transition-colors"
            >
              ✏️
            </button>
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex items-center gap-6">
        <button 
          onClick={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
          className="w-12 h-12 rounded-full border border-brand-border flex items-center justify-center disabled:opacity-30"
        >
          ←
        </button>
        <span className="font-bold text-brand-secondary">{page + 1} / {records.length}</span>
        <button 
          onClick={() => setPage(p => Math.min(records.length - 1, p + 1))}
          disabled={page === records.length - 1}
          className="w-12 h-12 rounded-full border border-brand-border flex items-center justify-center disabled:opacity-30"
        >
          →
        </button>
      </div>
    </div>
  );
};
