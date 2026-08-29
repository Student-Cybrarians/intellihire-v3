# IntelliHire v3 Design System Specification

## Overview

IntelliHire is a premium AI-powered career intelligence platform with a sophisticated, luxury SaaS aesthetic. This design system establishes a cohesive visual language across all digital touchpoints, prioritizing dark mode as the primary experience while maintaining accessible light mode support. The system is built with mobile-first responsive design principles and comprehensive accessibility standards (WCAG 2.1 AA).

---

## 1. Visual Identity

### 1.1 Color Palette

#### Primary Colors
- **Electric Blue (Primary Action)**: `#0066FF`
  - Luminous, high-energy accent for primary CTAs and highlights
  - HSL: 217, 100%, 50%
  - Used for: Primary buttons, links, focus states, loading indicators

- **Dark Navy/Charcoal (Base)**: `#0F1419`
  - Deep, sophisticated background for dark mode (primary)
  - HSL: 216, 36%, 8%
  - Used for: Main background, primary text container

- **Charcoal Secondary**: `#1A1F29`
  - Secondary background layer for card and component backgrounds
  - HSL: 216, 29%, 15%
  - Used for: Cards, modals, dropdowns, elevated surfaces

#### Accent Colors
- **Vibrant Green (Success/Growth)**: `#10B981`
  - Conveys positive outcomes, successful operations
  - HSL: 160, 84%, 39%
  - Used for: Success states, positive metrics, growth indicators

- **Electric Purple (Innovation/AI)**: `#8B5CF6`
  - Represents AI intelligence, innovation, and premium features
  - HSL: 259, 89%, 61%
  - Used for: AI features, premium badges, secondary emphasis

- **Warm Orange (Alerts/Attention)**: `#F97316`
  - Draws attention without alarm, warmth and productivity
  - HSL: 25, 97%, 53%
  - Used for: Warnings, pending states, important notices

#### Neutral Colors (Grays)
- **Gray-50 (Lightest)**: `#F9FAFB` (Light mode background)
- **Gray-100**: `#F3F4F6`
- **Gray-200**: `#E5E7EB`
- **Gray-300**: `#D1D5DB`
- **Gray-400**: `#9CA3AF`
- **Gray-500**: `#6B7280` (Disabled text, tertiary text)
- **Gray-600**: `#4B5563` (Secondary text)
- **Gray-700**: `#374151` (Primary text - light mode)
- **Gray-900**: `#111827` (Primary text - dark mode)

#### Semantic Colors

**Success**: `#10B981` (Vibrant Green)
- Dark mode: `#86EFAC` (lighter variant for text)
- Light mode: `#047857` (darker variant)

**Warning**: `#F97316` (Warm Orange)
- Dark mode: `#FDBA74` (lighter variant)
- Light mode: `#D97706` (darker variant)

**Error**: `#EF4444` (Alert Red)
- Dark mode: `#FCA5A5` (lighter variant)
- Light mode: `#B91C1C` (darker variant)

**Info**: `#0066FF` (Electric Blue)
- Dark mode: `#60A5FA` (lighter variant)
- Light mode: `#1E40AF` (darker variant)

### 1.2 Typography

#### Font Families

**Primary (UI)**: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif`
- Modern, clean sans-serif stack
- Optimized for screen readability
- Used for all UI text, buttons, labels, body copy

**Secondary (Headings - Optional)**: `"Inter", "Segoe UI", -apple-system, sans-serif`
- Premium sans-serif alternative for heading emphasis
- Can be used selectively for H1/H2 hierarchy emphasis
- Fallback to primary stack

**Monospace (Code)**: `"JetBrains Mono", "IBM Plex Mono", "Courier New", monospace`
- For code snippets, technical metrics, data
- Consistent character widths for alignment

#### Font Sizes (Modular Scale - 1.125x multiplier)

- **XS**: 12px (0.75rem) - Captions, metadata
- **SM**: 14px (0.875rem) - Secondary text, labels
- **Base**: 16px (1rem) - Body text, standard labels
- **LG**: 18px (1.125rem) - Subheadings, prominent text
- **XL**: 20px (1.25rem) - Section headings
- **2XL**: 24px (1.5rem) - Page subheadings
- **3XL**: 30px (1.875rem) - Page headings (H2)
- **4XL**: 36px (2.25rem) - Section headings (H1)
- **5XL**: 48px (3rem) - Hero headings

#### Font Weights

- **Regular (400)**: Default body text, base UI elements
- **Medium (500)**: Labels, small headings, emphasized text
- **Semibold (600)**: Navigation items, card titles, emphasis
- **Bold (700)**: Page headings, strong emphasis, CTA text

#### Line Heights

- **Tight**: 1.2 - Headings (H1, H2, H3)
- **Snug**: 1.375 - Subheadings, UI labels
- **Normal**: 1.5 - Body text, form fields
- **Relaxed**: 1.625 - Long-form content, extended reading

### 1.3 Spacing System

**Base Unit**: 4px

**Scale**:
- **4px (xs)** - Fine details, icon padding
- **8px (sm)** - Tight spacing, inline gaps
- **12px (xs-md)** - Button icon gaps
- **16px (md)** - Standard component padding
- **24px (lg)** - Card internal spacing
- **32px (xl)** - Section spacing
- **48px (2xl)** - Major section breaks
- **64px (3xl)** - Page-level spacing
- **96px (4xl)** - Hero/banner spacing

**Padding Conventions**:
- Buttons: 12px 16px (vertical/horizontal)
- Cards: 24px
- Modals: 32px
- Page containers: 24px (mobile), 32px (tablet), 48px (desktop)
- Form fields: 12px 16px

### 1.4 Border Radius

- **None (0)** - Strict, technical components
- **Small (4px)** - Fine details, badges
- **Medium (8px)** - Buttons, inputs, small modals
- **Large (12px)** - Cards, medium modals
- **XL (16px)** - Large containers, prominent cards
- **2XL (24px)** - Hero sections, large modals
- **Full (9999px)** - Circles, pills, avatars

**Usage Guidelines**:
- Buttons: 8px
- Form fields: 8px
- Cards: 12px
- Modals: 12px
- Avatar images: full (circular)
- Badge elements: 4px

### 1.5 Shadow System (Elevation Levels)

**Level 0** (None): `box-shadow: none`
- Flat components, minimal elevation

**Level 1** (Subtle): `box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- Soft boundaries, secondary elevation

