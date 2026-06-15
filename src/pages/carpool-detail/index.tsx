import React, { useState, useMemo } from 'react';
import { View, Text, Image, Button, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store/useStore';
import { getToday, getCurrentTime } from '@/utils/date';
import type { CarpoolInfo, CarpoolMember } from '@/types';

const CarpoolDetailPage: React.FC = () => {
  const router = useRouter();
  const { carpools, addCarpool, joinCarpool, cancelCarpool, user } = useAppStore();
  const carpoolId = router.params.id;
  const isCreate = !carpoolId;
  
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [startTime, setStartTime] = useState('08:30');
  const [date, setDate] = useState(getToday());
  const [seats, setSeats] = useState('4');
  const [routeName, setRouteName] = useState('');
  
  const carpool = useMemo(() => {
    if (!carpoolId) return null;
    return carpools.find(c => c.id === carpoolId) || null;
  }, [carpools, carpoolId]);
  
  const isJoined = useMemo(() => {
    if (!carpool) return false;
    return carpool.members.some(m => m.id === user.id);
  }, [carpool, user.id]);
  
  const isInitiator = useMemo(() => {
    if (!carpool) return false;
    return carpool.initiator === user.name;
  }, [carpool, user.name]);
  
  const isFull = useMemo(() => {
    if (!carpool) return false;
    return carpool.status === 'full';
  }, [carpool]);
  
  const isCancelled = useMemo(() => {
    if (!carpool) return false;
    return carpool.status === 'cancelled';
  }, [carpool]);
  
  const remainingSeats = useMemo(() => {
    if (!carpool) return 0;
    return carpool.seats - carpool.joinedCount;
  }, [carpool]);
  
  const handleJoin = () => {
    if (isCancelled) {
      Taro.showToast({ title: '拼车已取消', icon: 'none' });
      return;
    }
    if (isFull) {
      Taro.showToast({ title: '座位已满', icon: 'none' });
      return;
    }
    if (isJoined) {
      Taro.showToast({ title: '您已加入', icon: 'none' });
      return;
    }
    
    Taro.showModal({
      title: '加入拼车',
      content: '确定要加入这个拼车吗？加入后可获得额外低碳积分奖励。',
      confirmText: '确认加入',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          const member: CarpoolMember = {
            id: user.id,
            name: user.name,
            avatarId: user.avatarId,
            department: user.department,
            joinTime: new Date().toLocaleString('zh-CN')
          };
          const result = joinCarpool(carpoolId!, member);
          Taro.showToast({ title: result.message, icon: result.success ? 'success' : 'none' });
        }
      }
    });
  };
  
  const handleCancel = () => {
    Taro.showModal({
      title: '取消拼车',
      content: '确定要取消这个拼车吗？取消后其他成员将无法继续加入。',
      confirmText: '确认取消',
      cancelText: '再想想',
      confirmColor: '#F53F3F',
      success: (res) => {
        if (res.confirm) {
          const result = cancelCarpool(carpoolId!);
          Taro.showToast({ title: result.message, icon: result.success ? 'success' : 'none' });
        }
      }
    });
  };
  
  const handleCreate = () => {
    if (!startLocation || !endLocation) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    
    const seatsNum = parseInt(seats) || 4;
    
    const initiatorMember: CarpoolMember = {
      id: user.id,
      name: user.name,
      avatarId: user.avatarId,
      department: user.department,
      joinTime: new Date().toLocaleString('zh-CN')
    };
    
    const newCarpool: CarpoolInfo = {
      id: `carpool-${Date.now()}`,
      initiator: user.name,
      initiatorAvatar: user.avatarId,
      initiatorDept: user.department,
      startLocation,
      endLocation,
      startTime,
      seats: seatsNum,
      joinedCount: 1,
      date,
      routeName: routeName || `${startLocation}-${endLocation}`,
      members: [initiatorMember],
      createTime: new Date().toLocaleString('zh-CN'),
      status: seatsNum <= 1 ? 'full' : 'open'
    };
    
    Taro.showLoading({ title: '创建中...' });
    setTimeout(() => {
      addCarpool(newCarpool);
      Taro.hideLoading();
      Taro.showToast({ title: '创建成功', icon: 'success' });
      console.log('[Carpool] 创建拼车成功', newCarpool);
      setTimeout(() => {
        Taro.navigateBack();
      }, 1000);
    }, 800);
  };
  
  const handleShare = () => {
    Taro.showToast({ title: '分享功能', icon: 'none' });
  };
  
  const defaultMembers = [
    { name: '张明', dept: '技术研发部', avatar: 64 },
    { name: '李华', dept: '产品设计部', avatar: 91 }
  ];
  
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
            <Text className={styles.formLabel}>拼车日期</Text>
            <Input
              className={styles.formInput}
              value={date}
              onInput={(e) => setDate(e.detail.value)}
              placeholder="请输入日期"
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
          
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>路线名称</Text>
            <Input
              className={styles.formInput}
              value={routeName}
              onInput={(e) => setRouteName(e.detail.value)}
              placeholder="可选，如：天通苑-科技园"
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
        <View style={{ padding: '100rpx', textAlign: 'center' }}>
          <Text>拼车不存在或已取消</Text>
        </View>
      </View>
    );
  }
  
  const initiatorAvatarUrl = `https://picsum.photos/id/${carpool.initiatorAvatar}/100/100`;
  
  const displayMembers = carpool.members.length > 0 
    ? carpool.members 
    : defaultMembers.map((m, i) => ({
        id: `mock-${i}`,
        name: m.name,
        avatarId: m.avatar,
        department: m.dept,
        joinTime: ''
      }));
  
  const getJoinBtnText = () => {
    if (isCancelled) return '拼车已取消';
    if (isFull) return '已满员';
    if (isJoined) return '已加入';
    return '加入拼车';
  };
  
  const canJoin = () => {
    return !isCancelled && !isFull && !isJoined && carpool.status === 'open';
  };
  
  return (
    <View className={styles.page}>
      {isCancelled && (
        <View className={styles.cancelledBanner}>
          <Text className={styles.cancelledIcon}>⚠️</Text>
          <Text className={styles.cancelledText}>该拼车已被发起人取消</Text>
        </View>
      )}
      
      <View className={classnames(styles.routeCard, isCancelled && styles.disabled)}>
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
      
      <View className={classnames(styles.card, isCancelled && styles.disabled)} style={{ marginTop: '24rpx' }}>
        <Text className={styles.sectionTitle}>拼车信息</Text>
        <View className={styles.initiatorInfo}>
          <Image className={styles.avatar} src={initiatorAvatarUrl} mode="aspectFill" />
          <View className={styles.initiatorText}>
            <Text className={styles.initiatorName}>{carpool.initiator}</Text>
            <Text className={styles.initiatorLabel}>车主</Text>
          </View>
          <View className={styles.seatsInfo}>
            <Text className={classnames(
              styles.seatsNum,
              (isFull || isCancelled) && { color: isCancelled ? '#86909C' : '#F53F3F' }
            )}>
              {carpool.joinedCount}/{carpool.seats}
            </Text>
            <Text className={styles.seatsLabel}>已乘车/总座位</Text>
            {!isCancelled && remainingSeats > 0 && (
              <Text className={styles.remainingSeats}>剩余 {remainingSeats} 座</Text>
            )}
            {isCancelled && (
              <Text className={styles.cancelledSeats}>已取消</Text>
            )}
          </View>
        </View>
      </View>
      
      <View className={classnames(styles.card, isCancelled && styles.disabled)}>
        <View className={styles.membersHeader}>
          <Text className={styles.sectionTitle}>
            乘车成员 ({displayMembers.length})
          </Text>
          {!isCancelled && remainingSeats > 0 && (
            <Text className={styles.membersHint}>还剩 {remainingSeats} 个座位</Text>
          )}
        </View>
        <View className={styles.membersList}>
          {displayMembers.map((member, idx) => (
            <View key={member.id || idx} className={styles.memberItem}>
              <Image
                className={styles.memberAvatar}
                src={`https://picsum.photos/id/${member.avatarId}/100/100`}
                mode="aspectFill"
              />
              <View className={styles.memberInfo}>
                <Text className={styles.memberName}>
                  {member.name}
                  {member.id === user.id && (
                    <Text className={styles.memberMe}>(我)</Text>
                  )}
                </Text>
                <Text className={styles.memberDept}>{member.department}</Text>
              </View>
              {idx === 0 && <Text className={styles.memberRole}>车主</Text>}
            </View>
          ))}
        </View>
      </View>
      
      <View className={classnames(styles.card, isCancelled && styles.disabled)}>
        <View className={styles.noticeCard}>
          <Text className={styles.noticeTitle}>💡 温馨提示</Text>
          <View className={styles.noticeText}>
            请准时到达约定地点，拼车过程中请注意安全。
            参与拼车每次可获得额外 20 低碳积分奖励。
          </View>
        </View>
      </View>
      
      <View className={styles.bottomBar}>
        {isInitiator && !isCancelled ? (
          <>
            <Button className={styles.secondaryBtn} onClick={handleShare}>
              分享
            </Button>
            <Button
              className={classnames(styles.primaryBtn, styles.danger)}
              onClick={handleCancel}
            >
              取消拼车
            </Button>
          </>
        ) : (
          <>
            <Button className={styles.secondaryBtn} onClick={handleShare}>
              分享
            </Button>
            <Button
              className={classnames(
                styles.primaryBtn,
                !canJoin() && styles.disabled
              )}
              onClick={handleJoin}
              disabled={!canJoin()}
            >
              {getJoinBtnText()}
            </Button>
          </>
        )}
      </View>
    </View>
  );
};

export default CarpoolDetailPage;
