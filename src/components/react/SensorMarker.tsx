// src/components/react/SensorMarker.tsx
import { Marker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useRef, useEffect, useCallback, useMemo, memo } from 'react';
import { computeAqi } from '@/lib/aqi';
import type { Sensor, Scale } from '@/lib/types';

interface SensorMarkerProps {
  sensor: Sensor;
  scale: Scale;
  onClick: () => void;
  selected: boolean;
}

function createSensorIcon(
  color: string,
  textColor: string,
  index: number | null,
  selected: boolean,
  offline: boolean
): L.DivIcon {
  const size = selected ? 44 : 36;
  const halfSize = size / 2;
  const opacity = offline ? 0.5 : 1;
  const border = offline
    ? `border:2.5px dashed rgba(255,255,255,0.65);`
    : `border:2.5px solid rgba(255,255,255,0.9);`;

  const label =
    index !== null
      ? `<span style="font-size:${selected ? 13 : 11}px;font-weight:800;color:${textColor};line-height:1;letter-spacing:-0.5px;pointer-events:none;">${index}</span>`
      : '';

  const pulse =
    selected && !offline
      ? `<div class="sensor-pulse-ring" style="--pulse-color:${color};"></div>
         <div class="sensor-pulse-ring sensor-pulse-ring--delay" style="--pulse-color:${color};"></div>`
      : '';

  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [halfSize, halfSize],
    tooltipAnchor: [0, -halfSize - 4],
    html: `
      <div class="sensor-icon-wrapper" style="width:${size}px;height:${size}px;">
        ${pulse}
        <div class="sensor-icon-dot" style="
          width:${size}px;height:${size}px;
          background:${color};
          opacity:${opacity};
          ${border}
          box-shadow:0 2px 8px rgba(0,0,0,0.28),0 0 0 1px rgba(0,0,0,0.06);
        ">${label}</div>
      </div>`,
  });
}

export const SensorMarker = memo(function SensorMarker({
  sensor,
  scale,
  onClick,
  selected,
}: SensorMarkerProps) {
  const map = useMap();
  const mapRef = useRef(map);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    mapRef.current = map;
  }, [map]);

  const aqi = computeAqi(scale, { pm10: sensor.pm10, pm25: sensor.pm25 });
  const offline = sensor.active === false;

  const icon = useMemo(
    () => createSensorIcon(aqi.cls.color, aqi.cls.textColor, aqi.index, selected, offline),
    [aqi.cls.color, aqi.cls.textColor, aqi.index, selected, offline]
  );

  // Aktualizuj ikonę imperatywnie — unika migania przy re-mount markera
  useEffect(() => {
    markerRef.current?.setIcon(icon);
  }, [icon]);

  const handleClick = useCallback(() => {
    onClick();
    mapRef.current?.panTo([sensor.lat, sensor.lon]);
  }, [onClick, sensor.lat, sensor.lon]);

  return (
    <Marker
      ref={markerRef}
      position={[sensor.lat, sensor.lon]}
      icon={icon}
      eventHandlers={{ click: handleClick }}
      zIndexOffset={selected ? 1000 : 0}
    >
      <Tooltip direction="top" opacity={1}>
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
            <div className="text-xs text-white/70 mt-1 italic">Czujnik offline</div>
          )}
        </div>
      </Tooltip>
    </Marker>
  );
});
