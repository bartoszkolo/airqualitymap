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

export function percentOfNorm(pollutant: 'pm10' | 'pm25', value: number | null): number | null {
  if (value === null || Number.isNaN(value)) return null;
  const norms = { pm10: 50, pm25: 25 }; // EU daily norms
  const norm = norms[pollutant];
  return (value / norm) * 100;
}
