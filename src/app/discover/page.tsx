'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import { memberService, Profile } from '@/services/memberService';

export default function DiscoverPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const users = await memberService.searchProfileByUsername(searchQuery);
      setResults(users);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-warm pb-20">
      <Navbar />
      
      <main className="max-w-4xl mx-auto py-12 px-4">
        <div className="space-y-12">
          <header className="text-center space-y-4">
            <h1 className="text-4xl font-black text-brand-primary tracking-tight">친구 찾기</h1>
            <p className="text-brand-secondary font-bold">다른 사람들의 자서전을 찾아보세요.</p>
          </header>

          <section className="max-w-md mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="사용자 아이디 검색"
                className="w-full px-6 py-4 bg-white rounded-2xl border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-accent/50 text-brand-primary font-medium"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-2 top-2 px-6 py-2 bg-brand-primary text-white rounded-xl font-bold hover:scale-105 transition-transform disabled:opacity-50"
              >
                {isLoading ? '검색 중...' : '검색'}
              </button>
            </form>
          </section>

          <section className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
              </div>
            ) : results.length > 0 ? (
              <div className="grid gap-4">
                {results.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between p-6 bg-white rounded-3xl border border-brand-border hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-brand-warm rounded-full flex items-center justify-center border border-brand-border overflow-hidden relative">
                        {profile.avatar_url ? (
                          <Image
                            src={profile.avatar_url}
                            alt={profile.username}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-xl font-black text-brand-secondary">
                            {profile.username[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-brand-primary">@{profile.username}</h3>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/profile/${profile.id}`)}
                      className="px-6 py-2 bg-brand-warm text-brand-primary rounded-xl font-bold border border-brand-border hover:bg-brand-border transition-colors"
                    >
                      프로필 보기
                    </button>
                  </div>
                ))}
              </div>
            ) : hasSearched ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-brand-border">
                <p className="text-brand-secondary font-bold">검색 결과가 없습니다.</p>
              </div>
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
}
