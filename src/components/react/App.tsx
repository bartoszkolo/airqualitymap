// src/components/react/App.tsx
import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import type { Sensor, Scale, SensorsResponse } from '@/lib/types';

// Lazy load MapView to avoid Leaflet server-side import
const MapView = lazy(() => import('./MapView').then(m => ({ default: m.MapView })));

const REFRESH_MS = 60_000;
const SENSORS_URL = '/api/sensors.json';

function MapFallback() {
  return (
    <div className="flex-1 flex items-center justify-center bg-muted">
      <p className="text-muted-foreground">Ładowanie mapy...</p>
    </div>
  );
}

function SplashScreen({ hiding }: { hiding: boolean }) {
  return (
    <div className={`splash-overlay${hiding ? ' splash-overlay--out' : ''}`} aria-hidden="true">
      <div className="splash-content">
        <picture>
          <source srcSet="/logo.webp" type="image/webp" />
          <img src="/logo.png" alt="Powietrze Gniezno" className="splash-logo" />
        </picture>
        <div className="splash-dots">
          <span className="splash-dot" />
          <span className="splash-dot" />
          <span className="splash-dot" />
        </div>
      </div>
    </div>
  );
}

export function App() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [scale, setScale] = useState<Scale>('caqi');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [displayedId, setDisplayedId] = useState<string | null>(null);
  const [sidebarClosing, setSidebarClosing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [splashHiding, setSplashHiding] = useState(false);
  const [splashGone, setSplashGone] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstLoad = useRef(true);
  const splashStart = useRef(Date.now());

  const selectedSensor = sensors.find((s) => s.id === selectedId) || null;
  const displayedSensor = sensors.find((s) => s.id === displayedId) || null;

  const handleMarkerClick = (id: string) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setSidebarClosing(false);
    setSelectedId(id);
    setDisplayedId(id);
  };

  const handleClose = () => {
    setSelectedId(null);
    setSidebarClosing(true);
    closeTimerRef.current = setTimeout(() => {
      setDisplayedId(null);
      setSidebarClosing(false);
      closeTimerRef.current = null;
    }, 320); // 300ms animacja + 20ms bufor
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const loadSensors = async () => {
      try {
        const res = await fetch(SENSORS_URL);
        const data: SensorsResponse & { error?: string } = await res.json();
        if (data.error) throw new Error(data.error);
        setSensors(data.sensors ?? []);
        setUpdatedAt(data.updatedAt ?? Date.now());
        setError(null);
        if (firstLoad.current) {
          firstLoad.current = false;
          const elapsed = Date.now() - splashStart.current;
          const remaining = Math.max(0, 2500 - elapsed);
          setTimeout(() => {
            setSplashHiding(true);
            setTimeout(() => setSplashGone(true), 600);
          }, remaining);
        }
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
      {!splashGone && <SplashScreen hiding={splashHiding} />}
      <TopBar
        scale={scale}
        onScaleChange={setScale}
        updatedAt={updatedAt}
      />

      <Suspense fallback={<MapFallback />}>
        <MapView
          sensors={sensors}
          scale={scale}
          selectedId={selectedId}
          onMarkerClick={handleMarkerClick}
        />
      </Suspense>

      {displayedSensor && (
        <Sidebar
          sensor={displayedSensor}
          scale={scale}
          closing={sidebarClosing}
          onClose={handleClose}
        />
      )}

      {error && (
        <div
          role="alert"
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-destructive text-destructive-foreground px-4 py-2.5 rounded-lg shadow-lg max-w-sm w-[calc(100%-2rem)] error-drop-in"
        >
          <span className="text-sm">Błąd połączenia: {error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto p-1 rounded hover:bg-white/20 transition-colors flex-shrink-0"
            aria-label="Zamknij"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
