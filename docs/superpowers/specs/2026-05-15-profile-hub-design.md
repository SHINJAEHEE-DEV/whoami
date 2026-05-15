# Profile Hub Design Spec

**Goal:** Transform the Profile page into a central hub for managing relationships (Followers/Following), profile details, and account settings, removing the autobiography view to avoid redundancy with the Home page.

**Success Criteria:**
- A dedicated `/profile` page with a tabbed interface.
- Tab 1: **Followers** - List of users following the current user.
- Tab 2: **Following** - List of users the current user is following, with an 'Unfollow' option.
- A "Profile Edit" modal to update nickname and avatar.
- Integrated account settings (Visibility, Logout).
- Adheres to the Threads x MOODA warm aesthetic.

---

### 1. User Experience (UX) Flow

#### 1.1. Profile Dashboard (`/profile`)
- **Header**: Circular avatar, `@username`, and an "Edit Profile" button.
- **Tab Switcher**: Toggle between "팔로워" and "팔로잉".
- **Member Lists**: Consistent list items with avatar and username.
- **Settings Menu**: A simple, vertical list of action items at the bottom (e.g., "공개 범위 설정", "로그아웃").

#### 1.2. Edit Profile Flow
- Clicking "Edit Profile" opens a modal.
- Users can change their display nickname and choose a new avatar seed (API-based).
- Changes are saved and reflected immediately.

---

### 2. Architecture & Data Flow

#### 2.1. API / Services
- **`memberService`**:
  - `getMyFollowers()`: (Already exists) Fetch followers.
  - `getMyFollowing()`: (To be created) Fetch who the user is following.
  - `updateProfile(updates)`: Update nickname/avatar in the `profiles` table.
- **`authService`**:
  - Existing `signOut` logic for the settings menu.

#### 2.2. Component Structure
- `src/app/profile/page.tsx`: Main hub container.
- `src/components/profile/ProfileHeader.tsx`: Avatar and stats summary.
- `src/components/profile/RelationshipTabs.tsx`: Tab logic and member lists.
- `src/components/profile/EditProfileModal.tsx`: Form for nickname/avatar updates.

---

### 3. UI/UX Style
- High-contrast typography for usernames.
- Soft, rounded containers (24px+).
- Subtle background patterns consistent with the "Autobiography" feel.
