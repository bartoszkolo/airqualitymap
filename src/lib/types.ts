/**
 * Kształt danych czujnika oczekiwany przez frontend.
 * W Etapie 1 wypełniany z public/data/sensors.json (mock).
 * W Etapie 2 dokładnie ten sam JSON zwróci funkcja /api/sensors (proxy do ThingsBoard).
 */

export interface HistoryPoint {
  /** epoch ms */
  ts: number;
  pm10: number | null;
  pm25: number | null;
}

export interface Sensor {
  id: string;
  name: string;
  /** np. miejscowość / opis lokalizacji */
  address?: string;
  lat: number;
  lon: number;
  /** czas ostatniego pomiaru (epoch ms) */
  ts: number;
  pm10: number | null;
  pm25: number | null;
  pm1?: number | null;
  temperature?: number | null;
  humidity?: number | null;
  pressure?: number | null;
  /** czujnik online (atrybut `active` w ThingsBoard) */
  active?: boolean;
  /** ostatnie ~24h, najstarszy -> najnowszy */
  history?: HistoryPoint[];
}

export interface SensorsResponse {
  updatedAt: number;
  sensors: Sensor[];
}
