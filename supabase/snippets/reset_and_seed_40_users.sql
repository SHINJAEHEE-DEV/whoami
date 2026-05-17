DO $$
DECLARE
    target_user_id UUID := 'e386daf5-49bb-4f5d-8f2c-9c1236c0db8d';
    dummy_user_ids UUID[] := '{}';
    new_user_id UUID;
    q RECORD;
    i INTEGER;
    j INTEGER;
    v_username TEXT;
    v_email TEXT;
    v_answer TEXT;
    v_visibility visibility_level;
    v_group_id UUID;
    
    -- Names for dummy users
    names TEXT[] := ARRAY['김지호', '이서연', '박도윤', '최하준', '정지우', '강은우', '조서윤', '윤민준', '임채원', '한예준', '오하윤', '서시우', '권나은', '황준서', '안유주', '송지훈', '전서현', '홍건우', '유다인', '양우진', '백소윤', '허현우', '남하은', '심진서', '노민주', '손재원', '곽수아', '성준혁', '차지아', '구본혁', '나혜진', '주성민', '민경아', '지상우', '유진아', '변상철', '임수호', '신지민', '강동현', '조우리'];
    
    -- Avatar styles
    styles TEXT[] := ARRAY['avataaars', 'lorelei', 'notionists', 'adventurer', 'fun-emoji', 'croodles', 'pixel-art'];
