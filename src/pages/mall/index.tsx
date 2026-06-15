import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store/useStore';
import { mockGifts, giftCategories } from '@/data/mockGifts';
import type { GiftItem } from '@/types';

const MallPage: React.FC = () => {
  const { user, addExchangeRecord } = useAppStore();
  const [activeCategory, setActiveCategory] = useState('全部');
  
  const filteredGifts = useMemo(() => {
    if (activeCategory === '全部') {
      return mockGifts;
    }
    return mockGifts.filter(g => g.category === activeCategory);
  }, [activeCategory]);
  
  const handleExchange = (gift: GiftItem) => {
    if (user.totalPoints < gift.points) {
      Taro.showToast({ title: '积分不足', icon: 'none' });
      return;
    }
    
    Taro.showModal({
      title: '确认兑换',
      content: `确定要用 ${gift.points} 积分兑换「${gift.name}」吗？`,
      confirmText: '确认兑换',
      cancelText: '再想想',
      success: (res) => {
        if (res.confirm) {
          doExchange(gift);
        }
      }
    });
  };
  
  const doExchange = (gift: GiftItem) => {
    const record = {
      id: `ex-${Date.now()}`,
      giftId: gift.id,
      giftName: gift.name,
      points: gift.points,
      time: new Date().toLocaleString('zh-CN'),
      status: 'completed' as const,
      code: 'ECO' + Date.now().toString().slice(-8)
    };
    
    addExchangeRecord(record);
    
    Taro.showToast({
      title: '兑换成功',
      icon: 'success'
    });
    
    console.log('[Mall] 兑换成功', record);
  };
  
  const handleGiftClick = (gift: GiftItem) => {
    Taro.navigateTo({
      url: `/pages/gift-detail/index?id=${gift.id}`
    });
  };
  
  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.headerContent}>
          <Text className={styles.headerTitle}>我的积分</Text>
          <View className={styles.pointsRow}>
            <Text className={styles.pointsValue}>{user.totalPoints}</Text>
            <Text className={styles.pointsUnit}>积分</Text>
          </View>
          <Text className={styles.pointsTip}>累计减排 {user.totalCarbon.toFixed(1)} kg CO₂</Text>
        </View>
      </View>
      
      <View className={styles.content}>
        <View className={styles.banner} onClick={() => Taro.showToast({ title: '活动详情', icon: 'none' })}>
          <View className={styles.bannerContent}>
            <Text className={styles.bannerTitle}>🎉 618积分兑换日</Text>
            <Text className={styles.bannerDesc}>6月18日全场礼品8折兑换，限时一天！</Text>
          </View>
        </View>
        
        <ScrollView scrollX className={styles.categoryTabs} scrollWithAnimation>
          {giftCategories.map(cat => (
            <View
              key={cat}
              className={classnames(styles.categoryTab, activeCategory === cat && styles.active)}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </View>
          ))}
        </ScrollView>
        
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>热门兑换</Text>
          <Text className={styles.sectionMore}>更多</Text>
        </View>
        
        <View className={styles.giftGrid}>
          {filteredGifts.map(gift => (
            <View key={gift.id} className={styles.giftCard} onClick={() => handleGiftClick(gift)}>
              <View className={styles.giftImageWrap}>
                <Image
                  className={styles.giftImage}
                  src={`https://picsum.photos/id/${gift.imageId}/300/300`}
                  mode="aspectFill"
                />
                <View className={styles.giftStock}>库存 {gift.stock}</View>
              </View>
              <View className={styles.giftInfo}>
                <Text className={styles.giftName}>{gift.name}</Text>
                <Text className={styles.giftDesc}>{gift.description}</Text>
                <View className={styles.giftFooter}>
                  <View className={styles.giftPoints}>
                    <Text className={styles.giftPointsValue}>{gift.points}</Text>
                    <Text className={styles.giftPointsUnit}>积分</Text>
                  </View>
                  <View className={styles.exchangeBtn} onClick={(e) => {
                    e.stopPropagation?.();
                    handleExchange(gift);
                  }}>
                    兑换
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default MallPage;
