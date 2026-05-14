'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Record, recordService } from '@/services/recordService';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // 세션 체크 및 리다이렉트 로직
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (!session) {
        router.push('/login');
      } else {
        await fetchFeed();
      }
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session) {
        fetchFeed();
      } else {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const fetchFeed = async () => {
    try {
      const data = await recordService.getHomeFeed();
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch feed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 사용자가 없으면 아무것도 렌더링하지 않음 (리다이렉트 중)
  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <header className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">홈 피드</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              글쓰기
            </button>
          </header>

          {records.length > 0 ? (
            <div className="grid gap-6">
              {records.map((record) => (
                <article key={record.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                      {record.profiles?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{record.profiles?.username || '알 수 없는 사용자'}</p>
                      <p className="text-xs text-gray-500">{new Date(record.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="ml-auto">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${
                        record.visibility === 'public' ? 'bg-green-100 text-green-700' :
                        record.visibility === 'mutual' ? 'bg-purple-100 text-purple-700' :
                        record.visibility === 'group' ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {record.visibility}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Q. {record.question}</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{record.answer}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">표시할 기록이 없습니다. 먼저 글을 작성하거나 지인을 팔로우해 보세요!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
