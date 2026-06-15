// src/components/react/SensorHeader.tsx
import { Card, CardContent } from './ui/card';
import { StatusBadge } from './StatusBadge';
import { computeAqi } from '@/lib/aqi';
import type { Sensor, Scale } from '@/lib/types';

interface SensorHeaderProps {
  sensor: Sensor;
  scale: Scale;
}

export function SensorHeader({ sensor, scale }: SensorHeaderProps) {
  const aqi = computeAqi(scale, { pm10: sensor.pm10, pm25: sensor.pm25 });
  const when = new Date(sensor.ts).toLocaleString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card
      className="border-0 rounded-none"
      style={{
        background: aqi.cls.color,
        color: aqi.cls.textColor,
      }}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold leading-tight">{sensor.name}</h2>
            <p className="text-lg font-semibold mt-2 opacity-90">{aqi.cls.label}</p>
            {aqi.index !== null && (
              <p className="text-sm mt-1 opacity-80">
                {scale === 'caqi' ? `CAQI ${aqi.index}` : `Indeks GIOŚ: ${aqi.index}`}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusBadge sensor={sensor} />
            <p className="text-xs opacity-70">Aktualizacja: {when}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
