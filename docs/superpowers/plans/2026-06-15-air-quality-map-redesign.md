# Air Quality Map Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the air quality map from vanilla JS to React + shadcn/ui, adding comprehensive statistics (1h/24h/30d averages), educational tooltips, and health advice.

**Architecture:** Astro 6.4.7 (server mode) with React client components. Tailwind CSS + shadcn/ui for styling. Recharts for data visualization. API enhancements for multi-range historical data with server-side aggregation.

**Tech Stack:** Astro, React, Tailwind CSS, shadcn/ui, Recharts, react-leaflet, Radix UI

---

## File Structure Overview

```
src/
├── components/
│   ├── react/
│   │   ├── App.tsx                    # Main app component
│   │   ├── MapView.tsx                # Leaflet map wrapper
│   │   ├── SensorMarker.tsx           # Custom marker
│   │   ├── Sidebar.tsx                # Side panel
│   │   ├── SensorHeader.tsx           # Sensor name + status + CAQI
│   │   ├── PollutantCard.tsx          # PM10/PM2.5/PM1 with tooltip
│   │   ├── ChartSection.tsx           # 1h/24h/30d chart tabs
│   │   ├── HealthAdvice.tsx           # Health recommendations
│   │   ├── TopBar.tsx                 # Logo + scale toggle
│   │   ├── StatusBadge.tsx            # Online/offline/damaged status
│   │   └── ui/                        # shadcn components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── tooltip.tsx
│   │       ├── tabs.tsx
│   │       └── badge.tsx
│   └── ClientWrapper.astro            # Astro wrapper for React app
├── pages/
│   ├── index.astro                    # Main page (simplified)
│   └── api/
│       ├── sensors.json.ts            # Enhanced with metadata
│       └── history.json.ts            # Enhanced with range param
├── lib/
│   ├── types.ts                       # Enhanced types
│   ├── aqi.ts                         # Keep existing
│   ├── thingsboard.ts                 # Keep existing
│   ├── env.ts                         # Keep existing
│   └── content.ts                     # NEW: tooltips content
└── styles/
    └── globals.css                    # Tailwind directives
```

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install React and Astro React integration**

```bash
npm install @astrojs/react react react-dom
```

- [ ] **Step 2: Install Tailwind CSS**

```bash
npm install -D tailwindcss @astrojs/tailwind postcss autoprefixer
npx tailwindcss init -p
```

- [ ] **Step 3: Install visualization and mapping libraries**

```bash
npm install recharts react-leaflet leaflet
npm install -D @types/leaflet
```

- [ ] **Step 4: Install Radix UI prerequisites for shadcn**

```bash
npm install @radix-ui/react-tooltip @radix-ui/react-tabs class-variance-authority clsx tailwind-merge lucide-react
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: install React, Tailwind, Recharts, and dependencies"
```

---

## Task 2: Configure Tailwind CSS

**Files:**
- Modify: `astro.config.mjs`
- Create: `tailwind.config.mjs`
- Create: `postcss.config.cjs`

- [ ] **Step 1: Update Astro config for Tailwind**

```javascript
// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://air-quality-map.pages.dev',
  output: 'server',
  adapter: vercel(),
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false, // We'll use custom CSS file
    }),
  ],
});
```

- [ ] **Step 2: Create tailwind.config.mjs**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 3: Create postcss.config.cjs**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 4: Create src/styles/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 199 89% 48%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 199 89% 48%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 199 89% 48%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 199 89% 48%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 199 89% 48%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 199 89% 48%;
  }
}

