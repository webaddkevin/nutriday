<template>
  <view class="container">
    <!-- User Info Header -->
    <view class="header shadow-glass">
      <view class="avatar-holder">
        <text class="avatar-text">{{ userProfile?.gender === 'male' ? '男' : '女' }}</text>
      </view>
      <view class="user-details">
        <text class="user-title"
          >{{ userProfile?.name || '用户'
          }}{{ userProfile?.gender === 'male' ? '先生' : '女士' }}</text
        >
        <text class="user-desc"
          >{{ userProfile?.age || '--' }}岁 | {{ userProfile?.height || '--' }}cm |
          {{ userProfile?.weight || '--' }}kg</text
        >
      </view>
      <view class="edit-btn">编辑</view>
    </view>

    <!-- Menu Cards -->
    <view class="menu-list">
      <!-- Personal Goals -->
      <view class="menu-item shadow-glass">
        <view class="menu-icon bg-blue">🎯</view>
        <view class="menu-content">
          <text class="menu-title">个人目标</text>
          <text class="menu-subtitle">减脂 / 增肌 / 保持健康</text>
        </view>
        <view class="menu-arrow">
          <uni-icons type="right" size="16" color="rgba(255, 255, 255, 0.3)"></uni-icons>
        </view>
      </view>

      <!-- Health Profile -->
      <view class="menu-item shadow-glass">
        <view class="menu-icon bg-green">📋</view>
        <view class="menu-content">
          <text class="menu-title">健康档案</text>
          <text class="menu-subtitle">过敏原 / 身体情况信息</text>
        </view>
        <view class="menu-arrow">
          <uni-icons type="right" size="16" color="rgba(255, 255, 255, 0.3)"></uni-icons>
        </view>
      </view>

      <!-- Historical Reports -->
      <view class="menu-item shadow-glass">
        <view class="menu-icon bg-orange">📊</view>
        <view class="menu-content">
          <text class="menu-title">历史分析报告</text>
          <text class="menu-subtitle">饮食趋势与身体变化</text>
        </view>
        <view class="menu-arrow">
          <uni-icons type="right" size="16" color="rgba(255, 255, 255, 0.3)"></uni-icons>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import type { UserProfile } from '@nutriday/shared-types';

const userProfile = ref<UserProfile | null>(null);

onShow(() => {
  const profile = uni.getStorageSync('user_profile');
  if (profile) {
    userProfile.value = profile;
  }
});
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: #000;
  padding: 40rpx;
  color: #fff;
}

.shadow-glass {
  @include glass-morphism;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.header {
  border-radius: 40rpx;
  padding: 40rpx;
  display: flex;
  align-items: center;
  margin-bottom: 60rpx;

  .avatar-holder {
    width: 120rpx;
    height: 120rpx;
    border-radius: 60rpx;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02));
    border: 1px solid rgba(255, 255, 255, 0.1);
    @include flex-center;
    margin-right: 30rpx;

    .avatar-text {
      font-size: 50rpx;
      font-weight: 700;
      color: #fff;
    }
  }

  .user-details {
    flex: 1;

    .user-title {
      display: block;
      font-size: 36rpx;
      font-weight: 600;
      margin-bottom: 10rpx;
    }

    .user-desc {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.5);
    }
  }

  .edit-btn {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.6);
    padding: 10rpx 20rpx;
    border-radius: 30rpx;
    background: rgba(255, 255, 255, 0.05);
  }
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.menu-item {
  border-radius: 30rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;

  .menu-icon {
    width: 90rpx;
    height: 90rpx;
    border-radius: 25rpx;
    @include flex-center;
    font-size: 40rpx;
    margin-right: 30rpx;

    &.bg-blue {
      background: rgba(52, 152, 219, 0.1);
      color: #3498db;
    }
    &.bg-green {
      background: rgba(46, 204, 113, 0.1);
      color: #2ecc71;
    }
    &.bg-orange {
      background: rgba(230, 126, 34, 0.1);
      color: #e67e22;
    }
  }

  .menu-content {
    flex: 1;

    .menu-title {
      display: block;
      font-size: 32rpx;
      font-weight: 500;
      margin-bottom: 8rpx;
    }

    .menu-subtitle {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.4);
    }
  }

  .menu-arrow {
    font-size: 32rpx;
    color: rgba(255, 255, 255, 0.3);
  }
}
</style>
