# MLC Therapy - Frontend Design & UI/UX Standards

## Core Aesthetic & Typography Standards (Locked & In Memory)
Whenever making changes to UI components or responding to UI/UX screenshots:

1. **Typography (Minimalist, Graceful & Serif-Free — Strict Rule)**:
   - **Headings & Card Titles**: Always use `'Outfit', var(--font-outfit), sans-serif` with balanced `fontWeight="600"` and letterSpacing `"-0.015em"` to `"-0.01em"`.
     - *Why Outfit 600*: Open, soft, geometric curves that feel calm, graceful, and premium—avoids both outdated serifs and overly chunky/blocky tech SaaS weights.
   - **Body, Inputs, Subtitles & Metadata**: Always use `'Inter', var(--font-inter), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`.
   - **NO ITALICS**: Never use italic fonts anywhere (no italic quotes, subheadings, labels, or badges). Everything must be upright, crisp, and clean.
   - **Weights (No Heavy Bolds)**: Never use overly bold `800` or `900` weights. Use:
     - Titles: `600` (or `700` max).
     - Subheadings & Action Text: `600` or `500`.
     - Body & Descriptions: `400` (Regular) or `500` (Medium).
   - **Compact Sizing**:
     - Page H1: `24px`–`26px` (letterSpacing `-0.015em`, color `#263A33`).
     - Section / Card Titles: `15px`–`16px` (`color="#263A33"`, `fontWeight="600"`).
     - Body & Descriptions: `13px`–`13.5px` (`color="#5A6E65"`, line-height `1.5`).
     - Badges / Eyebrow Tags: `10px`–`11px`, `fontWeight="700"`, uppercase, `letterSpacing="0.08em"` to `0.1em`, color `#56756D` or `#718096`.

2. **Copywriting & Terminology**:
   - **Avoid "Sanctuary" Repetition**: Do not repeat "Sanctuary" across multiple adjacent components.
   - Top Bar Breadcrumb: Use `Client Portal / Overview`.
   - Main Hero Title: Use `Your Healing Space` (or `Your Care Space`).
   - Appointment Card Tagline: Use `Virtual 1-on-1 Session` (clean, clinical, accurate).

3. **Toasts, Popups & Floating Alerts (Never Submerged)**:
   - Never use plain white backgrounds for toasts over white cards (they get submerged/invisible).
   - Never use default neon Chakra alert blocks.
   - Use soft, elegant colored wash gradients:
     - Success / Check-in: `bg="linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)"`, border `1px solid rgba(16, 185, 129, 0.35)`.
     - Warning: `bg="linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)"`, border `1px solid rgba(245, 158, 11, 0.3)`.
     - Error: `bg="linear-gradient(135deg, #FEF2F2 0%, #FFF5F5 100%)"`, border `1px solid rgba(239, 68, 68, 0.3)`.
   - Elevated Floating Shadow: `boxShadow="0 14px 34px -4px rgba(6, 78, 59, 0.16), 0 2px 8px rgba(0, 0, 0, 0.04)"`, `backdropFilter="blur(16px)"`, `borderRadius="2xl"`.

4. **Floating Widgets & Status Accents**:
   - Feedback / Suggestion Trigger: Deep Royal Slate Indigo (`#4338CA`, hover `#3730A3`, shadow `0 8px 20px -2px rgba(67, 56, 202, 0.35)`). Distinct from green/cream backgrounds, non-glaring, sophisticated.
   - Primary Dark: `#263A33`
   - Primary Sage: `#56756D`
   - Light Cards / Background: `#FAF8F5`, `#FFFFFF`
   - Hairline Borders: `1px solid rgba(86, 117, 109, 0.14)`

5. **Layout Architecture (7:5 Balanced Bento)**:
   - Avoid 3-over-2 mismatched grids.
   - 2-Column structure (60% clinical care, 40% daily mindful habits).
   - Unify therapist info and session countdown into a single Spotlight card (eliminate duplicate guide cards).
   - Zero heavy black/dark green blocks that fight each other for visual gravity.

6. **Image Standards**:
   - Always depict calm, grounded, peaceful, and smiling subjects in therapy settings. Never show tears, crying, or emotional distress.
   - Ensure daylight images have proper bottom gradient scrims so text remains 100% legible. Never use full-width white fog gradients that bleach out subjects.

