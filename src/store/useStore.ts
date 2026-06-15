import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type { UserInfo, CommuteRecord, RouteInfo, ExchangeRecord, CarpoolInfo, CarpoolMember } from '@/types';
import { mockCommuteRecords } from '@/data/mockCommute';
import { mockExchangeRecords } from '@/data/mockGifts';
import { mockCarpoolList } from '@/data/mockRanking';

const STORAGE_KEY = 'low_carbon_commute_data_v1';

interface PersistedData {
  user: UserInfo;
  commuteRecords: CommuteRecord[];
  exchangeRecords: ExchangeRecord[];
  routes: RouteInfo[];
  carpools: CarpoolInfo[];
}

interface AppState {
  user: UserInfo;
  commuteRecords: CommuteRecord[];
  exchangeRecords: ExchangeRecord[];
  routes: RouteInfo[];
  carpools: CarpoolInfo[];
  joinedCarpoolIds: string[];
  
  _persist: () => void;
  _hydrate: () => void;
  
  addCommuteRecord: (record: CommuteRecord) => void;
  addExchangeRecord: (record: ExchangeRecord) => void;
  updateUserPoints: (points: number) => void;
  
  addRoute: (route: RouteInfo) => void;
  removeRoute: (id: string) => void;
  setDefaultRoute: (id: string) => void;
  updateRoute: (id: string, updates: Partial<RouteInfo>) => void;
  
  addCarpool: (carpool: CarpoolInfo) => void;
  joinCarpool: (carpoolId: string, member: CarpoolMember) => { success: boolean; message: string };
  leaveCarpool: (carpoolId: string, memberId: string) => void;
  cancelCarpool: (carpoolId: string) => { success: boolean; message: string };
  
  reviewMakeup: (recordId: string, approved: boolean, note?: string) => void;
  batchReviewMakeup: (recordIds: string[], approved: boolean, note?: string) => { success: number; message: string };
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

const initialCarpools: CarpoolInfo[] = mockCarpoolList.map(c => ({
  ...c,
  initiatorDept: '技术研发部',
  members: [],
  createTime: new Date().toLocaleString('zh-CN'),
  status: c.joinedCount >= c.seats ? 'full' : 'open'
}));

function loadFromStorage(): PersistedData | null {
  try {
    const data = Taro.getStorageSync(STORAGE_KEY);
    if (data) {
      console.log('[Store] 从本地存储加载数据成功');
      return JSON.parse(data) as PersistedData;
    }
  } catch (e) {
    console.error('[Store] 本地存储加载失败:', e);
  }
  return null;
}

function saveToStorage(data: PersistedData) {
  try {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(data));
    console.log('[Store] 数据已持久化到本地存储');
  } catch (e) {
    console.error('[Store] 本地存储保存失败:', e);
  }
}

