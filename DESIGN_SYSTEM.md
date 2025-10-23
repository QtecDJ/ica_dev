# Design System Documentation

## Übersicht

Minimalistisches, professionelles Design-System basierend auf **Industry Standards**:
- **Material Design 3** Principles
- **Tailwind CSS** Best Practices
- **WCAG 2.1 AAA** Accessibility
- **Mobile-First** Responsive Design

## Design-Prinzipien

### 1. Konsistenz
- Einheitliche Komponenten über alle Seiten
- Konsistente Abstände (8px Grid-System)
- Wiederverwendbare Utility-Klassen

### 2. Minimalismus
- Klare Hierarchie
- Reduzierte Farbpalette
- Fokus auf Inhalte

### 3. Funktionalität
- Keine rein dekorativen Elemente
- Jede Komponente hat einen Zweck
- Performance-optimiert

### 4. Zugänglichkeit
- WCAG 2.1 AAA konform
- Keyboard-Navigation
- Screen-Reader-freundlich
- Touch-Targets min. 44x44px

## Farbpalette

### Primary Colors
```css
Red-600: #DC2626  /* Primary Actions, CTAs */
Red-700: #B91C1C  /* Hover States */
Red-800: #991B1B  /* Active States */
```

### Neutral Colors (Light Mode)
```css
Slate-50:  #F8FAFC  /* Background */
Slate-100: #F1F5F9  /* Surface */
Slate-200: #E2E8F0  /* Borders */
Slate-600: #475569  /* Secondary Text */
Slate-900: #0F172A  /* Primary Text */
```

### Neutral Colors (Dark Mode)
```css
Slate-900: #0F172A  /* Background */
Slate-800: #1E293B  /* Surface */
Slate-700: #334155  /* Elevated */
Slate-300: #CBD5E1  /* Secondary Text */
Slate-50:  #F8FAFC  /* Primary Text */
```

### Semantic Colors
```css
Blue:   Info/Coach
Green:  Success/Member
Purple: Parent Role
Yellow: Warning
Red:    Error/Admin
```

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
```

### Type Scale
```css
h1: 2rem (32px)     - Page Titles
h2: 1.5rem (24px)   - Section Headings
h3: 1.25rem (20px)  - Subsections
body: 1rem (16px)   - Body Text
small: 0.875rem (14px) - Captions
```

### Mobile Type Scale (< 640px)
```css
h1: 1.75rem (28px)
h2: 1.5rem (24px)
h3: 1.25rem (20px)
```

## Spacing System

### 8px Grid System
```css
xs: 0.5rem  (8px)   - Tight spacing
sm: 0.75rem (12px)  - Small gaps
md: 1rem    (16px)  - Default spacing
lg: 1.5rem  (24px)  - Section spacing
xl: 2rem    (32px)  - Large sections
```

### Container Padding
```css
Mobile:  16px (1rem)
Tablet:  24px (1.5rem)
Desktop: 32px (2rem)
```

## Border Radius

```css
sm: 6px  (0.375rem) - Small elements
md: 8px  (0.5rem)   - Buttons, inputs
lg: 12px (0.75rem)  - Cards
xl: 16px (1rem)     - Large cards
```

## Shadows

```css
sm: 0 1px 2px rgba(0,0,0,0.05)      - Subtle elevation
md: 0 4px 6px rgba(0,0,0,0.1)       - Cards
lg: 0 10px 15px rgba(0,0,0,0.1)     - Modals, dropdowns
```

## Komponenten

### Buttons

#### Primary Button
```tsx
<button className="btn-primary">
  Primary Action
</button>
```
- Red background (#DC2626)
- White text
- Shadow on hover
- 44px min-height (touch target)

#### Secondary Button
```tsx
<button className="btn-secondary">
  Secondary Action
</button>
```
- Light gray background
- Dark text
- No shadow

#### Ghost Button
```tsx
<button className="btn-ghost">
  Tertiary Action
</button>
```
- Transparent background
- Hover background
- For less important actions

#### Button Sizes
```tsx
<button className="btn-primary btn-sm">Small</button>
<button className="btn-primary">Default</button>
<button className="btn-primary btn-lg">Large</button>
```

### Cards

#### Basic Card
```tsx
<div className="card">
  <div className="card-header">
    <h2>Card Title</h2>
  </div>
  <div className="card-body">
    Content here
  </div>
</div>
```

#### Hover Card
```tsx
<div className="card-hover">
  Interactive card with hover effect
</div>
```

#### Card with Footer
```tsx
<div className="card">
  <div className="card-header">Title</div>
  <div className="card-body">Content</div>
  <div className="card-footer">Actions</div>
</div>
```

### Form Elements

#### Input Field
```tsx
<div>
  <label className="label">Username</label>
  <input 
    type="text" 
    className="input" 
    placeholder="Enter username"
  />
</div>
```

#### Input States
```tsx
<input className="input" />         <!-- Normal -->
<input className="input-error" />   <!-- Error state -->
<input className="input-success" /> <!-- Success state -->
```

#### Select Dropdown
```tsx
<select className="input">
  <option>Option 1</option>
  <option>Option 2</option>
