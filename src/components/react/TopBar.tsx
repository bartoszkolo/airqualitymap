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
    <div className="flex items-center gap-3 px-4 py-3 bg-card shadow-sm z-20">
      <div className="flex items-center gap-2">
        <span className="text-2xl">🌬️</span>
        <span className="font-bold text-lg">Gniezno · powietrze</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <div className="flex rounded-full overflow-hidden border border-border">
          <Button
            variant={scale === 'caqi' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onScaleChange('caqi')}
            className="rounded-none"
          >
            CAQI
          </Button>
          <Button
            variant={scale === 'gios' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onScaleChange('gios')}
            className="rounded-none"
          >
            GIOŚ
          </Button>
        </div>

        {timeStr && (
          <div className="text-xs text-muted-foreground text-right">
            Aktualizacja {timeStr}
          </div>
        )}
      </div>
    </div>
  );
}
