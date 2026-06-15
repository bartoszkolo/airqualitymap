// src/components/react/TopBar.tsx
import { memo } from 'react';
import type { Scale } from '@/lib/types';

interface TopBarProps {
  scale: Scale;
  onScaleChange: (scale: Scale) => void;
  updatedAt?: number;
}

export const TopBar = memo(function TopBar({ scale, onScaleChange, updatedAt }: TopBarProps) {
  const timeStr = updatedAt
    ? new Date(updatedAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 bg-card border-b border-border z-50 shadow-sm h-14">
      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600 shadow-md flex-shrink-0">
          <span className="text-base" aria-hidden="true">🌬️</span>
        </div>
        <h1 className="font-semibold text-sm leading-tight">Powietrze Gniezno</h1>
      </div>

      <div className="flex-1" />

      {/* Scale toggle — sliding pill */}
      <div
        role="tablist"
        aria-label="Wybór skali jakości powietrza"
        className="relative flex items-center bg-muted/60 rounded-full p-1 border border-border/50"
      >
        {/* Animowany pill */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-1 left-1 rounded-full bg-primary shadow-sm transition-transform duration-200 ease-out"
          style={{
            width: 'calc(50% - 4px)',
            transform: scale === 'caqi' ? 'translateX(0)' : 'translateX(100%)',
          }}
        />
        <button
          role="tab"
          aria-selected={scale === 'caqi'}
          aria-label="Skala CAQI"
          onClick={() => onScaleChange('caqi')}
          className={`relative z-10 flex-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none ${
            scale === 'caqi' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          CAQI
        </button>
        <button
          role="tab"
          aria-selected={scale === 'gios'}
          aria-label="Skala GIOŚ"
          onClick={() => onScaleChange('gios')}
          className={`relative z-10 flex-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none ${
            scale === 'gios' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          GIOŚ
        </button>
      </div>

      {/* Update time */}
      {timeStr && (
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground flex-shrink-0">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 motion-reduce:hidden" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
          </span>
          <span>{timeStr}</span>
        </div>
      )}
    </div>
  );
});
