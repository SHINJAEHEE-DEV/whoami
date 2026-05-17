-- 1. records 테이블의 가시성 정책 고도화
-- 'mutual' 가시성을 '나를 팔로우하는 사람(follower)'에게 공개하는 로직으로 변경

DROP POLICY IF EXISTS "Viewable based on visibility level" ON public.records;

CREATE POLICY "Viewable based on visibility level" ON public.records FOR SELECT
  USING (
    (visibility = 'public') OR 
    ((visibility = 'mutual') AND EXISTS (
      SELECT 1 FROM public.follows 
      WHERE follower_id = auth.uid() 
      AND following_id = public.records.user_id 
      AND status = 'accepted'
    )) OR 
    ((visibility = 'group') AND public.has_group_access(id, auth.uid())) OR
    (auth.uid() = user_id)
  );

-- 2. group 가시성 로직은 기존 has_group_access 함수를 그대로 유지하되, 
-- 여러 그룹 지원을 위해 record_group_access 테이블과의 연동을 강화함 (이미 구조상 지원됨)

COMMENT ON COLUMN public.records.visibility IS 'private: 나만 보기, mutual: 팔로워 전체 공개, group: 지정 그룹 공개, public: 전체 공개';
