# PROJECT: Personal AI OS (PWA)

You are designing a **mobile-first Progressive Web App** that functions as a personal operating system for one user.  
It is NOT a productivity SaaS.  
It is NOT a public product.  
It is a private control panel for thoughts, tasks, memory, and decisions.

The app must feel:
- premium
- tactile
- playful
- alive
- slightly chaotic but intentional

---

# CORE TABS

Bottom navigation only.  
NO sidebars on mobile.

Tabs (max 4):

1. Chat  
2. Inbox  
3. Tasks  
4. Notes / Voice  

Memory lives inside Tasks (tagged, not separate).

---

# GLOBAL MOTION RULES

ALL animations must:
- be non-linear
- use easing (no linear motion)
- overshoot slightly
- slow settle at the end
- feel springy, elastic, slime-like

Detached elements (cards, bubbles, notes):
- stretch when dragged
- wobble on release
- snap back with bounce

Menus:
- children must stagger into view
- slight delay between each item
- each item enters with a tiny bounce

Micro-interactions:
- tap = squash
- release = bounce
- drag = elastic follow

---

# CHAT TAB

Full-height screen.  
Sticky input bar at bottom.

Chat bubbles:
- irregular shapes
- float subtly
- wobble when sent
- stretch + snap back

New message animation:
- slide up
- overshoot
- soft bounce settle

AI responses:
- staggered line reveal
- subtle bounce per line
- typing indicator pulses organically

Scroll:
- rubber-band physics
- soft resistance at edges

---

# INBOX TAB

Purpose: raw brain dump.

Mixed content feed:
- text
- voice
- screenshots

Cards:
- slightly rotated
- draggable
- spring physics

Swipe actions:
- left = delete (slime stretch)
- right = convert to task (snap bounce)

New items:
- drop in
- overshoot
- settle softly

---

# TASKS TAB

Single vertical list.  
NO kanban.  
NO calendar.

Task cards:
- lift on hover
- bounce on complete
- elastic collapse when done

Priority change:
- scale up
- overshoot
- slow settle

Reordering:
- stretchy drag
- magnetic snap

---

# NOTES / VOICE TAB

Loose Pinterest-style grid.

Cards:
- float independently
- subtle idle wobble

Mic button:
- pulses
- jelly bounce on tap

Recording state:
- waveform wiggles
- elastic expand

Opening a note:
- zoom in
- slight rotation
- soft bounce settle

---

# AI BEHAVIOR

AI acts as:
- assistant
- memory system
- pattern recognizer

NOT:
- decision maker
- planner god

AI should:
- extract tasks
- summarize chaos
- surface patterns
- challenge fake priorities
- remind past failures/wins

Memory rules:
- only store:
  - decisions
  - patterns
  - commitments
  - lessons
- ignore fluff

User explicitly commands:
- "remember this"
- "forget that"

---

# DESIGN SYSTEM
<design-system>

# Design Philosophy
The Hand-Drawn design style celebrates authentic imperfection and human touch in a digital world. It rejects the clinical precision of modern UI design in favor of organic, playful irregularity that evokes sketches on paper, sticky notes on a wall, and napkin diagrams from a brainstorming session.

Core Principles:
- No Straight Lines: Every border, shape, and container uses irregular border-radius values to create wobbly, hand-drawn edges that reject geometric perfection
- Authentic Texture: Layer paper grain, dot patterns, subtle background textures
- Playful Rotation: Elements deliberately tilted (-2deg to 2deg)
- Hard Offset Shadows: No blur. Solid shadows only (4px 4px 0px)
- Handwritten Typography: Kalam, Patrick Hand only
- Scribbled Decoration: arrows, tape, thumbtacks, dashed lines
- Limited Color Palette:
  - pencil black
  - paper white
  - correction red
  - post-it yellow
- Intentional Messiness: overlap, asymmetry, chaos with purpose

## Typography
- Large
- Dramatic size variation

## Radius & Border
- NEVER use standard rounded classes
- Use organic elliptical radius
- Thick borders (min 2px)

## Shadows
- box-shadow: 4px 4px 0px #2d2d2d
- hover reduces offset
- active removes shadow (pressed)

## Texture
- radial dot background
- notebook grain

## Layout
- responsive grid
- rotated cards
- overlaps
- negative margins
- speech bubble tails
- decorative elements outside bounds

## Interactions
- buttons flatten on press
- cards rotate on hover
- lift effect on hover

## Icons
- lucide-react
- stroke width 2.5+
- enclosed in rough circles

</design-system>

---

# FINAL RULE

This app must feel like:
a sketchbook  
a brain dump  
a living organism  

NOT:
a startup  
a dashboard  
a boring productivity tool

If it feels corporate, you failed.
If it feels fun, alive, and slightly chaotic, you won.

END.
