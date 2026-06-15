import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';
import type { CommuteRecord } from '@/types';
import { getTransportOption, formatCarbon, formatDistance } from '@/utils/carbon';

interface CommuteItemProps {
  record: CommuteRecord;
  showDate?: boolean;
  onClick?: () => void;
}

const CommuteItem: React.FC<CommuteItemProps> = ({ record, showDate = false, onClick }) => {
  const option = getTransportOption(record.type);
  
  return (
    <View className={styles.commuteItem} onClick={onClick}>
      <View className={styles.leftSection}>
        <View className={styles.iconWrap} style={{ backgroundColor: option?.color + '15' }}>
          <Text className={styles.icon}>{option?.icon}</Text>
        </View>
        <View className={styles.info}>
          <View className={styles.titleRow}>
            <Text className={styles.title}>{option?.name}</Text>
            <Text className={styles.direction}>{record.direction === 'go' ? '上班' : '下班'}</Text>
            {record.isMakeup && <Text className={styles.makeupTag}>补录</Text>}
          </View>
          <View className={styles.subRow}>
            {showDate && <Text className={styles.date}>{record.date} </Text>}
            <Text className={styles.time}>{record.time}</Text>
            {record.routeName && <Text className={styles.route}> · {record.routeName}</Text>}
          </View>
        </View>
      </View>
      <View className={styles.rightSection}>
        <View className={styles.points}>+{record.points}<Text className={styles.pointsUnit}>积分</Text></View>
        <View className={styles.carbon}>-{record.carbonSaved.toFixed(2)}kg CO₂</View>
      </View>
    </View>
  );
};

export default CommuteItem;
