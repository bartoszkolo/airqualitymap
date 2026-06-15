// Generuje public/data/sensors.json — realistyczne dane testowe.
// Uruchom:  node scripts/gen-mock.mjs
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, '..', 'public', 'data', 'sensors.json');

const now = Date.now();
const HOUR = 3600_000;

// bazowe lokalizacje (okolice Poznania) + bazowy poziom zanieczyszczenia
const base = [
  { id: 'tb-001', name: 'Łubowo',       address: 'Łubowo',            lat: 52.476, lon: 17.464, level: 6 },
  { id: 'tb-002', name: 'Sokolnicka',   address: 'Paczkowo',          lat: 52.378, lon: 17.082, level: 8 },
  { id: 'tb-003', name: 'Pobiedziska',  address: 'Pobiedziska',       lat: 52.479, lon: 17.288, level: 22 },
  { id: 'tb-004', name: 'Swarzędz',     address: 'Swarzędz Centrum',  lat: 52.408, lon: 17.078, level: 41 },
  { id: 'tb-005', name: 'Kostrzyn',     address: 'Kostrzyn',          lat: 52.396, lon: 17.228, level: 63 },
  { id: 'tb-006', name: 'Gniewkowo',    address: 'Gniewkowo',         lat: 52.541, lon: 18.405, level: 95 },
  { id: 'tb-007', name: 'Kleszczewo',   address: 'Kleszczewo',        lat: 52.339, lon: 17.135, level: 130 },
];

const rnd = (a, b) => a + Math.random() * (b - a);

function series(level) {
  const pts = [];
  for (let i = 23; i >= 0; i--) {
    const wobble = Math.sin(i / 3) * level * 0.25 + rnd(-level * 0.15, level * 0.15);
    const pm10 = Math.max(0, +(level + wobble).toFixed(1));
    const pm25 = Math.max(0, +(pm10 * rnd(0.55, 0.8)).toFixed(1));
    pts.push({ ts: now - i * HOUR, pm10, pm25 });
  }
  return pts;
}

const sensors = base.map((b) => {
  const history = series(b.level);
  const last = history[history.length - 1];
  return {
    id: b.id,
    name: b.name,
    address: b.address,
    lat: b.lat,
    lon: b.lon,
    ts: last.ts,
    pm10: last.pm10,
    pm25: last.pm25,
    pm1: +(last.pm25 * rnd(0.6, 0.85)).toFixed(1),
    temperature: +rnd(8, 19).toFixed(1),
    humidity: Math.round(rnd(45, 85)),
    pressure: Math.round(rnd(1005, 1022)),
    history,
  };
});

const payload = { updatedAt: now, sensors };

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(payload, null, 2));
console.log(`Zapisano ${sensors.length} czujników -> ${out}`);
