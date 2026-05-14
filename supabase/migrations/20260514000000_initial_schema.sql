-- Create custom types
CREATE TYPE visibility_level AS ENUM ('private', 'mutual', 'group', 'public');

-- 1. profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  avatar_url text,
  is_discoverable boolean DEFAULT true,
  phone_hash text,
  updated_at timestamptz DEFAULT now()
);

-- 2. follows
CREATE TABLE public.follows (
  follower_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted')),
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (follower_id, following_id)
);

-- 3. custom_groups
CREATE TABLE public.custom_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 4. group_members
CREATE TABLE public.group_members (
  group_id uuid REFERENCES public.custom_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (group_id, user_id)
);

-- 5. records
CREATE TABLE public.records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  visibility visibility_level NOT NULL DEFAULT 'private',
  created_at timestamptz DEFAULT now()
);

-- 6. record_group_access
CREATE TABLE public.record_group_access (
  record_id uuid REFERENCES public.records(id) ON DELETE CASCADE,
  group_id uuid REFERENCES public.custom_groups(id) ON DELETE CASCADE,
  PRIMARY KEY (record_id, group_id)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.record_group_access ENABLE ROW LEVEL SECURITY;

-- Helper Function: is_mutual_follower
CREATE OR REPLACE FUNCTION public.is_mutual_follower(user_a uuid, user_b uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.follows f1
    JOIN public.follows f2 ON f1.follower_id = f2.following_id AND f1.following_id = f2.follower_id
    WHERE f1.follower_id = user_a AND f1.following_id = user_b
    AND f1.status = 'accepted' AND f2.status = 'accepted'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies

-- Profiles: Anyone can view, only owner can update
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Follows: Involved parties can see, follower can insert
CREATE POLICY "Users can see their own follows" ON public.follows
  FOR SELECT USING (auth.uid() = follower_id OR auth.uid() = following_id);
CREATE POLICY "Users can follow others" ON public.follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow or update status" ON public.follows
  FOR ALL USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- Records: Complex visibility
CREATE POLICY "Owner can do everything with records" ON public.records
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Viewable based on visibility level" ON public.records
  FOR SELECT USING (
    visibility = 'public' OR
    (visibility = 'mutual' AND public.is_mutual_follower(auth.uid(), user_id)) OR
    (visibility = 'group' AND EXISTS (
      SELECT 1 FROM public.record_group_access rga
      JOIN public.group_members gm ON rga.group_id = gm.group_id
      WHERE rga.record_id = id AND gm.user_id = auth.uid()
    ))
  );

-- Groups & Members: Owner manages, members see
CREATE POLICY "Owners can manage groups" ON public.custom_groups
  FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Members can see group info" ON public.custom_groups
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM public.group_members WHERE group_id = id AND user_id = auth.uid()
  ));

CREATE POLICY "Owners can manage group members" ON public.group_members
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.custom_groups WHERE id = group_id AND owner_id = auth.uid()
  ));
CREATE POLICY "Members can see other members" ON public.group_members
  FOR SELECT USING (group_id IN (
    SELECT group_id FROM public.group_members WHERE user_id = auth.uid()
  ));

-- Record Group Access: Owner manages
CREATE POLICY "Owners can manage record group access" ON public.record_group_access
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.records WHERE id = record_id AND user_id = auth.uid()
  ));

-- Trigger: Create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
