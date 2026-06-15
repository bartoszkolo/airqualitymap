// src/components/react/HealthAdvice.tsx
import { Card, CardContent } from './ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { getHealthAdvice, aqiInfo } from '@/lib/content';
import type { AqiResult, Scale } from '@/lib/types';

interface HealthAdviceProps {
  aqi: AqiResult;
  scale: Scale;
}

export function HealthAdvice({ aqi, scale }: HealthAdviceProps) {
  const advice = getHealthAdvice(aqi.index);

  return (
    <Card className="bg-gradient-to-br from-card to-muted/20">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{advice.emoji}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{advice.title}</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <div className="space-y-2">
                      <p className="font-semibold">Indeks jakości powietrza ({scale.toUpperCase()})</p>
                      <p className="text-xs">{aqiInfo[scale].description}</p>
                      <div className="space-y-1 mt-2">
                        {aqiInfo[scale].levels.map((level) => (
                          <div key={level.label} className="flex items-center gap-2 text-xs">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: level.color }}
                            />
                            <span>{level.label}: {level.range}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{advice.advice}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
