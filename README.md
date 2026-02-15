# Smart Bookmarks

A modern bookmark manager that allows you to save, organize, and sync your bookmarks across devices in real-time. Sign in with Google OAuth and manage your private bookmark collection effortlessly.

## Technology Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase
- **Authentication:** Supabase Auth with Google OAuth
- **Database:** Supabase Postgres with Row-Level Security (RLS)
- **Real-Time:** Supabase Realtime Subscriptions + BroadcastChannel API
- **Deployment:** Vercel

## End-to-End Workflows

### Workflow 1: User Sign-In with Google OAuth

**Problem Statement:** Users need a secure, passwordless way to access the bookmark manager using their Google account.

We solved this by integrating Supabase Auth with Google OAuth 2.0. Users authenticate through Google's secure servers, and Supabase manages the session tokens. This eliminates password management complexity, provides enterprise-grade security, and leverages Google's infrastructure for identity verification. Sessions are persisted in the browser, allowing users to stay logged in across refreshes and tabs.

### Workflow 2: Add a Bookmark

**Problem Statement:** Users need a quick and intuitive way to save URLs along with descriptive titles to their personal collection.

We implemented a simple two-field form (URL + Title) that submits to the backend with the authenticated user's ID. The bookmark is stored in Supabase with the user's UUID, linking it permanently to that user. To provide instant feedback across devices, we built a dual-sync system: BroadcastChannel for same-browser tabs (instant, local communication) and Supabase Realtime for cross-device sync (server-driven updates).

### Workflow 3: Private Bookmarks (User Data Isolation)

**Problem Statement:** Each user's bookmarks must be completely isolated and visible only to that user. No user should see another user's bookmarks.

We implemented Row-Level Security (RLS) policies directly in the Supabase database. Every bookmark record includes a `user_id` column, and RLS policies enforce that SELECT, INSERT, and DELETE operations only succeed when the database recognizes the authenticated user's ID matches the record's `user_id`. This database-level enforcement means no application logic can bypass it—privacy is guaranteed at the data layer, not just the API layer.

### Workflow 4: Real-Time Bookmark Sync Across Tabs

**Problem Statement:** When a user adds or removes a bookmark in one browser tab, it should appear or disappear instantly in all other open tabs of the same application without requiring a page refresh.

We implemented a two-layer sync strategy: BroadcastChannel API for same-origin browser tabs (instant local messaging without server latency) and Supabase Realtime subscriptions for cross-device sync (WebSocket-based database change notifications). When a bookmark is added, both mechanisms fire simultaneously—BroadcastChannel delivers instant updates to sibling tabs, while Realtime ensures consistency across devices and handles new tabs that open after the change.

### Workflow 5: Delete a Bookmark

**Problem Statement:** Users need the ability to remove bookmarks from their collection when they no longer need them.

We provide a delete button for each bookmark that, when clicked, removes the bookmark from the database and triggers the same sync mechanisms as add/update operations. The backend verifies ownership via RLS policies (ensuring users can only delete their own bookmarks), and Supabase Realtime + BroadcastChannel propagate the deletion across all open tabs and devices instantly. This ensures consistency—when a bookmark is deleted, it disappears everywhere the user has the app open.

## Problems & Solutions

### Memoizing the Bookmarks List

**Problem:** The bookmarks list component re-rendered unnecessarily on every parent component update, causing performance degradation with large bookmark collections.

**Solution:** Wrapped the `BookmarkList` component with `React.memo()` to prevent re-renders when props haven't changed. This ensures the list only updates when the bookmark data or refresh trigger actually changes, not on unrelated parent re-renders.

### Memoizing the Header UI Using useRef

**Problem:** The header component (displaying user email and sign-out button) was re-rendering on every state change, even though the user information remained static.

**Solution:** Used `useRef` to persist the header DOM reference across renders and `useMemo` to cache the header JSX structure. This prevents unnecessary DOM diffing and re-rendering of the static header UI.

### Implementing Infinite Scroll

**Problem:** Loading all bookmarks at once could cause performance issues with users who have hundreds or thousands of bookmarks.

**Solution:** Implemented pagination by fetching bookmarks in batches (e.g., 20 per request) using Supabase `limit()` and `offset()` parameters. Added a "Load More" button or Intersection Observer to trigger new batch fetches as the user scrolls near the end of the list.

### Rendering the New Added Bookmark to the List

**Problem:** After adding a bookmark, the UI needed to immediately reflect the new entry without waiting for a server round-trip, but also needed to stay synchronized across tabs.

**Solution:** Used optimistic UI updates—immediately add the new bookmark to the local state before the API response arrives. On success, update with the server response (which includes the bookmark ID). For cross-tab sync, BroadcastChannel delivers the new bookmark instantly, and Supabase Realtime provides redundant sync to ensure all tabs converge to the same state.

