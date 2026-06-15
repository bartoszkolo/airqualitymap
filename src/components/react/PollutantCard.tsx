// src/components/react/PollutantCard.tsx
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { pollutantInfo, percentOfNorm } from '@/lib/content';
import type { Pollutant } from '@/lib/types';

interface PollutantCardProps {
  pollutant: 'pm10' | 'pm25' | 'pm1';
  value: number | null;
  isActive?: boolean;
  onClick?: () => void;
}

function formatValue(value: number | null): string {
  if (value === null || Number.isNaN(value)) return '—';
  return value.toFixed(0);
}

export function PollutantCard({ pollutant, value, isActive, onClick }: PollutantCardProps) {
  const info = pollutantInfo[pollutant === 'pm1' ? 'pm1_0' : pollutant];
  const pct = percentOfNorm(pollutant, value);

  return (
    <TooltipProvider>
      <Card
        className={`cursor-pointer transition-all ${isActive ? 'ring-2 ring-primary' : ''}`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <span className="font-semibold text-lg">{info.name}</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <div className="space-y-2">
                    <p className="font-semibold">{info.name} - co to jest?</p>
                    <p className="text-xs">{info.description}</p>
                    <p className="text-xs font-medium">{info.health}</p>
                    <p className="text-xs text-muted-foreground">{info.who}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{formatValue(value)}</div>
              <div className="text-xs text-muted-foreground">µg/m³</div>
            </div>
          </div>
          {pct !== null && (
            <div className="mt-2 flex items-center gap-2">
              <Badge variant={pct > 100 ? 'destructive' : pct > 50 ? 'warning' : 'success'}>
                {pct.toFixed(0)}% normy
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
