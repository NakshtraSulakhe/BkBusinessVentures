# BK Business Ventures - Professional UI Design System

## Overview
This document outlines the comprehensive UI design system for creating a professional banking application interface. The design system ensures consistency, accessibility, and a premium user experience across all application screens.

## 🎨 Color System

### Primary Colors
- **Primary (Navy)**: `#1e3a8a` - Used for primary actions, headers, and important elements
- **Primary Light**: `#3b82f6` - Hover states and secondary emphasis
- **Primary Dark**: `#1e40af` - Pressed states and deep emphasis

### Accent Colors
- **Accent (Teal)**: `#14b8a6` - Secondary actions, highlights, and success states
- **Accent Light**: `#5eead4` - Hover states for accent elements
- **Accent Dark**: `#0d9488` - Pressed states for accent elements

### Neutral Colors
- **Background**: `#ffffff` - Main page background
- **Surface**: `#f8fafc` - Card and panel backgrounds
- **Border**: `#e2e8f0` - Dividers and borders
- **Text Primary**: `#1e293b` - Main text content
- **Text Secondary**: `#64748b` - Supporting text and labels
- **Text Muted**: `#94a3b8` - Disabled and placeholder text

### Status Colors
- **Success**: `#22c55e` - Completed actions, positive states
- **Warning**: `#f59e0b` - Pending items, caution states
- **Error**: `#ef4444` - Errors, destructive actions
- **Info**: `#3b82f6` - Information, neutral states

## 📝 Typography System

### Font Family
- **Primary**: `Inter` (loaded from Google Fonts)
- **Monospace**: `JetBrains Mono` (for numbers and codes)

### Font Sizes & Weights
- **Text-xs**: `0.75rem` (12px) - Caption text, labels
- **Text-sm**: `0.875rem` (14px) - Body text, descriptions
- **Text-base**: `1rem` (16px) - Default text, paragraphs
- **Text-lg**: `1.125rem` (18px) - Emphasized text
- **Text-xl**: `1.25rem` (20px) - Section headings
- **Text-2xl**: `1.5rem` (24px) - Page headings

### Font Weights
- **Regular (400)**: Body text, descriptions
- **Medium (500)**: Emphasized text, labels
- **Semibold (600)**: Headings, important data
- **Bold (700)**: Page titles, critical information

### Font Sizes
- **xs**: 0.75rem (12px) - Small labels, metadata
- **sm**: 0.875rem (14px) - Secondary text, descriptions
- **base**: 1rem (16px) - Body text, default
- **lg**: 1.125rem (18px) - Large text, emphasis
- **xl**: 1.25rem (20px) - Section headings
- **2xl**: 1.5rem (24px) - Page titles
- **3xl**: 1.875rem (30px) - Large headings

## 📏 Spacing System

### 8px Grid System
- **1**: 0.25rem (4px) - Micro spacing
- **2**: 0.5rem (8px) - Small spacing
- **3**: 0.75rem (12px) - Medium spacing
- **4**: 1rem (16px) - Standard spacing
- **6**: 1.5rem (24px) - Large spacing
- **8**: 2rem (32px) - Extra large spacing
- **12**: 3rem (48px) - Section spacing
- **16**: 4rem (64px) - Page spacing

## � Component Styling

### Buttons
- **Height**: h-10 (40px) for standard buttons
- **Border Radius**: rounded-lg (8px)
- **Shadow**: shadow-sm with hover:shadow-md
- **Transition**: transition-all duration-200

### Cards
- **Border Radius**: rounded-lg (8px)
- **Shadow**: shadow-sm with hover:shadow-md
- **Border**: border border-border
- **Padding**: p-6 for standard, p-4 for small

### Status Badges
- **Border Radius**: rounded-md (6px)
- **Border**: border border-current/20
- **Padding**: px-2 py-1
- **Font Size**: text-xs
- **Padding**: `p-6` (24px)
- **Hover**: `hover:shadow-md transition-shadow`

### Tables
- **Header**: Sticky `sticky top-0 bg-surface border-b`
- **Row height**: `h-12` (48px)
- **Cell padding**: `px-4 py-3`
- **Hover**: `hover:bg-surface-dark`
- **Border**: `border-b border-border`

#### Column Alignment
- **Text columns**: `text-left`
- **Number columns**: `text-right font-mono tabular-nums`
- **Date columns**: `text-left`
- **Status columns**: `text-center`

## 🏗️ Layout Guidelines

### Page Structure
- **Max width**: `max-w-7xl` for main content
- **Page padding**: `p-6` (24px)
- **Section spacing**: `space-y-8` (32px)
- **Card spacing**: `space-y-6` (24px)

### Sidebar Navigation
- **Width**: `w-64` (256px) expanded, `w-16` (64px) collapsed
- **Item height**: `h-10` (40px)
- **Active state**: `bg-primary/10 border-l-4 border-primary`
- **Hover**: `hover:bg-surface`
- **Group spacing**: `space-y-2`

