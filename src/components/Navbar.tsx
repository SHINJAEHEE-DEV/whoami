'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await authService.signOut();
    router.push('/login');
  };

  return (
    <nav className="sticky top-0 z-50 px-4 py-3">
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-[32px] border border-brand-border px-6 py-4 shadow-mongle">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-black text-brand-primary tracking-tighter hover:scale-105 transition-transform">
              whoami
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link href="/discover" className="text-[13px] font-black text-brand-secondary hover:text-brand-primary transition-all">
                  탐색
                </Link>
                <Link href="/groups" className="text-[13px] font-black text-brand-secondary hover:text-brand-primary transition-all">
                  그룹
                </Link>
                <Link href="/profile" className="text-[13px] font-black text-brand-secondary hover:text-brand-primary transition-all">
                  프로필
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-[13px] font-black text-brand-accent hover:text-brand-primary transition-all"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-[13px] font-black text-brand-secondary hover:text-brand-primary transition-all">
                  로그인
                </Link>
                <Link href="/signup" className="px-5 py-2.5 bg-brand-primary text-white text-[13px] font-black rounded-full shadow-lg hover-mongle">
                  시작하기
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
