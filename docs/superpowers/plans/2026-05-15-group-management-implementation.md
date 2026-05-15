# Group Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `/groups` page and underlying services to allow users to create and manage private circles from their followers.

**Architecture:** Implement `groupService` for DB operations. Build a 2-step UI flow (Name -> Members) in `/groups` to sync members efficiently.

**Tech Stack:** Next.js (App Router), Tailwind CSS, Supabase.

---

### Task 1: Create `groupService` and update `memberService`

**Files:**
- Create: `src/services/groupService.ts`
- Modify: `src/services/memberService.ts`

- [ ] **Step 1: Add `getMyFollowers` to `memberService`**

```typescript
// src/services/memberService.ts
// Add to memberService object:
  async getMyFollowers(): Promise<Profile[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    const { data, error } = await supabase
      .from('follows')
      .select(`
        follower:follower_id (
          id,
          username,
          avatar_url
        )
      `)
      .eq('following_id', user.id)
      .eq('status', 'accepted');

    if (error) throw error;
    // Map the nested object to a flat Profile array
    return (data || []).map((d: any) => d.follower) as Profile[];
  },
```

- [ ] **Step 2: Create `groupService.ts`**

```typescript
// src/services/groupService.ts
import { supabase } from '@/lib/supabase';
import { Profile } from './memberService';

export interface Group {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
  member_count?: number;
  members?: Profile[];
}

const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('로그인이 필요합니다.');
  return user;
};

export const groupService = {
  async getGroups(): Promise<Group[]> {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('custom_groups')
      .select(`
        *,
        members:group_members(
          profile:user_id(id, username, avatar_url)
        )
      `)
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((g: any) => ({
      ...g,
      member_count: g.members?.length || 0,
      members: g.members?.map((m: any) => m.profile) || [],
    }));
  },

  async createGroup(name: string, memberIds: string[]): Promise<Group> {
    const user = await getCurrentUser();

    // 1. Create group
    const { data: group, error: groupError } = await supabase
      .from('custom_groups')
      .insert({ owner_id: user.id, name })
      .select()
      .single();

    if (groupError) throw groupError;

    // 2. Add members if any
    if (memberIds.length > 0) {
      const memberData = memberIds.map(id => ({
        group_id: group.id,
        user_id: id
      }));
      const { error: memberError } = await supabase
        .from('group_members')
        .insert(memberData);
        
      if (memberError) {
        // Rollback on failure (simplified)
        await this.deleteGroup(group.id);
        throw memberError;
      }
    }

    return group;
  },

  async deleteGroup(groupId: string): Promise<void> {
    await getCurrentUser(); // Verify auth
    const { error } = await supabase
      .from('custom_groups')
      .delete()
      .eq('id', groupId);

    if (error) throw error;
  }
};
```

- [ ] **Step 3: Commit**

```bash
git add src/services/memberService.ts src/services/groupService.ts
git commit -m "feat: implement groupService and getMyFollowers"
```

---

### Task 2: Build the Groups Dashboard (`/groups`)

**Files:**
- Create: `src/app/groups/page.tsx`

- [ ] **Step 1: Implement basic layout and group fetching**

```tsx
// src/app/groups/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { groupService, Group } from '@/services/groupService';
import Link from 'next/link';

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateWizard, setShowCreateWizard] = useState(false);

  const fetchGroups = async () => {
    try {
      const data = await groupService.getGroups();
      setGroups(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까? 관련된 공유 설정도 모두 해제됩니다.')) return;
    try {
      await groupService.deleteGroup(id);
      fetchGroups();
    } catch (e) {
      console.error(e);
      alert('삭제에 실패했습니다.');
    }
  };

  if (loading) return <div className="min-h-svh bg-brand-warm flex items-center justify-center">불러오는 중...</div>;

  return (
    <div className="min-h-svh bg-brand-warm pb-20">
      <Navbar />
      <main className="max-w-2xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black text-brand-primary">내 그룹 관리</h2>
          <button 
            onClick={() => setShowCreateWizard(true)}
            className="w-10 h-10 bg-brand-primary text-white rounded-full flex items-center justify-center text-xl hover:scale-105 transition-transform"
          >
            +
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {groups.map(group => (
            <div key={group.id} className="bg-white p-6 rounded-3xl border border-brand-border shadow-sm flex flex-col justify-between h-32">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-brand-primary">{group.name}</h3>
                <button onClick={() => handleDelete(group.id)} className="text-xs text-red-400 hover:text-red-600">삭제</button>
              </div>
              <p className="text-sm font-medium text-brand-secondary">멤버 {group.member_count}명</p>
            </div>
          ))}
          {groups.length === 0 && (
            <div className="col-span-full text-center py-20 text-brand-secondary border-2 border-dashed border-gray-300 rounded-3xl">
              아직 만들어진 그룹이 없습니다.<br/>새로운 그룹을 만들어 보세요!
            </div>
          )}
        </div>

        {/* Wizard placeholder */}
        {showCreateWizard && (
           <div className="fixed inset-0 z-50 bg-black/20 flex items-end sm:items-center justify-center backdrop-blur-sm">
             <div className="bg-white w-full max-w-md p-6 rounded-t-3xl sm:rounded-3xl">
               <p>Wizard Component Goes Here</p>
               <button onClick={() => setShowCreateWizard(false)}>Close</button>
             </div>
           </div>
        )}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/groups/page.tsx
git commit -m "feat: implement basic groups dashboard"
```

