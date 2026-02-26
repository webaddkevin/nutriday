<template>
  <view class="nutrition-ring-container" :style="{ width: size + 'rpx', height: size + 'rpx' }">
    <!-- 背景圆环 -->
    <view class="ring-background" :style="backgroundStyle"></view>
    <!-- 进度圆环 -->
    <view class="ring-progress" :style="progressStyle"></view>
    <!-- 中心内容 -->
    <view class="ring-content">
      <slot></slot>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  percent?: number; // 0-100
  size?: number; // rpx
  strokeWidth?: number; // rpx
  color?: string;
  backgroundColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  percent: 0,
  size: 300,
  strokeWidth: 20,
  color: '#2ECC71',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
});

const backgroundStyle = computed(() => ({
  width: `${props.size}rpx`,
  height: `${props.size}rpx`,
  border: `${props.strokeWidth}rpx solid ${props.backgroundColor}`,
  borderRadius: '50%',
}));

const progressStyle = computed(() => {
  const rotation = (props.percent / 100) * 360;
  // 使用 conic-gradient 实现环形进度
  return {
    width: `${props.size}rpx`,
    height: `${props.size}rpx`,
    background: `conic-gradient(${props.color} 0deg, ${props.color} ${rotation}deg, transparent ${rotation}deg)`,
    borderRadius: '50%',
    WebkitMaskImage: `radial-gradient(transparent calc(${props.size / 2 - props.strokeWidth}rpx), black calc(${props.size / 2 - props.strokeWidth}rpx))`,
  };
});
</script>

<style lang="scss" scoped>
.nutrition-ring-container {
  position: relative;
  @include flex-center;
}

.ring-background {
  position: absolute;
  top: 0;
  left: 0;
  box-sizing: border-box;
}

.ring-progress {
  position: absolute;
  top: 0;
  left: 0;
  transition: background 0.3s ease;
}

.ring-content {
  z-index: 1;
  @include flex-center;
  flex-direction: column;
}
</style>
