# Connections & Sharing Flow Design Spec

**Goal:** Implement a robust follow and connection system that allows users to find acquaintances, build relationships, and selectively share their digital autobiography.

**Success Criteria:**
- Users can search for others by username.
- Users can connect their contacts to find existing friends via phone hash matching.
- Relationships default to an asymmetric follow model, with automatic 'Mutual' rights granted when bidirectional following occurs.
- The UI provides a dedicated 'Discover' page for finding and managing connections.

---

### 1. User Experience (UX) Flow

#### 1.1. Discover Page (`/discover`)
- **Search Bar**: A prominent input field to search users by their unique `@username`.
- **Contact Sync**: An opt-in button to "Find friends from contacts". Once clicked, hashes contacts and queries the database for matches.
- **Recommended Users**: A list of matched contacts or suggested users.
- **Follow Action**: A simple "Follow" button next to each user profile.

#### 1.2. Profile Page (Viewer Perspective)
- When visiting another user's profile, the viewer sees the target user's autobiography.
- **Visibility Filtering**: The viewer only sees questions/answers where:
  - Visibility is `public`.
  - Visibility is `mutual` AND the viewer and target are mutually following each other.
  - Visibility is `group` AND the viewer is in the target's authorized group.
- **Relationship Status**: Displays "Follow", "Following", or "Mutual" based on the current relationship state.

#### 1.3. Notifications (Future/Phase 2)
- Notify users when they receive a new follower, encouraging them to reciprocate and unlock `mutual` visibility.

---

### 2. Architecture & Data Flow

#### 2.1. Data Model (`follows` table)
- Already exists in schema: `follower_id`, `following_id`, `status` (default: 'accepted').
- **Follow Action**: Inserts a row where `follower_id = auth.uid()` and `following_id = target_id`.
- **Unfollow Action**: Deletes the corresponding row.

#### 2.2. Contact Matching Logic
- **Client-side Hash**: Phone numbers are normalized (e.g., E.164 format) and hashed (SHA-256) on the client side before being sent to the server.
- **Server Match**: The server compares the provided hashes against the `phone_hash` column in the `profiles` table to return matched users.

#### 2.3. API / Services (`memberService`)
- `followUser(targetId)`
- `unfollowUser(targetId)`
- `checkRelationship(targetId)`: Returns 'none', 'following', 'follower', or 'mutual'.
- `findFriendsByContacts(hashedContacts[])`: Returns a list of matched profiles.

---

### 3. UI/UX Style
- Consistent with the Threads x MOODA theme.
- Clean list layouts for user discovery.
- Distinct visual indicators (e.g., a special badge or color) when a relationship is "Mutual".
