-- 1. records 테이블의 question_id 컬럼 추가 (이미 수행되었을 수 있지만 명시적 기록)
ALTER TABLE public.records ADD COLUMN IF NOT EXISTS question_id uuid REFERENCES public.questions(id);

-- 2. 답변(answer)과 공개 범위(visibility)만 수정 가능하도록 제한하는 트리거 함수
CREATE OR REPLACE FUNCTION public.restrict_record_updates()
RETURNS TRIGGER AS $$
BEGIN
  -- 수정 가능한 컬럼: answer, visibility
  -- 수정 불가능한 컬럼: id, user_id, question, question_id, created_at, question_type
  
  IF (OLD.id <> NEW.id) OR
     (OLD.user_id <> NEW.user_id) OR
     (OLD.question <> NEW.question) OR
     (OLD.created_at <> NEW.created_at) OR
     (COALESCE(OLD.question_id, '00000000-0000-0000-0000-000000000000'::uuid) <> COALESCE(NEW.question_id, '00000000-0000-0000-0000-000000000000'::uuid)) OR
     (COALESCE(OLD.question_type, '') <> COALESCE(NEW.question_type, '')) THEN
    RAISE EXCEPTION 'Only answer and visibility columns can be modified in a record.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. 트리거 적용
DROP TRIGGER IF EXISTS tr_restrict_record_updates ON public.records;
CREATE TRIGGER tr_restrict_record_updates
BEFORE UPDATE ON public.records
FOR EACH ROW
EXECUTE FUNCTION public.restrict_record_updates();
