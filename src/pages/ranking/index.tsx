import React, { useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store/useStore';
import { mockPersonalRanking, mockDepartmentRanking } from '@/data/mockRanking';
import RankItem from '@/components/RankItem';
import type { CarpoolMember } from '@/types';

const RankingPage: React.FC = () => {
  const { carpools, joinCarpool, user } = useAppStore();
  const [activeTab, setActiveTab] = useState<'personal' | 'department'>('personal');
  
  const topThree = mockPersonalRanking.slice(0, 3);
  const restList = mockPersonalRanking.slice(3);
  
  const handleJoinCarpool = (carpoolId: string) => {
    Taro.showModal({
      title: '加入拼车',
      content: '确定要加入这个拼车吗？加入后可获得额外低碳积分。',
      confirmText: '确认加入',
      cancelText: '再想想',
      success: (res) => {
        if (res.confirm) {
          const member: CarpoolMember = {
            id: user.id,
            name: user.name,
            avatarId: user.avatarId,
            department: user.department,
            joinTime: new Date().toLocaleString('zh-CN')
          };
          const result = joinCarpool(carpoolId, member);
          Taro.showToast({ title: result.message, icon: result.success ? 'success' : 'none' });
        }
      }
    });
  };
  
  const handleCreateCarpool = () => {
    Taro.navigateTo({ url: '/pages/carpool-detail/index' });
  };
  
  const handleViewCarpool = (id: string) => {
    Taro.navigateTo({ url: `/pages/carpool-detail/index?id=${id}` });
  };
  
  const getRankClass = (rank: number) => {
    if (rank === 1) return 'gold';
    if (rank === 2) return 'silver';
    if (rank === 3) return 'bronze';
    return '';
  };
  
  const getJoinBtnText = (carpool: any) => {
    if (carpool.status === 'full') return '已满员';
    if (carpool.status === 'cancelled') return '已取消';
    if (carpool.members.some((m: CarpoolMember) => m.id === user.id)) return '已加入';
    return '加入拼车';
  };
  
  const canJoin = (carpool: any) => {
    return carpool.status === 'open' && !carpool.members.some((m: CarpoolMember) => m.id === user.id);
  };
  
  return (
    <View className={styles.page}>
      <View className={styles.pageContent}>
        <View className={styles.tabBar}>
          <View
            className={classnames(styles.tabItem, activeTab === 'personal' && styles.active)}
            onClick={() => setActiveTab('personal')}
          >
            个人排行
          </View>
          <View
            className={classnames(styles.tabItem, activeTab === 'department' && styles.active)}
            onClick={() => setActiveTab('department')}
          >
            部门排行
          </View>
        </View>
        
        {activeTab === 'personal' ? (
          <>
            <View className={styles.topThree}>
              {topThree.map((item, idx) => (
                <View
                  key={item.id}
                  className={classnames(styles.topItem, idx === 0 ? styles.top1 : idx === 1 ? styles.top2 : styles.top3)}
                >
                  <View className={styles.topAvatarWrap}>
                    {idx === 0 && <Text className={styles.topCrown}>👑</Text>}
                    <Image
                      className={styles.topAvatar}
                      src={`https://picsum.photos/id/${item.avatarId}/100/100`}
                      mode="aspectFill"
                    />
                  </View>
                  <Text className={styles.topName}>{item.name}</Text>
                  <Text className={styles.topPoints}>{item.points}</Text>
                  <Text className={styles.topSub}>{item.carbonSaved.toFixed(1)}kg减排</Text>
                </View>
              ))}
            </View>
            
            <View className={styles.rankList}>
              {restList.map(item => (
                <RankItem key={item.id} item={item} type="personal" />
              ))}
            </View>
          </>
        ) : (
          <View className={styles.rankList}>
            {mockDepartmentRanking.map((dept, idx) => (
              <View key={dept.id} className={styles.deptRankItem}>
                <View className={classnames(styles.deptRankNum, getRankClass(idx + 1))}>
                  {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : idx + 1}
                </View>
                <View className={styles.deptInfo}>
                  <Text className={styles.deptName}>{dept.name}</Text>
                  <Text className={styles.deptStats}>{dept.memberCount}人 · 总减排{dept.totalCarbon.toFixed(1)}kg</Text>
                </View>
                <View className={styles.deptRight}>
                  <Text className={styles.deptPoints}>{dept.totalPoints}</Text>
                  <Text className={styles.deptRate}>参与率 {dept.participationRate}%</Text>
                </View>
              </View>
            ))}
          </View>
        )}
        
        <View className={styles.carpoolSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>🚗 拼车专区</Text>
            <Text className={styles.sectionMore}>共 {carpools.length} 条</Text>
          </View>
          
          {carpools.map(carpool => {
            const isCancelled = carpool.status === 'cancelled';
            const occupiedCount = carpool.members.length;
            const remaining = carpool.seats - occupiedCount;
            return (
              <View
                key={carpool.id}
                className={classnames(styles.carpoolCard, isCancelled && styles.cancelled)}
                onClick={() => handleViewCarpool(carpool.id)}
              >
                {isCancelled && (
                  <View className={styles.carpoolCancelledTag}>
                    已取消
                  </View>
                )}
                <View className={styles.carpoolHeader}>
                  <View className={styles.carpoolAvatar}>
                    <Image
                      className={styles.carpoolAvatarImg}
                      src={`https://picsum.photos/id/${carpool.initiatorAvatar}/100/100`}
                      mode="aspectFill"
                    />
                  </View>
                  <View className={styles.carpoolInitiator}>
                    <Text className={styles.initiatorName}>
                      {carpool.initiator}
                      <Text className={styles.initiatorLabel}>发起人</Text>
                    </Text>
                    {occupiedCount > 0 && (
                      <Text className={styles.memberAvatars}>
                        {carpool.members.slice(0, 3).map((m, i) => (
                          <Image
                            key={m.id}
                            className={styles.miniAvatar}
                            src={`https://picsum.photos/id/${m.avatarId}/80/80`}
                            mode="aspectFill"
                            style={{ marginLeft: i > 0 ? '-12rpx' : '0', zIndex: 10 - i }}
                          />
                        ))}
                        {occupiedCount > 3 && <Text className={styles.moreCount}>+{occupiedCount - 3}</Text>}
                      </Text>
                    )}
                  </View>
                  <View className={styles.carpoolSeats}>
                    <Text className={classnames(
                      styles.num,
                      (carpool.status === 'full' || isCancelled) && { color: isCancelled ? '#86909C' : '#F53F3F' }
                    )}>
                      {occupiedCount}
                    </Text>
                    /{carpool.seats}人
                    {!isCancelled && remaining > 0 && (
                      <Text className={styles.remainingTag}>剩{remaining}座</Text>
                    )}
                  </View>
                </View>
                
                <View className={styles.carpoolRoute}>
                  <View className={styles.routePoint}>
                    <Text className={styles.pointLabel}>起点</Text>
                    <Text className={styles.pointAddress}>{carpool.startLocation}</Text>
                  </View>
                  <Text className={styles.routeArrow}>→</Text>
                  <View className={styles.routePoint}>
                    <Text className={styles.pointLabel}>终点</Text>
                    <Text className={styles.pointAddress}>{carpool.endLocation}</Text>
                  </View>
                </View>
                
                <View className={styles.carpoolFooter}>
                  <Text className={styles.carpoolTime}>
                    <Text className={styles.icon}>🕐</Text>
                    {carpool.date} {carpool.startTime}
                  </Text>
                  <View
                    className={classnames(
                      styles.joinBtn,
                      !canJoin(carpool) && { background: '#C9CDD4' },
                      isCancelled && { background: '#86909C' }
                    )}
                    onClick={(e) => {
                      e.stopPropagation?.();
                      if (canJoin(carpool)) {
                        handleJoinCarpool(carpool.id);
                      } else if (isCancelled) {
                        Taro.showToast({ title: '拼车已取消', icon: 'none' });
                      }
                    }}
                  >
                    {getJoinBtnText(carpool)}
                  </View>
                </View>
              </View>
            );
          })}
          
          <View className={styles.createCarpoolBtn} onClick={handleCreateCarpool}>
            <Text>+ 发起拼车</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default RankingPage;