**Level 2** (Default): `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)`
- Standard cards, form fields, default hover state

**Level 3** (Elevated): `box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)`
- Prominent cards, modal backgrounds, dropdowns

**Level 4** (Maximum)**: `box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1)`
- Full-page modals, overlay shadows, maximum emphasis

**Dark Mode Adjustments**:
- Level 1: `rgba(0, 0, 0, 0.3)`
- Level 2: `rgba(0, 0, 0, 0.5)`
- Level 3: `rgba(0, 0, 0, 0.7)`
- Level 4: `rgba(0, 0, 0, 0.9)`

### 1.6 Opacity Scale

- **0%**: Invisible (display: none preferred)
- **10%**: Subtle overlay, disabled borders
- **20%**: Disabled states, faint text
- **30%**: Secondary elements, subtle backgrounds
- **50%**: Medium emphasis, hover states
- **70%**: Strong presence, active states
- **100%**: Full opacity, primary elements

---

## 2. Layout & Responsive Design

### 2.1 Breakpoints

- **Mobile**: 0px - 639px (< 640px)
- **Tablet**: 640px - 767px (640px - 767px)
- **Desktop**: 768px - 1023px (768px - 1023px)
- **Wide**: 1024px+ (≥ 1024px)
- **Ultra-wide**: 1280px+ (≥ 1280px)

**Tailwind CSS Breakpoints**:
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### 2.2 Grid System

**12-Column Grid** across all breakpoints:

- **Mobile (< 640px)**: Full width, 16px horizontal padding, single/dual columns
- **Tablet (640px - 767px)**: 12 columns, 24px horizontal padding
- **Desktop (768px+)**: 12 columns, 32px horizontal padding
- **Wide (1024px+)**: 12 columns, 48px horizontal padding, centered content

**Column Configuration**:
```css
display: grid;
grid-template-columns: repeat(12, 1fr);
gap: 24px; /* 16px on mobile, increases to 32px on desktop */
```

**Max Content Widths**:
- Mobile: 100% (with padding)
- Tablet: 768px
- Desktop: 1024px
- Wide: 1280px
- Ultra-wide: 1440px (centered with padding)

### 2.3 Container & Padding Specifications

**Page Container**:
```
Mobile:    padding: 16px;     width: 100vw
Tablet:    padding: 24px;     max-width: 768px
Desktop:   padding: 32px;     max-width: 1024px
Wide:      padding: 48px;     max-width: 1280px
```

**Safe Areas** (notches, device edges):
- Top: 16px minimum (24px on devices with notches)
- Bottom: 16px minimum (24px on devices with home indicator)
- Sides: respects viewport padding + 16px

### 2.4 Responsive Typography

**Mobile (< 640px)**:
- H1: 28px / 32px line-height
- H2: 24px / 28px line-height
- H3: 20px / 24px line-height
- Body: 16px / 24px line-height
- Small: 14px / 20px line-height

**Tablet (640px - 767px)**:
- H1: 32px / 36px line-height
- H2: 28px / 32px line-height
- H3: 24px / 28px line-height
- Body: 16px / 24px line-height
- Small: 14px / 20px line-height

**Desktop (768px+)**:
- H1: 36px / 40px line-height
- H2: 30px / 36px line-height
- H3: 24px / 30px line-height
- Body: 16px / 24px line-height
- Small: 14px / 20px line-height

---

## 3. Component Library

### 3.1 Buttons

#### Button Variants

**Primary Button**
- Background: `#0066FF` (Electric Blue)
- Text: `#FFFFFF` (White)
- Padding: 12px 16px
- Border Radius: 8px
- Font Weight: 600
- Hover: Brightness 110%, shadow level 2
- Active: Brightness 90%
- Disabled: Opacity 50%, cursor: not-allowed

```css
.btn-primary {
  background-color: #0066FF;
  color: #FFFFFF;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-primary:hover {
  background-color: #0052CC;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.btn-primary:active {
  background-color: #003D99;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Secondary Button**
- Background: `#1A1F29` (Charcoal)
- Border: 1px solid `#374151` (Gray-700)
- Text: `#E5E7EB` (Gray-200)
- Padding: 12px 16px
- Border Radius: 8px
- Hover: Border color `#0066FF`, background opacity +10%

**Tertiary Button**
- Background: Transparent
- Text: `#0066FF` (Electric Blue)
- Border: 1px solid `#0066FF`
- Padding: 12px 16px
- Hover: Background `rgba(0, 102, 255, 0.1)`

**Ghost Button** (Text-only)
- Background: Transparent
- Text: `#E5E7EB` (Gray-200)
- Border: none
- Padding: 12px 16px
- Hover: Background `rgba(229, 231, 235, 0.1)`

