# Jakość powietrza — Gniezno

Mapa czujników jakości powietrza (PM10 / PM2.5 / PM1) z danymi z **ThingsBoard**,
wdrażana na **Cloudflare Pages**. Markery kolorowane wg jakości powietrza,
przełącznik skali **CAQI ↔ GIOŚ**, panel szczegółów z historią 24h, responsywny
(na telefonie panel jako bottom-sheet).

## Stack

- **Astro 5** (strona statyczna) + **Leaflet** (mapa)
- Endpointy serwerowe (`/api/*`) jako funkcje na Cloudflare Pages — proxy do ThingsBoard
- Adapter `@astrojs/cloudflare`

## Architektura

```
Czujniki → ThingsBoard ──REST──► /api/sensors.json  (lista + najnowsze PM + GPS + online)
                                  /api/history.json  (24h historii dla 1 czujnika)
                                        │ JSON
                                        ▼
                            Frontend (Leaflet + panel)
```

Dane logowania do ThingsBoard **nigdy** nie trafiają do przeglądarki — żyją tylko
w endpointach serwerowych (zmienne środowiskowe).

## Konfiguracja (sekrety)

Endpointy czytają trzy zmienne:

| Zmienna       | Przykład                       |
| ------------- | ------------------------------ |
| `TB_URL`      | `http://54.37.232.178:9090`    |
| `TB_USERNAME` | `bartosz.kolo@gmail.com`       |
| `TB_PASSWORD` | `••••••••`                     |

- **Lokalnie:** plik `.env` (już utworzony, jest w `.gitignore`).
- **Na Cloudflare:** Pages → Settings → *Environment variables* (dla Production i Preview).

> Klucze telemetrii w TB: `pm10`, `pm25`, `pm1_0`. Współrzędne: atrybuty `latitude` / `longitude`.

## Uruchomienie lokalne

```bash
npm install
npm run dev          # http://localhost:4321
```

## Build

```bash
npm run build        # -> dist/
```

## Wdrożenie na Cloudflare Pages

```bash
npx wrangler pages deploy dist
```

Lub przez integrację z Git (zalecane):

1. Wypchnij repo na GitHub.
2. Cloudflare Pages → *Create project* → wskaż repo.
3. Build command: `npm run build`, output dir: `dist`.
4. Dodaj zmienne środowiskowe `TB_URL`, `TB_USERNAME`, `TB_PASSWORD`.

## Skala jakości powietrza

Logika w [`src/lib/aqi.ts`](src/lib/aqi.ts) — dwie przełączalne skale:

- **GIOŚ** — polski indeks, 6 klas (Bardzo dobry … Bardzo zły).
- **CAQI** — europejski, 5 klas, wartość 0–100+.

Wynik czujnika = gorszy (dominujący) sub-indeks z PM10 i PM2.5.

## Co dalej (pomysły)

- Wykres z większej liczby zakresów (7/30 dni).
- Auto-refresh już działa (co 60 s); można dodać websockety TB.
- Dodatkowe metryki, jeśli czujniki je raportują (temp./wilgotność/ciśnienie).
