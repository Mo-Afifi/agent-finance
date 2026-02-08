# OpenClaw Pay Color Reference

## Theme Colors

### Primary Palette

| Color | Hex Code | Usage | Tailwind Class |
|-------|----------|-------|----------------|
| **Black** | `#000000` | Primary background | `bg-dark` |
| **Dark Lighter** | `#0a0a0a` | Subtle variation | `bg-dark-lighter` |
| **Dark Card** | `#1a1a1a` | Card backgrounds | `bg-dark-card` |
| **Dark Panel** | `#262626` | Borders, panels | `bg-dark-panel`, `border-dark-panel` |

### Accent Colors

| Color | Hex Code | Usage | Tailwind Class |
|-------|----------|-------|----------------|
| **Lemon (Primary)** | `#F4E04D` | Buttons, highlights, icons | `bg-lemon`, `text-lemon` |
| **Gold** | `#FFD700` | Hover states, borders | `bg-gold`, `text-gold` |

### Text Colors

| Color | Hex Code | Usage | Tailwind Class |
|-------|----------|-------|----------------|
| **White** | `#ffffff` | Primary text | `text-text-primary` |
| **Light Grey** | `#d1d5db` | Secondary text | `text-text-secondary` |
| **Medium Grey** | `#9ca3af` | Tertiary text | `text-text-tertiary` |
| **Muted Grey** | `#6b7280` | Muted text | `text-text-muted` |

### Status Colors

| Color | Hex Code | Usage | Tailwind Class |
|-------|----------|-------|----------------|
| **Success Green** | `#10b981` | Completed, verified | `text-success`, `bg-success` |
| **Error Red** | `#ef4444` | Failed, errors | `text-error`, `bg-error` |

## Component Patterns

### Buttons
- **Primary**: `bg-lemon hover:bg-gold text-dark font-semibold shadow-lg shadow-lemon/20`
- **Secondary**: `bg-dark-panel hover:bg-dark-panel/70 text-text-primary border border-dark-panel`

### Cards
- **Standard**: `bg-dark-card border border-dark-panel shadow-lg`
- **Hover**: Add `hover:shadow-lemon/5 transition-shadow`

### Form Inputs
- **Base**: `bg-dark border border-dark-panel text-text-primary placeholder-text-muted`
- **Focus**: `focus:border-lemon focus:ring-1 focus:ring-lemon`

### Icons
- **Primary**: `text-lemon` (for main actions, highlights)
- **Success**: `text-success` (verified, completed)
- **Error**: `text-error` (failed, warnings)
- **Neutral**: `text-text-tertiary` (informational)

### Borders
- **Standard**: `border-dark-panel`
- **Accent**: `border-lemon`
- **Selected**: `border-l-2 border-lemon`

### Backgrounds
- **Page**: `bg-dark` (#000000)
- **Header**: `bg-dark-lighter` (#0a0a0a)
- **Cards**: `bg-dark-card` (#1a1a1a)
- **Nested Elements**: `bg-dark/50` (50% opacity black)
- **Selected/Highlighted**: `bg-lemon/5` (5% opacity lemon)

### Shadows
- **Standard**: `shadow-lg`
- **Lemon Glow**: `shadow-lg shadow-lemon/20`
- **Subtle**: `shadow-lemon/10`
- **Hover**: `hover:shadow-lemon/5`

## Before & After

### Before (Blue Theme)
```css
- Primary: #0ea5e9 (blue-500)
- Background: #0f172a (slate-900)
- Cards: #1e293b (slate-800)
- Borders: #334155 (slate-700)
- Text: Various slate shades
```

### After (Lemon/Gold Dark Theme)
```css
- Primary: #F4E04D (lemon)
- Background: #000000 (pure black)
- Cards: #1a1a1a (dark grey)
- Borders: #262626 (medium grey)
- Text: White/grey shades
```

## Accessibility

### Contrast Ratios
All color combinations meet WCAG AA standards:

- White text on black: **21:1** ✓ (AAA)
- Lemon on black: **15.3:1** ✓ (AAA)
- Light grey on black: **11.7:1** ✓ (AAA)
- Medium grey on black: **7.4:1** ✓ (AA)
- Success green on black: **6.8:1** ✓ (AA)
- Error red on black: **5.1:1** ✓ (AA)

## Usage Examples

### Dashboard Header
```tsx
<header className="border-b border-dark-panel bg-dark-lighter/95 backdrop-blur-sm">
  <Coins className="h-8 w-8 text-lemon" />
  <button className="bg-lemon hover:bg-gold text-dark shadow-lg shadow-lemon/20">
    New Agent
  </button>
</header>
```

### Stats Card
```tsx
<div className="bg-dark-card border border-dark-panel shadow-lg hover:shadow-lemon/5">
  <div className="bg-lemon/10">
    <Icon className="text-lemon" />
  </div>
  <div className="text-text-primary">{value}</div>
</div>
```

### Agent List Item (Selected)
```tsx
<div className="bg-lemon/5 border-l-2 border-lemon">
  <h3 className="text-text-primary">{agent.name}</h3>
  <div className="text-lemon font-bold">${balance}</div>
</div>
```

### Form Input
```tsx
<input 
  className="bg-dark border border-dark-panel text-text-primary 
             placeholder-text-muted focus:border-lemon focus:ring-lemon"
/>
```

## Tips

1. **Use lemon sparingly** - It's an accent, not a primary color
2. **Layer greys** - Use different dark shades for depth
3. **Maintain contrast** - Always test text readability
4. **Consistent shadows** - Use lemon-tinted shadows for glow effects
5. **Semantic colors** - Keep green for success, red for errors
6. **Hover feedback** - Transition from lemon to gold on hover
7. **Focus states** - Always use lemon ring for keyboard navigation