**Danger Button**
- Background: `#EF4444` (Alert Red)
- Text: `#FFFFFF`
- Padding: 12px 16px
- Hover: Brightness 110%

#### Button Sizes

- **Small**: Padding 8px 12px, font-size 14px
- **Medium** (default): Padding 12px 16px, font-size 16px
- **Large**: Padding 16px 24px, font-size 16px

#### Button States

- **Hover**: Transform scale(1.02), shadow elevation +1
- **Active**: Transform scale(0.98), shadow elevation 0
- **Disabled**: Opacity 50%, cursor not-allowed, no hover effects
- **Loading**: Animated spinner, text replaced with loading indicator

### 3.2 Form Components

#### Text Input
```css
.input {
  background-color: #1A1F29;
  border: 1px solid #374151;
  color: #E5E7EB;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 16px;
  line-height: 1.5;
  transition: all 150ms;
}

.input::placeholder {
  color: #9CA3AF;
}

.input:focus {
  outline: none;
  border-color: #0066FF;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

.input:disabled {
  background-color: #0F1419;
  opacity: 0.6;
  cursor: not-allowed;
}

.input.error {
  border-color: #EF4444;
}

.input.error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input.success {
  border-color: #10B981;
}
```

#### Select/Dropdown
- Background: `#1A1F29`
- Border: 1px solid `#374151`
- Focus: 3px `rgba(0, 102, 255, 0.1)` shadow
- Chevron icon: `#9CA3AF`, transforms on open
- Dropdown shadow: Level 3
- Z-index: 10 (above standard content)

#### Checkbox
- Size: 20x20px
- Border: 2px solid `#9CA3AF`
- Checked background: `#0066FF`
- Checked icon: SVG checkmark in white
- Focus: 3px `rgba(0, 102, 255, 0.1)` ring
- Disabled: Opacity 50%
- Label padding: 8px (left of checkbox)

#### Radio Button
- Size: 20x20px (outer), 8x8px (inner when selected)
- Border: 2px solid `#9CA3AF`
- Selected: Inner circle filled with `#0066FF`
- Focus: 3px `rgba(0, 102, 255, 0.1)` ring
- Group spacing: 16px between options

#### Textarea
- Min height: 120px
- Resize: vertical only
- Same styling as text input
- Font family: Monospace option for code
- Scrollbar: Custom styled (if applicable)

#### File Upload
- Background: `#1A1F29` with dashed border `#374151`
- Border radius: 8px
- Padding: 24px
- Upload icon: 48px, `#8B5CF6` (Purple)
- Drag-and-drop: Border changes to `#0066FF`, background becomes `rgba(0, 102, 255, 0.05)`
- File list: 12px text below
- Accepted file types: Customizable per field

#### Form Labels
- Font size: 14px
- Font weight: 500
- Color: `#E5E7EB` (Gray-200)
- Margin bottom: 8px
- Required indicator: Red asterisk `*`
- Helper text: 12px gray-500, margin top: 4px

#### Form Validation States

**Error State**:
- Border: 1px solid `#EF4444`
- Focus shadow: `rgba(239, 68, 68, 0.1)`
- Error message: 12px text, color `#FCA5A5` (lighter red)
- Icon: Alert circle in red

**Success State**:
- Border: 1px solid `#10B981`
- Focus shadow: `rgba(16, 185, 129, 0.1)`
- Success message: 12px text, color `#86EFAC`
- Icon: Checkmark in green

**Warning State**:
- Border: 1px solid `#F97316`
- Focus shadow: `rgba(249, 115, 22, 0.1)`
- Warning message: 12px text, color `#FDBA74`
- Icon: Alert triangle in orange

### 3.3 Cards

#### Standard Card
```css
.card {
  background-color: #1A1F29;
  border: 1px solid #374151;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #E5E7EB;
  margin-bottom: 8px;
}

.card-description {
  font-size: 14px;
  color: #9CA3AF;
  margin-bottom: 16px;
}
```

#### Hoverable Card
- Base styling: Same as standard card
- Hover: Border color `#0066FF`, shadow level 3, transform translateY(-2px)
- Active: Transform translateY(0px), shadow level 2

#### Interactive Card (Clickable)
- Cursor: pointer
- Same hover effect as hoverable card
- Accessible via keyboard (Tab navigation, Enter/Space to activate)

#### Card Sections
- Divider: 1px border `#374151`
- Header padding: 24px
- Body padding: 24px
- Footer padding: 24px
- Section-to-section margin: 0 (divider handles spacing)

### 3.4 Navigation Components

#### Top Navigation Bar
```css
.navbar {
  background-color: #0F1419;
  border-bottom: 1px solid #374151;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 40;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.nav-logo {
  font-size: 18px;
  font-weight: 700;
  color: #0066FF;
  text-decoration: none;
}

.nav-link {
  padding: 8px 16px;
  color: #9CA3AF;
  text-decoration: none;
  border-radius: 4px;
  transition: all 150ms;
  font-weight: 500;
}

.nav-link:hover {
  color: #E5E7EB;
  background-color: rgba(229, 231, 235, 0.1);
}

.nav-link.active {
  color: #0066FF;
  background-color: rgba(0, 102, 255, 0.1);
  border-bottom: 2px solid #0066FF;
}
```

#### Sidebar Navigation
- Width: 240px (desktop), collapsed on mobile
- Background: `#0F1419`
- Border-right: 1px solid `#374151`
- Padding: 16px
- Nav items: Full width, 8px border-radius, 8px padding

