<template>
  <view class="container">
    <!-- 顶部装饰背景 -->
    <view class="bg-decoration">
      <view class="bg-gradient"></view>
      <view class="bg-pattern"></view>
    </view>

    <!-- User Info Header -->
    <view class="header">
      <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <view class="avatar-wrapper">
          <image v-if="avatarUrl" class="avatar-img" :src="avatarUrl" mode="aspectFill" />
          <view v-else class="avatar-placeholder">
            <NutriIcon name="user" size="xl" color="#cbd5e1" />
          </view>
          <view class="avatar-edit-badge">
            <uni-icons type="camera-filled" size="16" color="#fff"></uni-icons>
          </view>
        </view>
      </button>

      <view class="user-details">
        <view v-if="!isEditingNickname" class="nickname-display">
          <text class="user-title">{{ nickname || '微信用户' }}</text>
          <view class="edit-btn" @tap="isEditingNickname = true">
            <uni-icons type="compose" size="14" color="#fff"></uni-icons>
          </view>
        </view>

        <view v-else class="nickname-edit">
          <input
            type="nickname"
            class="nickname-input"
            :value="nickname"
            :focus="isEditingNickname"
            placeholder="输入昵称"
            placeholder-class="nickname-placeholder"
            @change="onNicknameChange"
            @blur="onNicknameBlur"
            @confirm="onNicknameBlur"
          />
        </view>

        <view class="user-stats" @tap="goToEditBasicInfo">
          <view class="stat-item">
            <text class="stat-value">{{ userProfile?.age || '--' }}</text>
            <text class="stat-label">岁</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">{{ userProfile?.height || '--' }}</text>
            <text class="stat-label">cm</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-value">{{ userProfile?.weight || '--' }}</text>
            <text class="stat-label">kg</text>
          </view>
          <view class="edit-hint">
            <uni-icons type="right" size="14" color="rgba(255,255,255,0.6)"></uni-icons>
          </view>
        </view>
      </view>
    </view>

    <!-- 快捷统计卡片 -->
    <view class="quick-stats">
      <view class="quick-stat-card" @tap="goToStats">
        <view class="stat-icon-wrap bg-purple">
          <NutriIcon name="stats" size="md" color="#9b59b6" />
        </view>
        <view class="stat-info">
          <text class="stat-title">数据统计</text>
          <text class="stat-desc">查看详细报告</text>
        </view>
        <uni-icons type="right" size="16" color="#cbd5e1"></uni-icons>
      </view>
    </view>

    <!-- Menu Cards -->
    <view class="menu-section">
      <view class="menu-group">
        <view class="menu-item" @tap="goToWeight">
          <view class="menu-icon-wrap bg-teal">
            <NutriIcon name="weight" size="md" color="#1abc9c" />
          </view>
          <view class="menu-content">
            <text class="menu-title">体重记录</text>
            <text class="menu-subtitle">追踪体重变化趋势</text>
          </view>
          <view class="menu-arrow">
            <uni-icons type="right" size="16" color="#cbd5e1"></uni-icons>
          </view>
        </view>

        <view class="menu-item" @tap="goToGoal">
          <view class="menu-icon-wrap bg-blue">
            <NutriIcon name="target" size="md" color="#3498db" />
          </view>
          <view class="menu-content">
            <text class="menu-title">个人目标</text>
            <text class="menu-subtitle">减脂 / 增肌 / 保持健康</text>
          </view>
          <view class="menu-arrow">
            <uni-icons type="right" size="16" color="#cbd5e1"></uni-icons>
          </view>
        </view>

        <view class="menu-item" @tap="goToHealth">
          <view class="menu-icon-wrap bg-red">
            <NutriIcon name="health" size="md" color="#ef4444" />
          </view>
          <view class="menu-content">
            <text class="menu-title">健康档案</text>
            <text class="menu-subtitle">过敏原 / 身体情况</text>
          </view>
          <view class="menu-arrow">
            <uni-icons type="right" size="16" color="#cbd5e1"></uni-icons>
          </view>
        </view>
      </view>

      <view class="menu-group">
        <view class="menu-item" @tap="goToWater">
          <view class="menu-icon-wrap bg-cyan">
            <NutriIcon name="water" size="md" color="#00bcd4" />
          </view>
          <view class="menu-content">
            <text class="menu-title">饮水记录</text>
            <text class="menu-subtitle">每日饮水量追踪</text>
          </view>
          <view class="menu-arrow">
            <uni-icons type="right" size="16" color="#cbd5e1"></uni-icons>
          </view>
        </view>

        <view class="menu-item" @tap="goToFavorite">
          <view class="menu-icon-wrap bg-yellow">
            <NutriIcon name="star" size="md" color="#f59e0b" />
          </view>
          <view class="menu-content">
            <text class="menu-title">食物收藏</text>
            <text class="menu-subtitle">常吃食物快速添加</text>
          </view>
          <view class="menu-arrow">
            <uni-icons type="right" size="16" color="#cbd5e1"></uni-icons>
          </view>
        </view>

        <view class="menu-item" @tap="goToStats">
          <view class="menu-icon-wrap bg-orange">
            <NutriIcon name="trend" size="md" color="#e67e22" />
          </view>
          <view class="menu-content">
            <text class="menu-title">历史分析报告</text>
            <text class="menu-subtitle">饮食趋势与身体变化</text>
          </view>
          <view class="menu-arrow">
            <uni-icons type="right" size="16" color="#cbd5e1"></uni-icons>
          </view>
        </view>
      </view>
    </view>

    <!-- App Info -->
    <view class="app-info">
      <text class="app-version">Nutriday v1.0.0</text>
      <text class="app-slogan">让健康饮食成为习惯</text>
    </view>

    <!-- 自定义 Tabbar -->
    <CustomTabbar current-path="/pages/profile/profile" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import CustomTabbar from '@/components/CustomTabbar/CustomTabbar.vue';
