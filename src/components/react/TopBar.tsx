// src/components/react/TopBar.tsx
import { Button } from './ui/button';
import type { Scale } from '@/lib/types';

interface TopBarProps {
  scale: Scale;
  onScaleChange: (scale: Scale) => void;
  updatedAt?: number;
}

export function TopBar({ scale, onScaleChange, updatedAt }: TopBarProps) {
  const timeStr = updatedAt
    ? new Date(updatedAt).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="flex items-center gap-4 px-5 py-4 bg-card/80 backdrop-blur-md border-b border-border z-20 shadow-sm">
      {/* Logo section */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 shadow-lg">
          <span className="text-xl">🌬️</span>
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">Powietrze Gniezno</h1>
          <p className="text-xs text-muted-foreground">Jakość powietrza w czasie rzeczywistym</p>
        </div>
      </div>

      <div className="flex-1" />

      {/* Scale toggle */}
      <div className="flex items-center gap-2 bg-muted/50 rounded-full p-1 border border-border/50">
        <button
          onClick={() => onScaleChange('caqi')}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-all
            ${scale === 'caqi'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          CAQI
        </button>
        <button
          onClick={() => onScaleChange('gios')}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-all
            ${scale === 'gios'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
            }
          `}
        >
          GIOŚ
        </button>
      </div>

      {/* Update time */}
      {timeStr && (
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-lg">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span>Aktualizacja {timeStr}</span>
        </div>
      )}
    </div>
  );
}
