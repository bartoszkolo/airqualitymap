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
  const offline = sensor.active === false;
  const cardColor = offline ? '#9ca3af' : aqi.cls.color;
  const cardTextColor = offline ? '#ffffff' : aqi.cls.textColor;
  const advice = getHealthAdvice(aqi.index);
  const when = new Date(sensor.ts).toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  const photo = SENSOR_PHOTOS[sensor.id];

  return (
    <div className="overflow-hidden shadow-sm flex-shrink-0">
      {/* Top: clean building photo */}
      {photo && (
        <div className="h-32 relative">
          <img
            src={photo}
            alt={sensor.name}
            className={`w-full h-full object-cover${offline ? ' grayscale' : ''}`}
            draggable={false}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-8"
            style={{ background: `linear-gradient(to bottom, transparent, ${cardColor})` }}
          />
        </div>
      )}

      {/* Bottom: solid color info section */}
      <div
        className="px-4 py-3 relative overflow-hidden"
        style={{
          background: `linear-gradient(160deg, ${cardColor} 0%, ${cardColor}dd 100%)`,
          color: cardTextColor,
        }}
      >
        {/* Emoji background accent */}
        <div className="absolute -right-2 -bottom-2 text-7xl opacity-15 select-none blur-sm pointer-events-none">
          {advice.emoji}
        </div>

        <div className="relative z-10">
          {/* Row 1: emoji + sensor name */}
          <div className="flex items-center gap-2">
            <span className="text-xl leading-none">{advice.emoji}</span>
            <h2 className="text-xl font-bold tracking-tight leading-tight">{sensor.name}</h2>
          </div>

          {/* Row 2: AQI label + index */}
          <p className="text-sm font-semibold opacity-90 mt-1.5">
            {aqi.cls.label}
            {aqi.index !== null && (
              <span className="ml-2 text-xs font-normal opacity-75">
                {scale === 'caqi' ? `CAQI ${aqi.index}` : `GIOŚ ${aqi.index}`}
              </span>
            )}
          </p>

          {/* Row 3: health advice */}
          <p className="text-xs opacity-75 mt-1 leading-snug">{advice.advice}</p>

          {/* Row 4: timestamp + status */}
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs opacity-60">{when}</p>
            <StatusBadge sensor={sensor} />
          </div>
        </div>
      </div>
    </div>
  );
});
