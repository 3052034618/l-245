import type { GiftItem, ExchangeRecord } from '@/types';

export const mockGifts: GiftItem[] = [
  {
    id: 'gift-1',
    name: '星巴克中杯咖啡券',
    description: '全场中杯手工调制饮品通用',
    points: 500,
    stock: 100,
    category: '饮品',
    imageId: 431
  },
  {
    id: 'gift-2',
    name: '京东E卡 50元',
    description: '京东商城全品类通用电子卡',
    points: 800,
    stock: 50,
    category: '购物卡',
    imageId: 225
  },
  {
    id: 'gift-3',
    name: '环保帆布袋',
    description: '100%纯棉帆布，简约环保设计',
    points: 200,
    stock: 200,
    category: '周边',
    imageId: 582
  },
  {
    id: 'gift-4',
    name: '共享单车月卡',
    description: '美团/哈啰单车月卡任选',
    points: 300,
    stock: 80,
    category: '出行',
    imageId: 1
  },
  {
    id: 'gift-5',
    name: '绿植盆栽套装',
    description: '多肉植物组合盆栽，含花盆',
    points: 350,
    stock: 60,
    category: '生活',
    imageId: 1018
  },
  {
    id: 'gift-6',
    name: '电影票兑换券',
    description: '全国影院通用 2D/3D通兑',
    points: 600,
    stock: 40,
    category: '娱乐',
    imageId: 365
  },
  {
    id: 'gift-7',
    name: '保温杯 500ml',
    description: '304不锈钢内胆，长效保温',
    points: 450,
    stock: 75,
    category: '生活',
    imageId: 201
  },
  {
    id: 'gift-8',
    name: '爱奇艺会员月卡',
    description: '爱奇艺黄金VIP会员月卡',
    points: 400,
    stock: 120,
    category: '娱乐',
    imageId: 9
  }
];

export const mockExchangeRecords: ExchangeRecord[] = [
  {
    id: 'ex-1',
    giftId: 'gift-1',
    giftName: '星巴克中杯咖啡券',
    points: 500,
    time: '2024-06-10 14:30',
    status: 'completed',
    code: 'SBK20240610001'
  },
  {
    id: 'ex-2',
    giftId: 'gift-3',
    giftName: '环保帆布袋',
    points: 200,
    time: '2024-06-05 09:15',
    status: 'completed',
    code: 'ECO20240605003'
  },
  {
    id: 'ex-3',
    giftId: 'gift-4',
    giftName: '共享单车月卡',
    points: 300,
    time: '2024-06-01 08:00',
    status: 'expired',
    code: 'BIKE20240601007'
  }
];

export const giftCategories = ['全部', '饮品', '购物卡', '周边', '出行', '生活', '娱乐'];
