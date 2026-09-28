# MLC Therapy - Frontend Design & UI/UX Standards

## Core Aesthetic & Typography Rules
Whenever making changes to UI components or responding to UI/UX screenshots:
1. **Typography**:
   - **Headings & Titles**: Always use `'Playfair Display', var(--font-playfair), Georgia, serif`.
     - Sizes: Page H1 `28px`–`40px`, Section/Modal titles `22px`–`28px`, Card titles `15px`–`18px`.
     - Weight: `600` or `500`. Primary color: `#263A33` (deep forest green).
   - **Subheadings & Accents**: `'Playfair Display'`, italic, `13.5px`–`15px`, color `#56756D`.
   - **Body Text**: `'Inter', var(--font-inter), sans-serif`, `13.5px`–`14.5px`, color `#4A5568` or `#5A6E65`, line-height `1.5`–`1.6`. Never use bloated 18px+ text for standard content.
   - **Badges / Eyebrow Tags**: `10px`–`11px`, `fontWeight="700"`, uppercase, `letterSpacing="0.1em"` to `0.15em`, color `#56756D`.

2. **Proportions & Spacing (Prevent Oversized Elements & Scroll Overflow)**:
   - Avoid oversized clamp sizes, bloated padding (`p={8}`–`p={12}`), and huge vertical margins (`mb={12}`).
   - Modals and panels must fit cleanly on standard laptop viewports without triggering awkward internal scrollbars.
   - Use compact, balanced card padding (`p={4}` to `p={5}`).
   - Action buttons: height `38px`–`44px`, `borderRadius="full"` (pill-shaped), font size `13px`–`14px`, bg `#56756D`, hover `#263A33`.

3. **Color Tokens**:
   - Primary Dark: `#263A33`
   - Primary Sage: `#56756D`
   - Accent Mint/Soft Sage: `rgba(169, 203, 183, 0.08)` to `0.15`
   - Subtle Border: `rgba(169, 203, 183, 0.2)` or `rgba(86, 117, 109, 0.15)`
   - Light Cards / Warm Background: `#FAF8F5`, `#F7FAF8`, `#F4F7F5`

4. **Screenshot Handling**:
   - When the user sends a screenshot of any page or dashboard, automatically apply these exact typography, sizing, and spacing standards to all elements shown.
