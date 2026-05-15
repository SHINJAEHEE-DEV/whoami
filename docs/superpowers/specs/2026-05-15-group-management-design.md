# Group Management Design Spec

**Goal:** Implement a dedicated 'Groups' management system where users can organize their followers into private circles for selective autobiography sharing.

**Success Criteria:**
- A dedicated `/groups` page to view, create, edit, and delete groups.
- A 2-step creation/edit flow: Step 1 (Group Name) -> Step 2 (Member Selection via checkboxes).
- Uses the `syncMembers` API logic for efficient bulk updates.
- Adheres to the existing Threads x MOODA warm aesthetic.

---

### 1. User Experience (UX) Flow

#### 1.1. Groups Dashboard (`/groups`)
- **Header**: "내 그룹 관리" with an "Add (+)" button.
- **Group List**: Displays cards for each existing group.
- **Group Card Info**: Group Name, Member Count, and a preview of member avatars (up to 3).
- **Card Actions**: Click to Edit, Swipe/Menu to Delete.

#### 1.2. Creation / Edit Flow (Step-by-Step)
- **Step 1: Group Name**
  - Clean input field for the group's name.
  - "Next" button.
- **Step 2: Member Selection**
  - List of all users who follow the current user.
  - Checkbox UI for multi-selection.
  - Optional search bar for filtering followers.
  - "Complete/Save" button.

---

### 2. Architecture & Data Flow

#### 2.1. API / Services
- **`groupService` (to be created)**:
  - `getGroups()`: Fetch all groups owned by the user, including member count/previews.
  - `createGroup(name, memberIds)`: Create group and insert initial members.
  - `updateGroup(groupId, name, memberIds)`: Update name and sync members.
  - `deleteGroup(groupId)`: Remove group (cascades to members and record access).
- **`memberService` (existing)**:
  - Need to add `getMyFollowers()` to populate the selection list.

#### 2.2. Security (RLS)
- Fully relies on existing RLS policies defined in `custom_groups` and `group_members`.
- Only the owner (`auth.uid() = owner_id`) can execute these actions.

---

### 3. UI/UX Components
- **`GroupCard`**: Reusable component for the dashboard.
- **`StepWizard` (or multi-step modal)**: To handle the 2-step creation flow seamlessly without full page reloads.
