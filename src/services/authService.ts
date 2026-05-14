import { supabase } from '@/lib/supabase';

export const authService = {
  /**
   * 이메일/비밀번호로 회원가입을 시도합니다.
   * DB 트리거에 의해 profiles 테이블에 자동으로 레코드가 생성됩니다.
   */
  async signUp(email: string, password: string, username: string) {
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
   * 로그아웃합니다.
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};
