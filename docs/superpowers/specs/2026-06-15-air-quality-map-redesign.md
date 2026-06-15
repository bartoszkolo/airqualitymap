# Air Quality Map Redesign - Feature Spec

**Date:** 2025-06-15
**Status:** Approved

## Overview
Redesign the air quality map with modern React/shadcn UI, add comprehensive statistics (1h/24h/30d averages), educational tooltips, and health advice.

## Tech Stack Migration

### From (Current)
- Astro 6.4.7 (vanilla JS client)
- @astrojs/vercel adapter
- Custom SVG charts
- Leaflet (vanilla)

### To (New)
- Astro 6.4.7 (server mode)
- React client components via `@astrojs/react`
- Tailwind CSS via `@astrojs/tailwind`
- shadcn/ui components
- Recharts for data visualization
- react-leaflet for map

## New Features

### 1. Enhanced Statistics Panel

**Three chart ranges with averages:**
- **1 hour:** Minute-level data with hourly average displayed
- **24 hours:** Hourly averages with daily summary
- **30 days:** Daily averages with trend line

Each chart shows:
- PM10, PM2.5, PM1 as separate lines or toggleable
- Average value prominently displayed
- Min/max indicators

### 2. Educational Tooltips

**"?" buttons next to:**
- PM10, PM2.5, PM1 values - explaining what these pollutants are
- CAQI/GIOŚ index - what the numbers mean
- Health advice section

Tooltip content:
```typescript
const pollutantInfo = {
  pm10: {
    name: "PM10",
    description: "Pył zawieszony PM10 - cząstki o średnicy ≤10 µm. Pochodzą z spalania paliw, przemysłu, transportu. Wdychane dostają się do gardła i oskrzeli.",
    health: "Norma dobowe: 50 µg/m³ (roczna: 40 µg/m³)"
  },
  pm25: {
    name: "PM2.5",
    description: "Pył zawiszony PM2.5 - cząstki o średnicy ≤2.5 µm. Bardzo szkodliwe, przenikają do płuc i krwioobiegu.",
    health: "Norma dobowe: 25 µg/m³ (roczna: 10 µg/m³)"
  },
  pm1_0: {
    name: "PM1",
    description: "Najdrobniejsze cząstki, najbardziej szkodliwe dla zdrowia.",
    health: "Brak oficjalnej normy w UE"
  }
};

const aqiInfo = {
  caqi: {
    description: "Common Air Quality Index - europejski indeks jakości powietrza",
    levels: [
      { label: "Bardzo dobre", range: "0-25", color: "green" },
      { label: "Dobre", range: "25-50", color: "yellow" },
      { label: "Umiarkowane", range: "50-75", color: "orange" },
      { label: "Złe", range: "75-100", color: "red" },
      { label: "Bardzo złe", range: "100+", color: "purple" }
    ]
  }
};
```

### 3. Health Advice Display

**Based on CAQI level:**
```typescript
const healthAdvice = {
  veryGood: {
    emoji: "😊",
    title: "Powietrze bardzo dobre",
    advice: "Idealne warunki do aktywności na zewnątrz. Korzystaj z każdej okazji!"
  },
  good: {
    emoji: "🙂",
    title: "Powietrze dobre",
    advice: "Dobra jakość powietrza. Można uprawiać sport na zewnątrz."
  },
  moderate: {
    emoji: "😐",
    title: "Powietrze umiarkowane",
    advice: "Osoby wrażliwe mogą odczuwać dyskomfort. Rozważ ograniczenie wysiłku."
  },
  poor: {
    emoji: "😷",
    title: "Powietrze złe",
    advice: "Unikaj długiego przebywania na zewnątrz. Zalecana maska przy wyjściu."
  },
  veryPoor: {
    emoji: "🏠",
    title: "Powietrze bardzo złe",
    advice: "Zostań w domu! Otwieraj okna tylko w godzinach nocnych. Unikaj wysiłku."
  }
};
```

### 4. Sensor Status Improvements

