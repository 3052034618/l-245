import React, { useState, useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store/useStore';
import { generateCalendarDays, isToday, isSameDay, getToday } from '@/utils/date';
import CommuteItem from '@/components/CommuteItem';

const CalendarPage: React.FC = () => {
  const { commuteRecords } = useAppStore();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(getToday());
  
  const calendarDays = useMemo(() => {
    return generateCalendarDays(currentYear, currentMonth);
  }, [currentYear, currentMonth]);
  
  const monthRecords = useMemo(() => {
    const monthStr = String(currentMonth).padStart(2, '0');
    return commuteRecords.filter(r => r.date.startsWith(`${currentYear}-${monthStr}`));
  }, [commuteRecords, currentYear, currentMonth]);
  
  const effectiveRecords = useMemo(() => {
    return monthRecords.filter(r => !r.isMakeup || r.status === 'approved');
  }, [monthRecords]);
  
  const pendingRecords = useMemo(() => {
    return monthRecords.filter(r => r.isMakeup && r.status === 'pending');
  }, [monthRecords]);
  
  const monthStats = useMemo(() => {
    const totalPoints = effectiveRecords.reduce((sum, r) => sum + r.points, 0);
    const totalCarbon = effectiveRecords.reduce((sum, r) => sum + r.carbonSaved, 0);
    const totalDistance = effectiveRecords.reduce((sum, r) => sum + r.distance, 0);
    const effectiveCount = effectiveRecords.length;
    const uniqueDays = new Set(effectiveRecords.map(r => r.date)).size;
    
    const pendingPoints = pendingRecords.reduce((sum, r) => sum + r.points, 0);
    const pendingCarbon = pendingRecords.reduce((sum, r) => sum + r.carbonSaved, 0);
    const pendingCount = pendingRecords.length;
    
    return {
      points: totalPoints,
      carbon: totalCarbon.toFixed(1),
      distance: totalDistance.toFixed(1),
      effectiveCount,
      days: uniqueDays,
      pendingPoints,
      pendingCarbon: pendingCarbon.toFixed(1),
      pendingCount
    };
  }, [effectiveRecords, pendingRecords]);
  
  const selectedDayEffective = useMemo(() => {
    return commuteRecords.filter(r => r.date === selectedDate && (!r.isMakeup || r.status === 'approved'));
  }, [commuteRecords, selectedDate]);
  
  const selectedDayPending = useMemo(() => {
    return commuteRecords.filter(r => r.date === selectedDate && r.isMakeup && r.status === 'pending');
  }, [commuteRecords, selectedDate]);
  
  const getRecordStatus = (date: string) => {
    const dayRecords = monthRecords.filter(r => r.date === date);
    if (dayRecords.length === 0) return 'none';
    
    const hasNormal = dayRecords.some(r => !r.isMakeup || r.status === 'approved');
    const hasPending = dayRecords.some(r => r.isMakeup && r.status === 'pending');
    
    if (hasNormal && hasPending) return 'mixed';
    if (hasPending) return 'pending';
    return 'normal';
  };
  
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear(currentYear - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear(currentYear + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
  };
  
  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
  
  return (
    <View className={styles.page}>
      <View className={styles.pageContent}>
        <View className={styles.monthHeader}>
          <View className={styles.monthNav} onClick={handlePrevMonth}>
            ‹
          </View>
          <Text className={styles.monthTitle}>{currentYear}年{currentMonth}月</Text>
          <View className={styles.monthNav} onClick={handleNextMonth}>
            ›
          </View>
        </View>
        
        <View className={styles.calendarCard}>
          <View className={styles.weekDays}>
            {weekDays.map(day => (
              <Text key={day} className={styles.weekDay}>{day}</Text>
            ))}
          </View>
          
          <View className={styles.calendarGrid}>
            {calendarDays.map((day, index) => {
              const status = getRecordStatus(day.date);
              return (
                <View
                  key={index}
                  className={classnames(
                    styles.calendarDay,
                    !day.isCurrentMonth && styles.otherMonth,
                    status === 'normal' && styles.hasRecord,
                    status === 'pending' && styles.hasPending,
                    status === 'mixed' && styles.hasMixed,
                    isSameDay(day.date, selectedDate) && styles.selected,
                    isToday(day.date) && styles.today
                  )}
                  onClick={() => day.isCurrentMonth && handleSelectDate(day.date)}
                >
                  <Text className={styles.dayNum}>{day.day}</Text>
                  <View
                    className={classnames(
                      styles.dayDot,
                      status === 'pending' && styles.dotPending,
                      status === 'mixed' && styles.dotMixed
                    )}
                  />
                </View>
              );
            })}
          </View>
          
          <View className={styles.legend}>
            <View className={styles.legendItem}>
              <View className={classnames(styles.legendDot, styles.dotNormal)} />
              <Text className={styles.legendText}>已生效</Text>
            </View>
            <View className={styles.legendItem}>
              <View className={classnames(styles.legendDot, styles.dotPending)} />
              <Text className={styles.legendText}>待审核</Text>
            </View>
            <View className={styles.legendItem}>
              <View className={classnames(styles.legendDot, styles.dotMixed)} />
              <Text className={styles.legendText}>含待审核</Text>
            </View>
          </View>
        </View>
        
        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <View className={styles.statValue}>
              {monthStats.points}
              <Text className={styles.unit}>分</Text>
            </View>
            <Text className={styles.statLabel}>已到账积分</Text>
            {monthStats.pendingCount > 0 && (
              <Text className={styles.pendingHint}>待审核 +{monthStats.pendingPoints}</Text>
            )}
          </View>
          <View className={styles.statCard}>
            <View className={styles.statValue}>
              {monthStats.carbon}
              <Text className={styles.unit}>kg</Text>
            </View>
            <Text className={styles.statLabel}>已生效减排</Text>
            {monthStats.pendingCount > 0 && (
              <Text className={styles.pendingHint}>待审核 +{monthStats.pendingCarbon}</Text>
            )}
          </View>
          <View className={styles.statCard}>
            <View className={styles.statValue}>
              {monthStats.effectiveCount}
              <Text className={styles.unit}>次</Text>
            </View>
            <Text className={styles.statLabel}>有效通勤</Text>
            {monthStats.pendingCount > 0 && (
              <Text className={styles.pendingHint}>待审核 {monthStats.pendingCount}次</Text>
            )}
          </View>
          <View className={styles.statCard}>
            <View className={styles.statValue}>
              {monthStats.days}
              <Text className={styles.unit}>天</Text>
            </View>
            <Text className={styles.statLabel}>打卡天数</Text>
          </View>
        </View>
        
        {monthStats.pendingCount > 0 && (
          <View className={styles.pendingNotice}>
            <Text className={styles.pendingNoticeIcon}>⏳</Text>
            <Text className={styles.pendingNoticeText}>
              您有 {monthStats.pendingCount} 条补录申请待审核，通过后积分和次数将自动并入统计
            </Text>
          </View>
        )}
        
        <View className={styles.selectedDaySection}>
          <View className={styles.selectedDayTitle}>
            <Text>{isToday(selectedDate) ? '今天' : '当日'}记录</Text>
            <Text className={styles.date}>{selectedDate}</Text>
          </View>
          
          {selectedDayEffective.length > 0 && (
            <View className={styles.recordSection}>
              <Text className={styles.sectionLabel}>✅ 已生效 ({selectedDayEffective.length}次)</Text>
              <View className={styles.recordList}>
                {selectedDayEffective.map(record => (
                  <CommuteItem
                    key={record.id}
                    record={record}
                    onClick={() => {
                      Taro.navigateTo({ url: `/pages/makeup-detail/index?id=${record.id}&source=calendar` });
                    }}
                  />
                ))}
              </View>
            </View>
          )}
          
          {selectedDayPending.length > 0 && (
            <View className={styles.recordSection}>
              <Text className={classnames(styles.sectionLabel, styles.pendingLabel)}>
                ⏳ 待审核 ({selectedDayPending.length}次)
              </Text>
              <View className={styles.recordList}>
                {selectedDayPending.map(record => (
                  <CommuteItem
                    key={record.id}
                    record={record}
                    onClick={() => {
                      Taro.navigateTo({ url: `/pages/makeup-detail/index?id=${record.id}&source=calendar` });
                    }}
                  />
                ))}
              </View>
            </View>
          )}
          
          {selectedDayEffective.length === 0 && selectedDayPending.length === 0 && (
            <View className={styles.emptyTip}>
              <View className={styles.icon}>📅</View>
              <Text className={styles.text}>当天没有通勤记录</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default CalendarPage;
