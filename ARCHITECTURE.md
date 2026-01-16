# Component Architecture Proposal for Life OS

Based on `1.instructions.md`, `/context/frontend.yaml` and `/context/decisions.yaml`.

## 1. Tech Stack & Dependencies
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS v4 (Dark mode #0B0B0B base)
- **Animations**: Framer Motion (Spring physics, gesture-based)
- **Icons**: Lucide React (Clean, minimal)
- **State Management**: React Context (for MVP navigation/global state) + Local State

## 2. Directory Structure
```
src/
├── app/
│   ├── layout.tsx       # Root layout (Theme provider, Global styles)
│   ├── page.tsx         # Main entry, likely redirects or holds the NavigationShell
│   └── globals.css      # Global variable setup (colors, reset)
├── components/
│   ├── layout/
│   │   ├── NavigationShell.tsx  # The core swipe controller & tab renderer
│   │   ├── BottomNav.tsx        # The floating pill navigation
│   │   ├── TabAnimate.tsx       # Wrapper for tab transitions
│   │   └── Header.tsx           # Minimal top bar (if needed per tab)
│   ├── ui/
│   │   ├── Card.tsx             # Base card component (animations built-in)
│   │   ├── Button.tsx           # Primary (White), Secondary (Transparent)
│   │   ├── Modal.tsx            # Full screen modal logic
│   │   ├── SwipeableItem.tsx    # For individual list items (left/right actions)
│   │   └── GestureArea.tsx      # Invisible touch targets
│   ├── features/
│   │   ├── overview/
│   │   │   ├── Feed.tsx         # The "Tinder" stack or List view
│   │   │   ├── QuickAddFab.tsx  # Floating interaction button
│   │   │   └── MemoryCards.tsx  # Review cards
│   │   ├── tasks/
│   │   │   └── TaskCard.tsx     # Specific task interactions
│   │   ├── notes/
│   │   │   └── NoteCard.tsx     # Note preview
│   │   └── quick-add/
│   │       └── QuickAddModal.tsx # The creation interface
├── lib/
│   ├── hooks/
│   │   ├── use-swipe.ts         # Custom gesture logic
│   │   └── use-haptics.ts       # Web API vibration wrapper
│   ├── gestures/                # (Future) Dedicated gesture logic/components
│   └── constants/
│       ├── theme.ts             # Color tokens reference
│       └── spring.ts            # Standardized animation config
├── types/
│   └── index.ts                 # Shared interfaces
```

## 3. Core Logic Flow (Frontend Only)
1.  **NavigationShell**:
    *   Maintains `activeTab` state.
    *   Listens for global horizontal swipes to switch tabs (`AnimatePresence`).
    *   renders `<BottomNav />` which tracks gesture position (follows finger).
2.  **Tabs**:
    *   Tasks (Left) <- Overview (Center) -> Chat (Right)
    *   Logic for "Rubber banding" at edges.
3.  **Data Flow**:
    *   Mock data in `src/data/mock.ts` until backend is ready.

## 4. Key Design Decisions Implementation
- **Dark Mode**: Hardcoded in `globals.css` (`bg-[#0B0B0B]`, `text-white`).
- **Typography**: Inter or system-ui (Clean, tailored).
- **Motion**:
    *   Tabs slide in/out.
    *   Cards have spring pop on touch.
    *   Bottom bar hides on release if not interacting.

## 5. Next Steps
1.  Setup `globals.css` with design variables.
2.  Create `NavigationShell` and `BottomNav`.
3.  Implement Swipe Logic.
