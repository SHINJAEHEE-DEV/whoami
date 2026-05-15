# Connections & Sharing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the follow system and Discover page to allow users to connect and selectively share their autobiographies.

**Architecture:** Extend `memberService` with follow and search logic. Create a `/discover` page for finding users via username search. Create a dynamic `/profile/[id]` route to view other users' autobiographies, relying on existing Supabase RLS for secure filtering.

**Tech Stack:** Next.js (App Router), Tailwind CSS, Supabase.

---

### Task 1: Extend `memberService` with Connection Logic

**Files:**
- Modify: `src/services/memberService.ts`

- [ ] **Step 1: Add relationship methods**

```typescript
// src/services/memberService.ts
// ... existing imports ...

export const memberService = {
  // ... existing methods ...

  async followUser(targetUserId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: user.id, following_id: targetUserId, status: 'accepted' });

    if (error) throw error;
  },

  async unfollowUser(targetUserId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    const { error } = await supabase
      .from('follows')
      .delete()
      .match({ follower_id: user.id, following_id: targetUserId });

    if (error) throw error;
  },

  async checkRelationship(targetUserId: string): Promise<'none' | 'following' | 'mutual'> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 'none';

    // Check if I follow them
    const { data: iFollow } = await supabase
      .from('follows')
      .select('status')
      .match({ follower_id: user.id, following_id: targetUserId })
      .single();

    if (!iFollow) return 'none';

    // Check if they follow me (Mutual)
    const { data: theyFollow } = await supabase
      .from('follows')
      .select('status')
      .match({ follower_id: targetUserId, following_id: user.id })
      .single();

    return theyFollow ? 'mutual' : 'following';
  }
};
```

- [ ] **Step 2: Commit**

```bash
git add src/services/memberService.ts
git commit -m "feat: add follow, unfollow, and relationship check to memberService"
```

---

### Task 2: Build the Discover Page (`/discover`)

**Files:**
- Create: `src/app/discover/page.tsx`

- [ ] **Step 1: Implement search and user listing**

```tsx
// src/app/discover/page.tsx
'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { memberService, Profile } from '@/services/memberService';
import Link from 'next/link';

export default function DiscoverPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const users = await memberService.searchProfileByUsername(query);
      setResults(users);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-svh bg-brand-warm">
      <Navbar />
      <main className="max-w-2xl mx-auto py-8 px-4">
        <h2 className="text-2xl font-black text-brand-primary mb-6">지인 찾기</h2>
        
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="@username 으로 검색"
            className="flex-1 px-4 py-3 rounded-2xl border border-brand-border focus:outline-none focus:border-brand-primary"
          />
          <button type="submit" disabled={loading} className="px-6 py-3 bg-brand-primary text-white font-bold rounded-2xl">
            검색
          </button>
        </form>

        <div className="space-y-4">
          {results.map(profile => (
            <div key={profile.id} className="bg-white p-4 rounded-2xl border border-brand-border flex justify-between items-center">
              <span className="font-bold text-brand-primary">@{profile.username}</span>
              <Link href={`/profile/${profile.id}`} className="px-4 py-2 bg-brand-warm text-brand-primary font-bold text-sm rounded-xl hover:bg-gray-100">
                프로필 보기
              </Link>
            </div>
          ))}
          {results.length === 0 && !loading && query && (
             <p className="text-center text-brand-secondary py-10">검색 결과가 없습니다.</p>
          )}
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/discover/page.tsx
git commit -m "feat: implement Discover page for user search"
```

---

### Task 3: Build the Public Profile Page (`/profile/[id]`)

**Files:**
- Create: `src/app/profile/[id]/page.tsx`
- Modify: `src/services/recordService.ts`

- [ ] **Step 1: Add `getUserRecords` to `recordService.ts`**

```typescript
// src/services/recordService.ts
// Add to recordService:
  async getUserRecords(userId: string): Promise<Record[]> {
    // RLS will automatically filter out private/unauthorized records
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },
```

- [ ] **Step 2: Implement Profile Page**

```tsx
// src/app/profile/[id]/page.tsx
'use client';

import { useEffect, useState, use } from 'react';
import Navbar from '@/components/Navbar';
import { memberService } from '@/services/memberService';
import { recordService, Record } from '@/services/recordService';
import { ListViewer } from '@/components/records/ListViewer';

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const targetId = resolvedParams.id;
  
  const [records, setRecords] = useState<Record[]>([]);
  const [relation, setRelation] = useState<'none' | 'following' | 'mutual'>('none');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rel, recs] = await Promise.all([
          memberService.checkRelationship(targetId),
          recordService.getUserRecords(targetId)
        ]);
        setRelation(rel);
        setRecords(recs);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [targetId]);

  const toggleFollow = async () => {
    try {
      if (relation === 'none') {
        await memberService.followUser(targetId);
        setRelation('following'); // simplified, actual state might be mutual if they follow back
      } else {
        await memberService.unfollowUser(targetId);
        setRelation('none');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="min-h-svh bg-brand-warm flex items-center justify-center">불러오는 중...</div>;

  return (
    <div className="min-h-svh bg-brand-warm">
      <Navbar />
      <main className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white p-6 rounded-3xl border border-brand-border flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-black text-brand-primary">User Profile</h2>
            {relation === 'mutual' && <span className="text-xs font-bold text-brand-accent">서로 팔로우 중 (Mutual)</span>}
          </div>
          <button 
            onClick={toggleFollow}
            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${relation === 'none' ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            {relation === 'none' ? '팔로우' : '언팔로우'}
          </button>
        </div>

        {records.length > 0 ? (
          <ListViewer records={records} onEdit={() => {}} />
        ) : (
          <div className="text-center p-20 text-brand-secondary">
            공개된 기록이 없거나 열람 권한이 없습니다.
          </div>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/profile/[id]/page.tsx src/services/recordService.ts
git commit -m "feat: implement public profile page with follow action and RLS-filtered records"
```

---

### Task 4: Verification

- [ ] **Step 1: Verify searching for a user in `/discover`**
- [ ] **Step 2: Verify following a user updates the relationship status**
- [ ] **Step 3: Verify the public profile only shows records the viewer is authorized to see based on RLS**
