// src/components/react/ChartSection.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { HistoryResponse, HistoryPoint } from '@/lib/types';

interface ChartSectionProps {
  sensorId: string;
  selectedPollutant: 'pm10' | 'pm25' | 'pm1_0';
}

type ChartRange = '1h' | '24h' | '30d';

function formatTimestamp(range: ChartRange, ts: number): string {
  const date = new Date(ts);
  switch (range) {
    case '1h':
      return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
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
    value: parseFloat(p.value),
  }));
}

export function ChartSection({ sensorId, selectedPollutant }: ChartSectionProps) {
  const [range, setRange] = useState<ChartRange>('24h');
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`/api/history.json?id=${encodeURIComponent(sensorId)}&range=${range}`)
      .then((res) => res.json())
      .then((json: HistoryResponse & { error?: string }) => {
        if (json.error) throw new Error(json.error);
        setData(json);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [sensorId, range]);

  const chartData = data ? transformDataRange(data.points, selectedPollutant, range) : [];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historia</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Ładowanie danych...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historia</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Błąd: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data || chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historia</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Brak danych historycznych</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historia {selectedPollutant === 'pm1_0' ? 'PM1' : selectedPollutant.toUpperCase()}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={range} onValueChange={(v) => setRange(v as ChartRange)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="1h">1h</TabsTrigger>
            <TabsTrigger value="24h">24h</TabsTrigger>
            <TabsTrigger value="30d">30d</TabsTrigger>
          </TabsList>

          <TabsContent value={range} className="mt-4">
            <div className="mb-4 flex gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Średnia: </span>
                <span className="font-semibold">{data.average.toFixed(1)} µg/m³</span>
              </div>
              <div>
                <span className="text-muted-foreground">Min: </span>
                <span className="font-semibold">{data.min.toFixed(0)} µg/m³</span>
              </div>
              <div>
                <span className="text-muted-foreground">Max: </span>
                <span className="font-semibold">{data.max.toFixed(0)} µg/m³</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="timestamp"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                  labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  name={`${selectedPollutant.toUpperCase()} (µg/m³)`}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
