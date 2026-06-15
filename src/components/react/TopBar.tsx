// src/components/react/TopBar.tsx
import { memo } from 'react';
import { LiveIndicator } from './ui/live-indicator';
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
      <div className="flex items-center flex-shrink-0">
        <picture>
          <source srcSet="/logo.webp" type="image/webp" />
          <img src="/logo.png" alt="Powietrze Gniezno" className="h-11 w-auto" />
        </picture>
      </div>

      {/* H1 for SEO - visually hidden but accessible to screen readers */}
      <h1 className="sr-only">Powietrze Gniezno - Mapa jakości powietrza</h1>

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
          <LiveIndicator />
          <span>{timeStr}</span>
        </div>
      )}
    </div>
  );
});
