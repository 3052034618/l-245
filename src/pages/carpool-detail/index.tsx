import React, { useState, useMemo } from 'react';
import { View, Text, Image, Button, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { mockCarpoolList } from '@/data/mockRanking';
import type { CarpoolInfo } from '@/types';

const CarpoolDetailPage: React.FC = () => {
  const router = useRouter();
  const carpoolId = router.params.id;
  const isCreate = !carpoolId;
  
  const [carpool, setCarpool] = useState<CarpoolInfo | null>(null);
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [startTime, setStartTime] = useState('08:30');
  const [seats, setSeats] = useState('4');
  const [isJoined, setIsJoined] = useState(false);
  
  React.useEffect(() => {
    if (carpoolId) {
      const found = mockCarpoolList.find(c => c.id === carpoolId);
      if (found) {
        setCarpool(found);
      }
    }
  }, [carpoolId]);
  
  const isFull = useMemo(() => {
    if (!carpool) return false;
    return carpool.joinedCount >= carpool.seats;
  }, [carpool]);
  
  const handleJoin = () => {
    if (isFull) {
      Taro.showToast({ title: '座位已满', icon: 'none' });
      return;
    }
    
    Taro.showModal({
      title: '加入拼车',
      content: '确定要加入这个拼车吗？加入后可获得额外低碳积分奖励。',
      confirmText: '确认加入',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          setIsJoined(true);
          Taro.showToast({ title: '加入成功', icon: 'success' });
          console.log('[Carpool] 加入拼车成功', carpoolId);
        }
      }
    });
  };
  
  const handleCreate = () => {
    if (!startLocation || !endLocation) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    
    Taro.showLoading({ title: '创建中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '创建成功', icon: 'success' });
      console.log('[Carpool] 创建拼车成功', { startLocation, endLocation, startTime, seats });
      setTimeout(() => {
        Taro.navigateBack();
      }, 1500);
    }, 1000);
  };
  
  const handleShare = () => {
    Taro.showToast({ title: '分享功能', icon: 'none' });
  };
  
  const memberAvatars = [64, 91, 177];
  
  if (isCreate) {
    return (
      <View className={styles.page}>
        <View className={styles.card} style={{ marginTop: '24rpx' }}>
          <Text className={styles.sectionTitle}>发起拼车</Text>
          
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>出发地点</Text>
            <Input
              className={styles.formInput}
              value={startLocation}
              onInput={(e) => setStartLocation(e.detail.value)}
              placeholder="请输入出发地点"
            />
          </View>
          
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>目的地</Text>
            <Input
              className={styles.formInput}
              value={endLocation}
              onInput={(e) => setEndLocation(e.detail.value)}
              placeholder="请输入目的地"
            />
          </View>
          
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>出发时间</Text>
            <Input
              className={styles.formInput}
              value={startTime}
              onInput={(e) => setStartTime(e.detail.value)}
              placeholder="请输入出发时间"
            />
          </View>
          
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>座位数</Text>
            <Input
              className={styles.formInput}
              type="number"
              value={seats}
              onInput={(e) => setSeats(e.detail.value)}
              placeholder="请输入座位数"
            />
          </View>
        </View>
        
        <View className={styles.card}>
          <Text className={styles.sectionTitle}>拼车说明</Text>
          <View className={styles.noticeText}>
            1. 拼车仅限本公司员工参与{'\n'}
            2. 请准时到达约定地点{'\n'}
            3. 费用请自行与车主协商{'\n'}
            4. 参与拼车可获得额外低碳积分
          </View>
        </View>
        
        <View className={styles.bottomBar}>
          <Button className={styles.primaryBtn} onClick={handleCreate}>
            发起拼车
          </Button>
        </View>
      </View>
    );
  }
  
  if (!carpool) {
    return (
      <View className={styles.page}>
        <Text>加载中...</Text>
      </View>
    );
  }
  
  const initiatorAvatarUrl = `https://picsum.photos/id/${carpool.initiatorAvatar}/100/100`;
  
  return (
    <View className={styles.page}>
      <View className={styles.routeCard}>
        <View className={styles.routeRow}>
          <View className={styles.routePoint}>
            <Text className={styles.pointLabel}>起点</Text>
            <Text className={styles.pointAddress}>{carpool.startLocation}</Text>
          </View>
          <Text className={styles.routeIcon}>→</Text>
          <View className={styles.routePoint}>
            <Text className={styles.pointLabel}>终点</Text>
            <Text className={styles.pointAddress}>{carpool.endLocation}</Text>
          </View>
        </View>
        <View className={styles.timeRow}>
          <View className={styles.timeItem}>
            <Text className={styles.timeIcon}>📅</Text>
            <Text className={styles.timeText}>{carpool.date}</Text>
          </View>
          <View className={styles.timeItem}>
            <Text className={styles.timeIcon}>🕐</Text>
            <Text className={styles.timeText}>{carpool.startTime}</Text>
          </View>
        </View>
      </View>
      
      <View className={styles.card} style={{ marginTop: '24rpx' }}>
        <Text className={styles.sectionTitle}>拼车信息</Text>
        <View className={styles.initiatorInfo}>
          <Image className={styles.avatar} src={initiatorAvatarUrl} mode="aspectFill" />
          <View className={styles.initiatorText}>
            <Text className={styles.initiatorName}>{carpool.initiator}</Text>
            <Text className={styles.initiatorLabel}>车主</Text>
          </View>
          <View className={styles.seatsInfo}>
            <Text className={styles.seatsNum}>
              {carpool.joinedCount}/{carpool.seats}
            </Text>
            <Text className={styles.seatsLabel}>已乘车/总座位</Text>
          </View>
        </View>
      </View>
      
      <View className={styles.card}>
        <Text className={styles.sectionTitle}>乘车成员</Text>
        <View className={styles.membersList}>
          {memberAvatars.map((avatarId, idx) => (
            <View key={idx} className={styles.memberItem}>
              <Image
                className={styles.memberAvatar}
                src={`https://picsum.photos/id/${avatarId}/100/100`}
                mode="aspectFill"
              />
              <View className={styles.memberInfo}>
                <Text className={styles.memberName}>
                  {['张明', '李华', '王芳'][idx]}
                </Text>
                <Text className={styles.memberDept}>
                  {['技术研发部', '产品设计部', '市场运营部'][idx]}
                </Text>
              </View>
              {idx === 0 && <Text className={styles.memberRole}>车主</Text>}
            </View>
          ))}
        </View>
      </View>
      
      <View className={styles.card}>
        <View className={styles.noticeCard}>
          <Text className={styles.noticeTitle}>💡 温馨提示</Text>
          <View className={styles.noticeText}>
            请准时到达约定地点，拼车过程中请注意安全。
            参与拼车每次可获得额外 20 低碳积分奖励。
          </View>
        </View>
      </View>
      
      <View className={styles.bottomBar}>
        <Button className={styles.secondaryBtn} onClick={handleShare}>
          分享
        </Button>
        <Button
          className={classnames(styles.primaryBtn, (isFull || isJoined) && styles.disabled)}
          onClick={handleJoin}
        >
          {isJoined ? '已加入' : isFull ? '已满员' : '加入拼车'}
        </Button>
      </View>
    </View>
  );
};

export default CarpoolDetailPage;
