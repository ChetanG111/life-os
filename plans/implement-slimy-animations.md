# Implementation Plan - The "Slimy" Animation System

## 1. 🔍 Analysis & Context
*   **Objective:** Re-introduce `framer-motion` to build a "Premium + Slimy" animation system. The goal is a high-performance, physics-based UI that feels organic (viscous/bouncy) but retains Apple-like structural integrity.
*   **The "Signature":** 
    *   **Motion:** High velocity entry -> Overshoot -> controlled "Level 4" settle.
    *   **Tactility:** Elements deform/scale on interaction. Switches stretch like rubber bands.
    *   **Deck USP:** Connected, viscous movement between top card and background cards.
*   **Affected Files:**
    *   **Config:** `src/utils/animations.ts`.
    *   **Core UI:** `src/components/ui/Card.tsx`, `src/components/ui/Switch.tsx` (New), `src/components/layout/BottomNav.tsx`, `src/components/layout/NavigationShell.tsx`.
    *   **Features:** `SwipeFeed.tsx`, `MemoryReviewCards.tsx`, `TaskCard.tsx`, `ChatTab.tsx`, `WeeklyTab.tsx`, `DayItem.tsx`.
    *   **Modals:** `QuickAddModal.tsx`, `SettingsModal.tsx`, `StatePopup.tsx`, `ConfirmDeleteModal.tsx`.
    *   **System:** `ToastContext.tsx`, `src/app/template.tsx` (New).
*   **Key Dependencies:** `framer-motion`.

## 2. 📋 Checklist
- [ ] 1. Foundation: Install & Define Physics Constants
- [ ] 2. Core Components: MotionCard & Rubber-Band Switch
- [ ] 3. The "Deck" Engine (Feed & Memory)
- [ ] 4. The "Swipe Row" Engine (Tasks)
- [ ] 5. The "Staggered Stage" (Modals) & Empty States
- [ ] 6. The "Unfurl" System (Toasts)
- [ ] 7. The "Pop" & "Glide" (Chat, Tabs, FABs)
- [ ] 8. The "Waterfall" (Weekly View)
- [ ] 9. Global Polish (Nav Toggle, Route Transitions)

## 3. 📝 Step-by-Step Implementation Details

### Step 1: Foundation - Install & Define Physics
*   **Action:**
    *   Run `npm install framer-motion`.
    *   Create `src/utils/animations.ts`:
        *   `SLIMY_CONFIG`: `{ type: "spring", stiffness: 400, damping: 25, mass: 1.2 }`.
        *   `IOS_SPRING`: `{ type: "spring", stiffness: 500, damping: 30, mass: 1 }`.
        *   `RUBBER_BAND`: Keyframes for switch toggle `{ width: [48, 56, 48] }`.
        *   `FAB_POP`: Variants for Floating Button entry (Overshoot).

### Step 2: Core Components
*   **Action:**
    *   **Refactor `Card.tsx`**: Export `MotionCard` wrapped in `motion.div`.
    *   **Create `src/components/ui/Switch.tsx`**:
        *   A custom toggle component replacing the HTML `input` or `button`.
        *   Uses `layout` for the knob.
        *   Applies `RUBBER_BAND` width animation to the *background* or *knob* on click.

### Step 3: The "Deck" Engine (Feed & Memory)
*   **Action:**
    *   **Modify `SwipeFeed.tsx` & `MemoryReviewCards.tsx`**:
        *   Convert to `motion.div`.
        *   **Physics:** Top Card tracks `x`. Back cards interpolate `scale`/`x` based on top card drag (Viscosity).
        *   Add explicit "Action Buttons" that trigger the same swipe logic with animation.

### Step 4: The "Swipe Row" Engine (Tasks)
*   **Action:**
    *   **Modify `TaskCard.tsx`**:
        *   `drag="x"`. Background reveals Red (Delete) or Green (Complete).
        *   **Collapse:** Wrap in `AnimatePresence`. `exit={{ height: 0, opacity: 0 }}`.
        *   **List Container:** Ensure parent in `TasksTab.tsx` has `layout` prop so siblings slide up.

### Step 5: The "Staggered Stage" (Modals)
*   **Action:**
    *   **Target:** `QuickAddModal`, `SettingsModal`, `StatePopup`, `ConfirmDeleteModal`.
    *   **Animation:**
        *   Container: `IOS_SPRING` slide up.
        *   Content: `STAGGER_CHILDREN` variants.
        *   Elements: `OVERSHOOT_VARIANT`.
    *   **Empty States:** In `Feed` and `Tasks`, animate the placeholder icon/text with a gentle fade-in-up on mount.

### Step 6: The "Unfurl" System (Toasts)
*   **Action:**
    *   **Modify `ToastContext.tsx`**:
        *   Entry: `scaleY: 0.3` -> `1`, `opacity: 0` -> `1`.
        *   Exit: Slide out right.

### Step 7: The "Pop" & "Glide" (Chat, Tabs, FABs)
*   **Action:**
    *   **Chat:** `POP_VARIANT` bubbles from corners.
    *   **Tabs:** `layoutId` pill in `BottomNav`. `AnimatePresence` slider in `NavigationShell`.
    *   **FABs (NavigationShell):**
        *   Wrap FABs in `AnimatePresence`.
        *   Condition: `!isModalOpen`.
        *   Entry: `FAB_POP` (0 -> 1.2 -> 1).
        *   Exit: Scale down to 0.

### Step 8: The "Waterfall" (Weekly View)
*   **Action:**
    *   **WeeklyTab:** Stagger day entry.
    *   **DayItem:** Accordion expansion using `layout` + `IOS_SPRING`.

### Step 9: Global Polish
*   **Action:**
    *   **Nav Toggle:** Animate `BottomNav` y-position based on Settings.
    *   **Route:** Create `src/app/template.tsx` with a subtle fade-in for page transitions.

## 4. 🧪 Testing Strategy
*   **Verification:**
    *   Check FAB pops back in after closing Quick Add.
    *   Check Settings Switches stretch when clicked.
    *   Check Feed Stack feels connected.

## 5. ✅ Success Criteria
*   "Slimy" physics signature is recognizable across all interactions.
*   No visual glitches (z-fighting, layout jumping).
*   60fps performance on mobile viewport.