BEGIN
    -- 0. Cleanup
    -- Delete all dummy users from auth.users
    DELETE FROM auth.users WHERE id <> target_user_id;
    -- Clean target user's data (Cascade might handle some, but let's be thorough)
    DELETE FROM public.records;
    DELETE FROM public.follows;
    DELETE FROM public.custom_groups;
    -- Profiles table should be clean for dummy users now. 
    -- Target user's profile remains? No, let's reset it.
    DELETE FROM public.profiles WHERE id = target_user_id;

    -- 1. Re-initialize target profile
    INSERT INTO public.profiles (id, username, avatar_url, is_discoverable)
    VALUES (target_user_id, '신재희', 'https://api.dicebear.com/7.x/open-peeps/svg?seed=JaeHee', true)
    ON CONFLICT (id) DO UPDATE SET username = EXCLUDED.username, avatar_url = EXCLUDED.avatar_url;

    -- 2. Create 40 dummy users
    FOR i IN 1..40 LOOP
        v_username := names[i] || '_' || i;
        v_email := 'dummy' || i || '@example.com';
        new_user_id := gen_random_uuid();
        
        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password, 
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
            created_at, updated_at, confirmation_token, recovery_token, 
            email_change_token_new, phone_change_token
        ) VALUES (
            new_user_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', v_email, 
            '$2a$10$CtujBrhatVIHXXrpqpMt2.ejc8DJge654TwQ.vGXI/9zCSkPU/aLy', -- 'password123'
            now(), '{"provider": "email", "providers": ["email"]}', 
            jsonb_build_object('username', v_username, 'email_verified', true),
            now(), now(), '', '', '', ''
        );
        
        -- Update the profile that was created by the trigger
        UPDATE public.profiles 
        SET username = v_username, 
            avatar_url = 'https://api.dicebear.com/7.x/' || styles[(i % 7) + 1] || '/svg?seed=' || v_username,
            is_discoverable = true
        WHERE id = new_user_id;
        
        -- In case the trigger didn't run (unlikely but safe)
        INSERT INTO public.profiles (id, username, avatar_url, is_discoverable)
        VALUES (new_user_id, v_username, 'https://api.dicebear.com/7.x/' || styles[(i % 7) + 1] || '/svg?seed=' || v_username, true)
        ON CONFLICT (id) DO NOTHING;
        
        dummy_user_ids := array_append(dummy_user_ids, new_user_id);
    END LOOP;

    -- 3. Generate 70 records for target user (High Quality)
    FOR q IN (SELECT id, question_text, type, options FROM public.questions ORDER BY stage, id) LOOP
        IF q.type = 'choice' THEN
            v_answer := (q.options->>0);
        ELSIF q.type = 'short' THEN
            v_answer := '제가 생각하는 ' || q.question_text || '에 대한 솔직한 답변입니다.';
        ELSE
            v_answer := '이 질문("' || q.question_text || '")을 통해 저 자신을 되돌아보는 귀한 시간을 가졌습니다. ' || 
                        '평소 당연하게 여겼던 것들이 사실은 얼마나 소중한지 깨닫게 되네요. ' || 
                        '앞으로의 삶에서도 이런 작은 가치들을 잊지 않고 살아가고 싶습니다.';
        END IF;
        
        INSERT INTO public.records (user_id, question, answer, visibility, question_id)
        VALUES (target_user_id, q.question_text, v_answer, 'public', q.id);
    END LOOP;

    -- 4. Generate random records for dummy users
    FOR i IN 1..40 LOOP
        FOR q IN (SELECT id, question_text, type, options FROM public.questions ORDER BY random() LIMIT 15) LOOP
            IF q.type = 'choice' THEN
                v_answer := (q.options->>(floor(random()*2)::int));
            ELSE
                v_answer := names[i] || '의 생각입니다. ' || q.question_text || '은 저에게 ' || 
                            (ARRAY['아주 특별한', '잊을 수 없는', '행복한', '차분한'])[floor(random()*4)+1] || ' 의미가 있습니다.';
            END IF;
            
            v_visibility := (ARRAY['public', 'mutual', 'group', 'private'::visibility_level])[floor(random()*4)+1];
            
            INSERT INTO public.records (user_id, question, answer, visibility, question_id)
            VALUES (dummy_user_ids[i], q.question_text, v_answer, v_visibility, q.id);
        END LOOP;
    END LOOP;

    -- 5. Follow relationships
    -- At least 25 users follow target user (user requested 15+, 25 is safer and better)
    FOR i IN 1..25 LOOP
        INSERT INTO public.follows (follower_id, following_id, status)
        VALUES (dummy_user_ids[i], target_user_id, 'accepted')
        ON CONFLICT DO NOTHING;
    END LOOP;
    
    -- Random follows among others
    FOR i IN 1..40 LOOP
        FOR j IN 1..8 LOOP
            new_user_id := dummy_user_ids[floor(random()*40)+1];
            IF new_user_id <> dummy_user_ids[i] THEN
                INSERT INTO public.follows (follower_id, following_id, status)
                VALUES (dummy_user_ids[i], new_user_id, 'accepted')
                ON CONFLICT DO NOTHING;
            END IF;
        END LOOP;
    END LOOP;

    -- 6. Groups
    -- Target user groups
    INSERT INTO public.custom_groups (owner_id, name) VALUES (target_user_id, '나의 진솔한 친구들') RETURNING id INTO v_group_id;
    FOR i IN 1..15 LOOP
        INSERT INTO public.group_members (group_id, user_id) VALUES (v_group_id, dummy_user_ids[i]) ON CONFLICT DO NOTHING;
    END LOOP;
    
    INSERT INTO public.custom_groups (owner_id, name) VALUES (target_user_id, '주말 사색 모임') RETURNING id INTO v_group_id;
    FOR i IN 16..30 LOOP
        INSERT INTO public.group_members (group_id, user_id) VALUES (v_group_id, dummy_user_ids[i]) ON CONFLICT DO NOTHING;
    END LOOP;

    -- Dummy user groups (some include target user)
    FOR i IN 1..15 LOOP
        INSERT INTO public.custom_groups (owner_id, name) VALUES (dummy_user_ids[i], '멤버십 그룹 ' || i) RETURNING id INTO v_group_id;
        INSERT INTO public.group_members (group_id, user_id) VALUES (v_group_id, dummy_user_ids[i]); -- Owner as member
        INSERT INTO public.group_members (group_id, user_id) VALUES (v_group_id, target_user_id) ON CONFLICT DO NOTHING;
        -- Add a few more random members
        FOR j IN 1..5 LOOP
             INSERT INTO public.group_members (group_id, user_id) VALUES (v_group_id, dummy_user_ids[floor(random()*40)+1]) ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;

END $$;