@layer base {
  * { @apply border-border; }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add astro.config.mjs tailwind.config.mjs postcss.config.cjs src/styles/
git commit -m "feat: configure Tailwind CSS with custom theme"
```

---

## Task 3: Create shadcn/ui Base Components

**Files:**
- Create: `src/components/react/ui/button.tsx`
- Create: `src/components/react/ui/card.tsx`
- Create: `src/components/react/ui/badge.tsx`
- Create: `src/components/react/ui/tooltip.tsx`
- Create: `src/components/react/ui/tabs.tsx`
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Create utility functions**

```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 2: Create Button component**

```tsx
// src/components/react/ui/button.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
```

- [ ] **Step 3: Create Card component**

```tsx
// src/components/react/ui/card.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col space-y-1.5 p-6', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('text-2xl font-semibold leading-none tracking-tight', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
```

- [ ] **Step 4: Create Badge component**

```tsx
// src/components/react/ui/badge.tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        success: 'border-transparent bg-green-600 text-white hover:bg-green-700',
        warning: 'border-transparent bg-yellow-500 text-white hover:bg-yellow-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

function Badge({ className, variant, dot, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />}
      {props.children}
    </div>
  );
}

export { Badge, badgeVariants };
```

- [ ] **Step 5: Create Tooltip component**

```tsx
// src/components/react/ui/tooltip.tsx
import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95',
      'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
      'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2',
      'data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      'max-w-[300px]',
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
```

- [ ] **Step 6: Create Tabs component**

```tsx
// src/components/react/ui/tabs.tsx
import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
```

- [ ] **Step 7: Commit**

```bash
git add src/components/react/ui/ src/lib/utils.ts
git commit -m "feat: add shadcn/ui base components"
```

---

## Task 4: Enhanced Types and Content

**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/lib/content.ts`

- [ ] **Step 1: Update types.ts**

```typescript
// src/lib/types.ts
export interface Sensor {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  ts: number;
  pm10: number | null;
  pm25: number | null;
  pm1: number | null;
  active: boolean;
  lastSeen?: number; // For offline/damaged detection
}

export interface SensorsResponse {
  updatedAt: number;
  sensors: Sensor[];
}

export type HistoryPoint = Record<'pm10' | 'pm25' | 'pm1_0', { ts: number; value: string }[]>;

export interface HistoryResponse {
  points: HistoryPoint;
  average: number;
  min: number;
  max: number;
  range: '1h' | '24h' | '30d';
}

export type Scale = 'caqi' | 'gios';

export interface AqiResult {
  index: number | null;
  cls: AqiClass;
}

export interface AqiClass {
  label: string;
  color: string;
  textColor: string;
  range: [number, number];
}

export interface SensorStatus {
  type: 'online' | 'offline' | 'damaged';
  label: string;
  description: string;
}

export interface PollutantInfo {
  name: string;
  description: string;
  health: string;
  who: string;
}

export interface HealthAdvice {
  emoji: string;
  title: string;
  advice: string;
  iconColor: string;
}
```

- [ ] **Step 2: Create content.ts with tooltip and health advice data**

```typescript
// src/lib/content.ts
import type { PollutantInfo, HealthAdvice } from './types';

export const pollutantInfo: Record<'pm10' | 'pm25' | 'pm1_0', PollutantInfo> = {
  pm10: {
    name: 'PM10',
    description: 'Pył zawieszony PM10 - cząstki o średnicy ≤10 µm. Pochodzą z spalania paliw, przemysłu, transportu, budownictwa i rolnictwa. Wdychane dostają się do gardła, tchawicy i oskrzeli.',
    health: 'Norma dobowe: 50 µg/m³ (roczna: 40 µg/m³)',
    who: 'WHO zaleca: 45 µg/m³ (24h)',
  },
  pm25: {
    name: 'PM2.5',
    description: 'Pył zawiszony PM2.5 - cząstki o średnicy ≤2.5 µm. Bardzo szkodliwe - przenikają głęboko do płuc i krwioobiegu. Powodują choroby serca, udary, problemy oddechowe.',
    health: 'Norma dobowe: 25 µg/m³ (roczna: 10 µg/m³)',
    who: 'WHO zaleca: 15 µg/m³ (24h)',
  },
  pm1_0: {
    name: 'PM1',
    description: 'Najdrobniejsze cząstki (≤1 µm). Najbardziej niebezpieczne dla zdrowia - przenikają do organizmu i krwioobiegu. Długoterminowo zwiększają ryzyko chorób serca i nowotworów.',
    health: 'Brak oficjalnej normy w UE',
    who: 'WHO uznaje za najbardziej szkodliwy',
  },
};

export const aqiInfo = {
  caqi: {
    description: 'Common Air Quality Index - europejski indeks jakości powietrza oparty na najgorszym z dwóch wskaźników (PM10, PM2.5)',
    levels: [
      { label: 'Bardzo dobre', range: '0-25', color: '#10b981', textColor: '#fff' },
      { label: 'Dobre', range: '25-50', color: '#84cc16', textColor: '#fff' },
      { label: 'Umiarkowane', range: '50-75', color: '#eab308', textColor: '#fff' },
      { label: 'Złe', range: '75-100', color: '#f97316', textColor: '#fff' },
      { label: 'Bardzo złe', range: '100+', color: '#dc2626', textColor: '#fff' },
    ],
  },
  gios: {
    description: 'Polski indeks jakości powietrza GIOŚ. Skala 0-100+, wyższe wartości oznaczają gorszą jakość powietrza.',
    levels: [
      { label: 'Bardzo dobre', range: '0-25', color: '#10b981', textColor: '#fff' },
      { label: 'Dobre', range: '26-50', color: '#84cc16', textColor: '#fff' },
      { label: 'Umiarkowane', range: '51-75', color: '#eab308', textColor: '#fff' },
      { label: 'Złe', range: '76-100', color: '#f97316', textColor: '#fff' },
      { label: 'Bardzo złe', range: '101+', color: '#dc2626', textColor: '#fff' },
    ],
  },
};

export const healthAdviceByIndex: Record<number, HealthAdvice> = {
  0: {
    emoji: '😊',
    title: 'Powietrze bardzo dobre',
    advice: 'Idealna jakość powietrza! Pełny komfort aktywności na zewnątrz - spacer, jogging, rower. Ciesz się dniem!',
    iconColor: '#10b981',
  },
  25: {
    emoji: '🙂',
    title: 'Powietrze dobre',
    advice: 'Dobra jakość powietrza. Możesz uprawiać sport na zewnątrz bez obaw. Osoby wrażliwe czują się komfortowo.',
    iconColor: '#84cc16',
  },
  50: {
    emoji: '😐',
    title: 'Powietrze umiarkowane',
    advice: 'Osoby wrażliwe (dzieci, seniorzy, chorzy na astmę) mogą odczuwać dyskomfort. Rozważ ograniczenie intensywnego wysiłku.',
    iconColor: '#eab308',
  },
  75: {
    emoji: '😷',
    title: 'Powietrze złe',
    advice: 'Unikaj długiego przebywania na zewnątrz. Zalecana maska przy wyjściu. Osoby chore powinny ograniczyć aktywność fizyczną.',
    iconColor: '#f97316',
  },
  100: {
    emoji: '🏠',
    title: 'Powietrze bardzo złe',
    advice: 'Zostań w domu! Unikaj wysiłku fizycznego. Otwieraj okna tylko w godzinach nocnych (2-6 rano), gdy stężenia są niższe.',
    iconColor: '#dc2626',
  },
};

export function getHealthAdvice(aqi: number | null): HealthAdvice {
  if (aqi === null) {
    return {
      emoji: '❓',
      title: 'Brak danych',
      advice: 'Nie można określić jakości powietrza - czujnik może być offline.',
      iconColor: '#6b7280',
    };
  }
  if (aqi <= 25) return healthAdviceByIndex[0];
  if (aqi <= 50) return healthAdviceByIndex[25];
  if (aqi <= 75) return healthAdviceByIndex[50];
  if (aqi <= 100) return healthAdviceByIndex[75];
  return healthAdviceByIndex[100];
}

export function getSensorStatus(lastSeen: number | undefined, active: boolean): { type: 'online' | 'offline' | 'damaged'; label: string; description: string } {
  if (!active || lastSeen === undefined) {
    return { type: 'offline', label: 'Offline', description: 'Brak danych z czujnika' };
  }

  const now = Date.now();
  const minutesSince = (now - lastSeen) / 60000;

  if (minutesSince > 1440) { // 24 hours
    return { type: 'damaged', label: 'Uszkodzony', description: 'Brak danych od ponad 24h - czujnik prawdopodobnie uszkodzony' };
  }
  if (minutesSince > 30) { // 30 minutes
    return { type: 'offline', label: 'Offline', description: 'Brak nowych danych od 30 minut' };
  }

  return { type: 'online', label: 'Online', description: 'Czujnik aktywny' };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts src/lib/content.ts
git commit -m "feat: add enhanced types and content for tooltips/health advice"
```

---

## Task 5: Enhance API Endpoints

**Files:**
- Modify: `src/pages/api/sensors.json.ts`
- Modify: `src/pages/api/history.json.ts`

- [ ] **Step 1: Update sensors.json.ts to include lastSeen**

```typescript
// src/pages/api/sensors.json.ts
import type { APIRoute } from 'astro';
import { readTbEnv } from '../../lib/env';
import {
  listDevices,
  deviceAttributes,
  deviceLatest,
} from '../../lib/thingsboard';
import type { Sensor, SensorsResponse } from '../../lib/types';

export const prerender = false;

const TELEMETRY_KEYS = ['pm10', 'pm25', 'pm1_0'];
const TTL = 60_000;
let cache: { at: number; payload: SensorsResponse } | null = null;

const num = (v: unknown): number | null => {
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
};
const bool = (v: unknown): boolean => v === true || v === 'true';

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=30',
    },
  });
}

