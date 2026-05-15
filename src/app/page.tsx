'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Record, recordService } from '@/services/recordService';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { BookViewer } from '@/components/records/BookViewer';
import { ListViewer } from '@/components/records/ListViewer';
import { EditRecordModal } from '@/components/records/EditRecordModal';

export default function Home() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<'book' | 'list'>('book');
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();

  const fetchMyRecords = useCallback(async () => {
    try {
      const data = await recordService.getMyRecords();
      setRecords(data);
      if (data.length === 0) {
        router.push('/records/new');
      }
    } catch (error) {
      console.error('Failed to fetch records:', error);
    }
  }, [router]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (!session) {
        router.push('/login');
      } else {
        await fetchMyRecords();
      }
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session) {
        fetchMyRecords();
      } else {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, fetchMyRecords]);

  const handleEdit = (record: Record) => {
    setSelectedRecord(record);
    setIsEditModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-warm">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-brand-warm pb-20">
      <Navbar />
      
      <main className="max-w-4xl mx-auto py-12 px-4">
        <div className="space-y-12">
          <header className="text-center space-y-4">
            <h1 className="text-4xl font-black text-brand-primary tracking-tight">나의 자서전</h1>
            <p className="text-brand-secondary font-bold">지금까지 기록된 나의 이야기들입니다.</p>
          </header>

          {/* View Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white p-1 rounded-2xl border border-brand-border flex shadow-sm">
              <button 
                onClick={() => setViewMode('book')}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'book' ? 'bg-brand-primary text-white' : 'text-brand-secondary'}`}
              >
                📖 책으로 보기
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${viewMode === 'list' ? 'bg-brand-primary text-white' : 'text-brand-secondary'}`}
              >
                📜 목록으로 보기
              </button>
            </div>
          </div>

          <div className="mt-8">
            {records.length > 0 ? (
              viewMode === 'book' ? (
                <BookViewer records={records} onEdit={handleEdit} />
              ) : (
                <ListViewer records={records} onEdit={handleEdit} />
              )
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-brand-border">
                <p className="text-brand-secondary font-bold">표시할 기록이 없습니다.</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-center mt-12">
            <button 
              onClick={() => router.push('/records/new')}
              className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-black shadow-lg hover:scale-105 transition-transform"
            >
              새로운 기록 남기기
            </button>
          </div>
        </div>
      </main>

      {selectedRecord && (
        <EditRecordModal
          key={selectedRecord.id}
          record={selectedRecord}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRecord(null);
          }}
          onUpdate={fetchMyRecords}
        />
      )}
    </div>
  );
}
