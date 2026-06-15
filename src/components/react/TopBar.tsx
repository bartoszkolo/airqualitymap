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
    <div className="flex items-center gap-4 px-5 py-4 bg-card/80 backdrop-blur-md border-b border-border z-20 shadow-sm">
      {/* Logo section */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg">
          <span className="text-xl" aria-hidden="true">🌬️</span>
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">Powietrze Gniezno</h1>
          <p className="text-xs text-muted-foreground">Jakość powietrza w czasie rzeczywistym</p>
        </div>
      </div>

      <div className="flex-1" />

      {/* Scale toggle — sliding pill */}
      <div
        role="tablist"
        aria-label="Wybór skali jakości powietrza"
        className="relative flex items-center bg-muted/50 rounded-full p-1 border border-border/50"
      >
        {/* Animowany pill — przesuwa się między CAQI a GIOŚ */}
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
          aria-label="Skala CAQI - Common Air Quality Index"
          onClick={() => onScaleChange('caqi')}
          className={`relative z-10 flex-1 min-h-[44px] px-4 py-3 rounded-full text-sm font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none ${
            scale === 'caqi' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          CAQI
        </button>
        <button
          role="tab"
          aria-selected={scale === 'gios'}
          aria-label="Skala GIOŚ - Polski indeks jakości powietrza"
          onClick={() => onScaleChange('gios')}
          className={`relative z-10 flex-1 min-h-[44px] px-4 py-3 rounded-full text-sm font-medium transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none ${
            scale === 'gios' ? 'text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          GIOŚ
        </button>
      </div>

      {/* Update time */}
      {timeStr && (
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg min-h-[44px]">
          <span className="relative flex h-2 w-2 motion-reduce:static">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 motion-reduce:hidden"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span>Aktualizacja {timeStr}</span>
        </div>
      )}
    </div>
  );
});
