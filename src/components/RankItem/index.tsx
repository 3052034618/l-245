import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';
import type { RankItem } from '@/types';

interface RankItemComponentProps {
  item: RankItem;
  type?: 'personal' | 'department';
  showDepartment?: boolean;
}

const RankItemComponent: React.FC<RankItemComponentProps> = ({ item, type = 'personal', showDepartment = true }) => {
  const avatarUrl = `https://picsum.photos/id/${item.avatarId}/100/100`;
  
  const getRankStyle = (rank: number) => {
    if (rank === 1) return styles.rankGold;
    if (rank === 2) return styles.rankSilver;
    if (rank === 3) return styles.rankBronze;
    return styles.rankNormal;
  };
  
  return (
    <View className={styles.rankItem}>
      <View className={classnames(styles.rankNum, getRankStyle(item.rank))}>
        {item.rank <= 3 ? (
          <Text className={styles.rankIcon}>
            {item.rank === 1 ? '🥇' : item.rank === 2 ? '🥈' : '🥉'}
          </Text>
        ) : (
          <Text className={styles.rankText}>{item.rank}</Text>
        )}
      </View>
      
      {type === 'personal' && (
        <View className={styles.avatarWrap}>
          <Image className={styles.avatar} src={avatarUrl} mode="aspectFill" />
        </View>
      )}
      
      <View className={styles.info}>
        <Text className={styles.name}>{item.name}</Text>
        {showDepartment && type === 'personal' && (
          <Text className={styles.dept}>{item.department}</Text>
        )}
      </View>
      
      <View className={styles.rightSection}>
        <View className={styles.points}>
          <Text className={styles.pointsValue}>{item.points}</Text>
          <Text className={styles.pointsUnit}>积分</Text>
        </View>
        <View className={styles.carbon}>
          <Text className={styles.carbonValue}>{item.carbonSaved.toFixed(1)}</Text>
          <Text className={styles.carbonUnit}>kg减排</Text>
        </View>
      </View>
    </View>
  );
};

export default RankItemComponent;
