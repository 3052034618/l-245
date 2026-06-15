import React, { useState, useMemo } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store/useStore';
import { transportOptions, calculatePoints, calculateCarbonSaved } from '@/utils/carbon';
import { getCurrentTime } from '@/utils/date';
import type { TransportType, CommuteRecord } from '@/types';

const MakeupPage: React.FC = () => {
  const { addCommuteRecord } = useAppStore();
  const [selectedTransport, setSelectedTransport] = useState<TransportType>('subway');
  const [direction, setDirection] = useState<'go' | 'back'>('go');
  const [distance, setDistance] = useState<string>('10');
  const [date, setDate] = useState<string>('2024-06-10');
  const [time, setTime] = useState<string>('08:30');
  const [remark, setRemark] = useState<string>('');
  
  const previewPoints = useMemo(() => {
    const dist = parseFloat(distance) || 0;
    return calculatePoints(selectedTransport, dist);
  }, [selectedTransport, distance]);
  
  const previewCarbon = useMemo(() => {
    const dist = parseFloat(distance) || 0;
    return calculateCarbonSaved(selectedTransport, dist);
  }, [selectedTransport, distance]);
  
  const handleDateChange = () => {
    Taro.showDatePicker?.({
      success: (res: any) => {
        setDate(res.detail.value);
      }
    });
  };
  
  const handleSubmit = () => {
    const dist = parseFloat(distance);
    if (!dist || dist <= 0) {
      Taro.showToast({ title: '请输入有效里程', icon: 'none' });
      return;
    }
    
    const newRecord: CommuteRecord = {
      id: `record-${Date.now()}`,
      date,
      type: selectedTransport,
      distance: dist,
      carbonSaved: previewCarbon,
      points: previewPoints,
      direction,
      time,
      isMakeup: true,
      status: 'pending'
    };
    
    Taro.showModal({
      title: '提交补录',
      content: '补录申请提交后需要管理员审核，审核通过后积分会自动到账。确定提交吗？',
      confirmText: '确认提交',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          addCommuteRecord(newRecord);
          Taro.showToast({
            title: '提交成功，等待审核',
            icon: 'success'
          });
          console.log('[Makeup] 补录提交成功', newRecord);
          setTimeout(() => {
            Taro.navigateBack();
          }, 1500);
        }
      }
    });
  };
  
  const handleUploadReceipt = () => {
    Taro.showToast({ title: '上传票据功能', icon: 'none' });
  };
  
  return (
    <View className={styles.page}>
      <View className={styles.card}>
        <Text className={styles.sectionTitle}>交通方式</Text>
        <View className={styles.transportGrid}>
          {transportOptions.map(opt => (
            <View
              key={opt.type}
              className={classnames(styles.transportItem, selectedTransport === opt.type && styles.active)}
              onClick={() => setSelectedTransport(opt.type)}
            >
              <Text className={styles.transportIcon}>{opt.icon}</Text>
              <Text className={styles.transportName}>{opt.name}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View className={styles.card}>
        <Text className={styles.sectionTitle}>补录信息</Text>
        
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>补录日期</Text>
          <View className={styles.datePicker} onClick={handleDateChange}>
            {date} ›
          </View>
        </View>
        
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>通勤方向</Text>
          <View className={styles.directionTabs}>
            <View
              className={classnames(styles.tabItem, direction === 'go' && styles.active)}
              onClick={() => setDirection('go')}
            >
              上班
            </View>
            <View
              className={classnames(styles.tabItem, direction === 'back' && styles.active)}
              onClick={() => setDirection('back')}
            >
              下班
            </View>
          </View>
        </View>
        
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>通勤时间</Text>
          <Input
            className={styles.formInput}
            value={time}
            onInput={(e) => setTime(e.detail.value)}
            placeholder="请输入时间 如: 08:30"
          />
        </View>
        
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>通勤里程</Text>
          <Input
            className={styles.formInput}
            type="digit"
            value={distance}
            onInput={(e) => setDistance(e.detail.value)}
            placeholder="请输入里程"
          />
          <Text style={{ fontSize: '28rpx', color: '#86909C', marginLeft: '8rpx' }}>公里</Text>
        </View>
        
        <View className={styles.previewBox}>
          <View className={styles.previewItem}>
            <Text className={styles.value}>+{previewPoints}</Text>
            <Text className={styles.label}>预计积分</Text>
          </View>
          <View className={styles.previewItem}>
            <Text className={styles.value}>-{previewCarbon.toFixed(2)}kg</Text>
            <Text className={styles.label}>预计减排</Text>
          </View>
        </View>
      </View>
      
      <View className={styles.card}>
        <Text className={styles.sectionTitle}>上传凭证</Text>
        <View className={styles.receiptUpload} onClick={handleUploadReceipt}>
          <Text className={styles.uploadIcon}>📷</Text>
          <Text className={styles.uploadText}>点击上传票据/截图</Text>
        </View>
        <View className={styles.tip} style={{ marginTop: '24rpx' }}>
          温馨提示：补录通勤需提供相关凭证（如地铁票、公交记录、骑行记录截图等），以便管理员审核。
        </View>
      </View>
      
      <Button className={styles.submitBtn} onClick={handleSubmit}>
        提交补录申请
      </Button>
    </View>
  );
};

export default MakeupPage;