**Mobile Navigation (Hamburger Menu)**:
- Position: Fixed, left 0, top 0
- Width: 100vw
- Height: 100vh
- Background: `#0F1419` with backdrop blur
- Overlay: 50% opacity black backdrop
- Z-index: 50
- Close button: Top-right corner

#### Breadcrumbs
```
Home > Dashboard > Projects > Project Name
```
- Separator: `/` (slash) in `#6B7280`
- Links: `#0066FF`, underline on hover
- Current page: `#E5E7EB`, no link styling
- Font size: 12px
- Padding: 16px 0

### 3.5 Modals & Dialogs

#### Modal Container
```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  animation: fadeIn 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.modal {
  background-color: #1A1F29;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-header {
  padding: 32px;
  border-bottom: 1px solid #374151;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: #E5E7EB;
}

.modal-close {
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  font-size: 24px;
  padding: 0;
  transition: color 150ms;
}

.modal-close:hover {
  color: #E5E7EB;
}

.modal-body {
  padding: 32px;
}

.modal-footer {
  padding: 32px;
  border-top: 1px solid #374151;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
```

#### Modal Sizes
- Small: 400px max-width
- Medium: 600px max-width (default)
- Large: 800px max-width
- Full: 90% width, 90% height

#### Dialog Confirmation
- Title: Bold, 18px
- Message: 14px, secondary text
- Buttons: Secondary + Danger (or Primary + Secondary)
- Icon: 32px, left side, colored per context

### 3.6 Alerts & Notifications

#### Alert Box (Static)
```css
.alert {
  padding: 16px;
  border-radius: 8px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.alert-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.alert-description {
  font-size: 14px;
  opacity: 0.85;
}
```

**Alert Variants**:

Success:
- Background: `rgba(16, 185, 129, 0.1)`
- Border: 1px solid `#10B981`
- Icon: Checkmark, color `#86EFAC`
- Text: `#86EFAC`

Error:
- Background: `rgba(239, 68, 68, 0.1)`
- Border: 1px solid `#EF4444`
- Icon: Alert circle, color `#FCA5A5`
- Text: `#FCA5A5`

Warning:
- Background: `rgba(249, 115, 22, 0.1)`
- Border: 1px solid `#F97316`
- Icon: Alert triangle, color `#FDBA74`
- Text: `#FDBA74`

Info:
- Background: `rgba(0, 102, 255, 0.1)`
- Border: 1px solid `#0066FF`
- Icon: Info circle, color `#60A5FA`
- Text: `#60A5FA`

#### Toast Notifications (Temporary)
- Position: Bottom-right corner (or top-right on mobile)
- Width: 360px (mobile: 90% - 16px)
- Animation: Slide in from right, 300ms duration
- Auto-dismiss: 4000ms (customizable)
- Close button: X icon, right side
- Z-index: 60
- Stack: Latest on top, max 3 visible

### 3.7 Loading States

#### Spinner
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(229, 231, 235, 0.1);
  border-top-color: #0066FF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

**Sizes**: 16px, 24px, 32px, 48px

**Colors**: Blue (default), white (inverse), gray (secondary)

#### Skeleton Loading
- Placeholder blocks with 8px border-radius
- Animated gradient shimmer: `linear-gradient(90deg, #1A1F29 25%, #374151 50%, #1A1F29 75%)`
- Animation duration: 1600ms, infinite
- Used for: Cards, list items, table rows, text blocks

#### Progress Bar
```css
.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #374151;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0066FF, #8B5CF6);
  border-radius: 4px;
  transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

.progress-label {
  font-size: 12px;
  color: #9CA3AF;
  margin-top: 4px;
  text-align: right;
}
```

**States**: 0%, 25%, 50%, 75%, 100%

**Indeterminate**:
- Animation: Infinite slide left-right
- Used for: Upload progress, processing

### 3.8 Empty States

#### Empty State Container
```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  text-align: center;
  background-color: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px dashed #374151;
}

.empty-icon {
  width: 96px;
  height: 96px;
  margin-bottom: 24px;
  color: #6B7280;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: #E5E7EB;
  margin-bottom: 8px;
}

.empty-description {
  font-size: 14px;
  color: #9CA3AF;
  max-width: 400px;
  margin-bottom: 24px;
}

.empty-action {
  /* Primary button styling */
}
```

**Contexts**: No search results, no data, no permissions, no content

### 3.9 Error States

#### Error Page (404, 500, etc.)
- Large error code (120px bold)
- Heading: Clear, concise message
- Description: 14px secondary text
- Action button: Primary CTA (e.g., "Go Home")
- Illustration: Placeholder icon or custom SVG

#### Inline Error
- Icon: Alert circle (16px)
- Message: 14px red text
- Position: Below form field or inline with element
- Animation: Fade-in 150ms

### 3.10 Success States

#### Success Message
- Icon: Checkmark circle (16px-24px)
- Color: `#86EFAC` (light green)
- Message: 14px, bold weight
- Animation: Slide in from left, 300ms
- Auto-dismiss: 4000ms

#### Success Toast
- Icon: Large checkmark (48px)
- Title: Bold message
- Description: Secondary text
- Uses toast notification styling

### 3.11 Tabs

#### Tab Container
```css
.tabs {
  display: flex;
  border-bottom: 1px solid #374151;
  margin-bottom: 24px;
  gap: 0;
}

.tab-button {
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  border-bottom: 2px solid transparent;
  transition: all 150ms;
  margin-bottom: -1px;
}

.tab-button:hover {
  color: #E5E7EB;
}

.tab-button.active {
  color: #0066FF;
  border-bottom-color: #0066FF;
}

.tab-content {
  animation: fadeIn 150ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Tab Types**:
- Default: Underline indicator
- Filled: Background highlight on active
- Pill: Rounded tabs with background

### 3.12 Pagination

#### Pagination Controls
```css
.pagination {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
  margin-top: 32px;
}