export const GET: APIRoute = async ({ locals }) => {
  if (cache && Date.now() - cache.at < TTL) return json(cache.payload);

  try {
    const env = readTbEnv(locals);
    const devices = await listDevices(env);

    const sensors = await Promise.all(
      devices.map(async (d): Promise<Sensor | null> => {
        const [attrs, latest] = await Promise.all([
          deviceAttributes(env, d.id),
          deviceLatest(env, d.id, TELEMETRY_KEYS),
        ]);
        const lat = num(attrs.latitude);
        const lon = num(attrs.longitude);
        if (lat == null || lon == null) return null;

        // Find latest timestamp across all pollutants
        const ts =
          latest.pm10?.ts ?? latest.pm25?.ts ?? latest.pm1_0?.ts ?? Date.now();
        const maxTs = Math.max(
          latest.pm10?.ts ?? 0,
          latest.pm25?.ts ?? 0,
          latest.pm1_0?.ts ?? 0
        );

        return {
          id: d.id,
          name: d.name,
          address: d.name,
          lat,
          lon,
          ts,
          lastSeen: maxTs || ts, // Use maxTs if available, fallback to ts
          pm10: num(latest.pm10?.value),
          pm25: num(latest.pm25?.value),
          pm1: num(latest.pm1_0?.value),
          active: bool(attrs.active),
        };
      })
    );

    const payload: SensorsResponse = {
      updatedAt: Date.now(),
      sensors: sensors.filter((s): s is Sensor => s !== null),
    };
    cache = { at: Date.now(), payload };
    return json(payload);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 502);
  }
};
```

- [ ] **Step 2: Update history.json.ts with range parameter**

```typescript
// src/pages/api/history.json.ts
import type { APIRoute } from 'astro';
import { readTbEnv } from '../../lib/env';
import { deviceHistory } from '../../lib/thingsboard';
import type { HistoryResponse, HistoryPoint } from '../../lib/types';

export const prerender = false;

const TTL_1H = 30_000;     // 30 seconds
const TTL_24H = 60_000;    // 1 minute
const TTL_30D = 300_000;   // 5 minutes

const cache = new Map<string, { at: number; payload: HistoryResponse }>();

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=30',
    },
  });
}

