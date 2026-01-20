# Implementation Plan - Remove All Animations

## 1. 🔍 Analysis & Context
*   **Objective:** Completely strip the application of `framer-motion` and all CSS transitions/animations to resolve performance issues and "sluggishness", resulting in a static, instant UI.
*   **Affected Files:** 
    *   **Core:** `src/app/layout.tsx`, `src/app/globals.css`, `package.json`
    *   **Context/Utils:** `src/context/MotionContext.tsx`, `src/context/ToastContext.tsx`, `src/utils/animations.ts`, `src/hooks/use-slimy-spring.ts`
    *   **Components:** `NavigationShell`, `BottomNav`, `Card`, `WeeklyTab`, `DayItem`, `TasksTab`, `TaskCard`, `SettingsModal`, `Feed`, `SwipeFeed`, `StatePopup`, `QuickAddModal`, `MemoryReviewCards`, `ListFeed`, `NotesTab`, `NoteCard`, `ChatTab`, `ConfirmDeleteModal`, `CardDetailModal`.
*   **Key Dependencies:** `framer-motion` (to be removed).
*   **Risks/Unknowns:** 
    *   **Gesture Dependency:** `SwipeFeed` and `MemoryReviewCards` rely heavily on `framer-motion` drag gestures. These must be replaced with native scrolling or static button interactions.
    *   **Layout Shift:** Removing `AnimatePresence` might cause abrupt layout changes. We accept this as part of the "instant" UI goal.

## 2. 📋 Checklist
- [x] 1. Delete Animation Utilities & Contexts
- [x] 2. Update Global Providers & Layout
- [x] 3. Refactor Core UI Components (Remove motion primitives)
- [x] 4. Refactor Complex Interactive Components (SwipeFeed, MemoryReview)
- [x] 5. Clean up CSS & Tailwind Classes
- [x] 6. Uninstall Dependency & Verify

## 3. 📝 Step-by-Step Implementation Details

### Step 1: Delete Animation Utilities & Contexts
*   **Goal:** Remove source files that provide animation logic.
*   **Action:**
    *   Delete `src/utils/animations.ts`.
    *   Delete `src/context/MotionContext.tsx`.
    *   Delete `src/hooks/use-slimy-spring.ts`.

### Step 2: Update Global Providers & Layout
*   **Goal:** Remove providers from the app root.
*   **Action:**
    *   Modify `src/app/layout.tsx`: Remove `MotionProvider` import and usage.
    *   Modify `src/context/ToastContext.tsx`: 
        *   Remove `framer-motion` imports.
        *   Replace `<AnimatePresence>` and `<motion.div>` with standard conditional rendering and `<div>`.
        *   Remove toast entry/exit animations.

### Step 3: Refactor Core UI Components
*   **Goal:** Replace `<motion.xyz>` with standard HTML elements and remove transition props.
*   **Action:**
    *   **Target Files:** `src/components/ui/Card.tsx`, `NavigationShell.tsx`, `BottomNav.tsx`, `WeeklyTab.tsx`, `TasksTab.tsx`, `NotesTab.tsx`, `ChatTab.tsx`.
    *   **For each file:**
        *   Remove `import ... from 'framer-motion'`.
        *   Replace `<motion.div>`, `<motion.button>`, `<motion.h1>` with `<div>`, `<button>`, `<h1>`.
        *   Remove props: `initial`, `animate`, `exit`, `transition`, `variants`, `layout`, `whileTap`, `whileHover`.
        *   Remove `AnimatePresence`.

### Step 4: Refactor Complex Interactive Components
*   **Goal:** Replace gesture-based interactions with static/native alternatives.
*   **Action:**
    *   **`src/components/features/overview/MemoryReviewCards.tsx`**:
        *   Remove `useMotionValue`, `useTransform`, `useDragControls`.
        *   Remove `<motion.div>` drag props.
        *   In `StackCard`: Remove drag logic. Make "Swipe Hints" (Archive, Delete, Save) into actual clickable `<button>` elements with `onClick` handlers.
        *   In `StackView`: Remove stack layout calculations dependent on motion values. Just render the top card.
    *   **`src/components/features/overview/SwipeFeed.tsx`**:
        *   Remove `framer-motion` drag logic.
        *   Convert container to a standard horizontal scrollable flex container: `overflow-x-auto snap-x snap-mandatory`.
        *   Add `snap-center` to children items.
    *   **Modals (`SettingsModal`, `QuickAddModal`, `StatePopup`, `ConfirmDeleteModal`, `CardDetailModal`)**:
        *   Remove `framer-motion` imports.
        *   Replace `<motion.div>` overlay and modal content with standard `fixed inset-0` `div`s.
        *   Ensure `onClick` logic for backdrop closing remains on a standard `div`.

### Step 5: Clean up CSS & Tailwind Classes
*   **Goal:** Remove CSS animation classes.
*   **Action:**
    *   **Global Search & Replace (Regex):**
        *   Remove `transition-all`, `transition-colors`, `transition-transform`, `transition-opacity`.
        *   Remove `duration-\d+`, `ease-\w+`, `delay-\d+`.
        *   Remove `animate-spin`, `animate-pulse`, `animate-bounce`.
    *   **Target Files:** All `.tsx` files in `src/components`.

### Step 6: Cleanup Dependencies
*   **Goal:** Remove unused library.
*   **Action:**
    *   Run `npm uninstall framer-motion`.
    *   Remove `framer-motion` mocks from `src/__tests__/setup.ts` and `src/__tests__/swipe-thresholds.test.tsx` (or delete the test file if it's purely testing motion gestures).

## 4. 🧪 Testing Strategy
*   **Unit Tests:** Run `npm test` to ensure removing mocks doesn't break the suite.
*   **Manual Verification:**
    *   Navigate between tabs (Weekly, Tasks, Notes, Chat). Expect instant switching.
    *   Open Modals (Settings, Quick Add). Expect instant appearance.
    *   "Swipe" in Memory Review: Ensure clicking the new buttons works to process notes.
    *   Feed: Ensure horizontal scrolling works natively.

## 5. ✅ Success Criteria
*   No `framer-motion` imports remain in the source code.
*   No `transition-` or `animate-` classes in classNames.
*   Application builds successfully (`npm run build`).
*   All interactive features (modals, tabs, note actions) function correctly without animation.