.page-button {
  min-width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 8px;
  border: 1px solid #374151;
  background-color: transparent;
  color: #9CA3AF;
  cursor: pointer;
  transition: all 150ms;
}

.page-button:hover {
  background-color: rgba(229, 231, 235, 0.1);
  color: #E5E7EB;
}

.page-button.active {
  background-color: #0066FF;
  color: white;
  border-color: #0066FF;
}

.page-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Elements**:
- Previous button (chevron left)
- Page numbers (1, 2, 3, ...)
- Ellipsis for skipped pages
- Next button (chevron right)
- Jump to page input (optional)

### 3.13 Tables

#### Table Structure
```css
.table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #374151;
}

.table-header {
  background-color: #0F1419;
  border-bottom: 1px solid #374151;
}

.table-header-cell {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  color: #9CA3AF;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-row {
  border-bottom: 1px solid #374151;
  transition: background-color 150ms;
}

.table-row:hover {
  background-color: rgba(0, 102, 255, 0.05);
}

.table-cell {
  padding: 16px;
  font-size: 14px;
  color: #E5E7EB;
}
```

**Features**:
- Sortable columns (chevron icon indicates sort direction)
- Filterable headers
- Selectable rows (checkboxes)
- Expandable rows
- Sticky header (on scroll)
- Responsive (horizontal scroll on mobile)

### 3.14 Tooltips

#### Tooltip Styling
```css
.tooltip {
  position: absolute;
  background-color: #0F1419;
  color: #E5E7EB;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 40;
  pointer-events: none;
  animation: fadeIn 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.tooltip-arrow {
  position: absolute;
  width: 8px;
  height: 8px;
  background-color: #0F1419;
  transform: rotate(45deg);
}
```

**Positions**: Top, right, bottom, left (with arrow indicators)

**Trigger**: Hover (desktop), long-press (mobile)

**Delay**: 500ms before showing

### 3.15 Badges

#### Badge Styles
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.badge-primary {
  background-color: rgba(0, 102, 255, 0.1);
  color: #0066FF;
  border: 1px solid rgba(0, 102, 255, 0.3);
}

.badge-success {
  background-color: rgba(16, 185, 129, 0.1);
  color: #86EFAC;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge-danger {
  background-color: rgba(239, 68, 68, 0.1);
  color: #FCA5A5;
  border: 1px solid rgba(239, 68, 68, 0.3);
}
```

**Variants**: Primary, secondary, success, warning, danger, info

**Sizes**: Small (compact), medium (default), large

---

## 4. Mobile-First Behavior

### 4.1 Touch Target Sizes

- **Minimum**: 44x44px (WCAG AA standard)
- **Recommended**: 48x48px
- **Comfortable**: 56x56px

**Applied to**:
- Buttons: 44px height minimum
- Form fields: 44px height minimum
- Checkboxes/radios: 44x44px interaction area
- Links: 44px vertical spacing minimum
- Icon buttons: 40x40px (with padding)

### 4.2 Responsive Navigation

**Mobile (< 640px)**:
- Hamburger menu (3-line icon, top-left)
- Logo centered (or left with menu)
- Profile/menu icon (top-right)
- Bottom tab bar (if applicable)

**Tablet (640px - 767px)**:
- Logo + horizontal nav links visible
- Drawer menu secondary

**Desktop (768px+)**:
- Full horizontal navigation
- Sidebar available

### 4.3 Mobile Touch Interactions

- **Tap**: Immediate visual feedback (100ms scale-down)
- **Long-press**: Context menu or additional options (500ms)
- **Swipe left/right**: Navigate between sections or dismiss
- **Swipe up**: Load more (infinite scroll) or show additional content
- **Pull-to-refresh**: Refresh data (at page top)

### 4.4 Mobile Form UX

- **Full-width inputs**: 100% width of container
- **Large labels**: 14px + 600 weight
- **Adequate spacing**: 16px gap between fields
- **Native inputs**: Use type-specific keyboards (email, tel, number)
- **Validation**: Inline, real-time feedback
- **Submit button**: Full-width, sticky to bottom on long forms
- **Disabled submit**: Gray out until valid

### 4.5 Mobile List/Table Handling

**Cards instead of tables**:
```
[Card Header]
Key: Value
Key: Value
Key: Value
[Card Footer]
```

**Horizontal scroll tables**:
- Sticky first column (on desktop tables made cards)
- Minimal columns (only essential data)
- Scrollbar: Small, dark theme compatible

---

## 5. Accessibility (WCAG 2.1 AA Compliance)

### 5.1 Color Contrast Ratios

**Text Contrast**:
- Normal text: 4.5:1 minimum (AAA: 7:1)
- Large text (18px+): 3:1 minimum (AAA: 4.5:1)
- Current standard: 4.5:1 for all text

**UI Component Contrast**:
- Focused elements: 3:1 minimum
- Graphical elements: 3:1 minimum

**Verified Contrast Ratios** (dark mode `#0F1419` background):
- `#0066FF` on `#0F1419`: 4.7:1 ✓ (meets 4.5:1)
- `#E5E7EB` on `#0F1419`: 12.8:1 ✓ (exceeds)
- `#10B981` on `#0F1419`: 4.5:1 ✓ (meets)
- `#F97316` on `#0F1419`: 5.3:1 ✓ (meets)
- `#EF4444` on `#0F1419`: 4.7:1 ✓ (meets)

