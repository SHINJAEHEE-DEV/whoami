import React from 'react';
import { Record } from '@/services/recordService';

export const ListViewer = ({ records, onEdit }: { records: Record[], onEdit?: (r: Record) => void }) => (
  <div className="w-full max-w-md mx-auto space-y-8 px-4 pb-20">
    {records.map((r) => (
      <div 
        key={r.id} 
        className="bg-white p-8 rounded-[40px] shadow-mongle border border-brand-border hover-mongle"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="px-3 py-1 bg-brand-warm rounded-full">
            <span className="text-[10px] font-black text-brand-secondary uppercase tracking-wider">{r.question_type}</span>
          </div>
          {onEdit && (
            <button onClick={() => onEdit(r)} className="px-3 py-1 text-[11px] font-black text-brand-accent hover:underline transition-all">수정</button>
          )}
        </div>
        <h3 className="text-xl font-black text-brand-primary mb-4 tracking-tight leading-tight">Q. {r.question}</h3>
        <p className="text-brand-primary font-medium leading-relaxed opacity-90 whitespace-pre-wrap">{r.answer}</p>
      </div>
    ))}
  </div>
);
