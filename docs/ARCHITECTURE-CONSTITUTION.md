# ARCHITECTURE CONSTITUTION

- **Security First**: 모든 데이터 접근은 Supabase RLS(Row Level Security)를 통해 강제되어야 한다. 클라이언트 측 로직에만 의존하지 않는다.
- **App Router First**: Next.js App Router의 컨벤션을 준수한다.
- **Server Component Preference**: 가능한 경우 서버 컴포넌트를 우선적으로 사용하고, 인터랙션이 필요한 경우에만 클라이언트 컴포넌트로 분리한다.
- **Modular Design**: 도메인 간 결합도를 낮추고 독립적인 테스트가 가능하도록 설계한다.
