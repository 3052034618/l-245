import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store/useStore';
import { mockDepartmentRanking } from '@/data/mockRanking';
import { getTransportOption } from '@/utils/carbon';
import type { CommuteRecord } from '@/types';

const AdminPage: React.FC = () => {
  const { commuteRecords, reviewMakeup, user } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'review'>('overview');
  const [selectedRecord, setSelectedRecord] = useState<CommuteRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  const totalEmployees = 185;
  const activeEmployees = 156;
  const participationRate = Math.round((activeEmployees / totalEmployees) * 100);
  
  const pendingRecords = useMemo(() => {
    return commuteRecords.filter(r => r.isMakeup && r.status === 'pending');
  }, [commuteRecords]);
  
  const approvedRecords = useMemo(() => {
    return commuteRecords.filter(r => r.isMakeup && r.status === 'approved');
  }, [commuteRecords]);
  
  const totalCarbon = useMemo(() => {
    return mockDepartmentRanking.reduce((sum, dept) => sum + dept.totalCarbon, 0);
  }, []);
  
  const totalPoints = useMemo(() => {
    return mockDepartmentRanking.reduce((sum, dept) => sum + dept.totalPoints, 0);
  }, []);
  
  const weekData = [65, 72, 68, 75, 80, 78, 82];
  const weekLabels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  
  const handleViewDetail = () => {
    Taro.showToast({ title: '查看详情', icon: 'none' });
  };
  
  const handleExportData = () => {
    Taro.showLoading({ title: '导出中...' });
    setTimeout(() => {
      Taro.hideLoading();
      Taro.showToast({ title: '导出成功', icon: 'success' });
      console.log('[Admin] 数据导出成功');
    }, 1500);
  };
  
  const handleApprove = (record: CommuteRecord) => {
    Taro.showModal({
      title: '审核通过',
      content: `确定通过该补录申请？用户将获得 ${record.points} 积分，减排 ${record.carbonSaved.toFixed(2)}kg。`,
      confirmText: '通过',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          reviewMakeup(record.id, 'approved');
          Taro.showToast({ title: '已通过', icon: 'success' });
          console.log('[Admin] 审核通过', record.id);
        }
      }
    });
  };
  
  const handleRejectClick = (record: CommuteRecord) => {
    setSelectedRecord(record);
    setRejectReason('');
    setShowRejectModal(true);
  };
  
  const handleConfirmReject = () => {
    if (!selectedRecord) return;
    if (!rejectReason.trim()) {
      Taro.showToast({ title: '请填写驳回原因', icon: 'none' });
      return;
    }
    reviewMakeup(selectedRecord.id, 'rejected', rejectReason.trim());
    Taro.showToast({ title: '已驳回', icon: 'none' });
    console.log('[Admin] 审核驳回', selectedRecord.id, rejectReason);
    setShowRejectModal(false);
    setSelectedRecord(null);
  };
  
  const handleViewRecord = (record: CommuteRecord) => {
    if (record.receiptUrls && record.receiptUrls.length > 0) {
      Taro.previewImage({
        urls: record.receiptUrls,
        current: record.receiptUrls[0]
      });
    } else {
      Taro.showToast({ title: '无凭证图片', icon: 'none' });
    }
  };
  
  const top5Depts = mockDepartmentRanking.slice(0, 5);
  const maxRate = Math.max(...top5Depts.map(d => d.participationRate));
  
  const renderOverview = () => (
    <>
      <View className={styles.statsGrid}>
        <View className={styles.statCard}>
          <View className={classnames(styles.statValue, styles.primary)}>
            {totalEmployees}
            <Text className={styles.unit}>人</Text>
          </View>
          <Text className={styles.statLabel}>总员工数</Text>
        </View>
        <View className={styles.statCard}>
          <View className={classnames(styles.statValue, styles.success)}>
            {activeEmployees}
            <Text className={styles.unit}>人</Text>
          </View>
          <Text className={styles.statLabel}>活跃用户</Text>
        </View>
        <View className={styles.statCard}>
          <View className={classnames(styles.statValue, styles.warning)}>
            {totalPoints}
            <Text className={styles.unit}>分</Text>
          </View>
          <Text className={styles.statLabel}>总积分发放</Text>
        </View>
        <View className={styles.statCard}>
          <View className={classnames(styles.statValue, styles.info)}>
            {totalCarbon.toFixed(0)}
            <Text className={styles.unit}>kg</Text>
          </View>
          <Text className={styles.statLabel}>总减排量</Text>
        </View>
      </View>
      
      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text>总体参与率</Text>
          <Text className={styles.moreLink} onClick={handleViewDetail}>详情</Text>
        </View>
        
        <View className={styles.rateBar}>
          <Text className={styles.rateValue}>{participationRate}%</Text>
          <View className={styles.rateBarWrap}>
            <View
              className={styles.rateBarFill}
              style={{ width: `${participationRate}%` }}
            />
          </View>
        </View>
        
        <View className={styles.trendChart}>
          {weekData.map((value, idx) => (
            <View
              key={idx}
              className={classnames(styles.chartBar, value < 70 && styles.low)}
              style={{ height: `${(value / 100) * 100}%` }}
            >
              <Text className={styles.chartLabel}>{weekLabels[idx]}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text>部门参与率排行</Text>
          <Text className={styles.moreLink} onClick={handleViewDetail}>全部</Text>
        </View>
        
        <View className={styles.deptList}>
          {top5Depts.map((dept, idx) => (
            <View key={dept.id} className={styles.deptRankItem}>
              <Text className={classnames(styles.deptRank, idx < 3 && `top${idx + 1}`)}>
                {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : idx + 1}
              </Text>
              <Text className={styles.deptName}>{dept.name}</Text>
              <Text className={styles.deptRate}>{dept.participationRate}%</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>快捷功能</Text>
        <View className={styles.quickActions}>
          <View
            className={styles.actionItem}
            onClick={() => setActiveTab('review')}
          >
            <View className={styles.actionIcon}>
              📝
              {pendingRecords.length > 0 && (
                <View className={styles.badge}>{pendingRecords.length}</View>
              )}
            </View>
            <Text className={styles.actionText}>补录审核</Text>
          </View>
          <View className={styles.actionItem}>
            <View className={styles.actionIcon}>🎉</View>
            <Text className={styles.actionText}>活动管理</Text>
          </View>
          <View className={styles.actionItem}>
            <View className={styles.actionIcon}>📢</View>
            <Text className={styles.actionText}>发布公告</Text>
          </View>
          <View className={styles.actionItem}>
            <View className={styles.actionIcon}>👥</View>
            <Text className={styles.actionText}>用户管理</Text>
          </View>
          <View className={styles.actionItem} onClick={handleExportData}>
            <View className={styles.actionIcon}>�</View>
            <Text className={styles.actionText}>数据导出</Text>
          </View>
          <View className={styles.actionItem}>
            <View className={styles.actionIcon}>🎁</View>
            <Text className={styles.actionText}>礼品管理</Text>
          </View>
        </View>
      </View>
    </>
  );
  
  const renderReview = () => (
    <>
      <View className={styles.reviewStats}>
        <View className={styles.reviewStat}>
          <Text className={styles.reviewStatNum} style={{ color: '#FAAD14' }}>{pendingRecords.length}</Text>
          <Text className={styles.reviewStatLabel}>待审核</Text>
        </View>
        <View className={styles.reviewStatDivider} />
        <View className={styles.reviewStat}>
          <Text className={styles.reviewStatNum} style={{ color: '#00B42A' }}>{approvedRecords.length}</Text>
          <Text className={styles.reviewStatLabel}>已通过</Text>
        </View>
        <View className={styles.reviewStatDivider} />
        <View className={styles.reviewStat}>
          <Text className={styles.reviewStatNum} style={{ color: '#86909C' }}>
            {commuteRecords.filter(r => r.isMakeup && r.status === 'rejected').length}
          </Text>
          <Text className={styles.reviewStatLabel}>已驳回</Text>
        </View>
      </View>
      
      {pendingRecords.length === 0 ? (
        <View className={styles.emptyReview}>
          <Text style={{ fontSize: '48rpx' }}>🎉</Text>
          <Text style={{ fontSize: '28rpx', color: '#86909C', marginTop: '16rpx' }}>暂无待审核的补录申请</Text>
        </View>
      ) : (
        pendingRecords.map(record => {
          const option = getTransportOption(record.type);
          return (
            <View key={record.id} className={styles.reviewCard}>
              <View className={styles.reviewCardHeader}>
                <View className={styles.reviewUser}>
                  <Image
                    className={styles.reviewAvatar}
                    src={`https://picsum.photos/id/${user.avatarId}/100/100`}
                    mode="aspectFill"
                  />
                  <View>
                    <Text className={styles.reviewUserName}>{user.name}</Text>
                    <Text className={styles.reviewUserDept}>{user.department}</Text>
                  </View>
                </View>
                <View className={classnames(styles.reviewStatus, styles.pending)}>待审核</View>
              </View>
              
              <View className={styles.reviewInfo}>
                <View className={styles.reviewInfoRow}>
                  <Text className={styles.reviewInfoLabel}>补录日期</Text>
                  <Text className={styles.reviewInfoValue}>{record.date}</Text>
                </View>
                <View className={styles.reviewInfoRow}>
                  <Text className={styles.reviewInfoLabel}>交通方式</Text>
                  <Text className={styles.reviewInfoValue}>
                    <Text style={{ marginRight: '8rpx' }}>{option?.icon}</Text>
                    {option?.name} · {record.direction === 'go' ? '上班' : '下班'}
                  </Text>
                </View>
                <View className={styles.reviewInfoRow}>
                  <Text className={styles.reviewInfoLabel}>通勤里程</Text>
                  <Text className={styles.reviewInfoValue}>{record.distance} km</Text>
                </View>
                <View className={styles.reviewInfoRow}>
                  <Text className={styles.reviewInfoLabel}>预计积分</Text>
                  <Text className={styles.reviewInfoValue} style={{ color: '#FAAD14' }}>+{record.points} 分</Text>
                </View>
                <View className={styles.reviewInfoRow}>
                  <Text className={styles.reviewInfoLabel}>预计减排</Text>
                  <Text className={styles.reviewInfoValue} style={{ color: '#00B42A' }}>-{record.carbonSaved.toFixed(2)} kg</Text>
                </View>
                <View className={styles.reviewInfoRow}>
                  <Text className={styles.reviewInfoLabel}>提交时间</Text>
                  <Text className={styles.reviewInfoValue}>{record.submitTime || '-'}</Text>
                </View>
              </View>
              
              {record.receiptUrls && record.receiptUrls.length > 0 && (
                <View className={styles.reviewReceipt}>
                  <Text className={styles.reviewReceiptLabel}>凭证图片 ({record.receiptUrls.length})</Text>
                  <ScrollView className={styles.receiptScroll} scrollX>
                    <View className={styles.receiptList}>
                      {record.receiptUrls.map((url, idx) => (
                        <Image
                          key={idx}
                          className={styles.receiptImage}
                          src={url}
                          mode="aspectFill"
                          onClick={() => handleViewRecord(record)}
                        />
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
              
              <View className={styles.reviewActions}>
                <View
                  className={classnames(styles.reviewBtn, styles.reject)}
                  onClick={() => handleRejectClick(record)}
                >
                  驳回
                </View>
                <View
                  className={classnames(styles.reviewBtn, styles.approve)}
                  onClick={() => handleApprove(record)}
                >
                  通过
                </View>
              </View>
            </View>
          );
        })
      )}
    </>
  );
  
  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.headerContent}>
          <Text className={styles.headerTitle}>👑 管理员面板</Text>
          <Text className={styles.headerSub}>低碳通勤数据管理中心</Text>
        </View>
        
        <View className={styles.adminTabs}>
          <View
            className={classnames(styles.adminTab, activeTab === 'overview' && styles.active)}
            onClick={() => setActiveTab('overview')}
          >
            数据概览
          </View>
          <View
            className={classnames(styles.adminTab, activeTab === 'review' && styles.active)}
            onClick={() => setActiveTab('review')}
          >
            补录审核
            {pendingRecords.length > 0 && (
              <View className={styles.tabBadge}>{pendingRecords.length}</View>
            )}
          </View>
        </View>
      </View>
      
      <View className={styles.content}>
        {activeTab === 'overview' ? renderOverview() : renderReview()}
      </View>
      
      {showRejectModal && (
        <View className={styles.modalMask} onClick={() => setShowRejectModal(false)}>
          <View className={styles.rejectModal} onClick={(e) => e.stopPropagation?.()}>
            <Text className={styles.modalTitle}>驳回补录申请</Text>
            <Text className={styles.modalSub}>请填写驳回原因</Text>
            <View className={styles.textareaWrap}>
              <textarea
                className={styles.textarea}
                value={rejectReason}
                onInput={(e: any) => setRejectReason(e.target.value)}
                placeholder="请输入驳回原因，用户将看到此信息"
                rows={4}
              />
            </View>
            <View className={styles.modalActions}>
              <View
                className={classnames(styles.modalBtn, styles.cancel)}
                onClick={() => setShowRejectModal(false)}
              >
                取消
              </View>
              <View
                className={classnames(styles.modalBtn, styles.confirmReject)}
                onClick={handleConfirmReject}
              >
                确认驳回
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default AdminPage;
