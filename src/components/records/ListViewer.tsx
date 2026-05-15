import React from 'react';
import { Record } from '@/services/recordService';

export const ListViewer = ({ records, onEdit }: { records: Record[], onEdit: (r: Record) => void }) => (
  <div className="w-full max-w-md mx-auto space-y-6 px-4 pb-20">
    {records.map((r) => (
      <div key={r.id} className="bg-white p-6 rounded-[24px] shadow-sm border border-brand-border">
        <div className="flex justify-between items-start mb-4">
          <span className="text-[10px] font-black text-brand-secondary uppercase">{r.question_type}</span>
          <button onClick={() => onEdit(r)} className="text-xs font-bold text-brand-accent">수정</button>
        </div>
        <h3 className="text-lg font-black text-brand-primary mb-3">Q. {r.question}</h3>
        <p className="text-brand-primary leading-relaxed opacity-80 whitespace-pre-wrap">{r.answer}</p>
      </div>
    ))}
  </div>
);
