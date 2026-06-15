// src/components/react/EducationCard.tsx
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Info } from 'lucide-react';
import { aqiInfo } from '@/lib/content';
import type { Scale } from '@/lib/types';

interface EducationCardProps {
  scale: Scale;
}

export function EducationCard({ scale }: EducationCardProps) {
  const info = aqiInfo[scale];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="w-full text-left group">
          <Card className="border-muted/50 hover:border-primary/30 transition-colors cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">O jakości powietrza</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Dowiedz się, jak odczytywać wskaźniki
                </p>
              </div>
            </CardContent>
          </Card>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Skala {scale.toUpperCase()}</DialogTitle>
          <DialogDescription>{info.description}</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <h4 className="font-semibold text-sm">Poziomy jakości powietrza:</h4>
          {info.levels.map((level) => (
            <div key={level.label} className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: level.color }}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{level.label}</span>
                  <Badge variant="outline" className="text-xs">
                    {level.range}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border/50 space-y-2 text-sm text-muted-foreground">
          <h4 className="font-semibold text-foreground">Co oznaczają pyły zawieszone?</h4>
          <p>
            <strong>PM10</strong> - cząstki o średnicy ≤10 µm. Pochodzą z spalania paliw, przemysłu i transportu.
          </p>
          <p>
            <strong>PM2.5</strong> - cząstki ≤2.5 µm. Bardzo szkodliwe - przenikają do płuc i krwioobiegu.
          </p>
          <p>
            <strong>PM1</strong> - najdrobniejsze cząstki ≤1 µm. Najbardziej niebezpieczne dla zdrowia.
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            Wskaźnik % normy pokazuje stosunek aktualnego stężenia do dobowej normy UE (PM10: 50 µg/m³, PM2.5: 25 µg/m³).
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
