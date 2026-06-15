import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useAppStore } from '@/store/useStore';
import { mockActivities } from '@/data/mockActivities';

const ProfilePage: React.FC = () => {
  const { user, exchangeRecords } = useAppStore();
  
  const unreadCount = mockActivities.filter(a => !a.read).length;
  const avatarUrl = `https://picsum.photos/id/${user.avatarId}/200/200`;
  
  const handleRouteSetting = () => {
    Taro.navigateTo({ url: '/pages/route-setting/index' });
  };
  
  const handleExportReport = () => {
    Taro.showModal({
      title: '导出月报',
      content: '确定要导出本月通勤月报吗？月报将以图片形式保存到相册。',
      confirmText: '确认导出',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '生成中...' });
          setTimeout(() => {
            Taro.hideLoading();
            Taro.showToast({ title: '导出成功', icon: 'success' });
            console.log('[Profile] 月报导出成功');
          }, 1500);
        }
      }
    });
  };
  
  const handleMessages = () => {
    Taro.showToast({ title: '消息中心', icon: 'none' });
  };
  
  const handleAdminPanel = () => {
    Taro.navigateTo({ url: '/pages/admin/index' });
  };
  
  const handleExchangeRecords = () => {
    Taro.showToast({ title: '兑换记录', icon: 'none' });
  };
  
  const handleAbout = () => {
    Taro.showToast({ title: '关于我们', icon: 'none' });
  };
  
  const handleSettings = () => {
    Taro.showToast({ title: '设置', icon: 'none' });
  };
  
  const menuItems = [
    { icon: '🎁', text: '兑换记录', count: exchangeRecords.length, onClick: handleExchangeRecords },
    { icon: '🔔', text: '消息通知', badge: unreadCount, onClick: handleMessages },
    { icon: '⚙️', text: '通用设置', onClick: handleSettings },
    { icon: 'ℹ️', text: '关于我们', onClick: handleAbout }
  ];
  
  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.userInfo}>
          <View className={styles.avatarWrap}>
            <Image className={styles.avatar} src={avatarUrl} mode="aspectFill" />
            {user.isAdmin && <Text className={styles.adminBadge}>管理员</Text>}
          </View>
          <View className={styles.userText}>
            <Text className={styles.userName}>{user.name}</Text>
            <Text className={styles.userDept}>{user.department}</Text>
            <Text className={styles.userPosition}>{user.position}</Text>
          </View>
        </View>
      </View>
      
      <View className={styles.statsCard}>
        <View className={styles.statItem}>
          <View className={styles.statValue}>
            {user.totalPoints}
            <Text className={styles.unit}>积分</Text>
          </View>
          <Text className={styles.statLabel}>累计积分</Text>
        </View>
        <View className={styles.statItem}>
          <View className={styles.statValue}>
            {user.totalCarbon.toFixed(1)}
            <Text className={styles.unit}>kg</Text>
          </View>
          <Text className={styles.statLabel}>累计减排</Text>
        </View>
        <View className={styles.statItem}>
          <View className={styles.statValue}>
            {user.totalCommutes}
            <Text className={styles.unit}>次</Text>
          </View>
          <Text className={styles.statLabel}>通勤次数</Text>
        </View>
      </View>
      
      <View className={styles.quickGrid}>
        <View className={styles.quickItem} onClick={handleRouteSetting}>
          <View className={styles.quickIcon}>📍</View>
          <Text className={styles.quickText}>常用路线</Text>
        </View>
        <View className={styles.quickItem} onClick={handleExportReport}>
          <View className={styles.quickIcon}>📊</View>
          <Text className={styles.quickText}>导出月报</Text>
        </View>
        <View className={styles.quickItem} onClick={handleMessages}>
          <View className={styles.quickIcon}>📬</View>
          <Text className={styles.quickText}>活动通知</Text>
        </View>
        <View className={styles.quickItem} onClick={handleExchangeRecords}>
          <View className={styles.quickIcon}>🎁</View>
          <Text className={styles.quickText}>我的兑换</Text>
        </View>
      </View>
      
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>其他服务</Text>
        <View className={styles.menuList}>
          {menuItems.map((item, index) => (
            <View key={index} className={styles.menuItem} onClick={item.onClick}>
              <Text className={styles.menuIcon}>{item.icon}</Text>
              <Text className={styles.menuText}>{item.text}</Text>
              {item.badge ? (
                <Text className={styles.menuBadge}>{item.badge}条未读</Text>
              ) : item.count ? (
                <Text style={{ fontSize: '24rpx', color: '#86909C', marginRight: '8rpx' }}>
                  {item.count}条
                </Text>
              ) : null}
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>
      </View>
      
      {user.isAdmin && (
        <View className={styles.adminEntry} onClick={handleAdminPanel}>
          <Text className={styles.adminIcon}>👑</Text>
          <View className={styles.adminText}>
            <Text className={styles.adminTitle}>管理员面板</Text>
            <Text className={styles.adminDesc}>查看总体参与率和数据统计</Text>
          </View>
          <Text className={styles.adminArrow}>›</Text>
        </View>
      )}
    </View>
  );
};

export default ProfilePage;
