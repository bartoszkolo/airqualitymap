// src/components/react/Sidebar.tsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { CompactHeader } from './CompactHeader';
import { PollutantStrip } from './PollutantStrip';
import { MiniChart } from './MiniChart';
import { EducationCard } from './EducationCard';
import { computeAqi } from '@/lib/aqi';
import type { Sensor, Scale } from '@/lib/types';

interface SidebarProps {
  sensor: Sensor;
  scale: Scale;
  closing: boolean;
  onClose: () => void;
}

export function Sidebar({ sensor, scale, closing, onClose }: SidebarProps) {
  const [selectedPollutant, setSelectedPollutant] = useState<'pm10' | 'pm25' | 'pm1_0'>('pm10');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const aqi = computeAqi(scale, { pm10: sensor.pm10, pm25: sensor.pm25 });

  const translateClass = !mounted || closing ? '-translate-x-full' : 'translate-x-0';

  return (
    <div className={`fixed top-0 sm:top-14 bottom-0 left-0 w-full sm:w-96 bg-background/95 backdrop-blur-md shadow-2xl z-40 flex flex-col sidebar-panel ${translateClass} ${closing ? 'sidebar-closing' : ''}`}>
      {/* Drag handle — widoczny tylko na mobile (bottom-sheet) */}
      <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0" aria-hidden="true">
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
      </div>

      {/* Close button - absolute, no space taken */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-background/60 backdrop-blur-sm hover:bg-background hover:shadow-md transition-all"
        aria-label="Zamknij"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {/* Compact header with emoji */}
        <CompactHeader sensor={sensor} scale={scale} />

        {/* Pollutant strip - horizontal */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Pyły zawieszone</h3>
          <PollutantStrip
            pm10={sensor.pm10}
            pm25={sensor.pm25}
            pm1={sensor.pm1}
            selected={selectedPollutant}
            onSelect={setSelectedPollutant}
          />
        </div>

        {/* Mini chart */}
        <div>
          <h3 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Historia</h3>
          <MiniChart
            sensorId={sensor.id}
            selectedPollutant={selectedPollutant}
          />
        </div>

        {/* Education card */}
        <EducationCard scale={scale} />
      </div>
    </div>
  );
}