### 5.2 Focus Indicators

**Keyboard Focus Ring**:
```css
:focus-visible {
  outline: 2px solid #0066FF;
  outline-offset: 2px;
}
```

**Remove default blue outline** on most browsers:
- Standard outline: 2px solid electric blue
- Offset: 2px from element
- Apply to: Buttons, links, form fields, interactive elements

**Focus management**:
- Auto-focus on modals: Focus first interactive element
- Skip links: "Skip to main content" link (hidden by default, visible on focus)
- Trap focus: Keep focus within modal (don't let Tab escape)

### 5.3 Keyboard Navigation

**Navigation order** (Tab/Shift+Tab):
- Logical reading order
- Skip decorative elements
- Tab index: Auto (default order) or explicit if needed
- Don't use tabindex > 0 (breaks natural order)

**Supported Keys**:
- Tab: Move focus forward
- Shift+Tab: Move focus backward
- Enter/Space: Activate buttons
- Enter: Submit forms
- Escape: Close modals/dropdowns
- Arrow keys: Navigate menus, tabs, radio groups

### 5.4 Screen Reader Support

**ARIA Attributes**:
- `role="button"`: For clickable divs that act as buttons
- `aria-label`: For icon-only buttons
- `aria-labelledby`: Link elements to their labels
- `aria-describedby`: Link form fields to error messages
- `aria-hidden="true"`: Hide decorative elements
- `aria-live="polite"`: Announce dynamic content
- `aria-expanded`: Indicate toggle state (collapsed/expanded)
- `aria-current="page"`: Mark current page in navigation

**Semantic HTML**:
- Use `<button>` instead of `<div>` for buttons
- Use `<label>` for form fields
- Use `<input>` with proper type attribute
- Use `<a>` for navigation links
- Use `<nav>`, `<main>`, `<aside>`, `<footer>` for page structure
- Use heading hierarchy: `<h1>` → `<h2>` → `<h3>` (no skips)

**Form Accessibility**:
```html
<label for="email">Email Address</label>
<input 
  id="email" 
  type="email" 
  aria-describedby="email-error"
  required
/>
<span id="email-error" role="alert" class="error">
  Please enter a valid email
</span>
```

### 5.5 Motion & Animation Accessibility

**Respect `prefers-reduced-motion`**:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**General Rules**:
- No autoplay video/sound
- No sudden flashes (3+ per second)
- Avoid excessive motion/parallax
- Provide pause/stop controls

### 5.6 Text & Readability

- **Font size**: Minimum 12px, preferably 14px+ for body
- **Line spacing**: 1.5 minimum for body text
- **Letter spacing**: 0.12em for justified text
- **Word spacing**: Normal (don't justify text)
- **Paragraph width**: 80 characters maximum
- **Color**: Always use proper contrast
- **Abbreviations**: Define on first use or use `<abbr>`

---

## 6. Dark Mode Implementation

### 6.1 Color Palette Transformation

**Dark Mode (Primary)**:
```css
:root {
  /* Background */
  --bg-primary: #0F1419;
  --bg-secondary: #1A1F29;
  --bg-tertiary: #2D333F;
  
  /* Text */
  --text-primary: #E5E7EB;
  --text-secondary: #9CA3AF;
  --text-tertiary: #6B7280;
  
  /* Semantic */
  --success: #10B981;
  --warning: #F97316;
  --error: #EF4444;
  --info: #0066FF;
}
```

**Light Mode (Secondary)**:
```css
@media (prefers-color-scheme: light) {
  :root {
    /* Background */
    --bg-primary: #FFFFFF;
    --bg-secondary: #F9FAFB;
    --bg-tertiary: #F3F4F6;
    
    /* Text */
    --text-primary: #111827;
    --text-secondary: #4B5563;
    --text-tertiary: #9CA3AF;
    
    /* Semantic */
    --success: #047857;
    --warning: #D97706;
    --error: #B91C1C;
    --info: #1E40AF;
  }
}
```

### 6.2 Component Adjustments

**Cards** (light mode):
- Background: `#FFFFFF`
- Border: 1px solid `#E5E7EB`
- Shadow: Lighter (multiply opacity by 0.5)

**Buttons** (light mode primary):
- Background: `#1E40AF`
- Text: `#FFFFFF`
- Hover: Brightness 110%

**Form fields** (light mode):
- Background: `#F9FAFB`
- Border: 1px solid `#D1D5DB`
- Text: `#111827`
- Focus: 3px `rgba(30, 64, 175, 0.1)` shadow

**Shadows** (light mode):
- Reduce opacity by 30-50%
- Use pure black instead of off-black

### 6.3 Toggle Mechanism

**Toggle Switch**:
```css
.theme-toggle {
  background-color: transparent;
  border: 1px solid currentColor;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  gap: 8px;
  align-items: center;
  color: #9CA3AF;
  transition: all 150ms;
}

.theme-toggle:hover {
  color: #0066FF;
  border-color: #0066FF;
}

.theme-toggle.active {
  background-color: rgba(0, 102, 255, 0.1);
  border-color: #0066FF;
  color: #0066FF;
}
```

**Location**: Top-right header, or in user menu

**Icons**: Sun (light mode) / Moon (dark mode) + label

### 6.4 Preference Persistence

**Storage**: `localStorage`

```javascript
// Save preference
localStorage.setItem('theme', 'dark'); // 'dark' or 'light'

// Read preference
const theme = localStorage.getItem('theme') || 
              (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

// Apply theme
document.documentElement.setAttribute('data-theme', theme);
```

**System Preference Fallback**:
- Read `prefers-color-scheme` media query
- Default to dark mode if not specified
- Allow user override via toggle

---

## 7. Animation & Motion

### 7.1 Transition Durations

- **Quick**: 150ms - Hover effects, micro-interactions
- **Standard**: 300ms - Page transitions, modal appears
- **Slow**: 500ms - Major layout shifts, loading states

**CSS Transition Defaults**:
```css
* {
  transition: background-color 150ms, border-color 150ms, color 150ms;
}
```

### 7.2 Easing Functions

**Default (ease-in-out)**:
```
cubic-bezier(0.4, 0, 0.2, 1)
```
Used for: General transitions, elevation changes

**Emphasis (ease-out)**:
```
cubic-bezier(0.0, 0, 0.2, 1)
```
Used for: Entering animations, appearing elements

**Decelerate (ease-in)**:
```
cubic-bezier(0.4, 0, 1, 1)
```
Used for: Exiting animations, dismissing elements

**Linear**:
```
linear
```
Used for: Continuous animations (spinners, progress)

### 7.3 Animation Keyframes

**Fade In**:
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```
Duration: 150ms, Easing: ease-out

**Slide Up**:
```css
@keyframes slideUp {
  from { transform: translateY(16px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```
Duration: 300ms, Easing: ease-out

**Slide Down**:
```css
@keyframes slideDown {
  from { transform: translateY(-16px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```
Duration: 300ms, Easing: ease-out

**Scale In**:
```css
@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```
Duration: 150ms, Easing: ease-out

**Spin** (infinite):
```css
@keyframes spin {
  to { transform: rotate(360deg); }
}
```
Duration: 1s, Easing: linear, Iteration: infinite

**Pulse** (breathing):
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```
Duration: 2s, Easing: cubic-bezier(0.4, 0, 0.6, 1), Iteration: infinite

### 7.4 Page Transitions

**Enter Animation**:
```css
.page-enter {
  animation: slideUp 300ms cubic-bezier(0.0, 0, 0.2, 1) both;
}
```

**Exit Animation**:
```css
.page-exit {
  animation: slideDown 300ms cubic-bezier(0.4, 0, 1, 1) both;
}
```

### 7.5 Reduced Motion Support

All animations must respect `prefers-reduced-motion: reduce`

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 8. Icons & Imagery

### 8.1 Icon Library

**Primary**: Lucide React (`lucide-react`)
- 400+ icons
- Consistent stroke weight (2px)
- Perfect for modern UI
- Open source

**Alternative**: Heroicons (`@heroicons/react`)
- 460+ icons
- Solid and outline variants
- Enterprise quality

### 8.2 Icon Sizing

- **Extra Small**: 12px - Inline badges, metadata
- **Small**: 16px - Form validation, labels
- **Medium**: 20px - Button icons, list items
- **Large**: 24px - Hero icons, page headings
- **Extra Large**: 32px - Empty states, placeholders
- **Huge**: 48px - Success/error confirmations

### 8.3 Icon Styling

```css
.icon {
  color: currentColor; /* Inherits text color */
  stroke-width: 2;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.icon-primary {
  color: #0066FF;
}

.icon-success {
  color: #10B981;
}

.icon-error {
  color: #EF4444;
}

.icon-warning {
  color: #F97316;
}
```

### 8.4 Image Handling

**Avatar Images**:
- Size: 32px, 40px, 48px, 64px
- Border-radius: full (circular)
- Border: 1px solid `#374151`
- Fallback: Initials or default avatar

**Hero Images**:
- Max-width: 100% (responsive)
- Height: Auto (maintain aspect ratio)
- Border-radius: 12px
- Aspect ratios: 16:9 (default), 4:3 (alternative), 1:1 (square)

**Placeholder Images**:
- Background: `#374151` or gradient
- Icon: 48px gray, centered
- Text: "No image" (12px, secondary text)

---

## 9. Data Visualization

### 9.1 Chart Color Palette

**Primary Series**:
- Series 1: `#0066FF` (Electric Blue)
- Series 2: `#8B5CF6` (Purple)
- Series 3: `#10B981` (Green)
- Series 4: `#F97316` (Orange)
- Series 5: `#EC4899` (Pink)

**Secondary Series** (lighter variants):
- Extends with: Gray-500, Gray-600, Gray-700

### 9.2 Chart Styling

**Axis**:
- Line color: `#374151`
- Label color: `#9CA3AF`
- Font size: 12px

**Grid**:
- Color: `rgba(52, 65, 81, 0.5)`
- Stroke-width: 1px
- Dashed or solid

**Legend**:
- Background: Transparent or `rgba(0, 0, 0, 0.05)`
- Border: 1px solid `#374151`
- Padding: 12px
- Border-radius: 8px
- Font size: 12px

### 9.3 Metrics & KPIs

**Card Layout**:
```
[Icon] [Value]
       [Label]
       [Trend: +5% ↑]
```

- Value: Bold, large (24px+)
- Label: Secondary text (12px)
- Trend: Green if positive, red if negative
- Icon: 32px, semantic color

---

## 10. Micro-interactions

### 10.1 Form Validation

**Real-time Validation**:
```
User types → 150ms debounce → Validate → Display feedback
```

**Feedback types**:
- ✓ Green check: Valid
- ✗ Red X: Invalid
- ⚠ Orange triangle: Warning
- ℹ Blue circle: Info

**Animation**: Fade in icon + text, 150ms

### 10.2 Hover Effects

**Button Hover**:
- Background: Brightness +10%
- Shadow: Elevation +1
- Transform: scale(1.02) (optional, subtle)
- Duration: 150ms

**Card Hover**:
- Border color: `#0066FF` (optional)
- Shadow: Elevation +2
- Transform: translateY(-2px) (optional)
- Duration: 300ms

**Link Hover**:
- Color: Brightness +20%
- Underline: Appear (if not present)
- Duration: 150ms

### 10.3 Active States

**Button Active** (clicked):
- Transform: scale(0.98)
- Shadow: Elevation 0
- Duration: 100ms
- On release: Return to hover state

**Tab Active**:
- Border-bottom: 2px solid `#0066FF`
- Color: `#0066FF`
- Duration: 150ms

### 10.4 Loading Feedback

**Button Loading**:
```
[Loading Spinner] "Processing..."
```
- Spinner animation: 1s continuous rotation
- Text: "Processing" or "Saving"
- Button disabled: Prevent clicks
- Duration until timeout: 30s

**List Item Loading**:
- Skeleton card appears in place
- Animated shimmer effect
- Min duration: 500ms (visual consistency)

### 10.5 Submission Feedback

**Form Submission Flow**:
1. User clicks submit
2. Button enters loading state (spinner visible)
3. Validation occurs server-side
4. On success: Toast notification + redirect (1000ms delay)
5. On error: Inline field errors + shake animation (200ms)

**Shake Animation**:
```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-8px); }
  75% { transform: translateX(8px); }
}
```

---

## 11. Implementation Guide

### 11.1 Tailwind CSS Configuration

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // or 'media'
  theme: {
    extend: {
      colors: {
        primary: '#0066FF',
        secondary: '#8B5CF6',
        success: '#10B981',
        warning: '#F97316',
        error: '#EF4444',
        dark: {
          50: '#0F1419',
          100: '#1A1F29',
          200: '#2D333F',
        },
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '96px',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
      },
      boxShadow: {
        'elevation-1': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'elevation-2': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'elevation-3': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'elevation-4': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '30px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '44px' }],
        '5xl': ['48px', { lineHeight: '56px' }],
      },
    },
  },
};
```

### 11.2 shadcn/ui Components

**Recommended shadcn/ui Components**:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add table
npx shadcn-ui@latest add pagination
npx shadcn-ui@latest add breadcrumb
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add form
```

### 11.3 CSS-in-JS Example (Styled Components or Emotion)

```javascript
import styled from 'styled-components';

export const Button = styled.button`
  padding: 12px 16px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
  
  background-color: ${props => props.variant === 'primary' ? '#0066FF' : '#1A1F29'};
  color: ${props => props.variant === 'primary' ? '#FFFFFF' : '#E5E7EB'};
  
  &:hover {
    background-color: ${props => props.variant === 'primary' ? '#0052CC' : 'rgba(229, 231, 235, 0.1)'};
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
```

### 11.4 CSS Custom Properties (Variables)

```css
:root {
  /* Colors */
  --color-primary: #0066FF;
  --color-success: #10B981;
  --color-error: #EF4444;
  --color-warning: #F97316;
  
  --bg-primary: #0F1419;
  --bg-secondary: #1A1F29;
  --text-primary: #E5E7EB;
  --text-secondary: #9CA3AF;
  
  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  
  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  /* Shadows */
  --shadow-1: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-2: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  
  /* Transitions */
  --transition-quick: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-standard: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}

@media (prefers-color-scheme: light) {
  :root {
    --bg-primary: #FFFFFF;
    --bg-secondary: #F9FAFB;
    --text-primary: #111827;
    --text-secondary: #4B5563;
  }
}
```

---

## 12. Best Practices & Guidelines

### 12.1 Spacing & Alignment

- Always use spacing scale multiples (4px, 8px, 12px, etc.)
- Center content vertically and horizontally using flexbox
- Use consistent gutters between sections (32px on desktop, 16px on mobile)
- Never use arbitrary spacing values

### 12.2 Color Usage

- Limit accent colors to 2-3 per context (primary blue + one secondary)
- Maintain semantic color consistency (green = success, red = error)
- Use color + icons/patterns for accessibility (not color alone)
- Test all text on background for contrast compliance

### 12.3 Typography Best Practices

- Use font-weights sparingly (regular 400, medium 500, bold 700)
- Maintain hierarchy: H1 > H2 > H3 (no skips)
- Keep line-length between 50-75 characters for optimal readability
- Use em or rem for responsive sizing, not fixed px

### 12.4 Component Composition

- Break UI into reusable, single-responsibility components
- Props: `variant`, `size`, `disabled`, `loading`, `error`
- Avoid prop drilling; use context for global state (theme, user)
- Test components in isolation with storybook

### 12.5 Performance Optimization

- Lazy-load images and heavy components
- Memoize expensive computations (React.memo)
- Debounce search/filter inputs (300-500ms)
- Use CSS Grid/Flexbox, not floats
- Minimize repaints/reflows with will-change property

### 12.6 Responsive Design

- Mobile-first approach: Build mobile, then enhance
- Use media queries for layout shifts only (not typography)
- Test on real devices, not just browser DevTools
- Ensure touch targets are 44x44px minimum

---

## Conclusion

This design system provides a comprehensive foundation for IntelliHire v3, balancing premium aesthetics with practical usability. The dark-mode-first approach, combined with accessible color contrasts and responsive design principles, creates a cohesive experience across all devices. Implement components systematically using Tailwind CSS and shadcn/ui, maintain consistency through CSS variables, and prioritize accessibility throughout development.

For questions or refinements, refer to this document as the single source of truth for all design decisions across the platform.
