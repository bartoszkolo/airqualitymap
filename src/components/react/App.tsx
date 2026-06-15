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
