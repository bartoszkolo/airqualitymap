// src/components/react/Sidebar.tsx
import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
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
      {/* Drag handle — mobile only */}
      <div className="sm:hidden flex justify-center pt-3 pb-1 flex-shrink-0" aria-hidden="true">
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
      </div>

      {/* External close tab — sticks out to the right of the sidebar */}
      <button
        onClick={onClose}
        className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-full z-50 flex items-center justify-center bg-background border border-l-0 border-border rounded-r-xl shadow-md hover:bg-muted transition-colors"
        style={{ width: 28, paddingTop: 20, paddingBottom: 20 }}
        aria-label="Zamknij"
      >
        <ChevronLeft className="h-4 w-4 text-foreground" />
      </button>

      {/* CompactHeader — edge-to-edge, no padding */}
      <CompactHeader sensor={sensor} scale={scale} />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        <PollutantStrip
          pm10={sensor.pm10}
          pm25={sensor.pm25}
          pm1={sensor.pm1}
          selected={selectedPollutant}
          onSelect={setSelectedPollutant}
        />
        <MiniChart
          sensorId={sensor.id}
          selectedPollutant={selectedPollutant}
        />
        <EducationCard scale={scale} />
      </div>
    </div>
  );
}