---

### Task 3: Build the Group Creation Wizard (Step-by-Step)

**Files:**
- Create: `src/components/groups/CreateGroupWizard.tsx`
- Modify: `src/app/groups/page.tsx`

- [ ] **Step 1: Implement `CreateGroupWizard` component**

```tsx
// src/components/groups/CreateGroupWizard.tsx
import React, { useState, useEffect } from 'react';
import { memberService, Profile } from '@/services/memberService';
import { groupService } from '@/services/groupService';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateGroupWizard: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    memberService.getMyFollowers().then(setFollowers).catch(console.error);
  }, []);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await groupService.createGroup(name, Array.from(selectedIds));
      onSuccess();
    } catch (e) {
      console.error(e);
      alert('그룹 생성 실패');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex flex-col justify-end sm:justify-center items-center sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md flex flex-col h-[80vh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        <header className="p-4 flex justify-between items-center border-b border-gray-100">
          <button onClick={step === 2 ? () => setStep(1) : onClose} className="p-2 text-gray-500">
            {step === 2 ? '← 뒤로' : '취소'}
          </button>
          <span className="font-bold text-sm text-brand-primary">새 그룹 만들기 ({step}/2)</span>
          <div className="w-12"></div> {/* Spacer */}
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {step === 1 ? (
            <div className="flex flex-col h-full justify-center">
              <label className="text-xl font-black text-brand-primary mb-4">그룹의 이름을<br/>정해주세요</label>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 우리 가족, 대학교 동창"
                className="w-full text-2xl font-bold border-b-2 border-brand-primary focus:outline-none py-2 placeholder:text-gray-300"
              />
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-black text-brand-primary mb-4">함께할 멤버를<br/>선택해주세요</h3>
              <div className="space-y-2">
                {followers.map(f => (
                  <label key={f.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl cursor-pointer">
                    <span className="font-bold text-brand-primary">@{f.username}</span>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(f.id)}
                      onChange={() => toggleSelect(f.id)}
                      className="w-5 h-5 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                    />
                  </label>
                ))}
                {followers.length === 0 && <p className="text-gray-500 text-sm">아직 팔로워가 없습니다.</p>}
              </div>
            </div>
          )}
        </main>

        <footer className="p-4 border-t border-gray-100">
          {step === 1 ? (
            <button 
              onClick={() => setStep(2)} 
              disabled={!name.trim()}
              className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl disabled:bg-gray-300 transition-colors"
            >
              다음
            </button>
          ) : (
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="w-full py-4 bg-brand-primary text-white font-bold rounded-2xl disabled:bg-gray-300 transition-colors"
            >
              {isSaving ? '저장 중...' : '완료'}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Integrate `CreateGroupWizard` into `GroupsPage`**
Replace the wizard placeholder in `src/app/groups/page.tsx` with `<CreateGroupWizard onClose={() => setShowCreateWizard(false)} onSuccess={() => { setShowCreateWizard(false); fetchGroups(); }} />`

- [ ] **Step 3: Commit**

```bash
git add src/components/groups/CreateGroupWizard.tsx src/app/groups/page.tsx
git commit -m "feat: implement step-by-step CreateGroupWizard"
```

---

### Task 4: Verification

- [ ] **Step 1: Verify navigating to `/groups` loads empty state or existing groups**
- [ ] **Step 2: Verify Step 1 requires a name to proceed**
- [ ] **Step 3: Verify Step 2 loads followers and allows selection**
- [ ] **Step 4: Verify saving creates the group and refreshes the list**
- [ ] **Step 5: Verify deleting a group removes it from the list**
