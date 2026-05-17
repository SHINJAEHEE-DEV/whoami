-- 1. 팔로우 관계 제어 및 맞팔로우 가시성 강화
-- 기존 is_mutual_follower 함수는 이미 존재하므로, RLS 정책을 더 정교하게 다듬습니다.

-- 2. memberService 구현을 위한 헬퍼 함수 추가: 팔로우 상태 조회
CREATE OR REPLACE FUNCTION public.get_follow_status(viewer_id uuid, target_id uuid)
RETURNS text AS $$
DECLARE
    is_following boolean;
    is_followed boolean;
BEGIN
    SELECT EXISTS (SELECT 1 FROM public.follows WHERE follower_id = viewer_id AND following_id = target_id AND status = 'accepted') INTO is_following;
    SELECT EXISTS (SELECT 1 FROM public.follows WHERE follower_id = target_id AND following_id = viewer_id AND status = 'accepted') INTO is_followed;

    IF is_following AND is_followed THEN
        RETURN 'mutual';
    ELSIF is_following THEN
        RETURN 'following';
    ELSIF is_followed THEN
        RETURN 'follower';
    ELSE
        RETURN 'none';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 검색을 위한 인덱스 및 성능 최적화
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_records_visibility ON public.records(visibility);
CREATE INDEX IF NOT EXISTS idx_follows_status ON public.follows(status);

-- 4. records 테이블에 question_id 연결 (이미 20260515000001_create_questions_table.sql 에서 처리되었을 수 있으나 확인용)
-- 만약 records 테이블에 question_id가 없다면 추가하는 로직 (기존 initial_schema에는 question text만 있음)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'records' AND COLUMN_NAME = 'question_id') THEN
        ALTER TABLE public.records ADD COLUMN question_id uuid REFERENCES public.questions(id);
    END IF;
END $$;
