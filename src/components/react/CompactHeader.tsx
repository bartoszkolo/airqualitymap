// src/components/react/CompactHeader.tsx
import { memo } from 'react';
import { StatusBadge } from './StatusBadge';
import { computeAqi } from '@/lib/aqi';
import { getHealthAdvice } from '@/lib/content';
import { SENSOR_PHOTOS } from '@/lib/sensorPhotos';
import type { Sensor, Scale } from '@/lib/types';

interface CompactHeaderProps {
  sensor: Sensor;
  scale: Scale;
}

export const CompactHeader = memo(function CompactHeader({ sensor, scale }: CompactHeaderProps) {
  const aqi = computeAqi(scale, { pm10: sensor.pm10, pm25: sensor.pm25 });
  const advice = getHealthAdvice(aqi.index);
  const when = new Date(sensor.ts).toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const photo = SENSOR_PHOTOS[sensor.id];

  return (
    <div className="relative overflow-hidden rounded-xl shadow-md" style={{ color: aqi.cls.textColor }}>
      {/* Building photo */}
      {photo && (
        <img
          src={photo}
          alt={sensor.name}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      )}

      {/* AQI color overlay — gradient: stronger at bottom for text legibility */}
      <div
        className="absolute inset-0"
        style={{
          background: photo
            ? `linear-gradient(to bottom, transparent 0%, ${aqi.cls.color}55 40%, ${aqi.cls.color}cc 70%, ${aqi.cls.color}f0 100%)`
            : `linear-gradient(160deg, ${aqi.cls.color} 0%, ${aqi.cls.color}99 60%, ${aqi.cls.color}bb 100%)`,
        }}
      />

      {/* Background emoji accent */}
      <div className="absolute -right-2 -bottom-2 text-7xl opacity-15 select-none blur-sm pointer-events-none">
        {advice.emoji}
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-4">
        {/* Row 1: emoji + sensor name */}
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">{advice.emoji}</span>
          <h2 className="text-xl font-bold tracking-tight leading-tight drop-shadow-sm">{sensor.name}</h2>
        </div>

        {/* Row 2: AQI label + index inline */}
        <p className="text-sm font-semibold opacity-90 mt-2">
          {aqi.cls.label}
          {aqi.index !== null && (
            <span className="ml-2 text-xs font-normal opacity-75">
              {scale === 'caqi' ? `CAQI ${aqi.index}` : `GIOŚ ${aqi.index}`}
            </span>
          )}
        </p>

        {/* Row 3: health advice */}
        <p className="text-xs opacity-75 mt-1 leading-snug">{advice.advice}</p>

        {/* Row 4: timestamp + status badge */}
        <div className="flex items-center justify-between mt-2.5">
          <p className="text-xs opacity-60">{when}</p>
          <StatusBadge sensor={sensor} />
        </div>
      </div>
    </div>
  );
});
