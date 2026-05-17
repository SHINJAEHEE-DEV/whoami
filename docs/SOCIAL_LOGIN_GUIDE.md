# 소셜 로그인 설정 가이드 (Google & Kakao)

구글과 카카오 소셜 로그인을 활성화하려면 각 플랫폼의 개발자 센터에서 설정을 완료하고, Supabase 대시보드에 키 값을 입력해야 합니다.

## 1. 구글 (Google) 설정
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 선택
3. **API 및 서비스 > OAuth 동의 화면**에서 앱 정보 설정
4. **API 및 서비스 > 사용자 인증 정보 > 사용자 인증 정보 만들기 > OAuth 클라이언트 ID** 선택
5. 애플리케이션 유형: `웹 애플리케이션`
6. **승인된 리디렉션 URI**에 다음 추가:
   - `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback` (클라우드 사용 시)
   - `http://127.0.0.1:54321/auth/v1/callback` (로컬 개발 시)
7. 생성된 `Client ID`와 `Client Secret`을 복사

## 2. 카카오 (Kakao) 설정
1. [카카오 개발자 센터](https://developers.kakao.com/) 접속
2. **내 애플리케이션 > 애플리케이션 추가하기**
3. **제품 설정 > 카카오 로그인**: `활성화 설정`을 `ON`으로 변경
4. **Redirect URI** 추가:
   - `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback` (클라우드 사용 시)
   - `http://127.0.0.1:54321/auth/v1/callback` (로컬 개발 시)
5. **제품 설정 > 카카오 로그인 > 동의항목**: `닉네임`, `카카오계정(이메일)` 필수 설정
6. **앱 설정 > 앱 키**에서 `REST API 키`를 복사 (이것이 Client ID가 됩니다)
7. **제품 설정 > 카카오 로그인 > 보안**: `Client Secret` 생성 및 활성화 후 복사

## 3. Supabase 대시보드 설정
1. [Supabase 대시보드](https://supabase.com/dashboard) 접속
2. **Authentication > Providers** 메뉴로 이동
3. **Google** 및 **Kakao** 항목을 찾아 활성화(`Enabled`)
4. 각 플랫폼에서 복사한 `Client ID`와 `Client Secret`을 입력
5. **Save** 버튼 클릭

## 4. 로컬 환경 테스트 시 주의사항
로컬에서 테스트하려면 `supabase/config.toml`의 `[auth]` 섹션에서 `site_url`과 `additional_redirect_urls`가 `http://127.0.0.1:3000`으로 설정되어 있어야 합니다. (현재 설정 완료됨)