7. **Sidebar Active Tab & Navigation Standards (Sleek Rail & Solid Icon Badge — Strict Rule)**:
   - **Compact Sidebar Width**: Always keep the desktop sidebar width slim and proportional at `w="235px"` with `flexShrink={0}` (do NOT use oversized `280px`–`300px` widths that create dead space). Mobile drawer `maxW="260px"`.
   - **Zero Bulge / Identical Dimensions**: Never add outer borders or thick asymmetric border wedges (`borderLeft`) to active items. Both active and inactive tabs must share identical dimensions (`px={2.5}`, `py="7px"`, `borderRadius="10px"`, `border="none"`, `boxShadow="none"`). No width expansion or horizontal bulging.
   - **Active Tab Indicators**:
     - **Background**: Feather-light flat sage tint `bg="rgba(86, 117, 109, 0.08)"` (zero heavy gradient washes, zero outer borders).
     - **Slender Left Rail Pill**: Delicate 3px vertical indicator `<Box position="absolute" left="0" top="50%" transform="translateY(-50%)" w="3px" h="16px" borderRadius="full" bg="#56756D" />`. Absolute positioning ensures zero content shift.
     - **Icon Badge**: Filled with signature brand sage `bg="#56756D"` with crisp white icon `color="white"` and soft micro-elevation `boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"`. Inactive icons remain their themed pastel tint with colored icon.
     - **Text**: Deep slate `#263A33`, `fontWeight="600"`, `fontFamily="'Inter', var(--font-inter), sans-serif"`, `fontSize="13px"`.
     - **No Clutter**: No heavy right dots, no white icon boxes with borders, no hover translation shift.
   - **Path Normalization**: Always strip trailing slashes (`clean = path.replace(/\/+$/, '')`) so active states never fail to highlight.
   - **Brand Header**: Always use `'Outfit', sans-serif` 600 upright for "MLC Portal" and `'Inter', sans-serif` upright for subtext (zero Playfair/italics in the brand mark).

8. **Client Dashboard as Ground Truth Reference (Strict Mandate for All Dashboard UI/UX Changes)**:
   - **Client Dashboard is the Golden Benchmark**: All therapist, admin, and subpage dashboard layouts, spacing, paddings, cards, buttons, modals, and headers must strictly mirror `src/app/(dashboard)/dashboard/client/ClientDashboardOverview.js` and its corresponding subpages automatically without requiring the user to restate it.
   - **Outer Container & Breathing Room**:
     - Always use `<Box maxW="1240px" mx="auto" fontFamily="'Inter', var(--font-inter), sans-serif" pb={12}>`.
     - NEVER add inner horizontal padding (`px`) on the page wrapper since `DashboardLayoutClient.js` already provides `p={{ base: 4, md: 8, lg: 10 }}`. Adding redundant `px` squeezes content into a cramped column.
   - **Hero Banner Architecture**:
     - Always a single unified hero card: `bg="white"`, `p={{ base: 4, md: 5 }}`, `borderRadius="2xl"`, `border="1px solid rgba(86, 117, 109, 0.14)"`, `boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.03)"`, `mb={6}`.
     - Left: Avatar (`size="md"` / `48px` with status dot) + greeting/badges + H1 (`Outfit 600`, `25px`, `-0.015em`) + subtitle (`Inter`, `13px`, `color="#5A6E65"`).
     - Right: Compact Metric Strip (`HStack spacing={3} p={1.5} px={2.5} borderRadius="xl" bg="rgba(250, 248, 245, 0.9)" border="1px solid rgba(86, 117, 109, 0.1)"`) with exactly 3 balanced metric nodes separated by vertical dividers.
     - NEVER add an extra row of separate squashed stat cards between the hero and the bento grid.
   - **Card Standards & Internal Padding**:
     - Primary cards: `bg="white"`, `p={5}`, `borderRadius="2xl"`, `border="1px solid rgba(86, 117, 109, 0.14)"`, `boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"`.
     - Interactive item tiles / action rows: `p={3.5}` or `p={4}`, `borderRadius="xl"`, `bg="rgba(250, 248, 245, 0.85)"`, `border="1px solid rgba(86, 117, 109, 0.1)"`.
     - Avoid nested "box-in-a-box" containers for serene/empty states. Empty states sit directly on the card with `spacing={4}`.
   - **Buttons & Actions**:
     - Primary button: `bg="#56756D"` or `#263A33`, `color="white"`, `borderRadius="full"`, `height="38px"`, `fontSize="13px"`, `fontWeight="600"`, `px={5}`, `boxShadow="0 2px 6px rgba(86, 117, 109, 0.22)"`, `_hover={{ bg: '#263A33', transform: 'translateY(-1px)' }}`.
     - Secondary/Outline button: `variant="outline"`, `borderColor="rgba(86, 117, 109, 0.25)"`, `color="#263A33"`, `borderRadius="full"`, `height="38px"`, `fontSize="12.5px"`, `fontWeight="600"`, `px={4}`, `_hover={{ bg: "rgba(86, 117, 109, 0.06)" }}`.
   - **Grid Layout**:
     - Always `Grid templateColumns={{ base: "1fr", lg: "7fr 5fr" }} gap={6} alignItems="start"`.
     - Column stacks use `<VStack align="stretch" spacing={5}>`.

