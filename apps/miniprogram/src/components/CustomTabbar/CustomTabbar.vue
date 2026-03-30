<template>
  <view class="custom-tabbar" :style="{ paddingBottom: safeAreaBottom + 'px' }">
    <view
      v-for="item in tabs"
      :key="item.path"
      class="tab-item"
      :class="{ active: currentPath === item.path }"
      @tap="switchTab(item)"
    >
      <view class="tab-icon">
        <text>{{ currentPath === item.path ? item.activeIcon : item.icon }}</text>
      </view>
      <text class="tab-text">{{ item.text }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  currentPath: string;
}>();

const safeAreaBottom = computed(() => {
  const info = uni.getSystemInfoSync();
  return info.safeAreaInsets?.bottom || 0;
});

const tabs = [
  {
    path: '/pages/index/index',
    text: '首页',
    icon: '🏠',
    activeIcon: '🏠',
  },
  {
    path: '/pages/plan/plan',
    text: '计划',
    icon: '📅',
    activeIcon: '📅',
  },
  {
    path: '/pages/profile/profile',
    text: '我的',
    icon: '👤',
    activeIcon: '👤',
  },
];

const switchTab = (item: { path: string }) => {
  if (props.currentPath === item.path) return;
  uni.switchTab({
    url: item.path,
  });
};
</script>

<style scoped>
.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100rpx;
  background: #fff;
  display: flex;
  border-top: 1rpx solid #f0f0f0;
  z-index: 999;
  box-shadow: 0 -2rpx 20rpx rgba(0, 0, 0, 0.05);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
  transition: all 0.2s ease;
}

.tab-icon {
  font-size: 44rpx;
  line-height: 1;
  filter: grayscale(100%);
  opacity: 0.6;
  transition: all 0.2s ease;
}

.tab-item.active .tab-icon {
  filter: grayscale(0%);
  opacity: 1;
  transform: scale(1.1);
}

.tab-text {
  font-size: 22rpx;
  color: #95a5a6;
  transition: all 0.2s ease;
}

.tab-item.active .tab-text {
  color: #2ecc71;
  font-weight: 600;
}
</style>
