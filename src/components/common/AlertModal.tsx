'use client';

import React from 'react';

interface AlertModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  type?: 'error' | 'success' | 'info';
}

export function AlertModal({ isOpen, title, message, onClose, type = 'error' }: AlertModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-[40px] p-10 shadow-mongle border border-brand-border animate-in zoom-in-95 duration-200">
        <div className="text-center space-y-5">
          <div className="flex justify-center">
            {type === 'error' ? (
              <span className="text-5xl">🚨</span>
            ) : type === 'success' ? (
              <span className="text-5xl">✨</span>
            ) : (
              <span className="text-5xl">💡</span>
            )}
          </div>
          <div>
            {title && <h3 className="text-2xl font-black text-brand-primary mb-2 tracking-tight">{title}</h3>}
            <p className="text-sm font-bold text-brand-secondary leading-relaxed whitespace-pre-wrap">{message}</p>
          </div>
        </div>
        <div className="mt-10">
          <button
            onClick={onClose}
            className="w-full py-4 bg-brand-primary text-white rounded-full font-black text-sm shadow-xl hover-mongle"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
