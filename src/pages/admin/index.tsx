import React, { useMemo } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockDepartmentRanking } from '@/data/mockRanking';

const AdminPage: React.FC = () => {
  const totalEmployees = 185;
  const activeEmployees = 156;
  const participationRate = Math.round((activeEmployees / totalEmployees) * 100);
  
  const totalCarbon = useMemo(() => {
    return mockDepartmentRanking.reduce((sum, dept) => sum + dept.totalCarbon, 0);
  }, []);
  
  const totalPoints = useMemo(() => {
    return mockDepartmentRanking.reduce((sum, dept) => sum + dept.totalPoints, 0);
  }, []);
  
  const weekData = [65, 72, 68, 75, 80, 78, 82];
  const weekLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  
  const handleViewDetail = () => {
    Taro.showToast({ title: '查看详情', icon: 'none' });
  };
  
  const handleExportData = () => {
    Taro.showLoading({ title: '导出中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '导出成功', icon: 'success' });
      console.log('[Admin] 数据导出成功');
    }, 1500);
  };
  
  const handleManageActivities = () => {
    Taro.showToast({ title: '活动管理', icon: 'none' });
  };
  
  const handleManageUsers = () => {
    Taro.showToast({ title: '用户管理', icon: 'none' });
  };
  
  const handleApproveMakeup = () => {
    Taro.showToast({ title: '补录审核', icon: 'none' });
  };
  
  const handleSettings = () => {
    Taro.showToast({ title: '系统设置', icon: 'none' });
  };
  
  const handleNotice = () => {
    Taro.showToast({ title: '发布公告', icon: 'none' });
  };
  
  const top5Depts = mockDepartmentRanking.slice(0, 5);
  
  const maxRate = Math.max(...top5Depts.map(d => d.participationRate));
  
  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.headerContent}>
          <Text className={styles.headerTitle}>👑 管理员面板</Text>
          <Text className={styles.headerSub}>低碳通勤数据管理中心</Text>
        </View>
      </View>
      
      <View className={styles.content}>
        <View className={styles.statsGrid}>
          <View className={styles.statCard}>
            <View className={classnames(styles.statValue, styles.primary)}>
              {totalEmployees}
              <Text className={styles.unit}>人</Text>
            </View>
            <Text className={styles.statLabel}>总员工数</Text>
          </View>
          <View className={styles.statCard}>
            <View className={classnames(styles.statValue, styles.success)}>
              {activeEmployees}
              <Text className={styles.unit}>人</Text>
            </View>
            <Text className={styles.statLabel}>活跃用户</Text>
          </View>
          <View className={styles.statCard}>
            <View className={classnames(styles.statValue, styles.warning)}>
              {totalPoints}
              <Text className={styles.unit}>分</Text>
            </View>
            <Text className={styles.statLabel}>总积分发放</Text>
          </View>
          <View className={styles.statCard}>
            <View className={classnames(styles.statValue, styles.info)}>
              {totalCarbon.toFixed(0)}
              <Text className={styles.unit}>kg</Text>
            </View>
            <Text className={styles.statLabel}>总减排量</Text>
          </View>
        </View>
        
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text>总体参与率</Text>
            <Text className={styles.moreLink} onClick={handleViewDetail}>详情</Text>
          </View>
          
          <View className={styles.rateBar}>
            <Text className={styles.rateValue}>{participationRate}%</Text>
            <View className={styles.rateBarWrap}>
              <View
                className={styles.rateBarFill}
                style={{ width: `${participationRate}%` }}
              />
            </View>
          </View>
          
          <View className={styles.trendChart}>
            {weekData.map((value, idx) => (
              <View
                key={idx}
                className={classnames(styles.chartBar, value < 70 && styles.low)}
                style={{ height: `${(value / 100) * 100}%` }}
              >
                <Text className={styles.chartLabel}>{weekLabels[idx]}</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text>部门参与率排行</Text>
            <Text className={styles.moreLink} onClick={handleViewDetail}>全部</Text>
          </View>
          
          <View className={styles.deptList}>
            {top5Depts.map((dept, idx) => (
              <View key={dept.id} className={styles.deptRankItem}>
                <Text className={classnames(styles.deptRank, idx < 3 && `top${idx + 1}`)}>
                  {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : idx + 1}
                </Text>
                <Text className={styles.deptName}>{dept.name}</Text>
                <Text className={styles.deptRate}>{dept.participationRate}%</Text>
              </View>
            ))}
          </View>
        </View>
        
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>管理功能</Text>
          <View className={styles.quickActions}>
            <View className={styles.actionItem} onClick={handleApproveMakeup}>
              <View className={styles.actionIcon}>📝</View>
              <Text className={styles.actionText}>补录审核</Text>
            </View>
            <View className={styles.actionItem} onClick={handleManageActivities}>
              <View className={styles.actionIcon}>🎉</View>
              <Text className={styles.actionText}>活动管理</Text>
            </View>
            <View className={styles.actionItem} onClick={handleNotice}>
              <View className={styles.actionIcon}>📢</View>
              <Text className={styles.actionText}>发布公告</Text>
            </View>
            <View className={styles.actionItem} onClick={handleManageUsers}>
              <View className={styles.actionIcon}>👥</View>
              <Text className={styles.actionText}>用户管理</Text>
            </View>
            <View className={styles.actionItem} onClick={handleExportData}>
              <View className={styles.actionIcon}>📊</View>
              <Text className={styles.actionText}>数据导出</Text>
            </View>
            <View className={styles.actionItem}>
              <View className={styles.actionIcon}>🎁</View>
              <Text className={styles.actionText}>礼品管理</Text>
            </View>
            <View className={styles.actionItem}>
              <View className={styles.actionIcon}>📈</View>
              <Text className={styles.actionText}>数据报表</Text>
            </View>
            <View className={styles.actionItem} onClick={handleSettings}>
              <View className={styles.actionIcon}>⚙️</View>
              <Text className={styles.actionText}>系统设置</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default AdminPage;
