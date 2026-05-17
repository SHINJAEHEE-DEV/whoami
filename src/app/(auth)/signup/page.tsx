'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { memberService } from '@/services/memberService';
import { AlertModal } from '@/components/common/AlertModal';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, title?: string, message: string, type?: 'error' | 'success'}>({ isOpen: false, message: '' });
  const router = useRouter();

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsername(val);
    // 값이 바뀌면 다시 체크해야 함
    if (usernameStatus !== 'idle') {
      setUsernameStatus('idle');
    }
  };

  const checkUsernameAvailability = async () => {
    if (!username.trim() || username.length < 2) {
      setError('아이디를 2자 이상 입력해주세요.');
      return;
    }

    setUsernameStatus('checking');
    setError(null);
    try {
      const isAvailable = await memberService.isUsernameAvailable(username);
      setUsernameStatus(isAvailable ? 'available' : 'taken');
      if (!isAvailable) {
        setError('이미 사용 중인 아이디입니다.');
      }
    } catch (e) {
      console.error(e);
      setUsernameStatus('idle');
      setError('중복 체크 중 오류가 발생했습니다.');
    }
  };

  const getKoreanError = (err: { message: string } | null | undefined) => {
    const msg = err?.message || '';
    if (msg.includes('User already registered')) return '이미 가입된 이메일입니다.';
    if (msg.includes('Password should be at least')) return '비밀번호는 최소 6자 이상이어야 합니다.';
    if (msg.includes('already in use')) return '이미 사용 중인 정보가 있습니다.';
    return '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.';
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (usernameStatus !== 'available') {
      setError('아이디 중복 확인이 필요합니다.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authService.signUp(email, password, username);
      setModalConfig({
        isOpen: true,
        title: '가입 완료!',
        message: '회원가입이 성공적으로 완료되었습니다.\n지금 바로 로그인해보세요.',
        type: 'success'
      });
    } catch (err: unknown) {
      setError(getKoreanError(err instanceof Error ? err : { message: String(err) }));
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
        <header className="text-center mb-6">
          <h1 className="text-3xl font-black text-brand-primary tracking-tighter mb-1">whoami</h1>
          <p className="text-xs font-bold text-brand-secondary">진솔한 나를 기록하는 여정의 시작</p>
        </header>

        <form className="space-y-4" onSubmit={handleSignup}>
          <div className="space-y-3">
            {/* Username Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-brand-secondary uppercase tracking-widest ml-2">Username</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={handleUsernameChange}
                    className={`w-full px-5 py-3.5 rounded-[20px] border-2 outline-none font-bold transition-all text-sm ${
                      usernameStatus === 'available' ? 'border-green-400 bg-green-50/10' : 
                      usernameStatus === 'taken' ? 'border-red-400 bg-red-50/10' : 
                      'border-brand-border focus:border-brand-primary bg-brand-warm/30'
                    }`}
                    placeholder="아이디 (영문, 숫자, _)"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {usernameStatus === 'checking' && <div className="w-3 h-3 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />}
                    {usernameStatus === 'available' && <span className="text-green-500 text-xs font-bold">✓</span>}
                    {usernameStatus === 'taken' && <span className="text-red-500 text-xs font-bold">✕</span>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={checkUsernameAvailability}
                  disabled={usernameStatus === 'checking' || !username.trim()}
                  className="px-4 py-3 bg-brand-warm border-2 border-brand-border text-brand-primary rounded-[20px] font-black text-[10px] hover:bg-brand-border transition-all disabled:opacity-50"
                >
                  중복 확인
                </button>
              </div>
              {usernameStatus === 'available' && <p className="text-[9px] font-bold text-green-500 ml-2">사용 가능한 아이디입니다.</p>}
              {usernameStatus === 'taken' && <p className="text-[9px] font-bold text-red-500 ml-2">이미 사용 중인 아이디입니다.</p>}
            </div>

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-brand-secondary uppercase tracking-widest ml-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-5 py-3.5 rounded-[20px] border-2 outline-none font-bold transition-all text-sm placeholder:text-brand-secondary/50 ${
                  error?.includes('이메일') ? 'border-red-400 bg-red-50/10' : 'border-brand-border focus:border-brand-primary bg-brand-warm/30'
                }`}
                placeholder="이메일 주소"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-brand-secondary uppercase tracking-widest ml-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-5 py-3.5 rounded-[20px] border-2 outline-none font-bold transition-all text-sm placeholder:text-brand-secondary/50 ${
                  error?.includes('비밀번호') ? 'border-red-400 bg-red-50/10' : 'border-brand-border focus:border-brand-primary bg-brand-warm/30'
                }`}
                placeholder="비밀번호"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center justify-center space-x-1.5 pt-1">
              <span className="text-[11px]">❗️</span>
              <p className="text-red-500 text-[11px] font-black tracking-tight text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || usernameStatus !== 'available'}
            className="w-full py-4 bg-brand-primary text-white rounded-full font-black text-base shadow-lg hover-mongle disabled:opacity-50 disabled:hover:scale-100"
          >
            {loading ? '가입 중...' : '시작하기'}
          </button>
        </form>

        <div className="relative my-6">
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
            className="flex items-center justify-center py-3 bg-[#FEE500] text-[#3c1e1e] rounded-[20px] font-black text-xs shadow-sm hover-mongle"
          >
            <span className="mr-1.5">🟡</span> 카카오
          </button>
          <button
            onClick={() => handleSocialLogin('google')}
            className="flex items-center justify-center py-3 bg-white text-brand-primary border-2 border-brand-border rounded-[20px] font-black text-xs shadow-sm hover-mongle"
          >
            <span className="mr-1.5">⚪️</span> 구글
          </button>
        </div>

        <footer className="mt-8 text-center">
          <p className="text-xs font-bold text-brand-secondary">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-brand-accent hover:underline ml-1">
              로그인하기
            </Link>
          </p>
        </footer>
      </div>

      <AlertModal 
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onClose={() => {
          setModalConfig({ ...modalConfig, isOpen: false });
          if (modalConfig.type === 'success') {
            router.push('/login');
          }
        }}
      />
    </div>
  );
}
