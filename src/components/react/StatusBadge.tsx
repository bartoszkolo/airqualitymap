// src/components/react/StatusBadge.tsx
import { Badge } from './ui/badge';
import { getSensorStatus } from '@/lib/content';
import type { Sensor } from '@/lib/types';

interface StatusBadgeProps {
  sensor: Sensor;
}

export function StatusBadge({ sensor }: StatusBadgeProps) {
  const status = getSensorStatus(sensor.lastSeen, sensor.active);

  const variantMap = {
    online: 'success' as const,
    offline: 'warning' as const,
    damaged: 'destructive' as const,
  };

  return (
    <Badge variant={variantMap[status.type]} dot>
      {status.label}
    </Badge>
  );
}