function getRangeConfig(range: string) {
  const now = Date.now();
  switch (range) {
    case '1h':
      return {
        startTs: now - 60 * 60 * 1000,
        endTs: now,
        interval: 60 * 1000, // 1 minute
        ttl: TTL_1H,
      };
    case '24h':
      return {
        startTs: now - 24 * 60 * 60 * 1000,
        endTs: now,
        interval: 60 * 60 * 1000, // 1 hour
        ttl: TTL_24H,
      };
    case '30d':
      return {
        startTs: now - 30 * 24 * 60 * 60 * 1000,
        endTs: now,
        interval: 24 * 60 * 60 * 1000, // 1 day
        ttl: TTL_30D,
      };
    default:
      // Default to 24h
      return {
        startTs: now - 24 * 60 * 60 * 1000,
        endTs: now,
        interval: 60 * 60 * 1000,
        ttl: TTL_24H,
      };
  }
}

function calculateAverage(points: HistoryPoint): number {
  const allValues: number[] = [];
  for (const key of ['pm10', 'pm25', 'pm1_0'] as const) {
    const keyPoints = points[key];
    if (keyPoints) {
      for (const p of keyPoints) {
        const v = parseFloat(p.value);
        if (!Number.isNaN(v)) allValues.push(v);
      }
    }
  }
  if (allValues.length === 0) return 0;
  return allValues.reduce((a, b) => a + b, 0) / allValues.length;
}

function calculateMinMax(points: HistoryPoint): { min: number; max: number } {
  const allValues: number[] = [];
  for (const key of ['pm10', 'pm25', 'pm1_0'] as const) {
    const keyPoints = points[key];
    if (keyPoints) {
      for (const p of keyPoints) {
        const v = parseFloat(p.value);
        if (!Number.isNaN(v)) allValues.push(v);
      }
    }
  }
  if (allValues.length === 0) return { min: 0, max: 0 };
  return {
    min: Math.min(...allValues),
    max: Math.max(...allValues),
  };
}

export const GET: APIRoute = async ({ locals, url }) => {
  const id = url.searchParams.get('id');
  const range = url.searchParams.get('range') || '24h';

  if (!id) {
    return json({ error: 'Missing sensor id' }, 400);
  }

  const cacheKey = `${id}:${range}`;
  const cached = cache.get(cacheKey);
  const config = getRangeConfig(range);

  if (cached && Date.now() - cached.at < config.ttl) {
    return json(cached.payload);
  }

  try {
    const env = readTbEnv(locals);
    const points = await deviceHistory(
      env,
      id,
      ['pm10', 'pm25', 'pm1_0'],
      config.startTs,
      config.endTs,
      config.interval
    );

    const average = calculateAverage(points);
    const { min, max } = calculateMinMax(points);

    const payload: HistoryResponse = {
      points,
      average,
      min,
      max,
      range: range as '1h' | '24h' | '30d',
    };

    cache.set(cacheKey, { at: Date.now(), payload });
    return json(payload);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 502);
  }
};
```

- [ ] **Step 3: Commit**

```bash
git add src/pages/api/sensors.json.ts src/pages/api/history.json.ts
git commit -m "feat: enhance API endpoints with lastSeen and range parameter"
```

---

## Task 6: Create React Components - StatusBadge

**Files:**
- Create: `src/components/react/StatusBadge.tsx`

- [ ] **Step 1: Create StatusBadge component**

```tsx
// src/components/react/StatusBadge.tsx
import { Badge } from './ui/badge';
import { getSensorStatus } from '@/lib/content';
import type { Sensor } from '@/lib/types';

interface StatusBadgeProps {
  sensor: Sensor;
}

