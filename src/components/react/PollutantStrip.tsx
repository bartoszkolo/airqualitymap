// src/components/react/PollutantStrip.tsx
import { memo } from 'react';
import { Badge } from './ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { pollutantInfo } from '@/lib/content';

interface PollutantStripProps {
  pm10: number | null;
  pm25: number | null;
  pm1: number | null;
  selected: 'pm10' | 'pm25' | 'pm1_0';
  onSelect: (p: 'pm10' | 'pm25' | 'pm1_0') => void;
}

type PollutantKey = 'pm10' | 'pm25' | 'pm1_0';

function formatValue(value: number | null): string {
  if (value === null || Number.isNaN(value)) return '—';
  return value.toFixed(0);
}

const POLLUTANTS: { key: PollutantKey; label: string }[] = [
  { key: 'pm10', label: 'PM10' },
  { key: 'pm25', label: 'PM2.5' },
  { key: 'pm1_0', label: 'PM1' },
];

export const PollutantStrip = memo(function PollutantStrip({ pm10, pm25, pm1, selected, onSelect }: PollutantStripProps) {
  const values = { pm10, pm25, pm1_0: pm1 };

  return (
    <div className="flex gap-3">
      {POLLUTANTS.map(({ key, label }) => {
        const value = values[key];
        const info = pollutantInfo[key];
        const isSelected = selected === key;

        // PM1 has no EU norm - show special badge
        const showNoNormBadge = key === 'pm1_0';
        const pct = !showNoNormBadge
          ? (key === 'pm10'
              ? (value && value > 0 ? Math.round((value / 50) * 100) : null)
              : (value && value > 0 ? Math.round((value / 25) * 100) : null))
          : null;

        return (
          <TooltipProvider key={key}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelect(key)}
                  aria-pressed={isSelected}
                  aria-label={`Wybierz ${label}, bieżąca wartość: ${formatValue(value)} µg/m³`}
                  className={`
                    flex-1 flex flex-col items-center min-h-[44px] py-3 px-3 rounded-xl
                    border transition-colors transition-shadow duration-150
                    active:scale-95
                    focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none
                    ${isSelected
                      ? 'border-primary bg-primary/10 shadow-md ring-1 ring-primary/20'
                      : 'border-border bg-card hover:border-primary/30 hover:bg-accent/5'
                    }
                  `}
                >
                  {/* Name with help icon */}
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-sm font-semibold">{label}</span>
                    <HelpCircle
                      className="h-3 w-3 text-muted-foreground opacity-60"
                      aria-hidden="true"
                    />
                  </div>

                  {/* Value */}
                  <div className="text-2xl font-bold tracking-tight">{formatValue(value)}</div>

                  {/* Norm badge - mini */}
                  {showNoNormBadge ? (
                    <Badge
                      variant="secondary"
                      className="text-[10px] h-5 px-1.5 mt-2 font-medium"
                    >
                      Bez normy
                    </Badge>
                  ) : pct !== null && pct > 0 ? (
                    <Badge
                      variant={pct > 100 ? 'destructive' : pct > 50 ? 'warning' : 'success'}
                      className="text-[10px] h-5 px-1.5 mt-2 font-medium"
                    >
                      {pct}%
                    </Badge>
                  ) : null}
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs text-xs p-3">
                <div className="space-y-2">
                  <p className="font-semibold">{info.name}</p>
                  <p className="text-muted-foreground">{info.description}</p>
                  <p className="font-medium text-xs">{info.health}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
});
