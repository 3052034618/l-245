import type { CommuteRecord } from '@/types';

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth() + 1;

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const types: Array<{ type: CommuteRecord['type']; minDist: number; maxDist: number }> = [
  { type: 'subway', minDist: 8, maxDist: 15 },
  { type: 'bus', minDist: 5, maxDist: 12 },
  { type: 'bike', minDist: 2, maxDist: 5 },
  { type: 'walk', minDist: 0.5, maxDist: 2 },
  { type: 'carpool', minDist: 10, maxDist: 20 },
  { type: 'electric', minDist: 3, maxDist: 8 }
];

const routes = ['家-公司路线A', '家-公司路线B', '地铁通勤线'];

const employees = [
  { name: '张三', dept: '技术研发部', avatar: 1027 },
  { name: '张明', dept: '技术研发部', avatar: 64 },
  { name: '李华', dept: '产品设计部', avatar: 91 },
  { name: '王芳', dept: '市场运营部', avatar: 177 },
  { name: '刘伟', dept: '人力资源部', avatar: 338 },
  { name: '陈静', dept: '产品设计部', avatar: 338 },
  { name: '杨帆', dept: '技术研发部', avatar: 1027 },
  { name: '赵磊', dept: '行政部', avatar: 64 }
];

function generateRecords(count: number): CommuteRecord[] {
  const records: CommuteRecord[] = [];
  
  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    
    const typeInfo = types[Math.floor(Math.random() * types.length)];
    const distance = Number((typeInfo.minDist + Math.random() * (typeInfo.maxDist - typeInfo.minDist)).toFixed(1));
    
    const isGo = Math.random() > 0.5;
    const hour = isGo ? 7 + Math.floor(Math.random() * 2) : 17 + Math.floor(Math.random() * 2);
    const minute = Math.floor(Math.random() * 60);
    const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    
    const carbonFactor: Record<string, number> = {
      walk: 0, bike: 0, subway: 0.05, bus: 0.08, 
      electric: 0.03, carpool: 0.1, car: 0.21
    };
    const pointsPerKm: Record<string, number> = {
      walk: 10, bike: 8, subway: 5, bus: 4, 
      electric: 3, carpool: 3, car: 0
    };
    
    const carbonSaved = Number((0.21 * distance - carbonFactor[typeInfo.type] * distance).toFixed(2));
    const points = Math.round(pointsPerKm[typeInfo.type] * distance);
    
    const isMakeup = Math.random() < 0.1;
    const emp = employees[i % employees.length];
    
    records.push({
      id: `record-${i}`,
      date: formatDate(date),
      type: typeInfo.type,
      distance,
      carbonSaved: Math.max(0, carbonSaved),
      points,
      direction: isGo ? 'go' : 'back',
      time,
      isMakeup,
      status: isMakeup ? (Math.random() > 0.3 ? 'approved' : (Math.random() > 0.5 ? 'pending' : 'rejected')) : undefined,
      routeName: routes[Math.floor(Math.random() * routes.length)],
      userName: emp.name,
      userDept: emp.dept,
      userAvatarId: emp.avatar
    });
  }
  
  return records.sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return b.time.localeCompare(a.time);
  });
}

export const mockCommuteRecords: CommuteRecord[] = generateRecords(45);

export function getTodayRecords(date: string): CommuteRecord[] {
  return mockCommuteRecords.filter(r => r.date === date);
}

export function getMonthRecords(year: number, monthNum: number): CommuteRecord[] {
  const monthStr = String(monthNum).padStart(2, '0');
  return mockCommuteRecords.filter(r => r.date.startsWith(`${year}-${monthStr}`));
}