9. **Dropdown & Select Standards (`ModernSelect` — Strict Rule)**:
   - **NEVER Use Native Chakra/HTML `<Select>`**: Default browser/OS selects create harsh blue blocks, broken styling, and inconsistent OS popups.
   - **Always Use `ModernSelect`** (Menu-based custom dropdown):
     - Built using Chakra's `<Menu placement="bottom-start" matchWidth autoSelect={false}>`.
     - **Trigger Button**:
       - Height: `h="40px"` (standard) or `h="34px"` (compact `size="sm"`).
       - Shape & Border: `borderRadius="xl"`, `border="1px solid"`, `borderColor={isOpen ? "#56756D" : "rgba(86, 117, 109, 0.2)"}`.
       - Background: `bg={isOpen ? "white" : "rgba(250, 248, 245, 0.85)"}`, `_hover={{ bg: "white", borderColor: "#56756D" }}`.
       - Focus Ring: `boxShadow={isOpen ? "0 0 0 1px #56756D" : "none"}`.
       - Typography: `fontFamily="'Inter', sans-serif"`, `fontSize="13px"` (`12px` for sm), `color={hasValue ? "#263A33" : "#718096"}`.
       - Chevron: Right icon `<Icon as={FiChevronDown} />` with smooth 180° rotation when open (`transform={isOpen ? "rotate(180deg)" : "none"}`).
     - **Floating Menu List (`MenuList`)**:
       - Elevation: `boxShadow="0 12px 28px -4px rgba(38, 58, 51, 0.14), 0 2px 8px rgba(0, 0, 0, 0.04)"`.
       - Border: `1px solid rgba(86, 117, 109, 0.15)`, `borderRadius="xl"`, `p={1.5}`.
       - Scrollable: `maxH="240px"`, `overflowY="auto"`, `zIndex={1500}`.
     - **Menu Items (`MenuItem`)**:
       - `borderRadius="lg"`, `px={3}`, `py={2}`, `fontSize="13px"`, `fontFamily="'Inter', sans-serif"`.
       - Active item: `color="#263A33"`, `fontWeight="600"`, `bg="rgba(86, 117, 109, 0.08)"` with right-aligned `<Icon as={FiCheck} color="#56756D" boxSize="13px" />`.
       - Inactive item: `color="#5A6E65"`, `fontWeight="500"`, `bg="transparent"`, `_hover={{ bg: "rgba(86, 117, 109, 0.12)", color: "#263A33" }}`.

10. **Hero Metric Strip & Action Button Architecture (Zero Text Wrapping)**:
   - **Outer Flex Header**:
     ```jsx
     <Flex direction={{ base: 'column', lg: 'row' }} justify="space-between" align={{ base: 'flex-start', lg: 'center' }} gap={4}>
     ```
   - **Right Cluster Container**:
     ```jsx
     <Stack direction={{ base: "column", md: "row" }} spacing={3} align={{ base: "stretch", md: "center" }} w={{ base: "full", lg: "auto" }}>
     ```
   - **Metric Strip Specifications**:
     - Wrapper: `<HStack spacing={{ base: 1.5, sm: 3 }} p={1.5} px={{ base: 2, sm: 2.5 }} borderRadius="xl" bg="rgba(250, 248, 245, 0.9)" border="1px solid rgba(86, 117, 109, 0.1)" w={{ base: "full", md: "auto" }} justify="space-between">`.
     - Nodes: Exactly 3 nodes. Each node must have `<HStack spacing={2} px={{ base: 1.5, sm: 2 }} py={1} minW="max-content" flex="1" justify="center">`.
     - Icon Container: `<Circle size="28px" bg="rgba(86, 117, 109, 0.12)" color="#56756D" flexShrink={0}>`.
     - Labels & Values: MUST include `whiteSpace="nowrap"` on both label (`9.5px`, `700`, uppercase, `color="#718096"`) and value (`13px`–`13.5px`, `700`, `color="#263A33"`).
     - Separators: `<Divider orientation="vertical" h="22px" borderColor="rgba(86, 117, 109, 0.15)" />`.
   - **Action Buttons**:
     - Wrapper: `<HStack spacing={2.5} w={{ base: "full", md: "auto" }} justify={{ base: "flex-start", md: "flex-end" }} flexShrink={0}>`.
     - All buttons must include `whiteSpace="nowrap"` to prevent vertical text stacking.

