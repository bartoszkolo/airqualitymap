// src/lib/types.ts
export interface Sensor {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  ts: number;
  pm10: number | null;
  pm25: number | null;
  pm1: number | null;
  active: boolean;
  lastSeen?: number; // For offline/damaged detection
}

export interface SensorsResponse {
  updatedAt: number;
  sensors: Sensor[];
}

export type HistoryPoint = Record<'pm10' | 'pm25' | 'pm1_0', { ts: number; value: string }[]>;

export interface HistoryResponse {
  points: HistoryPoint;
  average: number;
  min: number;
  max: number;
  range: '1h' | '24h' | '30d';
}

export type Scale = 'caqi' | 'gios';

export interface AqiResult {
  index: number | null;
  cls: AqiClass;
}

export interface AqiClass {
  label: string;
  color: string;
  textColor: string;
  range: [number, number];
}

export interface SensorStatus {
  type: 'online' | 'offline' | 'damaged';
  label: string;
  description: string;
}

export interface PollutantInfo {
  name: string;
  description: string;
  health: string;
  who: string;
}

export interface HealthAdvice {
  emoji: string;
  title: string;
  advice: string;
  iconColor: string;
}
