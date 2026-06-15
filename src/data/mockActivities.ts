import type { ActivityInfo } from '@/types';

export const mockActivities: ActivityInfo[] = [
  {
    id: 'act-1',
    title: '低碳出行月活动火热进行中',
    description: '本月累计打卡满20天，额外奖励500积分！快来参与吧~',
    type: 'activity',
    time: '2024-06-12 10:00',
    read: false
  },
  {
    id: 'act-2',
    title: '618积分兑换日，全场8折',
    description: '6月18日当天，所有礼品积分兑换享8折优惠，限时一天！',
    type: 'activity',
    time: '2024-06-10 14:30',
    read: false
  },
  {
    id: 'act-3',
    title: '补录申请已通过审核',
    description: '您6月8日的补录申请已通过审核，获得25积分。',
    type: 'notification',
    time: '2024-06-09 16:00',
    read: true
  },
  {
    id: 'act-4',
    title: '关于系统维护的通知',
    description: '6月20日凌晨2:00-4:00系统维护，期间可能无法正常打卡。',
    type: 'announcement',
    time: '2024-06-08 09:00',
    read: true
  },
  {
    id: 'act-5',
    title: '恭喜您获得「低碳达人」称号',
    description: '您本月累计减排超过50kg，荣获「低碳达人」称号！',
    type: 'notification',
    time: '2024-06-05 11:20',
    read: true
  }
];
