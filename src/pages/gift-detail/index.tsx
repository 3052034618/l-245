import React, { useState, useMemo } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store/useStore';
import { mockGifts } from '@/data/mockGifts';
import type { GiftItem, ExchangeRecord } from '@/types';

const GiftDetailPage: React.FC = () => {
  const router = useRouter();
  const { user, addExchangeRecord } = useAppStore();
  const [gift, setGift] = useState<GiftItem | null>(null);
  
  React.useEffect(() => {
    const giftId = router.params.id;
    const found = mockGifts.find(g => g.id === giftId);
    if (found) {
      setGift(found);
    } else {
      setGift(mockGifts[0]);
    }
  }, [router.params.id]);
  
  const canExchange = useMemo(() => {
    return gift && user.totalPoints >= gift.points;
  }, [gift, user.totalPoints]);
  
  const handleExchange = () => {
    if (!gift) return;
    
    if (!canExchange) {
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
          doExchange();
        }
      }
    });
  };
  
  const doExchange = () => {
    if (!gift) return;
    
    const record: ExchangeRecord = {
      id: `ex-${Date.now()}`,
      giftId: gift.id,
      giftName: gift.name,
      points: gift.points,
      time: new Date().toLocaleString('zh-CN'),
      status: 'completed',
      code: 'ECO' + Date.now().toString().slice(-8)
    };
    
    addExchangeRecord(record);
    
    Taro.showToast({
      title: '兑换成功',
      icon: 'success'
    });
    
    console.log('[GiftDetail] 兑换成功', record);
  };
  
  if (!gift) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    );
  }
  
  const imageUrl = `https://picsum.photos/id/${gift.imageId}/750/500`;
  
  return (
    <View className={styles.page}>
      <View className={styles.giftImageWrap}>
        <Image className={styles.giftImage} src={imageUrl} mode="aspectFill" />
      </View>
      
      <View className={styles.giftInfo}>
        <Text className={styles.giftName}>{gift.name}</Text>
        <Text className={styles.giftDesc}>{gift.description}</Text>
        <View className={styles.priceRow}>
          <Text className={styles.pointsValue}>{gift.points}</Text>
          <Text className={styles.pointsUnit}>积分</Text>
          <Text className={styles.stockInfo}>库存 {gift.stock} 件</Text>
        </View>
      </View>
      
      <View className={styles.card}>
        <Text className={styles.cardTitle}>使用说明</Text>
        <View className={styles.useSteps}>
          <View className={styles.stepItem}>
            <View className={styles.stepNum}>1</View>
            <Text className={styles.stepText}>兑换成功后，在「我的-我的兑换」中查看兑换码</Text>
          </View>
          <View className={styles.stepItem}>
            <View className={styles.stepNum}>2</View>
            <Text className={styles.stepText}>前往对应商家门店/平台，出示兑换码即可使用</Text>
          </View>
          <View className={styles.stepItem}>
            <View className={styles.stepNum}>3</View>
            <Text className={styles.stepText}>兑换码有效期为30天，请在有效期内使用</Text>
          </View>
        </View>
      </View>
      
      <View className={styles.card}>
        <Text className={styles.cardTitle}>注意事项</Text>
        <View className={styles.cardContent}>
          1. 兑换成功后积分将自动扣除，不可退回{'\n'}
          2. 兑换码仅限本人使用，不可转让{'\n'}
          3. 如有问题请联系行政部门
        </View>
      </View>
      
      <View className={styles.bottomBar}>
        <View className={styles.myPoints}>
          <Text className={styles.myPointsLabel}>我的积分</Text>
          <View className={styles.myPointsValue}>
            <Text className={styles.num}>{user.totalPoints}</Text>
            <Text> 积分</Text>
          </View>
        </View>
        <Button
          className={classnames(styles.exchangeBtn, !canExchange && styles.disabled)}
          onClick={handleExchange}
        >
          {canExchange ? '立即兑换' : '积分不足'}
        </Button>
      </View>
    </View>
  );
};

export default GiftDetailPage;
