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

  const markerColor = offline ? '#9ca3af' : aqi.cls.color;
  const markerTextColor = offline ? '#ffffff' : aqi.cls.textColor;

  const icon = useMemo(
    () => createSensorIcon(markerColor, markerTextColor, aqi.index, selected, offline),
    [markerColor, markerTextColor, aqi.index, selected, offline]
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
        <div style={{ padding: '8px 12px', minWidth: 140 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            marginBottom: aqi.cls.label ? 5 : 0,
          }}>
            <span style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: aqi.cls.color,
              flexShrink: 0,
            }} />
            <span style={{ fontWeight: 700, fontSize: 13, color: '#111827', lineHeight: 1.2 }}>
              {sensor.name}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#374151', fontWeight: 600 }}>{aqi.cls.label}</span>
            {aqi.index !== null && (
              <span style={{
                fontSize: 11,
                color: '#6b7280',
                background: '#f3f4f6',
                borderRadius: 4,
                padding: '1px 5px',
              }}>
                {scale === 'caqi' ? `CAQI ${aqi.index}` : `GIOŚ ${aqi.index}`}
              </span>
            )}
          </div>
          {offline && (
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>Offline</div>
          )}
        </div>
      </Tooltip>
    </Marker>
  );
});
