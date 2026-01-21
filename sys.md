5-Item Sliding Navigation Bar (High Contrast) Design System: "Solid/Flat" (No Glassmorphism) Core Logic: 

Change the 5 buttons in the quick add modal to select different types of saves with this animation and layout described here

1. Structure & Layout

Container: A horizontal navigation bar containing 5 equal-width items.

Background: Deep Black (#050505).

Padding: Small internal padding to create a gap between the active indicator and the container edge.

Items (Left to Right):

Task (Icon: Circle with checkmark)

Note (Icon: Hashtag/Pound sign)

Idea (Icon: Sparkles/Stars)

Goal (Icon: Upward arrow)

Identity (Icon: User profile outline)

Typography: Sans-serif, bold weight, centered below the icon.

2. The Sliding Active Indicator (The "Video" Animation)

Appearance: A solid, opaque White (#FFFFFF) rounded square (Squircle).

Behavior: Instead of the buttons being separate entities, use a single background "cursor" (the white square) that physically slides behind the text/icons to the selected position.

Physics:

Use Spring Physics (High stiffness, medium damping).

Stretch/Jelly Effect: As the white square travels from "Task" to "Identity" (or any distance), it should stretch horizontally (width > 100%) and shrink vertically slightly during the movement, snapping back to a perfect square upon stopping.

3. Color Palette & State Logic

Active State (The Selected Item):

Background: White (#FFFFFF).

Icon & Text Color: Black (#000000).

Inactive State (Unselected Items):

Background: Transparent (showing the Black container).

Icon & Text Color: Dark Gray (#666666 or #888888).

The Transition:

Use mix-blend-mode or conditional coloring so that as the white square slides under an icon, the icon flips from Gray to Black immediately (or smoothly cross-fades).

4. Interaction Details

Trigger: On click.

Hover Effect: When hovering over an inactive item, lighten the gray text slightly (e.g., to #AAAAAA), but do not move the white indicator until clicked.