**Status states:**
- 🟢 **Online** - actively reporting
- 🟡 **Offline** - no data in last 30min (might be temporary)
- 🔴 **Uszkodzony** - no data in 24h+ (likely damaged)

Display in sidebar header with appropriate styling.

## Component Architecture

```
src/
├── components/
│   ├── MapView.astro          # Astro wrapper for React
│   ├── react/
│   │   ├── App.tsx            # Main layout + routing
│   │   ├── MapView.tsx        # Leaflet wrapper
│   │   ├── SensorMarker.tsx   # Custom marker component
│   │   ├── Sidebar.tsx        # Side panel
│   │   ├── SensorHeader.tsx   # Sensor name + status + CAQI
│   │   ├── PollutantCard.tsx  # PM10/PM2.5/PM1 with tooltip
│   │   ├── HourlyStats.tsx    # 1h average display
│   │   ├── ChartSection.tsx   # 3 chart tabs (1h/24h/30d)
│   │   ├── HealthAdvice.tsx   # Health recommendations
│   │   ├── TopBar.tsx         # Logo + scale toggle
│   │   └── ui/                # shadcn components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── tooltip.tsx
│   │       ├── tabs.tsx
│   │       └── badge.tsx
├── pages/
│   ├── index.astro            # Main page (React entry)
│   └── api/
│       ├── sensors.json.ts    # Enhanced: supports cached averages
│       └── history.json.ts    # Enhanced: range parameter (1h|24h|30d)
└── lib/
    ├── types.ts               # Enhanced types
    ├── aqi.ts                 # Keep existing
    ├── thingsboard.ts         # Keep existing
    └── env.ts                 # Keep existing
```

## API Changes

### Enhanced `/api/history.json`

**New query parameters:**
```typescript
interface HistoryQuery {
  id: string;           // Sensor ID
  range: '1h' | '24h' | '30d';  // Time range
}

interface HistoryResponse {
  points: HistoryPoint[];
  average: number;      // Calculated average
  min: number;
  max: number;
}
```

**Backend logic:**
```typescript
// Based on range parameter
const rangeConfig = {
  '1h': { interval: 60000, agg: 'AVG' },      // 1min intervals
  '24h': { interval: 3600000, agg: 'AVG' },   // 1h intervals
  '30d': { interval: 86400000, agg: 'AVG' }   // 1day intervals
};
```

## Data Flow

1. **Initial load:**
   - Fetch `/api/sensors.json` → current readings + metadata
   - Render markers on map

2. **On marker click:**
   - Open sidebar with sensor details
   - Immediately show current data
   - Start loading 1h data
   - Pre-fetch 24h data in background

3. **On chart tab change:**
   - Load data for selected range
   - Show cached if available
   - Display with Recharts LineChart

## Styling (Tailwind + shadcn)

**Color scheme:**
```css
Primary: zinc/slate scale
Accent: cyan-600 (#0891b2) - matching current brand
Success: green-600
Warning: yellow-600
Danger: red-600

Background: zinc-50
Surface: white
Border: zinc-200
```

**Components use:**
- `card` - styled containers
- `badge` - status indicators
- `tooltip` - "?" buttons
- `tabs` - chart range switcher
- `button` - interactive elements

## Migration Steps

1. Install dependencies (@astrojs/react, @astrojs/tailwind, tailwindcss, recharts, react-leaflet, @radix-ui/*)
2. Configure Tailwind
3. Initialize shadcn/ui
4. Create React component structure
5. Implement new features (charts, tooltips, health advice)
6. Test locally
7. Deploy to Vercel

## Performance Considerations

- Cache API responses (1h TTL for current, longer for historical)
- Lazy load chart data
- Recharts handles large datasets efficiently
- Consider pagination for 30d data if too many points

## Success Criteria

- [x] Three chart ranges working (1h, 24h, 30d)
- [x] Averages calculated and displayed
- [x] Tooltips explain pollutants and indexes
- [x] Health advice shown based on air quality
- [x] Sensor status clearly indicated (online/offline/damaged)
- [x] Modern shadcn-style design
- [x] Mobile responsive