11. **Form Inputs, Sliders, Checkboxes & Navigation Tabs**:
   - **Text Inputs & Textareas**: `borderRadius="xl"`, `borderColor="rgba(86, 117, 109, 0.2)"`, `bg="white"`, `fontSize="13px"`, `color="#263A33"`, `_focus={{ borderColor: "#56756D", boxShadow: "0 0 0 1px #56756D" }}`.
   - **Form Labels**: `fontSize="12.5px"` or `13px`, `fontWeight="600"`, `color="#263A33"`.
   - **Helper Text**: `fontSize="12px"`, `color="#5A6E65"`, `lineHeight="1.5"`.
   - **Sliders (Therapy Dynamics / Scoring)**:
     - Track: `<SliderTrack bg="rgba(86, 117, 109, 0.2)"><SliderFilledTrack bg="#56756D"/></SliderTrack>`.
     - Thumb: `<SliderThumb borderColor="#56756D" boxShadow="0 2px 4px rgba(38, 58, 51, 0.2)" />`.
   - **Checkboxes**: `colorScheme="teal"` with `<Text fontSize="13px" color="#263A33" fontWeight="500">`.
   - **Pill Tabs**: `variant="unstyled"`, `borderRadius="full"`, `px={4}`, `py={2}`, `fontSize="12.5px"`, `fontWeight="600"`, `border="1px solid rgba(86, 117, 109, 0.16)"`, `color="#5A6E65"`, `bg="white"`, `_selected={{ bg: '#56756D', color: 'white', borderColor: '#56756D', boxShadow: '0 2px 6px rgba(86, 117, 109, 0.22)' }}`.

12. **Admin Dashboard Standards (Groundwork for Admin Modules)**:
   - **Zero Legacy Chakra Tokens**: Never use `colorScheme="blue"`, `colorScheme="teal"`, `gray.50`, `gray.100`, etc.
   - **Data Tables**:
     - Card container: `bg="white"`, `borderRadius="2xl"`, `border="1px solid rgba(86, 117, 109, 0.14)"`, `boxShadow="0 4px 20px -2px rgba(38, 58, 51, 0.04)"`.
     - Table headers: `fontSize="10.5px"`, `fontWeight="700"`, uppercase, `letterSpacing="0.08em"`, `color="#718096"`, `borderBottom="1px solid rgba(86, 117, 109, 0.12)"`.
     - Table rows: `fontSize="13px"`, `color="#263A33"`, `borderBottom="1px solid rgba(86, 117, 109, 0.08)"`, `_hover={{ bg: "rgba(250, 248, 245, 0.6)" }}`.
   - **Filter & Search Bars**:
     - Search input with left icon `<FiSearch />`, `h="38px"`, `borderRadius="xl"`, `fontSize="13px"`.
     - Paired with `ModernSelect` for status, role, and date filters.
   - **Status Badges**:
     - Approved / Active: `bg="rgba(16, 185, 129, 0.12)"`, `color="#059669"`, `fontSize="10.5px"`, `fontWeight="700"`, `borderRadius="full"`, `px={2.5}`, `py={0.5}`.
     - Pending / Review: `bg="rgba(245, 158, 11, 0.12)"`, `color="#D97706"`.
     - Suspended / Flagged / Rejected: `bg="rgba(239, 68, 68, 0.12)"`, `color="#DC2626"`.
     - Draft / Unlisted: `bg="rgba(86, 117, 109, 0.1)"`, `color="#56756D"`.


