// src/components/react/Sidebar.tsx
import { useState, useEffect, useRef } from 'react';
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

const SWIPE_THRESHOLD = 80; // px - swipe distance to trigger close

export function Sidebar({ sensor, scale, closing, onClose }: SidebarProps) {
  const [selectedPollutant, setSelectedPollutant] = useState<'pm10' | 'pm25' | 'pm1_0'>('pm10');
  const [mounted, setMounted] = useState(false);

  // Swipe gesture state
  const [touchStart, setTouchStart] = useState(0);
  const [touchCurrent, setTouchCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const aqi = computeAqi(scale, { pm10: sensor.pm10, pm25: sensor.pm25 });

  // Touch handlers for swipe-to-dismiss (mobile only)
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only on mobile (screen width < 640px)
    if (window.innerWidth < 640) {
      setTouchStart(e.touches[0].clientX);
      setTouchCurrent(e.touches[0].clientX);
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging && window.innerWidth < 640) {
      const currentX = e.touches[0].clientX;
      setTouchCurrent(currentX);

      // Only allow swiping from left edge (x < 50)
      if (touchStart < 50) {
        // Calculate drag distance
        const dragDistance = currentX - touchStart;

        // Apply visual feedback if dragging in right direction
        if (dragDistance > 0 && panelRef.current) {
          panelRef.current.style.transform = `translateX(${dragDistance}px)`;
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const dragDistance = touchCurrent - touchStart;

    // Close if swipe distance exceeds threshold
    if (dragDistance > SWIPE_THRESHOLD) {
      onClose();
    } else if (panelRef.current) {
      // Reset transform
      panelRef.current.style.transform = '';
    }

    setIsDragging(false);
    setTouchStart(0);
    setTouchCurrent(0);
  };

  const translateClass = !mounted || closing ? '-translate-x-full' : 'translate-x-0';

  return (
    <div
      ref={panelRef}
      className={`fixed top-0 sm:top-14 bottom-0 left-0 w-full sm:w-96 bg-background/95 backdrop-blur-md shadow-2xl z-[600] flex flex-col sidebar-panel ${translateClass} ${closing ? 'sidebar-closing' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Drag handle — mobile only */}
      <div className="sm:hidden flex justify-center items-center gap-3 pt-3 pb-1 flex-shrink-0 relative" aria-hidden="true">
        <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        {/* Close button inside handle on mobile */}
        <button
          onClick={onClose}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-muted/80 hover:bg-muted transition-colors"
          aria-label="Zamknij"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* External close tab — desktop only, sticks out to the right */}
      <button
        onClick={onClose}
        className="hidden sm:flex absolute top-4 right-0 translate-x-full z-50 items-center justify-center bg-background border border-l-0 border-border rounded-r-xl shadow-md hover:bg-muted transition-colors"
        style={{ width: 28, paddingTop: 20, paddingBottom: 20 }}
        aria-label="Zamknij"
      >
        <ChevronLeft className="h-4 w-4 text-foreground" />
      </button>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto space-y-3">
        <div className="sidebar-stagger" style={{ animationDelay: '0ms' }}>
          <CompactHeader sensor={sensor} scale={scale} />
        </div>
        <div className="px-3 pb-3 space-y-3">
          <div className="sidebar-stagger" style={{ animationDelay: '50ms' }}>
            <PollutantStrip
              pm10={sensor.pm10}
              pm25={sensor.pm25}
              pm1={sensor.pm1}
              selected={selectedPollutant}
              onSelect={setSelectedPollutant}
            />
          </div>
          <div className="sidebar-stagger" style={{ animationDelay: '100ms' }}>
            <MiniChart
              sensorId={sensor.id}
              selectedPollutant={selectedPollutant}
            />
          </div>
          <div className="sidebar-stagger" style={{ animationDelay: '150ms' }}>
            <EducationCard scale={scale} />
          </div>
        </div>
      </div>
    </div>
  );
}
