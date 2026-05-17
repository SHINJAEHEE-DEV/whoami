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
import { ViewToggle } from '@/components/common/ViewToggle';

export default function Home() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [viewMode, setViewMode] = useState<'book' | 'list'>('book');
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const router = useRouter();

  const fetchHomeFeed = useCallback(async () => {
    try {
      const data = await recordService.getHomeFeed();
      setRecords(data);
      
      // 내 기록이 하나도 없는지 별도로 체크 (온보딩 리다이렉트용)
      const hasMyRecords = await recordService.hasRecords();
      if (!hasMyRecords) {
        router.push('/records/new');
      }
    } catch (error) {
      console.error('Failed to fetch home feed:', error);
    }
  }, [router]);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (!session) {
        router.push('/login');
      } else {
        await fetchHomeFeed();
      }
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session) {
        fetchHomeFeed();
      } else {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, fetchHomeFeed]);

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
    <div className="min-h-screen bg-brand-warm pb-10">
      <Navbar />
      
      <main className="max-w-4xl mx-auto py-8 px-6">
        <div className="space-y-10">
          <header className="text-center space-y-2">
            <h1 className="text-4xl font-black text-brand-primary tracking-tighter">나의 이야기</h1>
            <p className="text-base font-bold text-brand-secondary">한 페이지씩 채워가는 나만의 디지털 자서전</p>
          </header>

          {/* View Toggle */}
          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

          <div className="mt-6">
            {records.length > 0 ? (
              viewMode === 'book' ? (
                <BookViewer records={records} onEdit={handleEdit} />
              ) : (
                <ListViewer records={records} onEdit={handleEdit} />
              )
            ) : (
              <div className="text-center py-12 bg-white rounded-3xl border border-brand-border">
                <p className="text-brand-secondary font-bold">표시할 기록이 없습니다.</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-center mt-10">
            <button 
              onClick={() => router.push('/records/new')}
              className="px-8 py-4 bg-brand-primary text-white rounded-full font-black text-base shadow-lg hover-mongle"
            >
              ✨ 새로운 기록 남기기
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
          onUpdate={fetchHomeFeed}
        />
      )}
    </div>
  );
}
