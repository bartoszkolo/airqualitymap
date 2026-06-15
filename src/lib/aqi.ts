/**
 * Jakość powietrza — dwie skale, przełączalne w UI:
 *  - 'gios'  : polski indeks GIOŚ (6 klas: Bardzo dobry … Bardzo zły)
 *  - 'caqi'  : europejski Common Air Quality Index (5 klas, wartość 0–100+)
 *
 * Oba liczymy jako sub-indeksy dla PM10 i PM2.5, a wynik czujnika to
 * gorszy (dominujący) z dwóch — tak jak robi to większość map jakości powietrza.
 */

export type Pollutant = 'pm10' | 'pm25';
export type Scale = 'caqi' | 'gios';

export interface AqiClass {
  /** numer klasy (GIOŚ 1–6, CAQI 1–5) */
  level: number;
  label: string;
  color: string;
  /** kolor tekstu dla dobrego kontrastu na tle `color` */
  textColor: string;
}

export interface PollutantResult {
  value: number | null;
  /** wartość indeksu (CAQI: 0–100+, GIOŚ: numer klasy) lub null gdy brak danych */
  index: number | null;
  cls: AqiClass;
}

export interface AqiResult {
  scale: Scale;
  /** dominujący indeks całego czujnika */
  index: number | null;
  cls: AqiClass;
  dominant: Pollutant | null;
  perPollutant: Record<Pollutant, PollutantResult>;
}

const UNKNOWN: AqiClass = {
  level: 0,
  label: 'Brak danych',
  color: '#9ca3af',
  textColor: '#ffffff',
};

/* ------------------------------------------------------------------ GIOŚ */

const GIOS_CLASSES: AqiClass[] = [
  { level: 1, label: 'Bardzo dobry', color: '#57b108', textColor: '#ffffff' },
  { level: 2, label: 'Dobry',        color: '#b0dd10', textColor: '#1a2e05' },
  { level: 3, label: 'Umiarkowany',  color: '#ffd911', textColor: '#3a2f00' },
  { level: 4, label: 'Dostateczny',  color: '#ff9100', textColor: '#ffffff' },
  { level: 5, label: 'Zły',          color: '#e8413d', textColor: '#ffffff' },
  { level: 6, label: 'Bardzo zły',   color: '#990033', textColor: '#ffffff' },
];

// Górne granice stężeń (µg/m³) dla klas 1..5; powyżej ostatniej -> klasa 6.
const GIOS_BREAKS: Record<Pollutant, number[]> = {
  pm10: [20, 50, 80, 110, 150],
  pm25: [13, 35, 55, 75, 110],
};

function giosClass(p: Pollutant, value: number): AqiClass {
  const breaks = GIOS_BREAKS[p];
  for (let i = 0; i < breaks.length; i++) {
    if (value <= breaks[i]) return GIOS_CLASSES[i];
  }
  return GIOS_CLASSES[5];
}

/* ------------------------------------------------------------------ CAQI */

const CAQI_CLASSES: AqiClass[] = [
  { level: 1, label: 'Bardzo niski', color: '#79bc6a', textColor: '#ffffff' },
  { level: 2, label: 'Niski',        color: '#bbcf4c', textColor: '#1a2e05' },
  { level: 3, label: 'Średni',       color: '#eec20b', textColor: '#3a2f00' },
  { level: 4, label: 'Wysoki',       color: '#f29305', textColor: '#ffffff' },
  { level: 5, label: 'Bardzo wysoki',color: '#e8416f', textColor: '#ffffff' },
];

// Siatka CAQI (wartości godzinowe): [stężenie_lo, stężenie_hi, indeks_lo, indeks_hi]
const CAQI_GRID: Record<Pollutant, [number, number, number, number][]> = {
  pm10: [
    [0, 25, 0, 25],
    [25, 50, 25, 50],
    [50, 90, 50, 75],
    [90, 180, 75, 100],
  ],
  pm25: [
    [0, 15, 0, 25],
    [15, 30, 25, 50],
    [30, 55, 50, 75],
    [55, 110, 75, 100],
  ],
};

function caqiIndex(p: Pollutant, value: number): number {
  const grid = CAQI_GRID[p];
  for (const [cLo, cHi, iLo, iHi] of grid) {
    if (value <= cHi) {
      const ratio = (value - cLo) / (cHi - cLo);
      return Math.round(iLo + ratio * (iHi - iLo));
    }
  }
  // ponad ostatnim progiem — ekstrapolacja powyżej 100
  const [cLo, cHi, , iHi] = grid[grid.length - 1];
  const extra = ((value - cHi) / (cHi - cLo)) * (iHi - 75);
  return Math.round(100 + Math.max(0, extra));
}

function caqiClass(index: number): AqiClass {
  if (index < 25) return CAQI_CLASSES[0];
  if (index < 50) return CAQI_CLASSES[1];
  if (index < 75) return CAQI_CLASSES[2];
  if (index <= 100) return CAQI_CLASSES[3];
  return CAQI_CLASSES[4];
}

/* --------------------------------------------------------------- publiczne */

function evalPollutant(scale: Scale, p: Pollutant, value: number | null): PollutantResult {
  if (value == null || Number.isNaN(value)) {
    return { value: null, index: null, cls: UNKNOWN };
  }
  if (scale === 'gios') {
    const cls = giosClass(p, value);
    return { value, index: cls.level, cls };
  }
  const index = caqiIndex(p, value);
  return { value, index, cls: caqiClass(index) };
}

export interface SensorReadings {
  pm10: number | null;
  pm25: number | null;
}

/** Policz wynik czujnika w wybranej skali (dominuje gorszy z PM10/PM2.5). */
export function computeAqi(scale: Scale, r: SensorReadings): AqiResult {
  const perPollutant: Record<Pollutant, PollutantResult> = {
    pm10: evalPollutant(scale, 'pm10', r.pm10),
    pm25: evalPollutant(scale, 'pm25', r.pm25),
  };

  let dominant: Pollutant | null = null;
  let best: PollutantResult | null = null;
  (['pm10', 'pm25'] as Pollutant[]).forEach((p) => {
    const res = perPollutant[p];
    if (res.index == null) return;
    if (best == null || res.index > best.index!) {
      best = res;
      dominant = p;
    }
  });

  if (!best) {
    return { scale, index: null, cls: UNKNOWN, dominant: null, perPollutant };
  }
  return { scale, index: best.index, cls: best.cls, dominant, perPollutant };
}

/** Lista klas do legendy/skali na dole mapy. */
export function scaleLegend(scale: Scale): AqiClass[] {
  return scale === 'gios' ? GIOS_CLASSES : CAQI_CLASSES;
}

/** Normy dobowe (µg/m³) — do pokazania „% normy" jak w Airly. */
export const NORMS: Record<Pollutant, number> = { pm10: 50, pm25: 25 };

export function percentOfNorm(p: Pollutant, value: number | null): number | null {
  if (value == null) return null;
  return Math.round((value / NORMS[p]) * 100);
}
