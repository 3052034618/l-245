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
  
  const getStatusTag = () => {
    if (!record.isMakeup) return null;
    if (record.status === 'pending') {
      return <Text className={classnames(styles.statusTag, styles.pending)}>待审核</Text>;
    }
    if (record.status === 'rejected') {
      return <Text className={classnames(styles.statusTag, styles.rejected)}>已驳回</Text>;
    }
    return null;
  };
  
  const showPoints = record.isMakeup && record.status === 'pending' ? 0 : record.points;
  const showCarbon = record.isMakeup && record.status === 'pending' ? 0 : record.carbonSaved;
  
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
            {getStatusTag()}
          </View>
          <View className={styles.subRow}>
            {showDate && <Text className={styles.date}>{record.date} </Text>}
            <Text className={styles.time}>{record.time}</Text>
            {record.routeName && <Text className={styles.route}> · {record.routeName}</Text>}
            {record.reviewNote && record.status === 'rejected' && (
              <Text className={styles.reviewNote}> · 驳回原因：{record.reviewNote}</Text>
            )}
          </View>
        </View>
      </View>
      <View className={styles.rightSection}>
        <View className={classnames(styles.points, record.status === 'pending' && { opacity: 0.4 })}>
          +{showPoints}<Text className={styles.pointsUnit}>积分</Text>
        </View>
        <View className={classnames(styles.carbon, record.status === 'pending' && { opacity: 0.4 })}>
          -{showCarbon.toFixed(2)}kg CO₂
        </View>
      </View>
    </View>
  );
};

export default CommuteItem;
