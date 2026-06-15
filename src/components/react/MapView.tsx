// src/components/react/MapView.tsx
import { memo } from 'react';
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

export const MapView = memo(function MapView({ sensors, scale, selectedId, onMarkerClick }: MapViewProps) {
  return (
    <div className="flex-1 relative">
      <MapContainer
        center={GNIEZNO_CENTER}
        zoom={12}
        className="h-full w-full z-0"
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
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
});
