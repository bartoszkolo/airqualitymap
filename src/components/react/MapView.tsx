// src/components/react/MapView.tsx
import { memo, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, LayerGroup, ZoomControl, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { SensorMarker } from './SensorMarker';
import { scaleLegend } from '@/lib/aqi';
import type { Sensor, Scale } from '@/lib/types';

interface MapViewProps {
  sensors: Sensor[];
  scale: Scale;
  selectedId: string | null;
  onMarkerClick: (id: string) => void;
}

const GNIEZNO_CENTER: [number, number] = [52.535, 17.595];

// Legenda kolorów AQI — overlay nad mapą (bottom-left)
function MapLegend({ scale }: { scale: Scale }) {
  const classes = scaleLegend(scale);
  return (
    <div className="absolute bottom-7 right-3 z-[500] bg-background/90 backdrop-blur-sm rounded-xl border border-border/50 shadow-lg px-3 py-2.5 pointer-events-none">
      <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
        {scale === 'caqi' ? 'Indeks CAQI' : 'Indeks GIOŚ'}
      </p>
      <div className="flex flex-col gap-1.5">
        {classes.map((cls) => (
          <div key={cls.level} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: cls.color }} />
            <span className="text-[10px] text-foreground leading-none">{cls.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Fits map to show all sensors once on first load
function FitBoundsOnLoad({ sensors }: { sensors: Sensor[] }) {
  const map = useMap();
  const hasFit = useRef(false);

  useEffect(() => {
    if (hasFit.current || sensors.length === 0) return;
    const bounds = sensors.map((s) => [s.lat, s.lon] as [number, number]);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    hasFit.current = true;
  }, [sensors, map]);

  return null;
}

export const MapView = memo(function MapView({ sensors, scale, selectedId, onMarkerClick }: MapViewProps) {
  return (
    <div className="flex-1 relative">
      <MapLegend scale={scale} />
      <MapContainer
        center={GNIEZNO_CENTER}
        zoom={13}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />
        <ZoomControl position="topright" />
        <FitBoundsOnLoad sensors={sensors} />
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
});
