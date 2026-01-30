# Quick Start Guide - Mobile-First UI Components

## 🚀 Getting Started

### View the Changes

1. **Start the development server**:
   ```bash
   npm start
   ```

2. **Login as a student** to see the new Overview tab

3. **Test responsive behavior**:
   - Press `F12` to open DevTools
   - Toggle device toolbar (mobile icon)
   - Try different screen sizes:
     - iPhone SE (375px)
     - iPad (768px)
     - Desktop (1024px+)

---

## 📦 Using the New Component Library

### Import Components

```tsx
import { StatCard, CompactCard, ActivityItem, Grid } from '@/components/ui';
```

### Quick Examples

#### 1. Display Statistics

```tsx
<Grid cols={{ mobile: 1, tablet: 2, desktop: 4 }} gap={4}>
  <StatCard
    icon="📈"
    label="Total Students"
    value={150}
    color="primary"
    trend={{ value: 12, isPositive: true }}
  />
  
  <StatCard
    icon="✅"
    label="Present Today"
    value={145}
    color="success"
  />
</Grid>
```

#### 2. Create a Card Section

```tsx
<CompactCard
  title="Recent Activity"
  maxHeight="400px"
  actions={
    <button className="text-primary-600">View All</button>
  }
>
  <div className="space-y-2">
    <ActivityItem
      icon="📊"
      title="Report Card Published"
      description="Q1 2026 results available"
      timestamp="2 hours ago"
      type="info"
    />
  </div>
</CompactCard>
```

#### 3. Responsive Layout

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <CompactCard title="Section 1">
    {/* Content */}
  </CompactCard>
  
  <CompactCard title="Section 2">
    {/* Content */}
  </CompactCard>
</div>
```

---

## 🎨 Tailwind CSS Cheat Sheet

### Common Patterns

```css
/* Spacing */
p-4           /* padding: 16px */
px-6          /* padding-left/right: 24px */
py-3          /* padding-top/bottom: 12px */
space-y-6     /* gap between children (vertical) */
gap-4         /* grid/flex gap: 16px */

/* Responsive */
md:grid-cols-2      /* 2 columns on tablet+ */
lg:text-lg          /* larger text on desktop+ */
sm:p-6              /* more padding on small+ */

/* Colors */
bg-primary-50       /* light background */
text-primary-600    /* primary text color */
border-success-500  /* success border */

/* Layout */
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4
flex items-center justify-between
rounded-card        /* 12px border radius */
shadow-card         /* custom card shadow */
```

### Responsive Breakpoints

```css
sm:   640px   /* Small devices */
md:   768px   /* Tablets */
lg:   1024px  /* Desktops */
xl:   1280px  /* Large desktops */
2xl:  1536px  /* Extra large */
```

---

## 🔧 Customization

### Custom Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      brand: {
        500: '#your-color',
      },
    },
  },
}
```

Usage:
```tsx
<div className="bg-brand-500">
```

### Custom Spacing

```javascript
theme: {
  extend: {
    spacing: {
      '128': '32rem',
    },
  },
}
```

Usage:
```tsx
<div className="h-128">
```

---

## 📱 Mobile-First Rules

### ✅ DO

```tsx
// Start with mobile styles, enhance for larger screens
<div className="text-sm md:text-base lg:text-lg">

// Use responsive grids
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

// Stack on mobile, side-by-side on desktop
<div className="flex flex-col lg:flex-row">
```

### ❌ DON'T

```tsx
// Desktop-first (requires overriding)
<div className="text-lg md:text-sm">

// Fixed layouts
<div className="grid grid-cols-4"> {/* Breaks on mobile! */}
```

---

## 🐛 Troubleshooting

### Issue: Tailwind classes not working

**Solution**: 
1. Check `tailwind.config.js` includes your file:
   ```javascript
   content: ["./src/**/*.{js,jsx,ts,tsx}"]
   ```
2. Restart dev server: `npm start`

### Issue: Styles look different in production

**Solution**:
- Tailwind purges unused classes in production
- Avoid dynamic class names: `className={`text-${color}-600`}` ❌
- Use complete class names: `className={color === 'primary' ? 'text-primary-600' : 'text-gray-600'}` ✅

### Issue: Component not found

**Solution**:
- Check import path: `@/components/ui`
- Ensure component is exported in `index.ts`

---

## 📚 Further Reading

- **Component Docs**: `/src/components/ui/README.md`
- **Implementation Summary**: `/docs/UI_REVAMP_SUMMARY.md`
- **Tailwind Docs**: https://tailwindcss.com/docs
- **Mobile-First Design**: https://web.dev/responsive-web-design-basics/

---

## 🎯 Next Features to Implement

### Teacher Dashboard
```tsx
// Suggested components to create
<ClassSelector classes={['Play', 'Nursery', 'LKG']} />
<AttendanceGrid students={students} />
<QuickActions actions={[...]} />
```

### Admin Dashboard
```tsx
// Suggested components to create
<KPICard metric="Total Revenue" value="$50,000" />
<UserStatsCard users={users} />
<RecentUsersTable users={recentUsers} />
```

---

## ✨ Tips & Tricks

### 1. Use CSS Custom Properties
```tsx
<div style={{ maxHeight: '400px' }} className="overflow-y-auto">
```

### 2. Conditional Styling
```tsx
<div className={`base-class ${isActive ? 'active-class' : 'inactive-class'}`}>
```

### 3. Responsive Visibility
```tsx
<div className="block lg:hidden">Mobile only</div>
<div className="hidden lg:block">Desktop only</div>
```

### 4. Hover States
```tsx
<button className="bg-primary-500 hover:bg-primary-600 transition">
```

### 5. Dark Mode (Future)
```tsx
<div className="bg-white dark:bg-gray-800">
```

---

**Happy Coding!** 🚀

For questions, check the documentation or inspect existing implementations in `StudentOverview.tsx`.
