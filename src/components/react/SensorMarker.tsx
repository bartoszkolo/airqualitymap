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
    <>
      {/* Pulse rings for selected marker */}
      {selected && !offline && (
        <>
          <CircleMarker
            center={[sensor.lat, sensor.lon]}
            radius={22}
            pathOptions={{
              color: aqi.cls.color,
              weight: 0,
              fillColor: aqi.cls.color,
              fillOpacity: 0.3,
            }}
            className="leaflet-pulse-ring"
            style={{ animationDelay: '0s' }}
          />
          <CircleMarker
            center={[sensor.lat, sensor.lon]}
            radius={22}
            pathOptions={{
              color: aqi.cls.color,
              weight: 0,
              fillColor: aqi.cls.color,
              fillOpacity: 0.2,
            }}
            className="leaflet-pulse-ring"
            style={{ animationDelay: '0.6s' }}
          />
        </>
      )}

      {/* Main marker */}
      <CircleMarker
        center={[sensor.lat, sensor.lon]}
        radius={selected ? 14 : 11}
        pathOptions={pathOptions}
        eventHandlers={{ click: handleClick }}
      >
        <Tooltip direction="top" offset={[0, -8]} opacity={1}>
          <div className="text-sm">
            <div className="font-bold text-base">{sensor.name}</div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: aqi.cls.color }}
              />
              <span className="font-medium">{aqi.cls.label}</span>
              {aqi.index !== null && (
                <span className="text-white/70 text-xs">
                  ({scale === 'caqi' ? `CAQI ${aqi.index}` : `GIOŚ ${aqi.index}`})
                </span>
              )}
            </div>
            {offline && (
              <div className="text-xs text-white/70 mt-1 italic">
                Czujnik offline
              </div>
            )}
          </div>
        </Tooltip>
      </CircleMarker>
    </>
  );
}
