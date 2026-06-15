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
  
  const monthStats = useMemo(() => {
    const totalPoints = monthRecords.reduce((sum, r) => sum + r.points, 0);
    const totalCarbon = monthRecords.reduce((sum, r) => sum + r.carbonSaved, 0);
    const totalDistance = monthRecords.reduce((sum, r) => sum + r.distance, 0);
    const uniqueDays = new Set(monthRecords.map(r => r.date)).size;
    return {
      points: totalPoints,
      carbon: totalCarbon.toFixed(1),
      distance: totalDistance.toFixed(1),
      days: uniqueDays
    };
  }, [monthRecords]);
  
  const selectedDayRecords = useMemo(() => {
    return commuteRecords.filter(r => r.date === selectedDate);
  }, [commuteRecords, selectedDate]);
  
  const hasRecord = (date: string) => {
    return monthRecords.some(r => r.date === date);
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
            {calendarDays.map((day, index) => (
              <View
                key={index}
                className={classnames(
                  styles.calendarDay,
                  !day.isCurrentMonth && styles.otherMonth,
                  hasRecord(day.date) && styles.hasRecord,
                  isSameDay(day.date, selectedDate) && styles.selected,
                  isToday(day.date) && styles.today
                )}
                onClick={() => day.isCurrentMonth && handleSelectDate(day.date)}
              >
                <Text className={styles.dayNum}>{day.day}</Text>
                <View className={styles.dayDot} />
              </View>
            ))}
          </View>
        </View>
        
        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <View className={styles.statValue}>
              {monthStats.points}
              <Text className={styles.unit}>分</Text>
            </View>
            <Text className={styles.statLabel}>总积分</Text>
          </View>
          <View className={styles.statCard}>
            <View className={styles.statValue}>
              {monthStats.carbon}
              <Text className={styles.unit}>kg</Text>
            </View>
            <Text className={styles.statLabel}>减排量</Text>
          </View>
          <View className={styles.statCard}>
            <View className={styles.statValue}>
              {monthStats.days}
              <Text className={styles.unit}>天</Text>
            </View>
            <Text className={styles.statLabel}>打卡天数</Text>
          </View>
          <View className={styles.statCard}>
            <View className={styles.statValue}>
              {monthStats.distance}
              <Text className={styles.unit}>km</Text>
            </View>
            <Text className={styles.statLabel}>总里程</Text>
          </View>
        </View>
        
        <View className={styles.selectedDaySection}>
          <View className={styles.selectedDayTitle}>
            <Text>{isToday(selectedDate) ? '今天' : '当日'}记录</Text>
            <Text className={styles.date}>{selectedDate}</Text>
          </View>
          
          {selectedDayRecords.length > 0 ? (
            <View className={styles.recordList}>
              {selectedDayRecords.map(record => (
                <CommuteItem key={record.id} record={record} />
              ))}
            </View>
          ) : (
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
