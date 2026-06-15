import type { TransportType, TransportOption } from '@/types';

export const transportOptions: TransportOption[] = [
  { type: 'walk', name: '步行', carbonFactor: 0, pointsPerKm: 10, icon: '🚶', color: '#00B42A' },
  { type: 'bike', name: '骑行', carbonFactor: 0, pointsPerKm: 8, icon: '🚲', color: '#36CFC9' },
  { type: 'subway', name: '地铁', carbonFactor: 0.05, pointsPerKm: 5, icon: '🚇', color: '#165DFF' },
  { type: 'bus', name: '公交', carbonFactor: 0.08, pointsPerKm: 4, icon: '🚌', color: '#722ED1' },
  { type: 'electric', name: '电动车', carbonFactor: 0.03, pointsPerKm: 3, icon: '🛵', color: '#FAAD14' },
  { type: 'carpool', name: '拼车', carbonFactor: 0.1, pointsPerKm: 3, icon: '🚗', color: '#FF7D00' },
  { type: 'car', name: '自驾', carbonFactor: 0.21, pointsPerKm: 0, icon: '🚙', color: '#F53F3F' }
];

const CAR_CARBON_FACTOR = 0.21;

export function getTransportOption(type: TransportType): TransportOption | undefined {
  return transportOptions.find(opt => opt.type === type);
}

export function calculateCarbonSaved(type: TransportType, distance: number): number {
  const option = getTransportOption(type);
  if (!option) return 0;
  const carEmission = CAR_CARBON_FACTOR * distance;
  const transportEmission = option.carbonFactor * distance;
  const saved = carEmission - transportEmission;
  return Math.max(0, Number(saved.toFixed(2)));
}

export function calculatePoints(type: TransportType, distance: number): number {
  const option = getTransportOption(type);
  if (!option) return 0;
  return Math.round(option.pointsPerKm * distance);
}

export function detectDuplicateCheckIn(records: { date: string; direction: string; time: string }[], newRecord: { date: string; direction: string; time: string }): boolean {
  const sameDayRecords = records.filter(
    r => r.date === newRecord.date && r.direction === newRecord.direction
  );
  if (sameDayRecords.length === 0) return false;
  
  const newTimeMinutes = timeToMinutes(newRecord.time);
  for (const record of sameDayRecords) {
    const recordTimeMinutes = timeToMinutes(record.time);
    if (Math.abs(newTimeMinutes - recordTimeMinutes) < 30) {
      return true;
    }
  }
  return false;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function formatCarbon(kg: number): string {
  if (kg >= 1000) {
    return (kg / 1000).toFixed(2) + ' 吨';
  }
  return kg.toFixed(2) + ' kg';
}

export function formatDistance(km: number): string {
  if (km >= 1) {
    return km.toFixed(1) + ' km';
  }
  return (km * 1000).toFixed(0) + ' m';
}
