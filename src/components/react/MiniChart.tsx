// src/components/react/MiniChart.tsx
import { useState, useEffect, memo } from 'react';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { HistoryResponse, HistoryPoint } from '@/lib/types';
import { getCachedHistory, setCachedHistory } from '@/lib/historyCache';

interface MiniChartProps {
  sensorId: string;
  selectedPollutant: 'pm10' | 'pm25' | 'pm1_0';
}

type ChartRange = 'live' | '24h' | '30d';

const EU_NORMS: Partial<Record<'pm10' | 'pm25' | 'pm1_0', number>> = {
  pm10: 50,
  pm25: 25,
};

function formatTimestamp(range: ChartRange, ts: number): string {
  const date = new Date(ts);
  if (range === 'live' || range === '24h') {
    return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' });
}

function transformDataRange(
  points: HistoryPoint,
  pollutant: 'pm10' | 'pm25' | 'pm1_0',
  range: ChartRange
) {
  return (points[pollutant] || []).map((p) => ({
    timestamp: formatTimestamp(range, p.ts),
    value: Math.round(parseFloat(p.value)),
  }));
}

function ChartSkeleton() {
  return (
    <div className="h-32 flex flex-col justify-end gap-1 px-1 pt-4" aria-busy="true" role="status">
      {/* Simulated bars of varying heights */}
      {[55, 70, 45, 80, 60, 90, 50, 75, 65, 85, 40, 70].map((h, i) => (
        <div key={i} style={{ height: `${h}%` }} className="flex-none w-full" />
      ))}
      <div className="flex gap-1 w-full h-32 absolute inset-0 items-end pb-1 px-1">
        {[55, 70, 45, 80, 60, 90, 50, 75, 65, 85, 40, 70].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-muted animate-pulse"
            style={{ height: `${h}%`, animationDelay: `${i * 80}ms` }}
          />
        ))}
      </div>
      <span className="sr-only">Ładowanie wykresu...</span>
    </div>
  );
}

export const MiniChart = memo(function MiniChart({ sensorId, selectedPollutant }: MiniChartProps) {
  const [range, setRange] = useState<ChartRange>('live');
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const apiRange = range === 'live' ? '24h' : range;

    const doFetch = (abort: AbortSignal) => {
      if (range !== 'live') {
        const cached = getCachedHistory(sensorId, range);
        if (cached) { setData(cached); setLoading(false); return; }
      }

      setLoading(true);
      fetch(`/api/history.json?id=${encodeURIComponent(sensorId)}&range=${apiRange}`, { signal: abort })
        .then((res) => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
        .then((json: HistoryResponse & { error?: string }) => {
          if (json.error) throw new Error(json.error);
          if (!abort.aborted) {
            if (range !== 'live') setCachedHistory(sensorId, range, json);
            setData(json);
          }
        })
        .catch(() => { if (!abort.aborted) setData(null); })
        .finally(() => { if (!abort.aborted) setLoading(false); });
    };

    const ac = new AbortController();
    doFetch(ac.signal);

    let interval: ReturnType<typeof setInterval> | null = null;
    if (range === 'live') {
      interval = setInterval(() => {
        const ac2 = new AbortController();
        doFetch(ac2.signal);
      }, 60_000);
    }

    return () => { ac.abort(); if (interval) clearInterval(interval); };
  }, [sensorId, range]);

  const rawChartData = data ? transformDataRange(data.points, selectedPollutant, range) : [];
  const chartData = range === 'live' ? rawChartData.slice(-30) : rawChartData;
  const norm = EU_NORMS[selectedPollutant];
  // Unique gradient ID per sensor — unika konfliktów gdy wiele chartów w DOM
  const gradId = `aqi-grad-${sensorId.replace(/[^a-zA-Z0-9]/g, '_')}`;

  return (
    <Card className="border-muted/50">
      <CardContent className="p-4">
        <Tabs value={range} onValueChange={(v) => setRange(v as ChartRange)}>
          <TabsList className="grid w-full grid-cols-3 h-8 bg-muted/50">
            <TabsTrigger value="live" className="text-xs font-medium flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 motion-reduce:hidden" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
              </span>
              Na żywo
            </TabsTrigger>
            <TabsTrigger value="24h" className="text-xs font-medium">24h</TabsTrigger>
            <TabsTrigger value="30d" className="text-xs font-medium">30 dni</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-3 relative">
          {loading ? (
            <ChartSkeleton />
          ) : chartData.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
              Brak danych historycznych
            </div>
          ) : (
            /* key na sensorId+range+pollutant resetuje mounting → Recharts rysuje animację od nowa */
            <div key={`${sensorId}-${range}-${selectedPollutant}`} className="chart-fade-in">
              <ResponsiveContainer width="100%" height={128}>
                <AreaChart data={chartData} margin={{ top: 4, right: 2, bottom: 0, left: -8 }}>
                  <defs>
                    {/* Gradient: góra = wysokie wartości (czerwony), dół = niskie (zielony) */}
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#e8416f" stopOpacity={0.75} />
                      <stop offset="35%"  stopColor="#f29305" stopOpacity={0.55} />
                      <stop offset="65%"  stopColor="#eec20b" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#79bc6a" stopOpacity={0.08} />
                    </linearGradient>
                    <linearGradient id={`${gradId}-stroke`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#e8416f" stopOpacity={1} />
                      <stop offset="40%"  stopColor="#f29305" stopOpacity={1} />
                      <stop offset="70%"  stopColor="#eec20b" stopOpacity={1} />
                      <stop offset="100%" stopColor="#79bc6a" stopOpacity={1} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    opacity={0.3}
                    vertical={false}
                  />
                  {norm && (
                    <ReferenceLine
                      y={norm}
                      stroke="#f59e0b"
                      strokeDasharray="5 3"
                      strokeWidth={1.5}
                      label={{
                        value: `Norma UE ${norm} µg/m³`,
                        position: 'insideTopRight',
                        fontSize: 9,
                        fill: '#f59e0b',
                        dy: -6,
                      }}
                    />
                  )}
                  <XAxis
                    dataKey="timestamp"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                    interval="preserveStartEnd"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                    width={26}
                    tickFormatter={(v) => Math.round(v).toString()}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, (dataMax: number) => Math.ceil(Math.max(dataMax, norm ?? 0) * 1.2)]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '11px',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                      padding: '6px 10px',
                    }}
                    itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                    labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: 2 }}
                    formatter={(value: number) => [`${Math.round(value)} µg/m³`, '']}
                    cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={`url(#${gradId}-stroke)`}
                    strokeWidth={2}
                    fill={`url(#${gradId})`}
                    dot={false}
                    activeDot={{ r: 4, fill: 'hsl(var(--foreground))', strokeWidth: 0 }}
                    isAnimationActive={true}
                    animationDuration={500}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {data && !loading && chartData.length > 0 && (
          <div className="flex justify-center gap-6 mt-3 pt-3 border-t border-border/50 text-xs">
            <span className="text-muted-foreground">
              Śr: <span className="font-semibold text-foreground ml-1">{data.average.toFixed(0)} µg/m³</span>
            </span>
            <span className="text-muted-foreground">
              Max: <span className="font-semibold text-foreground ml-1">{data.max.toFixed(0)} µg/m³</span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
