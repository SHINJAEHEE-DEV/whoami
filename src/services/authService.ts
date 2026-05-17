import { supabase } from '@/lib/supabase';
import { memberService } from './memberService';

export const authService = {
  /**
   * 이메일/비밀번호로 회원가입을 시도합니다.
   * 닉네임 중복을 먼저 체크합니다.
   */
  async signUp(email: string, password: string, username: string) {
    // 닉네임 중복 체크
    const isAvailable = await memberService.isUsernameAvailable(username);
    if (!isAvailable) {
      throw new Error('이미 사용 중인 아이디입니다.');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * 이메일/비밀번호로 로그인을 시도합니다.
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * 소셜 로그인을 시도합니다 (구글, 카카오 등)
   */
  async signInWithOAuth(provider: 'google' | 'kakao') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * 로그아웃합니다.
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};
