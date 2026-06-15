// src/components/react/MiniChart.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { HistoryResponse, HistoryPoint } from '@/lib/types';

interface MiniChartProps {
  sensorId: string;
  selectedPollutant: 'pm10' | 'pm25' | 'pm1_0';
}

type ChartRange = '24h' | '30d';

function formatTimestamp(range: ChartRange, ts: number): string {
  const date = new Date(ts);
  switch (range) {
    case '24h':
      return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    case '30d':
      return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
    default:
      return date.toLocaleString('pl-PL');
  }
}

function transformDataRange(points: HistoryPoint, pollutant: 'pm10' | 'pm25' | 'pm1_0', range: ChartRange) {
  const pollutantData = points[pollutant] || [];
  return pollutantData.map((p) => ({
    timestamp: formatTimestamp(range, p.ts),
    value: Math.round(parseFloat(p.value)),
  }));
}

export function MiniChart({ sensorId, selectedPollutant }: MiniChartProps) {
  const [range, setRange] = useState<ChartRange>('24h');
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/history.json?id=${encodeURIComponent(sensorId)}&range=${range}`)
      .then((res) => res.json())
      .then((json: HistoryResponse & { error?: string }) => {
        if (json.error) throw new Error(json.error);
        setData(json);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [sensorId, range]);

  const chartData = data ? transformDataRange(data.points, selectedPollutant, range) : [];

  return (
    <Card className="border-muted/50">
      <CardContent className="p-4">
        {/* Range tabs */}
        <Tabs value={range} onValueChange={(v) => setRange(v as ChartRange)}>
          <TabsList className="grid w-full grid-cols-2 h-8 bg-muted/50">
            <TabsTrigger value="24h" className="text-xs font-medium">24h</TabsTrigger>
            <TabsTrigger value="30d" className="text-xs font-medium">30 dni</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Chart */}
        <div className="mt-3">
          {loading ? (
            <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
              Ładowanie...
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
              Brak danych
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={128}>
              <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.25} />
                <XAxis
                  dataKey="timestamp"
                  className="text-[10px]"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  className="text-[10px]"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  width={32}
                  tickFormatter={(value) => Math.round(value).toString()}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                  itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                  formatter={(value: number) => [Math.round(value), 'µg/m³']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Simple stats row */}
        {data && !loading && chartData.length > 0 && (
          <div className="flex justify-center gap-6 mt-3 pt-3 border-t border-border/50 text-xs">
            <span className="text-muted-foreground">Śr: <span className="font-semibold text-foreground ml-1">{data.average.toFixed(0)} µg/m³</span></span>
            <span className="text-muted-foreground">Max: <span className="font-semibold text-foreground ml-1">{data.max.toFixed(0)} µg/m³</span></span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
