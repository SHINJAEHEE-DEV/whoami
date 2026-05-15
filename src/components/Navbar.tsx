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
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-600">
              whoami
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/discover" className="text-sm font-black text-brand-secondary hover:text-brand-primary transition-colors">
                  탐색
                </Link>
                <Link href="/groups" className="text-sm font-black text-brand-secondary hover:text-brand-primary transition-colors">
                  그룹
                </Link>
                <Link href="/profile" className="text-sm font-black text-brand-secondary hover:text-brand-primary transition-colors">
                  프로필
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-black text-brand-secondary hover:text-brand-primary transition-colors"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-gray-900">
                  로그인
                </Link>
                <Link href="/signup" className="text-blue-600 font-medium">
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
