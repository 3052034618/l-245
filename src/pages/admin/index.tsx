import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Checkbox, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store/useStore';
import { mockDepartmentRanking } from '@/data/mockRanking';
import { getTransportOption, transportOptions } from '@/utils/carbon';
import type { CommuteRecord, TransportType } from '@/types';

type ReviewFilter = 'pending' | 'approved' | 'rejected' | 'all';

const AdminPage: React.FC = () => {
  const { commuteRecords, reviewMakeup, batchReviewMakeup, user } = useAppStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'review'>('overview');
  const [filter, setFilter] = useState<ReviewFilter>('pending');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<CommuteRecord | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchTransport, setSearchTransport] = useState<TransportType | ''>('');
  const [showSearchPanel, setShowSearchPanel] = useState(false);
  
  const totalEmployees = 185;
  const activeEmployees = 156;
  const participationRate = Math.round((activeEmployees / totalEmployees) * 100);
  
  const makeupRecords = useMemo(() => {
    return commuteRecords.filter(r => r.isMakeup);
  }, [commuteRecords]);
  
  const pendingRecords = useMemo(() => {
    return makeupRecords.filter(r => r.status === 'pending');
  }, [makeupRecords]);
  
  const approvedRecords = useMemo(() => {
    return makeupRecords.filter(r => r.status === 'approved');
  }, [makeupRecords]);
  
  const rejectedRecords = useMemo(() => {
    return makeupRecords.filter(r => r.status === 'rejected');
  }, [makeupRecords]);
  
  const reviewedRecords = useMemo(() => {
    return makeupRecords.filter(r => r.status === 'approved' || r.status === 'rejected');
  }, [makeupRecords]);
  
  const baseFiltered = useMemo(() => {
    switch (filter) {
      case 'pending': return pendingRecords;
      case 'approved': return approvedRecords;
      case 'rejected': return rejectedRecords;
      case 'all': return makeupRecords;
      default: return pendingRecords;
    }
  }, [filter, pendingRecords, approvedRecords, rejectedRecords, makeupRecords]);
  
  const filteredRecords = useMemo(() => {
    let result = baseFiltered;
    
    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim().toLowerCase();
      result = result.filter(r => {
        const opt = getTransportOption(r.type);
        return (
          (opt?.name && opt.name.toLowerCase().includes(kw)) ||
          r.date.includes(kw) ||
          (r.remark && r.remark.toLowerCase().includes(kw)) ||
          (r.reviewNote && r.reviewNote.toLowerCase().includes(kw))
        );
      });
    }
    
    if (searchDate.trim()) {
      const d = searchDate.trim();
      result = result.filter(r => r.date.includes(d));
    }
    
    if (searchTransport) {
      result = result.filter(r => r.type === searchTransport);
    }
    
    return result;
  }, [baseFiltered, searchKeyword, searchDate, searchTransport]);
  
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
    }, 1500);
  };
  
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };
  
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredRecords.length && selectedIds.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredRecords.map(r => r.id));
    }
  };
  
  const handleBatchApprove = () => {
    if (selectedIds.length === 0) {
      Taro.showToast({ title: '请先选择申请', icon: 'none' });
      return;
    }
    
    Taro.showModal({
      title: '批量通过',
      content: `确定通过选中的 ${selectedIds.length} 条补录申请？`,
      confirmText: '批量通过',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          const result = batchReviewMakeup(selectedIds, true);
          Taro.showToast({ title: result.message, icon: 'success' });
          setSelectedIds([]);
        }
      }
    });
  };
  
  const handleApprove = (record: CommuteRecord) => {
    Taro.showModal({
      title: '审核通过',
      content: `确定通过该补录申请？用户将获得 ${record.points} 积分，减排 ${record.carbonSaved.toFixed(2)}kg。`,
      confirmText: '通过',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          reviewMakeup(record.id, true);
          Taro.showToast({ title: '已通过', icon: 'success' });
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
    reviewMakeup(selectedRecord.id, false, rejectReason.trim());
    Taro.showToast({ title: '已驳回', icon: 'none' });
    setShowRejectModal(false);
    setSelectedRecord(null);
  };
  
  const handleViewRecord = (record: CommuteRecord) => {
    Taro.navigateTo({ url: `/pages/makeup-detail/index?id=${record.id}&source=admin` });
  };
  
  const handlePreviewImage = (record: CommuteRecord) => {
    if (record.receiptUrls && record.receiptUrls.length > 0) {
      Taro.previewImage({
        urls: record.receiptUrls,
        current: record.receiptUrls[0]
      });
    } else {
      Taro.showToast({ title: '无凭证图片', icon: 'none' });
    }
  };
  
  const clearSearch = () => {
    setSearchKeyword('');
    setSearchDate('');
    setSearchTransport('');
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return '待审核';
      case 'approved': return '已通过';
      case 'rejected': return '已驳回';
      default: return '未知';
    }
  };
  
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'pending': return 'pending';
      case 'approved': return 'approved';
      case 'rejected': return 'rejected';
      default: return '';
    }
  };
  
  const top5Depts = mockDepartmentRanking.slice(0, 5);
  
  const filterOptions: { value: ReviewFilter; label: string; count: number }[] = [
    { value: 'pending', label: '待审核', count: pendingRecords.length },
    { value: 'approved', label: '已通过', count: approvedRecords.length },
    { value: 'rejected', label: '已驳回', count: rejectedRecords.length },
    { value: 'all', label: '全部', count: makeupRecords.length }
  ];
  
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
            <View className={styles.rateBarFill} style={{ width: `${participationRate}%` }} />
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
            onClick={() => { setActiveTab('review'); setFilter('pending'); }}
          >
            <View className={styles.actionIcon}>
              📝
              {pendingRecords.length > 0 && <View className={styles.badge}>{pendingRecords.length}</View>}
            </View>
            <Text className={styles.actionText}>补录审核</Text>
          </View>
          <View
            className={styles.actionItem}
            onClick={() => { setActiveTab('review'); setFilter('approved'); }}
          >
            <View className={styles.actionIcon}>📋</View>
            <Text className={styles.actionText}>审核历史</Text>
          </View>
          <View className={styles.actionItem}>
            <View className={styles.actionIcon}>🎉</View>
            <Text className={styles.actionText}>活动管理</Text>
          </View>
          <View className={styles.actionItem}>
            <View className={styles.actionIcon}>�</View>
            <Text className={styles.actionText}>发布公告</Text>
          </View>
          <View className={styles.actionItem} onClick={handleExportData}>
            <View className={styles.actionIcon}>📊</View>
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
  
  const renderSearchPanel = () => (
    <View className={styles.searchPanel}>
      <View className={styles.searchRow}>
        <Text className={styles.searchLabel}>关键词</Text>
        <Input
          className={styles.searchInput}
          value={searchKeyword}
          onInput={(e) => setSearchKeyword(e.detail.value)}
          placeholder="日期/交通方式/备注"
        />
      </View>
      <View className={styles.searchRow}>
        <Text className={styles.searchLabel}>日期</Text>
        <Input
          className={styles.searchInput}
          value={searchDate}
          onInput={(e) => setSearchDate(e.detail.value)}
          placeholder="如: 2024-06"
        />
      </View>
      <View className={styles.searchRow}>
        <Text className={styles.searchLabel}>交通</Text>
        <ScrollView className={styles.transportScroll} scrollX>
          <View className={styles.transportChips}>
            <View
              className={classnames(styles.chip, searchTransport === '' && styles.chipActive)}
              onClick={() => setSearchTransport('')}
            >
              全部
            </View>
            {transportOptions.map(opt => (
              <View
                key={opt.type}
                className={classnames(styles.chip, searchTransport === opt.type && styles.chipActive)}
                onClick={() => setSearchTransport(opt.type)}
              >
                {opt.icon} {opt.name}
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
      <View className={styles.searchActions}>
        <View className={styles.clearBtn} onClick={clearSearch}>清除筛选</View>
        <View className={styles.searchClose} onClick={() => setShowSearchPanel(false)}>收起</View>
      </View>
    </View>
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
          <Text className={styles.reviewStatNum} style={{ color: '#86909C' }}>{rejectedRecords.length}</Text>
          <Text className={styles.reviewStatLabel}>已驳回</Text>
        </View>
      </View>
      
      <View className={styles.filterBar}>
        <ScrollView className={styles.filterScroll} scrollX>
          <View className={styles.filterList}>
            {filterOptions.map(opt => (
              <View
                key={opt.value}
                className={classnames(styles.filterItem, filter === opt.value && styles.active)}
                onClick={() => { setFilter(opt.value); setSelectedIds([]); }}
              >
                {opt.label}
                <View className={styles.filterCount}>{opt.count}</View>
              </View>
            ))}
          </View>
        </ScrollView>
        <View
          className={classnames(styles.searchToggle, showSearchPanel && styles.searchActive)}
          onClick={() => setShowSearchPanel(!showSearchPanel)}
        >
          🔍
        </View>
      </View>
      
      {showSearchPanel && renderSearchPanel()}
      
      {filter === 'pending' && filteredRecords.length > 0 && (
        <View className={styles.batchBar}>
          <View className={styles.batchLeft}>
            <Checkbox
              checked={selectedIds.length === filteredRecords.length && filteredRecords.length > 0}
              onClick={toggleSelectAll}
            />
            <Text className={styles.batchText}>
              已选 {selectedIds.length}/{filteredRecords.length} 条
            </Text>
          </View>
          <View className={styles.batchActions}>
            <View
              className={classnames(styles.batchBtn, selectedIds.length === 0 && { opacity: 0.4 })}
              onClick={handleBatchApprove}
            >
              批量通过
            </View>
          </View>
        </View>
      )}
      
      {(filter === 'approved' || filter === 'rejected' || filter === 'all') && reviewedRecords.length > 0 && (
        <View className={styles.historyHint}>
          共 {reviewedRecords.length} 条审核记录
        </View>
      )}
      
      {filteredRecords.length === 0 ? (
        <View className={styles.emptyReview}>
          <Text style={{ fontSize: '48rpx' }}>🎉</Text>
          <Text style={{ fontSize: '28rpx', color: '#86909C', marginTop: '16rpx' }}>
            {searchKeyword || searchDate || searchTransport
              ? '没有找到匹配的记录'
              : `暂无${getStatusText(filter)}的补录申请`}
          </Text>
        </View>
      ) : (
        filteredRecords.map(record => {
          const option = getTransportOption(record.type);
          const isSelected = selectedIds.includes(record.id);
          
          return (
            <View key={record.id} className={styles.reviewCard}>
              {filter === 'pending' && (
                <View
                  className={styles.checkWrap}
                  onClick={(e) => { e.stopPropagation?.(); toggleSelect(record.id); }}
                >
                  <Checkbox checked={isSelected} />
                </View>
              )}
              
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
                <View className={classnames(styles.reviewStatus, styles[getStatusClass(record.status)])}>
                  {getStatusText(record.status)}
                </View>
              </View>
              
              <View
                className={styles.reviewInfo}
                onClick={() => handleViewRecord(record)}
              >
                <View className={styles.reviewInfoRow}>
                  <Text className={styles.reviewInfoLabel}>补录日期</Text>
                  <Text className={styles.reviewInfoValue}>{record.date}</Text>
                </View>
                <View className={styles.reviewInfoRow}>
                  <Text className={styles.reviewInfoLabel}>交通方式</Text>
                  <Text className={styles.reviewInfoValue}>
                    {option?.icon} {option?.name} · {record.direction === 'go' ? '上班' : '下班'}
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
                  <Text className={styles.reviewInfoLabel}>提交时间</Text>
                  <Text className={styles.reviewInfoValue}>{record.submitTime || '-'}</Text>
                </View>
                {record.reviewerName && record.reviewTime && (
                  <View className={styles.reviewInfoRow}>
                    <Text className={styles.reviewInfoLabel}>审核信息</Text>
                    <Text className={styles.reviewInfoValue}>
                      {record.reviewerName} · {record.reviewTime}
                    </Text>
                  </View>
                )}
                {record.reviewNote && (
                  <View className={styles.reviewInfoRow}>
                    <Text className={styles.reviewInfoLabel}>
                      {record.status === 'rejected' ? '驳回原因' : '审核备注'}
                    </Text>
                    <Text className={styles.reviewInfoValue} style={{ color: record.status === 'rejected' ? '#F53F3F' : '#86909C' }}>
                      {record.reviewNote}
                    </Text>
                  </View>
                )}
              </View>
              
              {record.receiptUrls && record.receiptUrls.length > 0 && (
                <View className={styles.reviewReceipt}>
                  <Text className={styles.reviewReceiptLabel}>
                    凭证图片 ({record.receiptUrls.length})
                  </Text>
                  <ScrollView className={styles.receiptScroll} scrollX>
                    <View className={styles.receiptList}>
                      {record.receiptUrls.map((url, idx) => (
                        <Image
                          key={idx}
                          className={styles.receiptImage}
                          src={url}
                          mode="aspectFill"
                          onClick={(e) => { e.stopPropagation?.(); handlePreviewImage(record); }}
                        />
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
              
              {record.status === 'pending' && (
                <View className={styles.reviewActions}>
                  <View
                    className={classnames(styles.reviewBtn, styles.reject)}
                    onClick={(e) => { e.stopPropagation?.(); handleRejectClick(record); }}
                  >
                    驳回
                  </View>
                  <View
                    className={classnames(styles.reviewBtn, styles.approve)}
                    onClick={(e) => { e.stopPropagation?.(); handleApprove(record); }}
                  >
                    通过
                  </View>
                </View>
              )}
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
            onClick={() => { setActiveTab('overview'); setSelectedIds([]); }}
          >
            数据概览
          </View>
          <View
            className={classnames(styles.adminTab, activeTab === 'review' && styles.active)}
            onClick={() => { setActiveTab('review'); setFilter('pending'); setSelectedIds([]); }}
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
            <Text className={styles.modalSub}>请填写驳回原因（用户将看到此信息）</Text>
            <View className={styles.textareaWrap}>
              <textarea
                className={styles.textarea}
                value={rejectReason}
                onInput={(e: any) => setRejectReason(e.target.value)}
                placeholder="请输入驳回原因"
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
