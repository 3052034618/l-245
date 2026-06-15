import React, { useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store/useStore';
import { getTransportOption } from '@/utils/carbon';

const MakeupDetailPage: React.FC = () => {
  const router = useRouter();
  const { commuteRecords, reviewMakeup, user } = useAppStore();
  const recordId = router.params.id;
  const source = router.params.source || '';
  
  const record = useMemo(() => {
    return commuteRecords.find(r => r.id === recordId) || null;
  }, [commuteRecords, recordId]);
  
  const transport = useMemo(() => {
    if (!record) return null;
    return getTransportOption(record.type);
  }, [record]);
  
  const statusConfig = useMemo(() => {
    if (!record || !record.isMakeup) {
      return { status: 'normal', icon: '✅', text: '正常打卡', desc: '该记录为正常打卡记录' };
    }
    switch (record.status) {
      case 'pending':
        return { status: 'pending', icon: '⏳', text: '待审核', desc: '补录申请正在等待管理员审核' };
      case 'approved':
        return { status: 'approved', icon: '✅', text: '已通过', desc: `审核通过，积分已到账 +${record.points}` };
      case 'rejected':
        return { status: 'rejected', icon: '❌', text: '已驳回', desc: '补录申请未通过审核' };
      default:
        return { status: 'normal', icon: '✅', text: '正常', desc: '' };
    }
  }, [record]);
  
  const handlePreviewImage = (url: string) => {
    if (record?.receiptUrls) {
      Taro.previewImage({
        current: url,
        urls: record.receiptUrls
      });
    }
  };
  
  const handleApprove = () => {
    if (!record) return;
    Taro.showModal({
      title: '审核通过',
      content: `确定通过该补录申请？用户将获得 ${record.points} 积分，减排 ${record.carbonSaved.toFixed(2)}kg。`,
      confirmText: '通过',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          reviewMakeup(record.id, true);
          Taro.showToast({ title: '已通过', icon: 'success' });
          console.log('[MakeupDetail] 审核通过', record.id);
        }
      }
    });
  };
  
  const handleReject = () => {
    if (!record) return;
    Taro.showModal({
      title: '驳回申请',
      content: '确定驳回该补录申请吗？',
      confirmText: '驳回',
      cancelText: '取消',
      confirmColor: '#F53F3F',
      success: (res) => {
        if (res.confirm) {
          Taro.showModal({
            title: '填写驳回原因',
            content: '请填写驳回原因（用户将看到此信息）：',
            editable: true,
            placeholderText: '请输入驳回原因',
            success: (reasonRes) => {
              if (reasonRes.confirm) {
                const note = (reasonRes as any).content || '资料不全或不符合要求';
                reviewMakeup(record.id, false, note);
                Taro.showToast({ title: '已驳回', icon: 'none' });
                console.log('[MakeupDetail] 审核驳回', record.id, note);
              }
            }
          });
        }
      }
    });
  };
  
  if (!record) {
    return (
      <View className={styles.page}>
        <View style={{ padding: '100rpx 0', textAlign: 'center' }}>
          <Text style={{ color: '#86909C' }}>记录不存在</Text>
        </View>
      </View>
    );
  }
  
  const showAdminActions = user.isAdmin && record.isMakeup && record.status === 'pending';
  const hasReceipts = record.receiptUrls && record.receiptUrls.length > 0;
  
  return (
    <View className={styles.page}>
      <ScrollView scrollY style={{ height: '100%' }}>
        <View className={classnames(styles.statusCard, styles[statusConfig.status])}>
          <Text className={styles.statusIcon}>{statusConfig.icon}</Text>
          <Text className={styles.statusText}>{statusConfig.text}</Text>
          <Text className={styles.statusDesc}>{statusConfig.desc}</Text>
        </View>
        
        <View className={styles.infoCard}>
          <Text className={styles.cardTitle}>📋 补录信息</Text>
          <View className={styles.infoList}>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>补录日期</Text>
              <Text className={styles.infoValue}>{record.date}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>通勤方向</Text>
              <Text className={styles.infoValue}>{record.direction === 'go' ? '上班' : '下班'}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>通勤时间</Text>
              <Text className={styles.infoValue}>{record.time}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>交通方式</Text>
              <Text className={styles.infoValue}>
                {transport?.icon} {transport?.name}
              </Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>通勤里程</Text>
              <Text className={styles.infoValue}>{record.distance} 公里</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>预计积分</Text>
              <Text className={classnames(styles.infoValue, styles.pointsValue)}>
                {record.isMakeup && record.status === 'pending' ? '待审核后到账' : `+${record.points} 分`}
              </Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>预计减排</Text>
              <Text className={classnames(styles.infoValue, styles.carbonValue)}>
                {record.isMakeup && record.status === 'pending' ? '待审核后生效' : `-${record.carbonSaved.toFixed(2)} kg`}
              </Text>
            </View>
          </View>
          
          {record.status === 'rejected' && record.reviewNote && (
            <View className={styles.rejectCard}>
              <Text className={styles.rejectTitle}>
                ❌ 驳回原因
              </Text>
              <Text className={styles.rejectContent}>{record.reviewNote}</Text>
            </View>
          )}
          
          {record.status === 'approved' && record.reviewNote && (
            <View className={styles.approveCard}>
              <Text className={styles.approveTitle}>
                ✅ 审核备注
              </Text>
              <Text className={styles.approveContent}>{record.reviewNote}</Text>
            </View>
          )}
          
          <View className={styles.receiptSection}>
            <Text className={styles.receiptLabel}>上传凭证 ({hasReceipts ? record.receiptUrls!.length : 0}/3)</Text>
            {hasReceipts ? (
              <View className={styles.receiptGrid}>
                {record.receiptUrls!.map((url, idx) => (
                  <Image
                    key={idx}
                    className={styles.receiptImage}
                    src={url}
                    mode="aspectFill"
                    onClick={() => handlePreviewImage(url)}
                  />
                ))}
              </View>
            ) : (
              <View className={styles.receiptEmpty}>无凭证图片</View>
            )}
          </View>
          
          <View className={styles.timeInfo}>
            <Text>提交时间：{record.submitTime || '-'}</Text>
            {record.reviewTime && (
              <Text>审核时间：{record.reviewTime}</Text>
            )}
            {record.reviewerName && (
              <Text>审核人：{record.reviewerName}</Text>
            )}
          </View>
        </View>
      </ScrollView>
      
      {showAdminActions && (
        <View className={styles.bottomBar}>
          <View className={classnames(styles.bottomBtn, styles.reject)} onClick={handleReject}>
            驳回
          </View>
          <View className={classnames(styles.bottomBtn, styles.approve)} onClick={handleApprove}>
            通过
          </View>
        </View>
      )}
    </View>
  );
};

export default MakeupDetailPage;
