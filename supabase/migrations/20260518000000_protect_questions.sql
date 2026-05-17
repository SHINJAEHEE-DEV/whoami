-- Ensure column exists
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS is_system boolean DEFAULT false;

-- Temporarily disable triggers if they exist to allow initial setup
DROP TRIGGER IF EXISTS tr_prevent_system_question_update ON public.questions;
DROP TRIGGER IF EXISTS tr_prevent_system_question_delete ON public.questions;
DROP TRIGGER IF EXISTS tr_prevent_any_question_update ON public.questions;

-- Update existing 70 questions to be system questions
UPDATE public.questions SET is_system = true;

-- Refined protection function
CREATE OR REPLACE FUNCTION public.protect_questions_table()
RETURNS TRIGGER AS $$
BEGIN
  -- Block all updates
  IF TG_OP = 'UPDATE' THEN
    RAISE EXCEPTION 'Questions cannot be modified once created.';
  END IF;

  -- Block deletion of system questions
  IF TG_OP = 'DELETE' AND OLD.is_system = true THEN
    RAISE EXCEPTION 'System questions cannot be deleted.';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER tr_prevent_any_question_update
BEFORE UPDATE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION public.protect_questions_table();

CREATE TRIGGER tr_prevent_system_question_delete
BEFORE DELETE ON public.questions
FOR EACH ROW
EXECUTE FUNCTION public.protect_questions_table();

-- RLS Policies
DROP POLICY IF EXISTS "Questions are viewable by everyone" ON public.questions;
CREATE POLICY "Questions are viewable by everyone" ON public.questions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage non-system questions" ON public.questions;
CREATE POLICY "Admins can manage non-system questions" ON public.questions
  FOR ALL
  TO authenticated
  USING (is_system = false)
  WITH CHECK (is_system = false);