export function StatusBadge({ sensor }: StatusBadgeProps) {
  const status = getSensorStatus(sensor.lastSeen, sensor.active);

  const variantMap = {
    online: 'success' as const,
    offline: 'warning' as const,
    damaged: 'destructive' as const,
  };

  return (
    <Badge variant={variantMap[status.type]} dot>
      {status.label}
    </Badge>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/react/StatusBadge.tsx
git commit -m "feat: add StatusBadge component"
```

---

## Task 7: Create React Components - SensorHeader

**Files:**
- Create: `src/components/react/SensorHeader.tsx`

- [ ] **Step 1: Create SensorHeader component**

```tsx
// src/components/react/SensorHeader.tsx
import { Card, CardContent } from './ui/card';
import { StatusBadge } from './StatusBadge';
import { computeAqi } from '@/lib/aqi';
import type { Sensor, Scale } from '@/lib/types';

interface SensorHeaderProps {
  sensor: Sensor;
  scale: Scale;
}

export function SensorHeader({ sensor, scale }: SensorHeaderProps) {
  const aqi = computeAqi(scale, { pm10: sensor.pm10, pm25: sensor.pm25 });
  const when = new Date(sensor.ts).toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card
      className="border-0 rounded-none"
      style={{
        background: aqi.cls.color,
        color: aqi.cls.textColor,
      }}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold leading-tight">{sensor.name}</h2>
            <p className="text-lg font-semibold mt-2 opacity-90">{aqi.cls.label}</p>
            {aqi.index !== null && (
              <p className="text-sm mt-1 opacity-80">
                {scale === 'caqi' ? `CAQI ${aqi.index}` : `Indeks GIOŚ: ${aqi.index}`}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge sensor={sensor} />
            <p className="text-xs opacity-70">Aktualizacja: {when}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/react/SensorHeader.tsx
git commit -m "feat: add SensorHeader component"
```

---

## Task 8: Create React Components - PollutantCard

**Files:**
- Create: `src/components/react/PollutantCard.tsx`

- [ ] **Step 1: Create PollutantCard component**

```tsx
// src/components/react/PollutantCard.tsx
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { pollutantInfo, percentOfNorm } from '@/lib/content';
import type { Pollutant } from '@/lib/types';

interface PollutantCardProps {
  pollutant: 'pm10' | 'pm25' | 'pm1';
  value: number | null;
  isActive?: boolean;
  onClick?: () => void;
}

function formatValue(value: number | null): string {
  if (value === null || Number.isNaN(value)) return '—';
  return value.toFixed(0);
}

export function PollutantCard({ pollutant, value, isActive, onClick }: PollutantCardProps) {
  const info = pollutantInfo[pollutant === 'pm1' ? 'pm1_0' : pollutant];
  const pct = percentOfNorm(pollutant, value);

  return (
    <TooltipProvider>
      <Card
        className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-primary' : ''}`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <span className="font-semibold text-lg">{info.name}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <div className="space-y-2">
                    <p className="font-semibold">{info.name} - co to jest?</p>
                    <p className="text-xs">{info.description}</p>
                    <p className="text-xs font-medium">{info.health}</p>
                    <p className="text-xs text-muted-foreground">{info.who}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatValue(value)}</div>
              <div className="text-xs text-muted-foreground">µg/m³</div>
            </div>
          </div>
          {pct !== null && (
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={pct > 100 ? 'destructive' : pct > 50 ? 'warning' : 'success'}>
                {pct.toFixed(0)}% normy
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

// Helper function moved from aqi.ts for reuse
function percentOfNorm(pollutant: 'pm10' | 'pm25', value: number | null): number | null {
  if (value === null || Number.isNaN(value)) return null;
  const norms = { pm10: 50, pm25: 25 }; // EU daily norms
  const norm = norms[pollutant];
  return (value / norm) * 100;
}
```

- [ ] **Step 2: Add percentOfNorm to content.ts if not already there**

```typescript
// Add to src/lib/content.ts
export function percentOfNorm(pollutant: 'pm10' | 'pm25', value: number | null): number | null {
  if (value === null || Number.isNaN(value)) return null;
  const norms = { pm10: 50, pm25: 25 }; // EU daily norms
  const norm = norms[pollutant];
  return (value / norm) * 100;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/react/PollutantCard.tsx src/lib/content.ts
git commit -m "feat: add PollutantCard component with educational tooltips"
```

---

## Task 9: Create React Components - ChartSection

**Files:**
- Create: `src/components/react/ChartSection.tsx`

- [ ] **Step 1: Create ChartSection component**

```tsx
// src/components/react/ChartSection.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { HistoryResponse, HistoryPoint } from '@/lib/types';

interface ChartSectionProps {
  sensorId: string;
  selectedPollutant: 'pm10' | 'pm25' | 'pm1_0';
}

type ChartRange = '1h' | '24h' | '30d';

function transformData(points: HistoryPoint, pollutant: 'pm10' | 'pm25' | 'pm1_0') {
  const pollutantData = points[pollutant] || [];
  return pollutantData.map((p) => ({
    timestamp: new Date(p.ts).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    value: parseFloat(p.value),
  }));
}

function formatTimestamp(range: ChartRange, ts: number): string {
  const date = new Date(ts);
  switch (range) {
    case '1h':
      return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    case '24h':
      return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    case '30d':
      return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
    default:
      return date.toLocaleString('pl-PL');
  }
}

function transformDataRange(points: HistoryPoint, pollutant: 'pm10' | 'pm25' | 'pm1_0', range: ChartRange) {
  const pollutantData = points[pollutant] || [];
  return pollutantData.map((p) => ({
    timestamp: formatTimestamp(range, p.ts),
    value: parseFloat(p.value),
  }));
}

export function ChartSection({ sensorId, selectedPollutant }: ChartSectionProps) {
  const [range, setRange] = useState<ChartRange>('24h');
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/history.json?id=${encodeURIComponent(sensorId)}&range=${range}`)
      .then((res) => res.json())
      .then((json: HistoryResponse & { error?: string }) => {
        if (json.error) throw new Error(json.error);
        setData(json);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [sensorId, range]);

  const chartData = data ? transformDataRange(data.points, selectedPollutant, range) : [];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historia</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Ładowanie danych...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historia</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Błąd: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historia</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Brak danych historycznych</p>
        </CardContent>
      </Card>
    );
  }

  const rangeLabels = {
    '1h': 'Ostatnia godzina',
    '24h': 'Ostatnie 24 godziny',
    '30d': 'Ostatnie 30 dni',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historia {selectedPollutant === 'pm1_0' ? 'PM1' : selectedPollutant.toUpperCase()}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={range} onValueChange={(v) => setRange(v as ChartRange)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="1h">1h</TabsTrigger>
            <TabsTrigger value="24h">24h</TabsTrigger>
            <TabsTrigger value="30d">30d</TabsTrigger>
          </TabsList>

          <TabsContent value={range} className="mt-4">
            <div className="mb-4 flex gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Średnia: </span>
                <span className="font-semibold">{data.average.toFixed(1)} µg/m³</span>
              </div>
              <div>
                <span className="text-muted-foreground">Min: </span>
                <span className="font-semibold">{data.min.toFixed(0)} µg/m³</span>
              </div>
              <div>
                <span className="text-muted-foreground">Max: </span>
                <span className="font-semibold">{data.max.toFixed(0)} µg/m³</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="timestamp"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  name={`${selectedPollutant.toUpperCase()} (µg/m³)`}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/react/ChartSection.tsx
git commit -m "feat: add ChartSection component with 1h/24h/30d ranges"
```

---

## Task 10: Create React Components - HealthAdvice

**Files:**
- Create: `src/components/react/HealthAdvice.tsx`

- [ ] **Step 1: Create HealthAdvice component**

```tsx
// src/components/react/HealthAdvice.tsx
import { Card, CardContent } from './ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { getHealthAdvice, aqiInfo } from '@/lib/content';
import type { AqiResult, Scale } from '@/lib/types';

interface HealthAdviceProps {
  aqi: AqiResult;
  scale: Scale;
}

export function HealthAdvice({ aqi, scale }: HealthAdviceProps) {
  const advice = getHealthAdvice(aqi.index);

  return (
    <Card className="bg-gradient-to-br from-card to-muted/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{advice.emoji}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{advice.title}</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <div className="space-y-2">
                      <p className="font-semibold">Indeks jakości powietrza ({scale.toUpperCase()})</p>
                      <p className="text-xs">{aqiInfo[scale].description}</p>
                      <div className="space-y-1 mt-2">
                        {aqiInfo[scale].levels.map((level) => (
                          <div key={level.label} className="flex items-center gap-2 text-xs">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: level.color }}
                            />
                            <span>{level.label}: {level.range}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{advice.advice}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/react/HealthAdvice.tsx
git commit -m "feat: add HealthAdvice component with tooltips"
```

---

## Task 11: Create React Components - Sidebar

**Files:**
- Create: `src/components/react/Sidebar.tsx`

- [ ] **Step 1: Create Sidebar component**

```tsx
// src/components/react/Sidebar.tsx
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { SensorHeader } from './SensorHeader';
import { PollutantCard } from './PollutantCard';
import { ChartSection } from './ChartSection';
import { HealthAdvice } from './HealthAdvice';
import { computeAqi } from '@/lib/aqi';
import type { Sensor, Scale } from '@/lib/types';

interface SidebarProps {
  sensor: Sensor | null;
  scale: Scale;
  onClose: () => void;
}

export function Sidebar({ sensor, scale, onClose }: SidebarProps) {
  const [selectedPollutant, setSelectedPollutant] = useState<'pm10' | 'pm25' | 'pm1_0'>('pm10');

  if (!sensor) return null;

  const aqi = computeAqi(scale, { pm10: sensor.pm10, pm25: sensor.pm25 });

  return (
    <div className="fixed inset-y-0 left-0 w-full sm:w-96 bg-background shadow-xl z-50 overflow-y-auto transform transition-transform">
      <div className="sticky top-0 z-10 flex justify-end p-4 bg-background/80 backdrop-blur-sm">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        <SensorHeader sensor={sensor} scale={scale} />

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
            Pyły zawieszone
          </h3>
          <div className="space-y-2">
            <PollutantCard
              pollutant="pm10"
              value={sensor.pm10}
              isActive={selectedPollutant === 'pm10'}
              onClick={() => setSelectedPollutant('pm10')}
            />
            <PollutantCard
              pollutant="pm25"
              value={sensor.pm25}
              isActive={selectedPollutant === 'pm25'}
              onClick={() => setSelectedPollutant('pm25')}
            />
            <PollutantCard
              pollutant="pm1"
              value={sensor.pm1}
              isActive={selectedPollutant === 'pm1_0'}
              onClick={() => setSelectedPollutant('pm1_0')}
            />
          </div>
        </div>

        <ChartSection
          sensorId={sensor.id}
          selectedPollutant={selectedPollutant}
        />

        <HealthAdvice aqi={aqi} scale={scale} />

        <div className="pb-safe" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/react/Sidebar.tsx
git commit -m "feat: add Sidebar component"
```

---

## Task 12: Create React Components - MapView with Leaflet

**Files:**
- Create: `src/components/react/MapView.tsx`
- Create: `src/components/react/SensorMarker.tsx`

- [ ] **Step 1: Create SensorMarker component**

```tsx
// src/components/react/SensorMarker.tsx
import { CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { computeAqi } from '@/lib/aqi';
import type { Sensor, Scale } from '@/lib/types';

interface SensorMarkerProps {
  sensor: Sensor;
  scale: Scale;
  onClick: () => void;
  selected: boolean;
}

export function SensorMarker({ sensor, scale, onClick, selected }: SensorMarkerProps) {
  const map = useMap();
  const aqi = computeAqi(scale, { pm10: sensor.pm10, pm25: sensor.pm25 });
  const offline = sensor.active === false;

  const handleClick = () => {
    onClick();
    map.panTo([sensor.lat, sensor.lon]);
  };

  return (
    <CircleMarker
      center={[sensor.lat, sensor.lon]}
      radius={selected ? 14 : 11}
      pathOptions={{
        color: '#ffffff',
        weight: 2,
        fillColor: aqi.cls.color,
        fillOpacity: offline ? 0.45 : 1,
        className: offline ? 'marker-offline' : '',
      }}
      eventHandlers={{ click: handleClick }}
    >
      <Tooltip direction="top" offset={[0, -6]} opacity={1}>
        <span className="font-semibold">{sensor.name}</span>
        <br />
        {aqi.cls.label}
        {aqi.index !== null && scale === 'caqi' && ` · CAQI ${aqi.index}`}
        {offline && <br /><i className="text-muted-foreground">offline</i>}
      </Tooltip>
    </CircleMarker>
  );
}
```

- [ ] **Step 2: Create MapView component**

```tsx
// src/components/react/MapView.tsx
import { MapContainer, TileLayer, LayerGroup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { SensorMarker } from './SensorMarker';
import type { Sensor, Scale } from '@/lib/types';

interface MapViewProps {
  sensors: Sensor[];
  scale: Scale;
  selectedId: string | null;
  onMarkerClick: (id: string) => void;
}

const GNIEZNO_CENTER: [number, number] = [52.535, 17.595];

export function MapView({ sensors, scale, selectedId, onMarkerClick }: MapViewProps) {
  return (
    <div className="flex-1 relative">
      <MapContainer
        center={GNIEZNO_CENTER}
        zoom={12}
        className="h-full w-full z-0"
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />
        <LayerGroup>
          {sensors.map((sensor) => (
            <SensorMarker
              key={sensor.id}
              sensor={sensor}
              scale={scale}
              selected={selectedId === sensor.id}
              onClick={() => onMarkerClick(sensor.id)}
            />
          ))}
        </LayerGroup>
      </MapContainer>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/react/MapView.tsx src/components/react/SensorMarker.tsx
git commit -m "feat: add MapView and SensorMarker components with react-leaflet"
```

---

## Task 13: Create React Components - TopBar

**Files:**
- Create: `src/components/react/TopBar.tsx`

- [ ] **Step 1: Create TopBar component**

```tsx
// src/components/react/TopBar.tsx
import { Button } from './ui/button';
import type { Scale } from '@/lib/types';

interface TopBarProps {
  scale: Scale;
  onScaleChange: (scale: Scale) => void;
  updatedAt?: number;
}

export function TopBar({ scale, onScaleChange, updatedAt }: TopBarProps) {
  const timeStr = updatedAt
    ? new Date(updatedAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-card shadow-sm z-20">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🌬️</span>
        <span className="font-bold text-lg">Gniezno · powietrze</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <div className="flex rounded-full overflow-hidden border border-border">
          <Button
            variant={scale === 'caqi' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onScaleChange('caqi')}
            className="rounded-none"
          >
            CAQI
          </Button>
          <Button
            variant={scale === 'gios' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onScaleChange('gios')}
            className="rounded-none"
          >
            GIOŚ
          </Button>
        </div>

        {timeStr && (
          <div className="text-xs text-muted-foreground text-right">
            Aktualizacja {timeStr}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/react/TopBar.tsx
git commit -m "feat: add TopBar component with scale toggle"
```

---

## Task 14: Create Main App Component

**Files:**
- Create: `src/components/react/App.tsx`

- [ ] **Step 1: Create App component**

```tsx
// src/components/react/App.tsx
import { useState, useEffect } from 'react';
import { MapView } from './MapView';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import type { Sensor, Scale, SensorsResponse } from '@/lib/types';

const REFRESH_MS = 60_000;
const SENSORS_URL = '/api/sensors.json';

export function App() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [scale, setScale] = useState<Scale>('caqi');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);

  const selectedSensor = sensors.find((s) => s.id === selectedId) || null;

  useEffect(() => {
    const loadSensors = async () => {
      try {
        const res = await fetch(SENSORS_URL);
        const data: SensorsResponse & { error?: string } = await res.json();
        if (data.error) throw new Error(data.error);
        setSensors(data.sensors ?? []);
        setUpdatedAt(data.updatedAt ?? Date.now());
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        console.error('Błąd pobierania czujników', e);
      }
    };

    loadSensors();
    const interval = setInterval(loadSensors, REFRESH_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-background">
      <TopBar
        scale={scale}
        onScaleChange={setScale}
        updatedAt={updatedAt}
      />

      <MapView
        sensors={sensors}
        scale={scale}
        selectedId={selectedId}
        onMarkerClick={setSelectedId}
      />

      {selectedSensor && (
        <Sidebar
          sensor={selectedSensor}
          scale={scale}
          onClose={() => setSelectedId(null)}
        />
      )}

      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg shadow-lg z-50">
          Błąd połączenia: {error}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/react/App.tsx
git commit -m "feat: add main App component"
```

---

## Task 15: Update Astro Page

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Update index.astro to use React**

```astro
---
// Mapa jakości powietrza — Gniezno
// React + shadcn/ui redesign
import { App } from '../components/react/App';
---

<!doctype html>
<html lang="pl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="theme-color" content="#0aa5b5" />
    <title>Jakość powietrza — Gniezno</title>
    <meta name="description" content="Mapa czujników jakości powietrza w Gnieźnie — PM10, PM2.5, skala CAQI / GIOŚ." />
    <link rel="stylesheet" href="/src/styles/globals.css" />
  </head>
  <body>
    <App client:load />
  </body>
</html>
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: update index.astro to use React App component"
```

---

## Task 16: Fix TypeScript Path Alias

**Files:**
- Modify: `tsconfig.json`

- [ ] **Step 1: Update tsconfig.json for path aliases**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add tsconfig.json
git commit -m "feat: add TypeScript path alias for @/* imports"
```

---

## Task 17: Fix Leaflet CSS and Markers

**Files:**
- Create: `src/styles/leaflet.css`
- Modify: `src/components/react/SensorMarker.tsx`

- [ ] **Step 1: Create custom Leaflet CSS to fix marker rendering**

```css
/* src/styles/leaflet.css */
.leaflet-container {
  font-family: inherit;
}

.marker-offline {
  stroke-dasharray: 4 3;
}
```

- [ ] **Step 2: Update SensorMarker to handle offline styling properly**

```tsx
// Add proper class handling for offline markers
import { CircleMarker, Tooltip, useMap } from 'react-leaflet';
import { computeAqi } from '@/lib/aqi';
import type { Sensor, Scale } from '@/lib/types';

interface SensorMarkerProps {
  sensor: Sensor;
  scale: Scale;
  onClick: () => void;
  selected: boolean;
}

export function SensorMarker({ sensor, scale, onClick, selected }: SensorMarkerProps) {
  const map = useMap();
  const aqi = computeAqi(scale, { pm10: sensor.pm10, pm25: sensor.pm25 });
  const offline = sensor.active === false;

  const handleClick = () => {
    onClick();
    map.panTo([sensor.lat, sensor.lon]);
  };

  // Create custom path options for offline state
  const pathOptions = offline
    ? {
        color: '#ffffff',
        weight: 2,
        fillColor: aqi.cls.color,
        fillOpacity: 0.45,
        dashArray: '4 3',
      }
    : {
        color: '#ffffff',
        weight: 2,
        fillColor: aqi.cls.color,
        fillOpacity: 1,
      };

  return (
    <CircleMarker
      center={[sensor.lat, sensor.lon]}
      radius={selected ? 14 : 11}
      pathOptions={pathOptions}
      eventHandlers={{ click: handleClick }}
    >
      <Tooltip direction="top" offset={[0, -6]} opacity={1}>
        <div>
          <span className="font-semibold">{sensor.name}</span>
          <br />
          {aqi.cls.label}
          {aqi.index !== null && scale === 'caqi' && ` · CAQI ${aqi.index}`}
          {offline && <><br /><i>offline</i></>}
        </div>
      </Tooltip>
    </CircleMarker>
  );
}
```

- [ ] **Step 3: Update globals.css to include Leaflet CSS import**

```css
/* Add to src/styles/globals.css at the top */
@import 'leaflet/dist/leaflet.css';

@tailwind base;
/* ... rest of file */
```

- [ ] **Step 4: Commit**

```bash
git add src/styles/leaflet.css src/styles/globals.css src/components/react/SensorMarker.tsx
git commit -m "fix: improve Leaflet marker styling for offline state"
```

---

## Task 18: Update Gitignore for Build Artifacts

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Update .gitignore**

```
# build output
dist/
.astro/

# deps
node_modules/

# cloudflare / wrangler
.wrangler/
.dev.vars

# vercel
.vercel/

# env / secrets
.env
.env.*
*.local

# os / editor
.DS_Store
Thumbs.db
.vscode/
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: update .gitignore"
```

---

## Task 19: Final Build Test

**Files:**
- None

- [ ] **Step 1: Run development build**

```bash
npm run build
```

Expected: Build succeeds with no errors

- [ ] **Step 2: Run dev server to verify**

```bash
npm run dev
```

Expected: Dev server starts, no console errors

- [ ] **Step 3: Test in browser**

1. Visit http://localhost:4321
2. Check markers render on map
3. Click a marker - sidebar should open
4. Verify tooltips work (hover over ? icons)
5. Check chart tabs (1h, 24h, 30d)
6. Verify health advice displays
7. Test scale toggle (CAQI/GIOŚ)
8. Check responsive on mobile view

- [ ] **Step 4: If everything works, commit final cleanup**

```bash
git add .
git commit -m "chore: final cleanup after successful build test"
```

---

## Task 20: Deploy to Vercel

**Files:**
- None

- [ ] **Step 1: Push to GitHub**

```bash
git push
```

- [ ] **Step 2: Verify Vercel deployment**

1. Go to Vercel dashboard
2. Check deployment is successful
3. Test on live URL
4. Verify env vars are set (TB_URL, TB_USERNAME, TB_PASSWORD)

- [ ] **Step 3: Tag release**

```bash
git tag -a v2.0.0 -m "React + shadcn redesign"
git push --tags
```

---

## Completion Checklist

- [ ] All dependencies installed
- [ ] Tailwind CSS configured
- [ ] shadcn/ui components created
- [ ] API endpoints enhanced (lastSeen, range parameter)
- [ ] All React components created and working
- [ ] Build succeeds locally
- [ ] Dev server runs without errors
- [ ] Features verified (charts, tooltips, health advice)
- [ ] Deployed to Vercel
- [ ] Live URL tested and working
