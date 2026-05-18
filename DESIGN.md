# ARMEDIA REGISTRATION FORM - DESIGN SYSTEM
This document strictly controls the UI layout and responsiveness. 

## 1. THE GOLDEN RULE (DO NOT TOUCH COLORS)
- NEVER change the existing brand colors, background colors, text colors, or border colors.
- Maintain the original aesthetic identity. Your ONLY job is to fix spacing, padding, layout, and responsiveness.

## 2. RESPONSIVENESS & LAYOUT (MOBILE-FIRST)
- **Base Layout:** The form must be perfectly centered vertically and horizontally on the screen (`min-h-screen flex items-center justify-center`).
- **Form Wrapper:** - Mobile (Default): Width should be `w-full max-w-[92%]` with comfortable padding `p-6`.
  - Desktop: Max width expands gracefully `md:max-w-xl` with generous padding `md:p-10`.
- **Inner Spacing:** Use Flexbox for vertical stacking (`flex flex-col`). The gap between input fields must be consistent and breathable (`gap-5` or `gap-6`).

## 3. COMPONENT STRUCTURE
- **Input Fields:** Ensure all inputs are 100% width (`w-full`). Keep their original colors, just ensure they have consistent height and rounded corners (e.g., `rounded-xl`).
- **Buttons:** Buttons must be full width (`w-full`) with a minimum height for easy tapping on mobile (`min-h-[48px]`). Add a subtle transition (`transition-transform active:scale-95`).
- **Glassmorphism (Optional Layouting):** If a wrapper card exists, ensure it looks elegant with a subtle backdrop blur, ONLY IF it doesn't break the original color scheme.