</select>
```

### Badges

```tsx
<span className="badge-red">Admin</span>
<span className="badge-blue">Coach</span>
<span className="badge-green">Member</span>
<span className="badge-purple">Parent</span>
<span className="badge-gray">Inactive</span>
```

### Alerts

```tsx
<div className="alert-info">
  <Icon className="w-5 h-5" />
  <p>Information message</p>
</div>

<div className="alert-success">Success message</div>
<div className="alert-warning">Warning message</div>
<div className="alert-error">Error message</div>
```

## Layout

### Page Container
```tsx
<div className="container-page">
  <!-- Max-width, centered, responsive padding -->
</div>
```

### Section Spacing
```tsx
<section className="section">
  <!-- Consistent margin-bottom -->
</section>
```

## Responsive Breakpoints

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet portrait */
lg: 1024px  /* Tablet landscape */
xl: 1280px  /* Desktop */
2xl: 1536px /* Large desktop */
```

### Usage
```tsx
<!-- Stack on mobile, 2 columns on tablet, 4 on desktop -->
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

## Responsive Tables

### Auto-responsive
```tsx
<div className="table-responsive">
  <table>
    <!-- Table auto-scrolls on mobile -->
  </table>
</div>
```

### Card Layout (Mobile)
```tsx
<table className="table-mobile">
  <tbody>
    <tr>
      <td data-label="Name">John Doe</td>
      <td data-label="Email">john@example.com</td>
    </tr>
  </tbody>
</table>
```

## Accessibility Features

### Skip to Content
```tsx
<a href="#main-content" className="skip-to-content">
  Skip to main content
</a>
```

### Screen Reader Only
```tsx
<span className="sr-only">
  Hidden from visual users, read by screen readers
</span>
```

### Focus Visible
- All interactive elements have visible focus states
- 2px red outline on keyboard focus
- Respects `prefers-reduced-motion`

### Touch Targets
- Minimum 44x44px on mobile
- Adequate spacing between interactive elements

### Color Contrast
- Text meets WCAG AAA standards
- 7:1 contrast ratio for body text
- 4.5:1 for large text

## Dark Mode

### Automatic Detection
```css
@media (prefers-color-scheme: dark) {
  /* Automatic dark mode based on system preference */
}
```

### Manual Toggle
```tsx
<!-- Use Tailwind's dark: prefix -->
<div className="bg-white dark:bg-slate-800">
  Content adapts to theme
</div>
```

## Animations & Transitions

### Transition Speeds
```css
Fast: 150ms   - Hover states
Base: 200ms   - Default transitions
Slow: 300ms   - Complex animations
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  /* Animations disabled for users who prefer less motion */
}
```

## Icons

### Icon Library
**Lucide React** - Consistent, minimal icons

### Icon Sizes
```tsx
<Icon className="w-4 h-4" />  <!-- 16px - Small -->
<Icon className="w-5 h-5" />  <!-- 20px - Default -->
<Icon className="w-6 h-6" />  <!-- 24px - Large -->
```

### Icon Colors
```tsx
<Icon className="text-slate-500" />         <!-- Neutral -->
<Icon className="text-red-600" />           <!-- Primary -->
<Icon className="text-blue-600" />          <!-- Info -->
<Icon className="text-green-600" />         <!-- Success -->
```

## Best Practices

### 1. Use Semantic HTML
```tsx
✅ <button>Click me</button>
❌ <div onClick={}>Click me</div>
```

### 2. Proper Heading Hierarchy
```tsx
✅ <h1> → <h2> → <h3>
❌ <h1> → <h3> → <h2>
```

### 3. Form Labels
```tsx
✅ <label htmlFor="email">Email</label>
   <input id="email" />

❌ <input placeholder="Email" />
```

### 4. Alt Text for Images
```tsx
✅ <img src="..." alt="Description" />
❌ <img src="..." />
```

### 5. Loading States
```tsx
<button disabled={loading} className="btn-primary">
  {loading ? 'Loading...' : 'Submit'}
</button>
```

## Performance

### Code Splitting
```tsx
// Lazy load heavy components
const Modal = lazy(() => import('./Modal'));
```

### Image Optimization
```tsx
// Use Next.js Image component
<Image 
  src="/photo.jpg" 
  width={400} 
  height={300} 
  alt="Description"
/>
```

### CSS Purging
- Tailwind automatically removes unused CSS in production
- Keep className strings intact (no dynamic composition)

## Migration Guide

### From Old Design
```tsx
<!-- Old -->
<div className="bg-gradient-to-r from-black via-red-700 to-black">

<!-- New -->
<div className="card-header">
```

### Button Migration
```tsx
<!-- Old -->
<button className="bg-red-600 text-white px-4 py-2 rounded-lg">

<!-- New -->
<button className="btn-primary">
```

### Card Migration
```tsx
<!-- Old -->
<div className="bg-white rounded-lg shadow-lg border border-gray-200">

<!-- New -->
<div className="card">
```

## Testing Checklist

- [ ] Works on Mobile (< 640px)
- [ ] Works on Tablet (640px - 1024px)
- [ ] Works on Desktop (> 1024px)
- [ ] Keyboard navigation works
- [ ] Screen reader accessible
- [ ] Dark mode tested
- [ ] Color contrast verified (WCAG AAA)
- [ ] Touch targets minimum 44px
- [ ] Reduced motion respected
- [ ] Print styles work

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design 3](https://m3.material.io)
- [Lucide Icons](https://lucide.dev)