export const useAppStore = create<AppState>((set, get) => {
  const persisted = loadFromStorage();
  
  return {
    user: persisted?.user || initialUser,
    commuteRecords: persisted?.commuteRecords || mockCommuteRecords,
    exchangeRecords: persisted?.exchangeRecords || mockExchangeRecords,
    routes: persisted?.routes || initialRoutes,
    carpools: persisted?.carpools || initialCarpools,
    joinedCarpoolIds: [],
    
    _persist: () => {
      const { user, commuteRecords, exchangeRecords, routes, carpools } = get();
      saveToStorage({ user, commuteRecords, exchangeRecords, routes, carpools });
    },
    
    _hydrate: () => {
      const persisted = loadFromStorage();
      if (persisted) {
        set({
          user: persisted.user,
          commuteRecords: persisted.commuteRecords,
          exchangeRecords: persisted.exchangeRecords,
          routes: persisted.routes,
          carpools: persisted.carpools
        });
      }
    },
    
    addCommuteRecord: (record: CommuteRecord) => {
      set(state => {
        let newUser = state.user;
        const isMakeupPending = record.isMakeup && record.status === 'pending';
        
        if (!isMakeupPending) {
          newUser = {
            ...state.user,
            totalPoints: state.user.totalPoints + record.points,
            totalCarbon: Number((state.user.totalCarbon + record.carbonSaved).toFixed(2)),
            totalCommutes: state.user.totalCommutes + 1
          };
        }
        
        const newRecords = [record, ...state.commuteRecords].sort((a, b) => {
          if (a.date !== b.date) return b.date.localeCompare(a.date);
          return b.time.localeCompare(a.time);
        });
        
        return {
          commuteRecords: newRecords,
          user: newUser
        };
      });
      get()._persist();
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
      get()._persist();
      console.log('[Store] addExchangeRecord', record);
    },
    
    updateUserPoints: (points: number) => {
      set(state => ({
        user: {
          ...state.user,
          totalPoints: state.user.totalPoints + points
        }
      }));
      get()._persist();
    },
    
    addRoute: (route: RouteInfo) => {
      set(state => {
        let newRoutes = [...state.routes];
        if (route.isDefault) {
          newRoutes = newRoutes.map(r => ({ ...r, isDefault: false }));
        }
        newRoutes.push(route);
        return { routes: newRoutes };
      });
      get()._persist();
      console.log('[Store] addRoute', route);
    },
    
    removeRoute: (id: string) => {
      set(state => {
        const routeToRemove = state.routes.find(r => r.id === id);
        let newRoutes = state.routes.filter(r => r.id !== id);
        if (routeToRemove?.isDefault && newRoutes.length > 0) {
          newRoutes[0] = { ...newRoutes[0], isDefault: true };
        }
        return { routes: newRoutes };
      });
      get()._persist();
      console.log('[Store] removeRoute', id);
    },
    
    setDefaultRoute: (id: string) => {
      set(state => ({
        routes: state.routes.map(r => ({
          ...r,
          isDefault: r.id === id
        }))
      }));
      get()._persist();
      console.log('[Store] setDefaultRoute', id);
    },
    
    updateRoute: (id: string, updates: Partial<RouteInfo>) => {
      set(state => {
        let newRoutes = state.routes.map(r => 
          r.id === id ? { ...r, ...updates } : r
        );
        if (updates.isDefault) {
          newRoutes = newRoutes.map(r => 
            r.id === id ? r : { ...r, isDefault: false }
          );
        }
        return { routes: newRoutes };
      });
      get()._persist();
      console.log('[Store] updateRoute', id, updates);
    },
    
    addCarpool: (carpool: CarpoolInfo) => {
      set(state => ({
        carpools: [carpool, ...state.carpools]
      }));
      get()._persist();
      console.log('[Store] addCarpool', carpool);
    },
    
    joinCarpool: (carpoolId: string, member: CarpoolMember) => {
      const state = get();
      const carpool = state.carpools.find(c => c.id === carpoolId);
      
      if (!carpool) {
        return { success: false, message: '拼车不存在' };
      }
      
      if (carpool.status !== 'open') {
        return { success: false, message: '拼车已关闭或已满员' };
      }
      
      if (carpool.members.length >= carpool.seats) {
        return { success: false, message: '座位已满' };
      }
      
      if (carpool.members.some(m => m.id === member.id)) {
        return { success: false, message: '您已加入该拼车' };
      }
      
      const newMembers = [...carpool.members, member];
      const newJoinedCount = newMembers.length;
      const newStatus = newJoinedCount >= carpool.seats ? 'full' : 'open';
      
      set(s => ({
        carpools: s.carpools.map(c => 
          c.id === carpoolId
            ? {
                ...c,
                joinedCount: newJoinedCount,
                status: newStatus,
                members: newMembers
              }
            : c
        ),
        joinedCarpoolIds: [...s.joinedCarpoolIds, carpoolId]
      }));
      get()._persist();
      console.log('[Store] joinCarpool', carpoolId, member);
      return { success: true, message: '加入成功' };
    },
    
    leaveCarpool: (carpoolId: string, memberId: string) => {
      set(state => {
        const carpool = state.carpools.find(c => c.id === carpoolId);
        const newMembers = carpool ? carpool.members.filter(m => m.id !== memberId) : [];
        return {
          carpools: state.carpools.map(c => 
            c.id === carpoolId
              ? {
                  ...c,
                  joinedCount: newMembers.length,
                  status: 'open',
                  members: newMembers
                }
              : c
          )
        };
      });
      get()._persist();
      console.log('[Store] leaveCarpool', carpoolId, memberId);
    },
    
    reviewMakeup: (recordId: string, approved: boolean, note?: string) => {
      set(state => {
        const targetRecord = state.commuteRecords.find(r => r.id === recordId);
        let newUser = state.user;
        
        if (targetRecord && approved && targetRecord.status === 'pending') {
          newUser = {
            ...state.user,
            totalPoints: state.user.totalPoints + targetRecord.points,
            totalCarbon: Number((state.user.totalCarbon + targetRecord.carbonSaved).toFixed(2)),
            totalCommutes: state.user.totalCommutes + 1
          };
        }
        
        return {
          commuteRecords: state.commuteRecords.map(r =>
            r.id === recordId
              ? {
                  ...r,
                  status: approved ? 'approved' : 'rejected',
                  reviewTime: new Date().toLocaleString('zh-CN'),
                  reviewNote: note,
                  reviewerName: state.user.name
                }
              : r
          ),
          user: newUser
        };
      });
      get()._persist();
      console.log('[Store] reviewMakeup', recordId, approved ? '通过' : '驳回');
    },
    
    batchReviewMakeup: (recordIds: string[], approved: boolean, note?: string) => {
      const state = get();
      let successCount = 0;
      let totalPoints = 0;
      let totalCarbon = 0;
      
      state.commuteRecords.forEach(r => {
        if (recordIds.includes(r.id) && r.status === 'pending' && approved) {
          successCount++;
          totalPoints += r.points;
          totalCarbon += r.carbonSaved;
        } else if (recordIds.includes(r.id) && !approved) {
          successCount++;
        }
      });
      
      set(s => {
        let newUser = s.user;
        const reviewerName = s.user.name;
        if (approved && totalPoints > 0) {
          newUser = {
            ...s.user,
            totalPoints: s.user.totalPoints + totalPoints,
            totalCarbon: Number((s.user.totalCarbon + totalCarbon).toFixed(2)),
            totalCommutes: s.user.totalCommutes + (approved ? successCount : 0)
          };
        }
        
        return {
          commuteRecords: s.commuteRecords.map(r =>
            recordIds.includes(r.id) && r.status === 'pending'
              ? {
                  ...r,
                  status: approved ? 'approved' : 'rejected',
                  reviewTime: new Date().toLocaleString('zh-CN'),
                  reviewNote: note,
                  reviewerName
                }
              : r
          ),
          user: newUser
        };
      });
      get()._persist();
      console.log('[Store] batchReviewMakeup', recordIds.length, '条', approved ? '通过' : '驳回', '成功', successCount, '条');
      return {
        success: successCount,
        message: `成功${approved ? '通过' : '驳回'} ${successCount} 条申请`
      };
    },
    
    cancelCarpool: (carpoolId: string) => {
      const state = get();
      const carpool = state.carpools.find(c => c.id === carpoolId);
      
      if (!carpool) {
        return { success: false, message: '拼车不存在' };
      }
      
      if (carpool.status === 'cancelled') {
        return { success: false, message: '拼车已取消' };
      }
      
      set(s => ({
        carpools: s.carpools.map(c =>
          c.id === carpoolId
            ? { ...c, status: 'cancelled' as const }
            : c
        )
      }));
      get()._persist();
      console.log('[Store] cancelCarpool', carpoolId);
      return { success: true, message: '拼车已取消' };
    }
  };
});
