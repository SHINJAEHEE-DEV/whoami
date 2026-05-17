'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { AlertModal } from '@/components/common/AlertModal';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, title?: string, message: string, type?: 'error' | 'success'}>({ isOpen: false, message: '' });
  const router = useRouter();

  const getKoreanError = (err: { message: string } | null | undefined) => {
    const msg = err?.message || '';
    if (msg.includes('Invalid login credentials')) return '이메일 또는 비밀번호가 올바르지 않습니다.';
    if (msg.includes('Email not confirmed')) return '이메일 인증이 필요합니다.';
    return '로그인 중 오류가 발생했습니다. 다시 시도해주세요.';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.signIn(email, password);
      router.push('/');
      router.refresh();
    } catch (err: unknown) {
      setError(getKoreanError(err as any));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    try {
      await authService.signInWithOAuth(provider);
    } catch (err: unknown) {
      console.error(`${provider} login error:`, err);
      setModalConfig({
        isOpen: true,
        title: '로그인 실패',
        message: '소셜 로그인 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.',
        type: 'error'
      });
    }
  };

  return (
    <div className="min-h-screen bg-brand-warm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-[40px] p-10 border border-brand-border shadow-mongle">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-black text-brand-primary tracking-tighter mb-1">whoami</h1>
          <p className="text-xs font-bold text-brand-secondary">내면을 기록할 준비가 되셨나요?</p>
        </header>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-brand-secondary uppercase tracking-widest ml-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-5 py-3.5 rounded-[20px] border-2 outline-none font-bold transition-all text-sm placeholder:text-brand-secondary/40 ${
                  error ? 'border-red-400 bg-red-50/10' : 'border-brand-border focus:border-brand-primary bg-brand-warm/30'
                }`}
                placeholder="이메일 주소"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-brand-secondary uppercase tracking-widest ml-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-5 py-3.5 rounded-[20px] border-2 outline-none font-bold transition-all text-sm placeholder:text-brand-secondary/40 ${
                  error ? 'border-red-400 bg-red-50/10' : 'border-brand-border focus:border-brand-primary bg-brand-warm/30'
                }`}
                placeholder="비밀번호"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center justify-center space-x-1.5 pt-1">
              <span className="text-[11px]">❗️</span>
              <p className="text-red-500 text-[11px] font-black tracking-tight">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-primary text-white rounded-full font-black text-base shadow-lg hover-mongle disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-border"></div>
          </div>
          <div className="relative flex justify-center text-[9px] font-black">
            <span className="px-3 bg-white text-brand-secondary uppercase tracking-widest">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleSocialLogin('kakao')}
            className="flex items-center justify-center py-3.5 bg-[#FEE500] text-[#3c1e1e] rounded-[20px] font-black text-xs shadow-sm hover-mongle"
          >
            <span className="mr-1.5">🟡</span> 카카오
          </button>
          <button
            onClick={() => handleSocialLogin('google')}
            className="flex items-center justify-center py-3.5 bg-white text-brand-primary border-2 border-brand-border rounded-[20px] font-black text-xs shadow-sm hover-mongle"
          >
            <span className="mr-1.5">⚪️</span> 구글
          </button>
        </div>

        <footer className="mt-8 text-center">
          <p className="text-xs font-bold text-brand-secondary">
            처음이신가요?{' '}
            <Link href="/signup" className="text-brand-accent hover:underline ml-1">
              회원가입하기
            </Link>
          </p>
        </footer>
      </div>

      <AlertModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
      />
    </div>
  );
}
