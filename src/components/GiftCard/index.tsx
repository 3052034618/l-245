import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';
import type { GiftItem } from '@/types';

interface GiftCardProps {
  gift: GiftItem;
  onClick?: () => void;
  size?: 'normal' | 'large';
}

const GiftCard: React.FC<GiftCardProps> = ({ gift, onClick, size = 'normal' }) => {
  const imageUrl = `https://picsum.photos/id/${gift.imageId}/300/300`;
  
  return (
    <View className={classnames(styles.giftCard, size === 'large' && styles.large)} onClick={onClick}>
      <View className={styles.imageWrap}>
        <Image className={styles.image} src={imageUrl} mode="aspectFill" />
        <View className={styles.stock}>
          <Text className={styles.stockText}>库存 {gift.stock}</Text>
        </View>
      </View>
      <View className={styles.info}>
        <Text className={styles.name}>{gift.name}</Text>
        <Text className={styles.desc}>{gift.description}</Text>
        <View className={styles.footer}>
          <View className={styles.points}>
            <Text className={styles.pointsValue}>{gift.points}</Text>
            <Text className={styles.pointsUnit}>积分</Text>
          </View>
          <View className={styles.exchangeBtn}>兑换</View>
        </View>
      </View>
    </View>
  );
};

export default GiftCard;