### Header Bar
- **Height**: `h-16` (64px)
- **Background**: `bg-white/95 backdrop-blur`
- **Border**: `border-b border-border`
- **Padding**: `px-6`

## 🎭 Status & State Indicators

### Badges
- **Size**: `text-xs px-2 py-1 rounded-full`
- **Font weight**: `font-medium`

#### Badge Colors
- **Success**: `bg-success/10 text-success`
- **Warning**: `bg-warning/10 text-warning`
- **Error**: `bg-error/10 text-error`
- **Info**: `bg-info/10 text-info`
- **Neutral**: `bg-surface text-text-secondary`

### Loading States
- **Skeleton**: `animate-pulse bg-surface rounded`
- **Spinner**: `animate-spin`
- **Button loading**: Disabled state with spinner icon

### Empty States
- **Container**: `flex flex-col items-center justify-center py-12`
- **Icon**: `w-12 h-12 text-muted-foreground mb-4`
- **Title**: `text-lg font-medium text-foreground mb-2`
- **Description**: `text-sm text-muted-foreground mb-4`
- **Action**: Primary button

## ✨ Micro-interactions

### Transitions
- **Fast**: `transition-all duration-150` - Button hover
- **Standard**: `transition-all duration-200` - Card hover, focus
- **Slow**: `transition-all duration-300` - Page transitions

### Hover Effects
- **Buttons**: Scale transform `hover:scale-105`
- **Cards**: Shadow increase `hover:shadow-lg`
- **Table rows**: Background change `hover:bg-surface-dark`

### Focus States
- **Ring**: `focus:ring-2 focus:ring-primary/30`
- **Outline**: `focus:outline-none`
- **Offset**: `focus:ring-offset-2`

## 📊 Data Display Guidelines

### Financial Tables
- **Amounts**: Right-aligned, monospace font
- **Dates**: Left-aligned, consistent format
- **Status**: Center-aligned badges
- **Actions**: Right-aligned, minimal buttons

### Charts & Graphs
- **Colors**: Use primary and accent colors
- **Grid**: Subtle grid lines
- **Labels**: Clear, readable labels
- **Legend**: Below or to the right

## 🔐 Security & Trust UI

### Audit Trail
- **Timestamp**: `text-xs text-muted-foreground`
- **User info**: `text-sm font-medium`
- **Edited indicator**: Small icon with hover tooltip

### Confirmation Dialogs
- **Title**: Clear, action-oriented
- **Description**: Explain consequences
- **Actions**: Primary (confirm) and secondary (cancel)
- **Destructive**: Red styling for dangerous actions

## 📱 Responsive Guidelines

### Breakpoints
- **Mobile**: `< 640px`
- **Tablet**: `640px - 1024px`
- **Desktop**: `> 1024px`

### Mobile Adaptations
- **Sidebar**: Collapsible to hamburger menu
- **Tables**: Horizontal scroll on mobile
- **Cards**: Stack vertically
- **Buttons**: Full width on mobile

## 🎯 Accessibility Standards

### Color Contrast
- **Normal text**: 4.5:1 minimum
- **Large text**: 3:1 minimum
- **Interactive elements**: 3:1 minimum

### Keyboard Navigation
- **Focus**: Visible focus ring
- **Tab order**: Logical sequence
- **Skip links**: For main content

### Screen Readers
- **Labels**: All inputs have labels
- **ARIA**: Proper ARIA attributes
- **Alt text**: Meaningful descriptions

## 🛠️ Implementation Notes

### CSS Custom Properties
```css
:root {
  --color-primary: 30 58 138;
  --color-accent: 20 184 166;
  --radius: 0.5rem;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
}
```

### Utility Classes
- Use Tailwind's utility classes extensively
- Create custom utility classes for repeated patterns
- Maintain consistency with design tokens

### Component Variants
- Use `class-variance-authority` for component variants
- Create reusable component patterns
- Document component props and usage

## 📋 Checklist for New Features

### Before Implementation
- [ ] Review existing components for reuse
- [ ] Check design system for patterns
- [ ] Plan responsive behavior
- [ ] Consider accessibility requirements

### During Implementation
- [ ] Use consistent spacing (8px grid)
- [ ] Apply correct typography rules
- [ ] Include proper focus states
- [ ] Add loading and error states
- [ ] Implement hover interactions

### After Implementation
- [ ] Test on different screen sizes
- [ ] Verify keyboard navigation
- [ ] Check color contrast
- [ ] Test with screen readers
- [ ] Ensure consistent behavior

---

This design system serves as the foundation for all UI development in the BK Business Ventures banking application. Following these guidelines ensures a consistent, professional, and accessible user experience across the entire application.
