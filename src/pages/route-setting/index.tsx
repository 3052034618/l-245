import React, { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classnames from 'classnames';
import { useAppStore } from '@/store/useStore';
import type { RouteInfo } from '@/types';

const RouteSettingPage: React.FC = () => {
  const { routes, setDefaultRoute, removeRoute, addRoute } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editRoute, setEditRoute] = useState<RouteInfo | null>(null);
  const [name, setName] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [distance, setDistance] = useState('');
  
  const handleSetDefault = (id: string) => {
    setDefaultRoute(id);
    Taro.showToast({ title: '已设为默认', icon: 'success' });
    console.log('[RouteSetting] 设置默认路线', id);
  };
  
  const handleEdit = (route: RouteInfo) => {
    setEditRoute(route);
    setName(route.name);
    setStartLocation(route.startLocation);
    setEndLocation(route.endLocation);
    setDistance(route.distance.toString());
    setShowModal(true);
  };
  
  const handleDelete = (id: string) => {
    Taro.showModal({
      title: '删除路线',
      content: '确定要删除这条路线吗？',
      confirmText: '删除',
      cancelText: '取消',
      confirmColor: '#F53F3F',
      success: (res) => {
        if (res.confirm) {
          removeRoute(id);
          Taro.showToast({ title: '删除成功', icon: 'success' });
          console.log('[RouteSetting] 删除路线', id);
        }
      }
    });
  };
  
  const handleAdd = () => {
    setEditRoute(null);
    setName('');
    setStartLocation('');
    setEndLocation('');
    setDistance('');
    setShowModal(true);
  };
  
  const handleSave = () => {
    if (!name || !startLocation || !endLocation || !distance) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }
    
    if (editRoute) {
      Taro.showToast({ title: '修改成功', icon: 'success' });
      console.log('[RouteSetting] 修改路线', editRoute.id);
    } else {
      const newRoute: RouteInfo = {
        id: `route-${Date.now()}`,
        name,
        startLocation,
        endLocation,
        distance: parseFloat(distance) || 0,
        isDefault: false
      };
      addRoute(newRoute);
      Taro.showToast({ title: '添加成功', icon: 'success' });
      console.log('[RouteSetting] 添加路线', newRoute);
    }
    
    setShowModal(false);
  };
  
  return (
    <View className={styles.page}>
      {routes.map(route => (
        <View
          key={route.id}
          className={classnames(styles.routeCard, route.isDefault && styles.default)}
        >
          {route.isDefault && <Text className={styles.defaultBadge}>默认</Text>}
          
          <View className={styles.routeHeader}>
            <Text className={styles.routeName}>{route.name}</Text>
            <Text className={styles.routeDistance}>{route.distance} km</Text>
          </View>
          
          <View className={styles.routePath}>
            <View className={styles.routePoint}>
              <Text className={styles.pointLabel}>起点</Text>
              <Text className={styles.pointAddress}>{route.startLocation}</Text>
            </View>
            <Text className={styles.routeArrow}>→</Text>
            <View className={styles.routePoint}>
              <Text className={styles.pointLabel}>终点</Text>
              <Text className={styles.pointAddress}>{route.endLocation}</Text>
            </View>
          </View>
          
          <View className={styles.routeActions}>
            <View
              className={classnames(styles.actionBtn, !route.isDefault && styles.primary)}
              onClick={() => !route.isDefault && handleSetDefault(route.id)}
            >
              {route.isDefault ? '默认路线' : '设为默认'}
            </View>
            <View className={styles.divider} />
            <View
              className={classnames(styles.actionBtn, styles.primary)}
              onClick={() => handleEdit(route)}
            >
              编辑
            </View>
            <View className={styles.divider} />
            <View
              className={classnames(styles.actionBtn, styles.danger)}
              onClick={() => handleDelete(route.id)}
            >
              删除
            </View>
          </View>
        </View>
      ))}
      
      <View className={styles.addBtn} onClick={handleAdd}>
        <Text>+ 添加新路线</Text>
      </View>
      
      {showModal && (
        <View className={styles.modalMask} onClick={() => setShowModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation?.()}>
            <Text className={styles.modalTitle}>
              {editRoute ? '编辑路线' : '添加路线'}
            </Text>
            
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>路线名称</Text>
              <Input
                className={styles.formInput}
                value={name}
                onInput={(e) => setName(e.detail.value)}
                placeholder="请输入路线名称"
              />
            </View>
            
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>起点</Text>
              <Input
                className={styles.formInput}
                value={startLocation}
                onInput={(e) => setStartLocation(e.detail.value)}
                placeholder="请输入起点"
              />
            </View>
            
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>终点</Text>
              <Input
                className={styles.formInput}
                value={endLocation}
                onInput={(e) => setEndLocation(e.detail.value)}
                placeholder="请输入终点"
              />
            </View>
            
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>里程</Text>
              <Input
                className={styles.formInput}
                type="digit"
                value={distance}
                onInput={(e) => setDistance(e.detail.value)}
                placeholder="请输入里程(公里)"
              />
            </View>
            
            <View className={styles.modalActions}>
              <View
                className={classnames(styles.modalBtn, styles.cancel)}
                onClick={() => setShowModal(false)}
              >
                取消
              </View>
              <View
                className={classnames(styles.modalBtn, styles.confirm)}
                onClick={handleSave}
              >
                保存
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default RouteSettingPage;
