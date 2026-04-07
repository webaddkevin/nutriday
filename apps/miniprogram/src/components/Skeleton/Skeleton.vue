<template>
  <view class="skeleton" :class="{ animate: animate }">
    <view v-if="type === 'card'" class="skeleton-card">
      <view class="skeleton-avatar"></view>
      <view class="skeleton-content">
        <view class="skeleton-title"></view>
        <view class="skeleton-text"></view>
      </view>
    </view>

    <view v-else-if="type === 'list'" class="skeleton-list">
      <view v-for="i in rows" :key="i" class="skeleton-item">
        <view class="skeleton-avatar"></view>
        <view class="skeleton-content">
          <view class="skeleton-title"></view>
          <view class="skeleton-text short"></view>
        </view>
      </view>
    </view>

    <view v-else-if="type === 'dashboard'" class="skeleton-dashboard">
      <!-- 热量环骨架 -->
      <view class="skeleton-ring">
        <view class="ring-circle"></view>
      </view>
      <view class="skeleton-stats">
        <view class="stat-item"></view>
        <view class="stat-item"></view>
      </view>
      <!-- 营养素骨架 -->
      <view class="skeleton-nutrients">
        <view v-for="i in 3" :key="i" class="nutrient-item">
          <view class="nutrient-header"></view>
          <view class="nutrient-bar"></view>
        </view>
      </view>
    </view>

    <view v-else-if="type === 'meal-grid'" class="skeleton-meal-grid">
      <view v-for="i in 4" :key="i" class="meal-card">
        <view class="meal-icon"></view>
        <view class="meal-title"></view>
        <view class="meal-cal"></view>
      </view>
    </view>

    <view v-else-if="type === 'text'" class="skeleton-text" :style="{ width: width }"></view>

    <view
      v-else-if="type === 'circle'"
      class="skeleton-circle"
      :style="{ width: size, height: size }"
    ></view>

    <view v-else class="skeleton-block" :style="{ width: width, height: height }"></view>
  </view>
</template>

<script setup lang="ts">
defineProps({
  type: {
    type: String,
    default: 'block',
    validator: (v: string) =>
      ['block', 'card', 'list', 'dashboard', 'meal-grid', 'text', 'circle'].includes(v),
  },
  rows: {
    type: Number,
    default: 3,
  },
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: '20px',
  },
  size: {
    type: String,
    default: '40px',
  },
  animate: {
    type: Boolean,
    default: true,
  },
});
</script>

<style lang="scss" scoped>
.skeleton {
  background: #f1f5f9;
  border-radius: 8rpx;
  overflow: hidden;

  &.animate {
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        transparent 0%,
        rgba(255, 255, 255, 0.4) 50%,
        transparent 100%
      );
      animation: shimmer 1.5s infinite;
    }
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.skeleton-card {
  display: flex;
  gap: 16rpx;
  padding: 24rpx;

  .skeleton-avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: #e2e8f0;
    flex-shrink: 0;
  }

  .skeleton-content {
    flex: 1;

    .skeleton-title {
      height: 32rpx;
      width: 60%;
      background: #e2e8f0;
      border-radius: 4rpx;
      margin-bottom: 12rpx;
    }

    .skeleton-text {
      height: 24rpx;
      width: 80%;
      background: #e2e8f0;
      border-radius: 4rpx;
    }
  }
}

.skeleton-list {
  .skeleton-item {
    display: flex;
    gap: 16rpx;
    padding: 20rpx 24rpx;
    border-bottom: 1rpx solid #f1f5f9;

    .skeleton-avatar {
      width: 64rpx;
      height: 64rpx;
      border-radius: 16rpx;
      background: #e2e8f0;
      flex-shrink: 0;
    }

    .skeleton-content {
      flex: 1;

      .skeleton-title {
        height: 28rpx;
        width: 50%;
        background: #e2e8f0;
        border-radius: 4rpx;
        margin-bottom: 8rpx;
      }

      .skeleton-text {
        height: 20rpx;
        width: 70%;
        background: #e2e8f0;
        border-radius: 4rpx;

        &.short {
          width: 40%;
        }
      }
    }
  }
}

.skeleton-dashboard {
  padding: 32rpx;

  .skeleton-ring {
    display: flex;
    justify-content: center;
    margin-bottom: 24rpx;

    .ring-circle {
      width: 180rpx;
      height: 180rpx;
      border-radius: 50%;
      background: #e2e8f0;
    }
  }

  .skeleton-stats {
    display: flex;
    justify-content: center;
    gap: 48rpx;
    margin-bottom: 24rpx;

    .stat-item {
      width: 120rpx;
      height: 60rpx;
      background: #e2e8f0;
      border-radius: 8rpx;
    }
  }

  .skeleton-nutrients {
    .nutrient-item {
      margin-bottom: 16rpx;

      .nutrient-header {
        height: 24rpx;
        width: 30%;
        background: #e2e8f0;
        border-radius: 4rpx;
        margin-bottom: 8rpx;
      }

      .nutrient-bar {
        height: 8rpx;
        width: 100%;
        background: #e2e8f0;
        border-radius: 4rpx;
      }
    }
  }
}

.skeleton-meal-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  padding: 4rpx;

  .meal-card {
    background: #fff;
    border-radius: 24rpx;
    padding: 24rpx;

    .meal-icon {
      width: 64rpx;
      height: 64rpx;
      background: #e2e8f0;
      border-radius: 16rpx;
      margin-bottom: 12rpx;
    }

    .meal-title {
      height: 28rpx;
      width: 50%;
      background: #e2e8f0;
      border-radius: 4rpx;
      margin-bottom: 8rpx;
    }

    .meal-cal {
      height: 20rpx;
      width: 40%;
      background: #e2e8f0;
      border-radius: 4rpx;
    }
  }
}

.skeleton-text {
  height: 24rpx;
  background: #e2e8f0;
  border-radius: 4rpx;
}

.skeleton-circle {
  border-radius: 50%;
  background: #e2e8f0;
}

.skeleton-block {
  background: #e2e8f0;
}
</style>
