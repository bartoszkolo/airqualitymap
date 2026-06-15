// src/components/react/CompactHeader.tsx
import { memo } from 'react';
import { StatusBadge } from './StatusBadge';
import { computeAqi } from '@/lib/aqi';
import { getHealthAdvice } from '@/lib/content';
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

  return (
    <div
      className="p-5 relative overflow-hidden rounded-2xl shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${aqi.cls.color} 0%, ${aqi.cls.color}cc 100%)`,
        color: aqi.cls.textColor,
      }}
    >
      {/* Emoji as large background accent */}
      <div className="absolute -right-3 -top-3 text-8xl opacity-20 select-none blur-sm">
        {advice.emoji}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Health advice message - subtle */}
        <p className="text-xs font-medium leading-tight opacity-90">{advice.advice}</p>

        {/* Sensor name + emoji row */}
        <div className="flex items-center gap-3 mt-3 mb-1">
          <span className="text-2xl">{advice.emoji}</span>
          <h2 className="text-lg font-bold leading-tight">{sensor.name}</h2>
        </div>

        {/* AQI status row */}
        <div className="flex items-center justify-between mt-2">
          <div>
            <p className="text-sm font-semibold opacity-95">{aqi.cls.label}</p>
            {aqi.index !== null && (
              <p className="text-xs opacity-80 mt-0.5">
                {scale === 'caqi' ? `CAQI ${aqi.index}` : `GIOŚ: ${aqi.index}`}
              </p>
            )}
          </div>
          <StatusBadge sensor={sensor} />
        </div>

        {/* Update time */}
        <p className="text-xs opacity-70 mt-2">Aktualizacja: {when}</p>
      </div>
    </div>
  );
});
