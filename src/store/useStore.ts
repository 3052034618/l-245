import { create } from 'zustand';
import type { UserInfo, CommuteRecord, RouteInfo, ExchangeRecord } from '@/types';
import { mockCommuteRecords } from '@/data/mockCommute';
import { mockExchangeRecords } from '@/data/mockGifts';

interface AppState {
  user: UserInfo;
  commuteRecords: CommuteRecord[];
  exchangeRecords: ExchangeRecord[];
  routes: RouteInfo[];
  addCommuteRecord: (record: CommuteRecord) => void;
  addExchangeRecord: (record: ExchangeRecord) => void;
  updateUserPoints: (points: number) => void;
  addRoute: (route: RouteInfo) => void;
  removeRoute: (id: string) => void;
  setDefaultRoute: (id: string) => void;
}

const initialUser: UserInfo = {
  id: 'user-001',
  name: '张三',
  avatarId: 1027,
  department: '技术研发部',
  position: '高级工程师',
  totalPoints: 2680,
  totalCarbon: 56.28,
  totalCommutes: 38,
  isAdmin: true
};

const initialRoutes: RouteInfo[] = [
  {
    id: 'route-1',
    name: '家-公司（地铁）',
    startLocation: '天通苑北站',
    endLocation: '科技园站',
    distance: 12.5,
    isDefault: true
  },
  {
    id: 'route-2',
    name: '家-公司（骑行）',
    startLocation: '龙泽苑小区',
    endLocation: '科技园A座',
    distance: 4.2,
    isDefault: false
  }
];

export const useAppStore = create<AppState>((set, get) => ({
  user: initialUser,
  commuteRecords: mockCommuteRecords,
  exchangeRecords: mockExchangeRecords,
  routes: initialRoutes,
  
  addCommuteRecord: (record: CommuteRecord) => {
    set(state => ({
      commuteRecords: [record, ...state.commuteRecords].sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        return b.time.localeCompare(a.time);
      }),
      user: {
        ...state.user,
        totalPoints: state.user.totalPoints + record.points,
        totalCarbon: Number((state.user.totalCarbon + record.carbonSaved).toFixed(2)),
        totalCommutes: state.user.totalCommutes + 1
      }
    }));
    console.log('[Store] addCommuteRecord', record);
  },
  
  addExchangeRecord: (record: ExchangeRecord) => {
    set(state => ({
      exchangeRecords: [record, ...state.exchangeRecords],
      user: {
        ...state.user,
        totalPoints: state.user.totalPoints - record.points
      }
    }));
    console.log('[Store] addExchangeRecord', record);
  },
  
  updateUserPoints: (points: number) => {
    set(state => ({
      user: {
        ...state.user,
        totalPoints: state.user.totalPoints + points
      }
    }));
  },
  
  addRoute: (route: RouteInfo) => {
    set(state => ({
      routes: [...state.routes, route]
    }));
  },
  
  removeRoute: (id: string) => {
    set(state => ({
      routes: state.routes.filter(r => r.id !== id)
    }));
  },
  
  setDefaultRoute: (id: string) => {
    set(state => ({
      routes: state.routes.map(r => ({
        ...r,
        isDefault: r.id === id
      }))
    }));
  }
}));
