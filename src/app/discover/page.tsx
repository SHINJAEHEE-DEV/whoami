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
      
      <main className="max-w-4xl mx-auto py-16 px-6">
        <div className="space-y-16">
          <header className="text-center space-y-4">
            <h1 className="text-5xl font-black text-brand-primary tracking-tighter">친구 찾기</h1>
            <p className="text-lg font-bold text-brand-secondary">다른 사람들의 자서전을 찾아보세요.</p>
          </header>

          <section className="max-w-md mx-auto">
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="사용자 아이디 검색"
                className="w-full px-8 py-5 bg-white rounded-full border-2 border-brand-border focus:border-brand-primary outline-none text-brand-primary font-bold shadow-mongle transition-all placeholder:text-brand-secondary/40"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-2 top-2 px-8 py-3 bg-brand-primary text-white rounded-full font-black text-sm hover-mongle disabled:opacity-50 shadow-lg"
              >
                {isLoading ? '검색 중...' : '검색'}
              </button>
            </form>
          </section>

          <section className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : results.length > 0 ? (
              <div className="grid gap-6">
                {results.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex items-center justify-between p-5 bg-white rounded-3xl border border-brand-border shadow-mongle hover-mongle cursor-pointer"
                    onClick={() => router.push(`/profile/${profile.id}`)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-brand-warm rounded-full flex items-center justify-center border-2 border-brand-border overflow-hidden relative shadow-inner">
                        {profile.avatar_url ? (
                          <Image
                            src={profile.avatar_url}
                            alt={profile.username}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-black text-brand-secondary">
                            {profile.username[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-brand-primary">@{profile.username}</h3>
                        <p className="text-xs font-bold text-brand-secondary">프로필 보기</p>
                      </div>
                    </div>
                    <div className="text-brand-secondary pr-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            ) : hasSearched ? (
              <div className="text-center py-24 bg-white/50 backdrop-blur-sm rounded-[48px] border border-dashed border-brand-border shadow-inner">
                <p className="text-brand-secondary font-black text-lg">검색 결과가 없습니다. 🥺</p>
              </div>
            ) : null}
          </section>
        </div>
      </main>
    </div>
  );
}