import NutriIcon from '@/components/NutriIcon/NutriIcon.vue';
import type { UserProfile } from '@nutriday/shared-types';
import { getProfile, saveProfile } from '@/api/profile-api';

const userProfile = ref<UserProfile | null>(null);
const loading = ref(false);
const avatarUrl = ref('');
const nickname = ref('');

onShow(async () => {
  loading.value = true;
  try {
    const data = await getProfile();
    if (data) {
      userProfile.value = data;
      avatarUrl.value = data.avatarUrl || '';
      nickname.value = data.nickname || '';
      uni.setStorageSync('user_profile', data);
    }
  } catch (e) {
    console.warn('从服务器获取用户画像失败，使用本地缓存：', e);
    const cached = uni.getStorageSync('user_profile');
    if (cached) {
      userProfile.value = cached;
      avatarUrl.value = cached.avatarUrl || '';
      nickname.value = cached.nickname || '';
    }
  } finally {
    loading.value = false;
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onChooseAvatar = (e: any) => {
  const url = e.detail.avatarUrl;
  avatarUrl.value = url;
  saveUserInfo({ avatarUrl: url });
};

const isEditingNickname = ref(false);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onNicknameChange = (e: any) => {
  const value = e.detail.value;
  if (value && value !== nickname.value) {
    nickname.value = value;
    saveUserInfo({ nickname: value });
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onNicknameBlur = (e: any) => {
  onNicknameChange(e);
  setTimeout(() => {
    isEditingNickname.value = false;
  }, 100);
};

const goToEditBasicInfo = () => {
  uni.navigateTo({
    url: '/pages/onboarding/onboarding',
  });
};

const goToStats = () => {
  uni.navigateTo({
    url: '/pages/stats/stats',
  });
};

const goToWeight = () => {
  uni.navigateTo({
    url: '/pages/weight/weight',
  });
};

const goToGoal = () => {
  uni.navigateTo({
    url: '/pages/goal/goal',
  });
};

const goToHealth = () => {
  uni.navigateTo({
    url: '/pages/health/health',
  });
};

const goToWater = () => {
  uni.navigateTo({
    url: '/pages/water/water',
  });
};

const goToFavorite = () => {
  uni.navigateTo({
    url: '/pages/favorite/favorite',
  });
};

const saveUserInfo = async (updates: { nickname?: string; avatarUrl?: string }) => {
  const cached = uni.getStorageSync('user_profile') || {};
  uni.setStorageSync('user_profile', { ...cached, ...updates });

  if (!userProfile.value) return;

  try {
    await saveProfile({
      gender: userProfile.value.gender,
      age: userProfile.value.age,
      height: userProfile.value.height,
      weight: userProfile.value.weight,
      goal: userProfile.value.goal,
      tags: userProfile.value.tags as string[],
      activityLevel: userProfile.value.activityLevel,
      bmr: userProfile.value.bmr,
      tdee: userProfile.value.tdee,
      nickname: updates.nickname ?? nickname.value,
      avatarUrl: updates.avatarUrl ?? avatarUrl.value,
    });

    userProfile.value = { ...userProfile.value, ...updates };
    uni.setStorageSync('user_profile', userProfile.value);
    uni.showToast({ title: '保存成功', icon: 'success' });
  } catch (e) {
    console.warn('保存用户信息到服务器失败：', e);
  }
};
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 180rpx;
  color: $uni-text-color;
}

// 背景装饰
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 400rpx;
  pointer-events: none;

  .bg-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, #00b171 0%, #009b63 100%);
    border-radius: 0 0 60rpx 60rpx;
  }

  .bg-pattern {
    position: absolute;
    inset: 0;
    background-image:
      radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 40%);
  }
}

.header {
  position: relative;
  z-index: 1;
  padding: 60rpx 40rpx 40rpx;
  display: flex;
  align-items: center;

  .avatar-btn {
    padding: 0;
    margin: 0 32rpx 0 0;
    background: none;
    border: none;
    line-height: normal;
    width: auto;

    &::after {
      border: none;
    }
  }

  .avatar-wrapper {
    position: relative;
    width: 140rpx;
    height: 140rpx;
    border-radius: 40rpx;
    background: rgba(255, 255, 255, 0.2);
    border: 4rpx solid rgba(255, 255, 255, 0.3);
    overflow: visible;

    .avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 36rpx;
      display: block;
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      border-radius: 36rpx;
      @include flex-center;
      background: rgba(255, 255, 255, 0.1);
    }

    .avatar-edit-badge {
      position: absolute;
      bottom: -8rpx;
      right: -8rpx;
      width: 48rpx;
      height: 48rpx;
      background: linear-gradient(135deg, #00b171 0%, #00d387 100%);
      border-radius: 50%;
      @include flex-center;
      box-shadow: 0 4rpx 12rpx rgba(0, 177, 113, 0.3);
      border: 3rpx solid #fff;
    }
  }

  .user-details {
    flex: 1;
    overflow: hidden;

    .nickname-display {
      display: flex;
      align-items: center;
      gap: 12rpx;
      margin-bottom: 16rpx;

      .user-title {
        font-size: 40rpx;
        font-weight: 700;
        color: #fff;
        max-width: 320rpx;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .edit-btn {
        width: 48rpx;
        height: 48rpx;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        @include flex-center;
      }
    }

    .nickname-edit {
      margin-bottom: 16rpx;

      .nickname-input {
        font-size: 36rpx;
        font-weight: 700;
        height: 60rpx;
        line-height: 60rpx;
        color: #fff;
        border-bottom: 2rpx solid rgba(255, 255, 255, 0.5);
        padding: 0 10rpx;
        background: transparent;
      }

      .nickname-placeholder {
        color: rgba(255, 255, 255, 0.5);
        font-weight: 400;
      }
    }

    .user-stats {
      display: flex;
      align-items: center;
      gap: 8rpx;
      background: rgba(255, 255, 255, 0.15);
      padding: 12rpx 20rpx;
      border-radius: 20rpx;
      width: fit-content;

      .stat-item {
        display: flex;
        align-items: baseline;
        gap: 4rpx;

        .stat-value {
          font-size: 32rpx;
          font-weight: 600;
          color: #fff;
        }

        .stat-label {
          font-size: 22rpx;
          color: rgba(255, 255, 255, 0.7);
        }
      }

      .stat-divider {
        width: 1rpx;
        height: 28rpx;
        background: rgba(255, 255, 255, 0.3);
        margin: 0 16rpx;
      }

      .edit-hint {
        margin-left: 8rpx;
      }
    }
  }
}

// 快捷统计
.quick-stats {
  padding: 0 32rpx;
  margin-bottom: 24rpx;
  position: relative;
  z-index: 1;

  .quick-stat-card {
    background: #fff;
    border-radius: 24rpx;
    padding: 28rpx;
    display: flex;
    align-items: center;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);

    .stat-icon-wrap {
      width: 72rpx;
      height: 72rpx;
      border-radius: 20rpx;
      @include flex-center;
      margin-right: 24rpx;

      &.bg-purple {
        background: rgba(155, 89, 182, 0.1);
      }
    }

    .stat-info {
      flex: 1;

      .stat-title {
        font-size: 30rpx;
        font-weight: 600;
        color: #1e293b;
        display: block;
      }

      .stat-desc {
        font-size: 24rpx;
        color: #94a3b8;
        margin-top: 4rpx;
      }
    }
  }
}

// 菜单区块
.menu-section {
  padding: 0 32rpx;
  position: relative;
  z-index: 1;

  .menu-group {
    background: #fff;
    border-radius: 24rpx;
    overflow: hidden;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);

    .menu-item {
      display: flex;
      align-items: center;
      padding: 28rpx;
      border-bottom: 1rpx solid #f1f5f9;
      transition: background 0.2s ease;

      &:last-child {
        border-bottom: none;
      }

      &:active {
        background: #f8fafc;
      }

      .menu-icon-wrap {
        width: 72rpx;
        height: 72rpx;
        border-radius: 20rpx;
        @include flex-center;
        margin-right: 24rpx;

        &.bg-blue {
          background: rgba(52, 152, 219, 0.1);
        }
        &.bg-teal {
          background: rgba(26, 188, 156, 0.1);
        }
        &.bg-red {
          background: rgba(239, 68, 68, 0.1);
        }
        &.bg-cyan {
          background: rgba(0, 188, 212, 0.1);
        }
        &.bg-yellow {
          background: rgba(245, 158, 11, 0.1);
        }
        &.bg-orange {
          background: rgba(230, 126, 34, 0.1);
        }
      }

      .menu-content {
        flex: 1;

        .menu-title {
          display: block;
          font-size: 30rpx;
          font-weight: 500;
          color: #1e293b;
          margin-bottom: 4rpx;
        }

        .menu-subtitle {
          font-size: 24rpx;
          color: #94a3b8;
        }
      }

      .menu-arrow {
        opacity: 0.6;
      }
    }
  }
}

// App 信息
.app-info {
  text-align: center;
  padding: 40rpx;

  .app-version {
    font-size: 24rpx;
    color: #94a3b8;
    display: block;
  }

  .app-slogan {
    font-size: 22rpx;
    color: #cbd5e1;
    margin-top: 8rpx;
  }
}
</style>
