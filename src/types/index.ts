export type TransportType = 'walk' | 'bike' | 'subway' | 'bus' | 'car' | 'carpool' | 'electric';

export interface TransportOption {
  type: TransportType;
  name: string;
  carbonFactor: number;
  pointsPerKm: number;
  icon: string;
  color: string;
}

export interface CommuteRecord {
  id: string;
  date: string;
  type: TransportType;
  distance: number;
  carbonSaved: number;
  points: number;
  direction: 'go' | 'back';
  time: string;
  isMakeup?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  receiptUrl?: string;
  routeName?: string;
  submitTime?: string;
  reviewTime?: string;
  reviewNote?: string;
}

export interface GiftItem {
  id: string;
  name: string;
  description: string;
  points: number;
  stock: number;
  category: string;
  imageId: number;
}

export interface ExchangeRecord {
  id: string;
  giftId: string;
  giftName: string;
  points: number;
  time: string;
  status: 'pending' | 'completed' | 'expired';
  code?: string;
}

export interface RankItem {
  id: string;
  name: string;
  avatarId: number;
  department: string;
  points: number;
  carbonSaved: number;
  rank: number;
}

export interface DepartmentRank {
  id: string;
  name: string;
  totalPoints: number;
  totalCarbon: number;
  participationRate: number;
  memberCount: number;
  rank: number;
}

export interface CarpoolMember {
  id: string;
  name: string;
  avatarId: number;
  department: string;
  joinTime: string;
}

export interface CarpoolInfo {
  id: string;
  initiator: string;
  initiatorAvatar: number;
  initiatorDept: string;
  startLocation: string;
  endLocation: string;
  startTime: string;
  seats: number;
  joinedCount: number;
  date: string;
  routeName?: string;
  members: CarpoolMember[];
  createTime: string;
  status: 'open' | 'full' | 'cancelled';
}

export interface UserInfo {
  id: string;
  name: string;
  avatarId: number;
  department: string;
  position: string;
  totalPoints: number;
  totalCarbon: number;
  totalCommutes: number;
  isAdmin: boolean;
}

export interface RouteInfo {
  id: string;
  name: string;
  startLocation: string;
  endLocation: string;
  distance: number;
  isDefault: boolean;
}

export interface ActivityInfo {
  id: string;
  title: string;
  description: string;
  type: 'activity' | 'notification' | 'announcement';
  time: string;
  read: boolean;
}

export interface MonthlyStats {
  month: string;
  totalPoints: number;
  totalCarbon: number;
  totalCommutes: number;
  totalDistance: number;
  transportStats: { type: TransportType; count: number; distance: number }[];
}

export interface PendingMakeupRecord {
  record: CommuteRecord;
  userId: string;
  userName: string;
  userDept: string;
  submitTime: string;
}
