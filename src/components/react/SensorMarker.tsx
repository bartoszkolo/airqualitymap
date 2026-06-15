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

  // Create custom path options for offline state
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
    <CircleMarker
      center={[sensor.lat, sensor.lon]}
      radius={selected ? 14 : 11}
      pathOptions={pathOptions}
      eventHandlers={{ click: handleClick }}
    >
      <Tooltip direction="top" offset={[0, -6]} opacity={1}>
        <div>
          <span className="font-semibold">{sensor.name}</span>
          <br />
          {aqi.cls.label}
          {aqi.index !== null && scale === 'caqi' && ` · CAQI ${aqi.index}`}
          {offline && <><br /><i>offline</i></>}
        </div>
      </Tooltip>
    </CircleMarker>
  );
}
