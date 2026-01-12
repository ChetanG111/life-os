# ANIMATION SYSTEM

Motion is a core identity of this app.  
It must feel:
– premium  
– intentional  
– controlled  
– hardware-grade  

Think iOS system animations.  
Nothing goofy. Nothing flashy.

## EASING

ONLY use:
– ease-out-spring  
– cubic-bezier(0.22, 1, 0.36, 1)  
– physics-based spring curves  

NEVER:
– linear  
– ease-in-out defaults  

---

## TIMING

– Micro interactions: 120–180ms  
– Screen transitions: 280–400ms  
– Modal / sheets: 350–500ms  

Fast but not rushed.

---

## MOTION RULES

Every animation must:
– slightly overshoot  
– settle smoothly  
– respect mass & inertia  

No:
– wobble  
– jelly  
– cartoon bounce  

---

## COMPONENT BEHAVIOR

Buttons:
– press = scale 0.96  
– release = spring back  

Cards:
– hover = lift + shadow  
– tap = compress  

Lists:
– items enter with stagger  
– 40–60ms delay per child  

Sheets / Modals:
– slide from bottom  
– overshoot 3–5%  
– slow settle  

---

## DRAG PHYSICS

– elastic stretch  
– magnetic snap  
– momentum on release  

Feels like:
dragging real objects, not pixels.

---

## SCROLL

– rubber-band edges  
– resistance at bounds  
– momentum scroll  

---

## FEEDBACK

Success:
– soft scale up  
– subtle glow  

Error:
– micro shake (horizontal, 2px max)  
– no aggressive vibrations  

---

# GOLDEN RULE

If the animation feels noticeable, it’s wrong.  
Motion should feel **inevitable**, not decorative.
