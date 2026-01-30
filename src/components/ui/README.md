# UI Component Library - Mobile-First Dashboard Components

## Overview

This library provides reusable, mobile-first UI components built with **Tailwind CSS v3** for the MapleKids dashboard system. All components follow a responsive design approach with breakpoints optimized for mobile, tablet, and desktop viewports.

## 🎨 Design System

### Color Palette

- **Primary (Indigo)**: Professional, trustworthy - `#6366f1`
- **Secondary (Purple)**: Creative, educational - `#8b5cf6`
- **Success (Green)**: Positive outcomes - `#10b981`
- **Warning (Amber)**: Cautions - `#f59e0b`
- **Danger (Red)**: Errors, critical - `#ef4444`

### Breakpoints

```css
Mobile:     320px - 767px   (Base styles, mobile-first)
Tablet:     768px - 1023px  (md: prefix)
Desktop:    1024px+         (lg: prefix)
```

### Typography Scale

- **H1**: 20px → 22px → 24px (mobile → tablet → desktop)
- **H2**: 18px → 19px → 20px
- **H3**: 16px (consistent)
- **Body**: 14px (consistent)
- **Small**: 12px (consistent)

## 📦 Components

### 1. StatCard

Compact card for displaying key statistics with optional trend indicators.

#### Props

```typescript
interface StatCardProps {
  icon: string;              // Emoji or icon
  label: string;             // Stat description
  value: string | number;    // Main value
  trend?: {                  // Optional trend indicator
    value: number;           // Percentage
    isPositive: boolean;     // Green (up) or red (down)
  };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  className?: string;
  onClick?: () => void;
}
```

#### Usage

```tsx
import { StatCard } from '@/components/ui';

<StatCard
  icon="📈"
  label="Attendance Rate"
  value="87%"
  color="primary"
  trend={{ value: 5, isPositive: true }}
/>
```

#### Responsive Behavior

- **Mobile**: Full width (1 column)
- **Tablet**: 50% width (2 columns)
- **Desktop**: 25% width (4 columns)

---

### 2. CompactCard

Flexible container card with header, actions, and scrollable content.

#### Props

```typescript
interface CompactCardProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;       // Optional header actions (buttons, links)
  className?: string;
  maxHeight?: string;        // e.g., "400px" - enables scrolling
  noPadding?: boolean;       // Remove default padding
}
```

#### Usage

```tsx
import { CompactCard } from '@/components/ui';

<CompactCard
  title="📅 Attendance Overview"
  maxHeight="400px"
  actions={
    <button className="text-primary-600">View All →</button>
  }
>
  {/* Content here */}
</CompactCard>
```

---

### 3. ActivityItem

List item component for displaying recent activities/events.

#### Props

```typescript
interface ActivityItemProps {
  icon: string;
  title: string;
  description?: string;
  timestamp: string;
  type?: 'default' | 'success' | 'warning' | 'info';
}
```

#### Usage

```tsx
import { ActivityItem } from '@/components/ui';

<ActivityItem
  icon="📊"
  title="Report Card Published"
  description="Q1 2026 academic report"
  timestamp="Jan 28, 2026"
  type="info"
/>
```

---

### 4. Grid

Responsive grid layout system.

#### Props

```typescript
interface GridProps {
  children: ReactNode;
  cols?: {
    mobile?: number;    // Default: 1
    tablet?: number;    // Default: 2
    desktop?: number;   // Default: 4
  };
  gap?: number;         // Tailwind spacing (4, 6, 8, etc.)
  className?: string;
}
```

#### Usage

```tsx
import { Grid } from '@/components/ui';

<Grid cols={{ mobile: 1, tablet: 2, desktop: 4 }} gap={4}>
  <StatCard {...props1} />
  <StatCard {...props2} />
  <StatCard {...props3} />
  <StatCard {...props4} />
</Grid>
```

---

## 🚀 Implementation Examples

### Student Dashboard Overview

Complete implementation using all UI components:

```tsx
import { StatCard, CompactCard, ActivityItem, Grid } from '@/components/ui';

const StudentOverview = ({ student, attendance, reports }) => {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <Grid cols={{ mobile: 1, tablet: 2, desktop: 4 }}>
        <StatCard icon="📈" label="Attendance" value="87%" color="primary" />
        <StatCard icon="✅" label="Present Days" value={24} color="success" />
        <StatCard icon="❌" label="Absent Days" value={3} color="danger" />
        <StatCard icon="⏰" label="Late" value={2} color="warning" />
      </Grid>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CompactCard title="📅 Attendance Overview">
          {/* Circular progress chart */}
        </CompactCard>

        <CompactCard title="📈 Recent Activity" maxHeight="400px">
          {activities.map(activity => (
            <ActivityItem key={activity.id} {...activity} />
          ))}
        </CompactCard>
      </div>
    </div>
  );
};
```

