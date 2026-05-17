DO $$
DECLARE
    user_id UUID;
    friend_id UUID;
    group_id UUID;
    i INTEGER;
    j INTEGER;
    k INTEGER;
    v_username TEXT;
    v_email TEXT;
    v_question TEXT;
    v_answer TEXT;
    v_group_name TEXT;
    v_names TEXT[] := ARRAY['민수', '영희', '철수', '지은', '도윤', '서연', '하준', '지우', '은우', '서윤', '윤우', '채원', '예준', '하윤', '시우', '나은', '준서', '유주', '지훈', '서현', '건우', '다인', '우진', '소윤', '현우', '하은', '진서', '민주', '재원', '수아'];
    v_adjectives TEXT[] := ARRAY['행복한', '차분한', '열정적인', '꿈꾸는', '고독한', '빛나는', '따뜻한', '냉철한', '순수한', '용감한'];
    v_verbs TEXT[] := ARRAY['여행가', '작가', '사색가', '모험가', '관찰자', '수집가', '예술가', '연구원', '철학자', '몽상가'];
    v_questions TEXT[] := ARRAY['찍먹 vs 부먹', '짜장면 vs 짬뽕', '나의 소울 푸드', '죽기 전 마지막 한 끼', '강아지 vs 고양이', '산 vs 바다', '인생 영화 3편', '나만의 스트레스 해소법', '어린 시절 가장 좋아했던 장난감', '미래의 나에게 하고 싶은 말'];
    v_group_names TEXT[] := ARRAY['고등학교 친구들', '대학교 동기', '독서 모임', '운동 친구', '가족', '회사 동료', '여행 동아리', '주말 농장'];
    v_user_ids UUID[] := '{}';
BEGIN
    -- 1. 30명의 유저 생성 (auth.users + public.profiles)
    FOR i IN 1..30 LOOP
        v_username := v_adjectives[(i % 10) + 1] || '_' || v_verbs[(i % 10) + 1] || '_' || i;
        v_email := 'dummy_user_' || i || '@example.com';
        
        -- auth.users에 삽입
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password, 
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
            created_at, updated_at, confirmation_token, recovery_token, 
            email_change_token_new, phone_change_token
        ) VALUES (
            gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', v_email, 
            '$2a$10$y8zaCHFIEU4XAN1B7MthH..7g8h8M7FNWfkDJTZyfoWx6JioljPHS', -- 'password123'
            now(), '{"provider": "email", "providers": ["email"]}', 
            jsonb_build_object('username', v_username, 'email_verified', true),
            now(), now(), '', '', '', ''
        ) RETURNING id INTO user_id;

        v_user_ids := array_append(v_user_ids, user_id);

        -- public.profiles는 트리거에 의해 자동 생성될 수도 있지만, 명시적으로 처리
        -- (만약 트리거가 있다면 ON CONFLICT DO UPDATE 사용)
        INSERT INTO public.profiles (id, username, avatar_url, is_discoverable)
        VALUES (user_id, v_username, 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || v_username, true)
        ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, avatar_url = EXCLUDED.avatar_url;
        
        -- 2. 각 유저별 자서전 기록 생성 (5~10개씩)
        FOR j IN 1..(5 + (i % 5)) LOOP
            v_question := v_questions[((i + j) % 10) + 1];
            v_answer := v_names[i] || '의 ' || v_question || '에 대한 ' || j || '번째 생각입니다. ' || 
                        '정말 소중한 기억이죠. ' || v_adjectives[(j % 10) + 1] || ' 느낌이 들어요.';
            
            INSERT INTO public.records (user_id, question, answer, visibility, created_at)
            VALUES (
                user_id, 
                v_question, 
                v_answer, 
                (CASE WHEN j % 4 = 0 THEN 'private'::visibility_level 
                      WHEN j % 4 = 1 THEN 'mutual'::visibility_level 
                      WHEN j % 4 = 2 THEN 'group'::visibility_level 
                      ELSE 'public'::visibility_level END),
                now() - (i || ' days')::interval - (j || ' hours')::interval
            );
        END LOOP;
    END LOOP;

    -- 3. 팔로우 관계 생성 (랜덤하게 각자 3~7명씩 팔로우)
    FOR i IN 1..30 LOOP
        user_id := v_user_ids[i];
        FOR j IN 1..(3 + (i % 5)) LOOP
            friend_id := v_user_ids[((i + j * 7) % 30) + 1];
            IF user_id <> friend_id THEN
                INSERT INTO public.follows (follower_id, following_id, status)
                VALUES (user_id, friend_id, 'accepted')
                ON CONFLICT DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;

    -- 4. 그룹 및 그룹 멤버 생성
    FOR i IN 1..30 LOOP
        user_id := v_user_ids[i];
        -- 각자 1~2개의 그룹 소유
        FOR j IN 1..(1 + (i % 2)) LOOP
            v_group_name := v_group_names[((i + j) % 8) + 1];
            INSERT INTO public.custom_groups (owner_id, name)
            VALUES (user_id, v_group_name || ' (' || i || ')')
            RETURNING id INTO group_id;

            -- 본인을 포함하여 랜덤하게 3~5명의 멤버 추가
            INSERT INTO public.group_members (group_id, user_id)
            VALUES (group_id, user_id);

            FOR k IN 1..(2 + (i % 3)) LOOP
                friend_id := v_user_ids[((i + k * 11) % 30) + 1];
                IF user_id <> friend_id THEN
                    INSERT INTO public.group_members (group_id, user_id)
                    VALUES (group_id, friend_id)
                    ON CONFLICT DO NOTHING;
                END IF;
            END LOOP;
        END LOOP;
    END LOOP;

END $$;
