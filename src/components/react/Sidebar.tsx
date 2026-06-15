// src/components/react/Sidebar.tsx
import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { SensorHeader } from './SensorHeader';
import { PollutantCard } from './PollutantCard';
import { ChartSection } from './ChartSection';
import { HealthAdvice } from './HealthAdvice';
import { computeAqi } from '@/lib/aqi';
import type { Sensor, Scale } from '@/lib/types';

interface SidebarProps {
  sensor: Sensor | null;
  scale: Scale;
  onClose: () => void;
}

export function Sidebar({ sensor, scale, onClose }: SidebarProps) {
  const [selectedPollutant, setSelectedPollutant] = useState<'pm10' | 'pm25' | 'pm1_0'>('pm10');

  if (!sensor) return null;

  const aqi = computeAqi(scale, { pm10: sensor.pm10, pm25: sensor.pm25 });

  return (
    <div className="fixed inset-y-0 left-0 w-full sm:w-96 bg-background shadow-xl z-50 overflow-y-auto transform transition-transform">
      <div className="sticky top-0 z-10 flex justify-end p-4 bg-background/80 backdrop-blur-sm">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        <SensorHeader sensor={sensor} scale={scale} />

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3 px-1">
            Pyły zawieszone
          </h3>
          <div className="space-y-2">
            <PollutantCard
              pollutant="pm10"
              value={sensor.pm10}
              isActive={selectedPollutant === 'pm10'}
              onClick={() => setSelectedPollutant('pm10')}
            />
            <PollutantCard
              pollutant="pm25"
              value={sensor.pm25}
              isActive={selectedPollutant === 'pm25'}
              onClick={() => setSelectedPollutant('pm25')}
            />
            <PollutantCard
              pollutant="pm1"
              value={sensor.pm1}
              isActive={selectedPollutant === 'pm1_0'}
              onClick={() => setSelectedPollutant('pm1_0')}
            />
          </div>
        </div>

        <ChartSection
          sensorId={sensor.id}
          selectedPollutant={selectedPollutant}
        />

        <HealthAdvice aqi={aqi} scale={scale} />

        <div className="pb-safe" />
      </div>
    </div>
  );
}
