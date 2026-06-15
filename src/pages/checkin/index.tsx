import React, { useState, useMemo } from 'react';
import { View, Text, Image, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store/useStore';
import { transportOptions, calculatePoints, calculateCarbonSaved, detectDuplicateCheckIn } from '@/utils/carbon';
import { getToday, getCurrentTime } from '@/utils/date';
import type { TransportType, CommuteRecord } from '@/types';
import CommuteItem from '@/components/CommuteItem';

const CheckinPage: React.FC = () => {
  const { user, commuteRecords, routes, addCommuteRecord } = useAppStore();
  const [selectedTransport, setSelectedTransport] = useState<TransportType>('subway');
  const [direction, setDirection] = useState<'go' | 'back'>('go');
  const [distance, setDistance] = useState<string>('12.5');
  
  const today = getToday();
  const todayRecords = useMemo(() => {
    return commuteRecords.filter(r => r.date === today);
  }, [commuteRecords, today]);
  
  const todayStats = useMemo(() => {
    const totalPoints = todayRecords.reduce((sum, r) => sum + r.points, 0);
    const totalCarbon = todayRecords.reduce((sum, r) => sum + r.carbonSaved, 0);
    return {
      points: totalPoints,
      carbon: totalCarbon.toFixed(2),
      count: todayRecords.length
    };
  }, [todayRecords]);
  
  const defaultRoute = routes.find(r => r.isDefault);
  
  const previewPoints = useMemo(() => {
    const dist = parseFloat(distance) || 0;
    return calculatePoints(selectedTransport, dist);
  }, [selectedTransport, distance]);
  
  const previewCarbon = useMemo(() => {
    const dist = parseFloat(distance) || 0;
    return calculateCarbonSaved(selectedTransport, dist);
  }, [selectedTransport, distance]);
  
  const handleSelectTransport = (type: TransportType) => {
    setSelectedTransport(type);
  };
  
  const handleCheckin = () => {
    const dist = parseFloat(distance);
    if (!dist || dist <= 0) {
      Taro.showToast({ title: '请输入有效里程', icon: 'none' });
      return;
    }
    
    const newRecord: Omit<CommuteRecord, 'id'> = {
      date: today,
      type: selectedTransport,
      distance: dist,
      carbonSaved: previewCarbon,
      points: previewPoints,
      direction,
      time: getCurrentTime(),
      routeName: defaultRoute?.name
    };
    
    const isDuplicate = detectDuplicateCheckIn(
      todayRecords.map(r => ({ date: r.date, direction: r.direction, time: r.time })),
      { date: newRecord.date, direction: newRecord.direction, time: newRecord.time }
    );
    
    if (isDuplicate) {
      Taro.showModal({
        title: '重复打卡提醒',
        content: '检测到您在相近时间已有同方向打卡记录，是否确认继续打卡？',
        confirmText: '继续打卡',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            doCheckin(newRecord);
          }
        }
      });
      return;
    }
    
    doCheckin(newRecord);
  };
  
  const doCheckin = (record: Omit<CommuteRecord, 'id'>) => {
    const newRecord: CommuteRecord = {
      ...record,
      id: `record-${Date.now()}`
    };
    
    addCommuteRecord(newRecord);
    
    Taro.showToast({
      title: `打卡成功 +${record.points}积分`,
      icon: 'success'
    });
    
    console.log('[Checkin] 打卡成功', newRecord);
  };
  
  const handleMakeup = () => {
    Taro.navigateTo({ url: '/pages/makeup/index' });
  };
  
  const handleCarpool = () => {
    Taro.navigateTo({ url: '/pages/carpool-detail/index' });
  };
  
  const handleRouteSetting = () => {
    Taro.navigateTo({ url: '/pages/route-setting/index' });
  };
  
  const avatarUrl = `https://picsum.photos/id/${user.avatarId}/100/100`;
  
  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <Image className={styles.avatar} src={avatarUrl} mode="aspectFill" />
          <View className={styles.userText}>
            <Text className={styles.userName}>{user.name}</Text>
            <Text className={styles.userDept}>{user.department} · {user.position}</Text>
          </View>
        </View>
        
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>
              {todayStats.points}
              <Text className={styles.unit}>积分</Text>
            </Text>
            <Text className={styles.statLabel}>今日积分</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>
              {todayStats.carbon}
              <Text className={styles.unit}>kg</Text>
            </Text>
            <Text className={styles.statLabel}>今日减排</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>
              {todayStats.count}
              <Text className={styles.unit}>次</Text>
            </Text>
            <Text className={styles.statLabel}>今日打卡</Text>
          </View>
        </View>
      </View>
      
      <View className={styles.content}>
        <View className={styles.card}>
          <Text className={styles.sectionTitle}>选择交通方式</Text>
          <View className={styles.transportGrid}>
            {transportOptions.map(opt => (
              <View
                key={opt.type}
                className={classnames(styles.transportItem, selectedTransport === opt.type && styles.active)}
                onClick={() => handleSelectTransport(opt.type)}
              >
                <Text className={styles.transportIcon}>{opt.icon}</Text>
                <Text className={styles.transportName}>{opt.name}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View className={styles.card}>
          <Text className={styles.sectionTitle}>通勤信息</Text>
          
          <View className={styles.directionTabs}>
            <View
              className={classnames(styles.tabItem, direction === 'go' && styles.active)}
              onClick={() => setDirection('go')}
            >
              上班
            </View>
            <View
              className={classnames(styles.tabItem, direction === 'back' && styles.active)}
              onClick={() => setDirection('back')}
            >
              下班
            </View>
          </View>
          
          <View className={styles.routeSelect} onClick={handleRouteSetting}>
            <View className={styles.routeInfo}>
              <Text className={styles.routeName}>{defaultRoute?.name || '选择常用路线'}</Text>
              <Text className={styles.routeDetail}>
                {defaultRoute ? `${defaultRoute.startLocation} → ${defaultRoute.endLocation}` : '点击设置常用路线'}
              </Text>
            </View>
            <Text className={styles.routeArrow}>›</Text>
          </View>
          
          <View className={styles.inputRow}>
            <Text className={styles.inputLabel}>通勤里程</Text>
            <Input
              className={styles.distanceInput}
              type="digit"
              value={distance}
              onInput={(e) => setDistance(e.detail.value)}
              placeholder="请输入里程"
            />
            <Text className={styles.inputUnit}>公里</Text>
          </View>
          
          <View className={styles.previewBox}>
            <View className={styles.previewItem}>
              <Text className={styles.value}>+{previewPoints}</Text>
              <Text className={styles.label}>预计积分</Text>
            </View>
            <View className={styles.previewItem}>
              <Text className={styles.value}>-{previewCarbon.toFixed(2)}kg</Text>
              <Text className={styles.label}>预计减排</Text>
            </View>
          </View>
          
          <Button className={styles.checkinBtn} onClick={handleCheckin}>
            立即打卡
          </Button>
        </View>
        
        <View className={styles.card}>
          <View className={styles.quickActions}>
            <View className={styles.quickAction} onClick={handleMakeup}>
              <View className={styles.quickIcon}>📝</View>
              <Text className={styles.quickText}>补录通勤</Text>
            </View>
            <View className={styles.quickAction} onClick={handleCarpool}>
              <View className={styles.quickIcon}>🚗</View>
              <Text className={styles.quickText}>发起拼车</Text>
            </View>
            <View className={styles.quickAction}>
              <View className={styles.quickIcon}>🧾</View>
              <Text className={styles.quickText}>上传票据</Text>
            </View>
            <View className={styles.quickAction} onClick={handleRouteSetting}>
              <View className={styles.quickIcon}>📍</View>
              <Text className={styles.quickText}>路线设置</Text>
            </View>
          </View>
        </View>
        
        <View className={styles.recordsSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionHeaderTitle}>今日记录</Text>
            <Text className={styles.recordCount}>共 {todayRecords.length} 条</Text>
          </View>
          
          <View className={styles.recordList}>
            {todayRecords.length > 0 ? (
              todayRecords.map(record => (
                <CommuteItem
                  key={record.id}
                  record={record}
                  onClick={() => {
                    Taro.navigateTo({ url: `/pages/makeup-detail/index?id=${record.id}&source=checkin` });
                  }}
                />
              ))
            ) : (
              <View className={styles.card} style={{ textAlign: 'center', padding: '48rpx 32rpx' }}>
                <Text style={{ fontSize: '28rpx', color: '#86909C' }}>今日还没有打卡记录，快去打卡吧~</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default CheckinPage;
