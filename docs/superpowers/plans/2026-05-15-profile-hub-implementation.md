# Profile Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Profile page into a Relationship and Settings Hub.

**Architecture:** Create a new `/profile` page with tabbed lists for Followers/Following and integrated account settings. Implement an `EditProfileModal` for updating user metadata.

**Tech Stack:** Next.js (App Router), Tailwind CSS, Supabase.

---

### Task 1: Extend `memberService` for Profile Hub

**Files:**
- Modify: `src/services/memberService.ts`

- [ ] **Step 1: Add `getMyFollowing` and `updateProfile` methods**

```typescript
// src/services/memberService.ts
export const memberService = {
  // ... existing ...
  async getMyFollowing(): Promise<Profile[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    const { data, error } = await supabase
      .from('follows')
      .select(`
        following:following_id (id, username, avatar_url)
      `)
      .eq('follower_id', user.id)
      .eq('status', 'accepted');

    if (error) throw error;
    return (data || []).map((d: any) => d.following) as Profile[];
  },

  async updateProfile(updates: { username?: string; avatar_url?: string | null }) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('로그인이 필요합니다.');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
```

- [ ] **Step 2: Commit**

```bash
git add src/services/memberService.ts
git commit -m "feat: add getMyFollowing and updateProfile to memberService"
```

---

### Task 2: Create Profile UI Components

**Files:**
- Create: `src/components/profile/ProfileHeader.tsx`
- Create: `src/components/profile/RelationshipTabs.tsx`
- Create: `src/components/profile/EditProfileModal.tsx`

- [ ] **Step 1: Implement `ProfileHeader`**
Show avatar, username, and "Edit Profile" button.

- [ ] **Step 2: Implement `RelationshipTabs`**
Handle "Followers" vs "Following" state and display lists.

- [ ] **Step 3: Implement `EditProfileModal`**
Allow updating nickname and choosing avatar seed.

- [ ] **Step 4: Commit**

```bash
git add src/components/profile/
git commit -m "feat: implement Profile Hub components"
```

---

### Task 3: Build the New Profile Hub Page

**Files:**
- Create: `src/app/profile/page.tsx`
- Modify: `src/components/Navbar.tsx`

- [ ] **Step 1: Implement `/profile` container**
Integrate header, tabs, and settings menu (Visibility, Logout).

- [ ] **Step 2: Update Navbar link**
Change the Profile link to point to `/profile` instead of `/profile/${user.id}` for the hub experience.

- [ ] **Step 3: Commit**

```bash
git add src/app/profile/page.tsx src/components/Navbar.tsx
git commit -m "feat: implement Profile Hub page and update Navbar"
```

---

### Task 4: Verification

- [ ] **Step 1: Verify `/profile` loads with correct follower/following counts**
- [ ] **Step 2: Verify switching tabs updates the member list**
- [ ] **Step 3: Verify editing profile updates the display immediately**
- [ ] **Step 4: Verify unfollowing from the "Following" tab works**
