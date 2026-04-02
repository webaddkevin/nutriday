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
        <NutriIcon
          :name="item.icon"
          size="md"
          :color="currentPath === item.path ? '#00b171' : '#94a3b8'"
        />
      </view>
      <text class="tab-text">{{ item.text }}</text>
      <view v-if="currentPath === item.path" class="active-indicator"></view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import NutriIcon from '@/components/NutriIcon/NutriIcon.vue';

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
    icon: 'home',
  },
  {
    path: '/pages/plan/plan',
    text: '计划',
    icon: 'plan',
  },
  {
    path: '/pages/profile/profile',
    text: '我的',
    icon: 'user',
  },
];

const switchTab = (item: { path: string }) => {
  if (props.currentPath === item.path) return;
  uni.switchTab({
    url: item.path,
  });
};
</script>

<style lang="scss" scoped>
.custom-tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 110rpx;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  display: flex;
  border-top: 1rpx solid rgba(0, 0, 0, 0.05);
  z-index: 999;
  box-shadow: 0 -4rpx 30rpx rgba(0, 0, 0, 0.03);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
  transition: all 0.25s ease;
  position: relative;

  .tab-icon {
    transition: transform 0.25s ease;
  }

  .tab-text {
    font-size: 22rpx;
    color: #94a3b8;
    font-weight: 500;
    transition: all 0.25s ease;
  }

  .active-indicator {
    position: absolute;
    top: 8rpx;
    width: 8rpx;
    height: 8rpx;
    background: #00b171;
    border-radius: 50%;
    animation: fadeIn 0.3s ease;
  }

  &.active {
    .tab-icon {
      transform: scale(1.1) translateY(-4rpx);
    }

    .tab-text {
      color: #00b171;
      font-weight: 600;
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