---

## 🎯 Mobile-First Principles

### 1. Touch Targets
- Minimum size: **44px × 44px**
- Adequate spacing between tappable elements

### 2. Content Hierarchy
- Vertical stacking on mobile
- Multi-column layouts on tablet/desktop
- Progressive disclosure (collapsible sections)

### 3. Performance
- Lightweight components
- CSS animations with `prefers-reduced-motion` support
- Lazy loading where appropriate

---

## 🎨 Tailwind Classes Reference

### Common Patterns

```css
/* Responsive Grid */
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4

/* Card Base */
bg-white rounded-card shadow-card border border-gray-200

/* Spacing */
space-y-6      /* Vertical spacing between children */
p-4 sm:p-6     /* Responsive padding */

/* Typography */
text-sm text-gray-600         /* Small secondary text */
text-2xl font-bold text-gray-900  /* Large heading */

/* Colors */
bg-primary-50 text-primary-600    /* Primary color variant */
border-success-500                /* Success border */
```

---

## 📝 Best Practices

### 1. Use Semantic HTML
```tsx
// ✅ Good
<button className="..." onClick={handleClick}>

// ❌ Bad
<div className="..." onClick={handleClick}>
```

### 2. Mobile-First Approach
```css
/* ✅ Good - Base styles are mobile, enhanced for larger screens */
className="text-sm md:text-base lg:text-lg"

/* ❌ Bad - Desktop-first requires overriding */
className="text-lg md:text-sm"
```

### 3. Consistent Spacing
Use Tailwind's spacing scale:
- `gap-4` (16px)
- `space-y-6` (24px)
- `p-4` (16px)

### 4. Accessibility
```tsx
// Add ARIA labels
<button aria-label="Close modal">×</button>

// Use semantic color meanings
<StatCard color="success" /> // For positive metrics
<StatCard color="danger" />  // For negative metrics
```

---

## 🔧 Customization

### Extending Tailwind Config

To add custom colors or styles, edit `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          // ... more shades
        },
      },
    },
  },
};
```

### Creating Custom Components

Follow the existing pattern:

```tsx
// src/components/ui/YourComponent.tsx
import React from 'react';

export interface YourComponentProps {
  // ... props
}

const YourComponent: React.FC<YourComponentProps> = ({ ... }) => {
  return (
    <div className="...">
      {/* Mobile-first styles */}
    </div>
  );
};

export default YourComponent;
```

Then export from `index.ts`:

```typescript
export { default as YourComponent } from './YourComponent';
export type { YourComponentProps } from './YourComponent';
```

---

## 📊 Component Status

| Component | Status | Mobile | Tablet | Desktop | Accessibility |
|-----------|--------|--------|--------|---------|---------------|
| StatCard | ✅ Complete | ✅ | ✅ | ✅ | ✅ |
| CompactCard | ✅ Complete | ✅ | ✅ | ✅ | ✅ |
| ActivityItem | ✅ Complete | ✅ | ✅ | ✅ | ✅ |
| Grid | ✅ Complete | ✅ | ✅ | ✅ | ✅ |

---

## 🚧 Roadmap

### Phase 2: Teacher Dashboard Components
- [ ] ClassSelector
- [ ] AttendanceGrid
- [ ] StudentQuickCard

### Phase 3: Admin Dashboard Components
- [ ] KPICard
- [ ] QuickActionGrid
- [ ] UserManagementTable

### Phase 4: Shared Components
- [ ] DataTable (with sorting, filtering, pagination)
- [ ] Modal (bottom sheet on mobile)
- [ ] Form components
- [ ] Chart wrappers

---

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Mobile-First Design Principles](https://developers.google.com/web/fundamentals/design-and-ux/responsive)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 🤝 Contributing

When adding new components:

1. Follow mobile-first approach
2. Use TypeScript interfaces for props
3. Add comprehensive JSDoc comments
4. Include usage examples
5. Test on actual devices (not just DevTools)
6. Ensure accessibility (keyboard nav, screen readers)
7. Update this README

---

**Last Updated**: January 30, 2026  
**Version**: 1.0.0  
**Tailwind CSS**: v3.4.19
