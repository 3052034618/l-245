import type { RankItem, DepartmentRank, CarpoolInfo } from '@/types';

const names = [
  '张明', '李华', '王芳', '刘伟', '陈静', '杨帆', '赵磊', '黄丽',
  '周强', '吴敏', '徐峰', '孙琳', '朱军', '马燕', '胡杰', '郭婷'
];

const departments = [
  '技术研发部', '产品设计部', '市场运营部', '人力资源部',
  '财务部', '行政部', '销售部', '客户服务部'
];

const avatars = [64, 91, 177, 338, 1027, 64, 91, 177, 338, 1027, 64, 91, 177, 338, 1027, 64];

function generateRankItems(count: number): RankItem[] {
  const items: RankItem[] = [];
  for (let i = 0; i < count; i++) {
    const points = Math.floor(500 + Math.random() * 3000);
    items.push({
      id: `user-${i}`,
      name: names[i % names.length],
      avatarId: avatars[i % avatars.length],
      department: departments[Math.floor(Math.random() * departments.length)],
      points,
      carbonSaved: Number((points * 0.021).toFixed(2)),
      rank: i + 1
    });
  }
  return items.sort((a, b) => b.points - a.points).map((item, idx) => ({ ...item, rank: idx + 1 }));
}

export const mockPersonalRanking: RankItem[] = generateRankItems(15);

export const mockDepartmentRanking: DepartmentRank[] = [
  { id: 'dept-1', name: '技术研发部', totalPoints: 15680, totalCarbon: 329.28, participationRate: 92, memberCount: 45, rank: 1 },
  { id: 'dept-2', name: '产品设计部', totalPoints: 12450, totalCarbon: 261.45, participationRate: 88, memberCount: 28, rank: 2 },
  { id: 'dept-3', name: '市场运营部', totalPoints: 10230, totalCarbon: 214.83, participationRate: 75, memberCount: 32, rank: 3 },
  { id: 'dept-4', name: '人力资源部', totalPoints: 8760, totalCarbon: 183.96, participationRate: 85, memberCount: 15, rank: 4 },
  { id: 'dept-5', name: '财务部', totalPoints: 6540, totalCarbon: 137.34, participationRate: 78, memberCount: 12, rank: 5 },
  { id: 'dept-6', name: '行政部', totalPoints: 5890, totalCarbon: 123.69, participationRate: 70, memberCount: 10, rank: 6 },
  { id: 'dept-7', name: '销售部', totalPoints: 5200, totalCarbon: 109.2, participationRate: 60, memberCount: 25, rank: 7 },
  { id: 'dept-8', name: '客户服务部', totalPoints: 4680, totalCarbon: 98.28, participationRate: 65, memberCount: 18, rank: 8 }
];

export const mockCarpoolList: CarpoolInfo[] = [
  {
    id: 'carpool-1',
    initiator: '张明',
    initiatorAvatar: 64,
    startLocation: '回龙观地铁站',
    endLocation: '科技园A座',
    startTime: '08:30',
    seats: 4,
    joinedCount: 2,
    date: '2024-06-15',
    routeName: '回龙观-科技园'
  },
  {
    id: 'carpool-2',
    initiator: '李华',
    initiatorAvatar: 91,
    startLocation: '西二旗地铁站',
    endLocation: '科技园B座',
    startTime: '09:00',
    seats: 3,
    joinedCount: 1,
    date: '2024-06-15',
    routeName: '西二旗-科技园'
  },
  {
    id: 'carpool-3',
    initiator: '王芳',
    initiatorAvatar: 177,
    startLocation: '望京SOHO',
    endLocation: '科技园C座',
    startTime: '08:15',
    seats: 2,
    joinedCount: 0,
    date: '2024-06-16',
    routeName: '望京-科技园'
  },
  {
    id: 'carpool-4',
    initiator: '刘伟',
    initiatorAvatar: 338,
    startLocation: '上地地铁站',
    endLocation: '科技园A座',
    startTime: '08:45',
    seats: 3,
    joinedCount: 2,
    date: '2024-06-16',
    routeName: '上地-科技园'
  }
];

export const mockMyCarpool: CarpoolInfo[] = [
  {
    id: 'mycarpool-1',
    initiator: '我',
    initiatorAvatar: 1027,
    startLocation: '天通苑北地铁站',
    endLocation: '科技园B座',
    startTime: '08:20',
    seats: 4,
    joinedCount: 3,
    date: '2024-06-15',
    routeName: '天通苑-科技园'
  }
];
