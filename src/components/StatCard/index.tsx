import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: string;
  gradient?: string;
  color?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon,
  gradient = 'linear-gradient(135deg, #00B42A 0%, #36CFC9 100%)',
  color = '#00B42A',
  className
}) => {
  return (
    <View className={classnames(styles.statCard, className)} style={{ background: gradient }}>
      <View className={styles.cardContent}>
        <View className={styles.icon}>{icon}</View>
        <View className={styles.info}>
          <Text className={styles.value}>
            {value}
            {unit && <Text className={styles.unit}>{unit}</Text>}
          </Text>
          <Text className={styles.title}>{title}</Text>
        </View>
      </View>
    </View>
  );
};

export default StatCard;
