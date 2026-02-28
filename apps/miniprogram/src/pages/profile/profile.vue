<template>
  <view class="container">
    <!-- User Info Header -->
    <view class="header shadow-glass">
      <!-- 头像：使用 chooseAvatar 按钮获取微信头像 -->
      <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <view class="avatar-wrapper">
          <image v-if="avatarUrl" class="avatar-img" :src="avatarUrl" mode="aspectFill" />
          <view v-else class="avatar-placeholder">
            <uni-icons type="contact" size="50" color="rgba(0,0,0,0.15)"></uni-icons>
          </view>
          <!-- 底部悬浮相机角标 -->
          <view class="avatar-edit-badge">
            <uni-icons type="camera-filled" size="18" color="#666"></uni-icons>
          </view>
        </view>
      </button>

      <view class="user-details">
        <!-- 昵称：展示模式 -->
        <view v-if="!isEditingNickname" class="nickname-display">
          <text class="user-title">{{ nickname || '微信用户' }}</text>
          <view class="edit-btn" @tap="isEditingNickname = true">
            <uni-icons type="compose" size="14" color="#666"></uni-icons>
            <text class="edit-text">更换昵称</text>
          </view>
        </view>

        <!-- 昵称：编辑模式 -->
        <view v-else class="nickname-edit">
          <input
            type="nickname"
            class="nickname-input"
            :value="nickname"
            :focus="isEditingNickname"
            placeholder="获取微信昵称"
            placeholder-class="nickname-placeholder"
            @change="onNicknameChange"
            @blur="onNicknameBlur"
            @confirm="onNicknameBlur"
          />
        </view>

        <!-- 基础信息展示：点击跳转编辑 -->
        <view class="user-desc-wrapper" @tap="goToEditBasicInfo">
          <text class="user-desc"
            >{{ userProfile?.age || '--' }}岁 | {{ userProfile?.height || '--' }}cm |
            {{ userProfile?.weight || '--' }}kg</text
          >
          <uni-icons type="right" size="12" color="#999"></uni-icons>
        </view>
      </view>
    </view>

    <!-- Menu Cards -->
    <view class="menu-list">
      <view class="menu-item shadow-glass">
        <view class="menu-icon bg-blue">🎯</view>
        <view class="menu-content">
          <text class="menu-title">个人目标</text>
          <text class="menu-subtitle">减脂 / 增肌 / 保持健康</text>
        </view>
        <view class="menu-arrow">
          <uni-icons type="right" size="16" color="rgba(0, 0, 0, 0.2)"></uni-icons>
        </view>
      </view>

      <view class="menu-item shadow-glass">
        <view class="menu-icon bg-green">📋</view>
        <view class="menu-content">
          <text class="menu-title">健康档案</text>
          <text class="menu-subtitle">过敏原 / 身体情况信息</text>
        </view>
        <view class="menu-arrow">
          <uni-icons type="right" size="16" color="rgba(0, 0, 0, 0.2)"></uni-icons>
        </view>
      </view>

      <view class="menu-item shadow-glass">
        <view class="menu-icon bg-orange">📊</view>
        <view class="menu-content">
          <text class="menu-title">历史分析报告</text>
          <text class="menu-subtitle">饮食趋势与身体变化</text>
        </view>
        <view class="menu-arrow">
          <uni-icons type="right" size="16" color="rgba(0, 0, 0, 0.2)"></uni-icons>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import type { UserProfile } from '@nutriday/shared-types';
import { getProfile, saveProfile } from '@/api/profile-api';

const userProfile = ref<UserProfile | null>(null);
const loading = ref(false);
const avatarUrl = ref('');
const nickname = ref('');

onShow(async () => {
  loading.value = true;
  try {
    const data = await getProfile(1);
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

/**
 * 选择头像回调（微信 chooseAvatar 事件）
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onChooseAvatar = (e: any) => {
  const url = e.detail.avatarUrl;
  console.log('获取头像：', url);
  avatarUrl.value = url;
  saveUserInfo({ avatarUrl: url });
};

const isEditingNickname = ref(false);

/**
 * 昵称变更回调（支持微信自动填充和手动输入）
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onNicknameChange = (e: any) => {
  const value = e.detail.value;
  console.log('昵称事件触发：', value);
  if (value && value !== nickname.value) {
    console.log('设置昵称：', value);
    nickname.value = value;
    saveUserInfo({ nickname: value });
  }
};

/**
 * 昵称输入失焦回调
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onNicknameBlur = (e: any) => {
  onNicknameChange(e);
  // 延迟关闭编辑态，避免点击完成按钮引发事件冲突
  setTimeout(() => {
    isEditingNickname.value = false;
  }, 100);
};

/**
 * 跳转到基本信息编辑页（使用 onboarding 页面）
 */
const goToEditBasicInfo = () => {
  uni.navigateTo({
    url: '/pages/onboarding/onboarding',
  });
};

/**
 * 保存用户信息到后端
 */
const saveUserInfo = async (updates: { nickname?: string; avatarUrl?: string }) => {
  // 先更新本地缓存
  const cached = uni.getStorageSync('user_profile') || {};
  uni.setStorageSync('user_profile', { ...cached, ...updates });

  if (!userProfile.value) {
    console.log('用户画像未加载，仅保存到本地');
    return;
  }

  try {
    await saveProfile({
      userId: 1,
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
  background-color: $nutri-dark;
  padding: 40rpx;
  color: $uni-text-color;
}

.shadow-glass {
  @include glass-morphism;
}

.header {
  border-radius: 40rpx;
  padding: 40rpx;
  display: flex;
  align-items: center;
  margin-bottom: 60rpx;

  // 重置 button 默认样式
  .avatar-btn {
    padding: 0;
    margin: 0 30rpx 0 0;
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
    width: 156rpx;
    height: 156rpx;
    border-radius: 44rpx; // 方圆形圆角
    background: #f8f9fa;
    border: 4rpx solid #fff;
    // 关键！因为有外部溢出的相机会标角标，所以不能 hidden
    overflow: visible;
    box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);

    .avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 40rpx; // 内部图片也要保持同轮廓
      display: block; // 去除底部间隙
    }

    .avatar-placeholder {
      width: 100%;
      height: 100%;
      border-radius: 40rpx;
      @include flex-center;
    }

    .avatar-edit-badge {
      position: absolute;
      bottom: -16rpx;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx;
      height: 40rpx;
      background: #fff;
      border-radius: 20rpx;
      @include flex-center;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
      border: 2rpx solid #f0f0f0;
      z-index: 2;
    }
  }

  .user-details {
    flex: 1;
    overflow: hidden;

    .nickname-display {
      display: flex;
      align-items: center;
      margin-bottom: 12rpx;

      .user-title {
        font-size: 38rpx;
        font-weight: 600;
        color: $uni-text-color;
        margin-right: 16rpx;
        max-width: 280rpx;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .edit-btn {
        display: flex;
        align-items: center;
        background: rgba(0, 0, 0, 0.04);
        padding: 6rpx 16rpx;
        border-radius: 30rpx;

        .edit-text {
          font-size: 22rpx;
          color: #666;
          margin-left: 6rpx;
        }
      }
    }

    .nickname-edit {
      display: flex;
      align-items: center;
      margin-bottom: 12rpx;

      .nickname-input {
        flex: 1;
        font-size: 34rpx;
        font-weight: 600;
        height: 60rpx;
        line-height: 60rpx;
        color: $uni-text-color;
        border-bottom: 2rpx solid $nutri-primary;
        padding: 0 10rpx;
      }

      .nickname-placeholder {
        color: rgba(0, 0, 0, 0.25);
        font-weight: 400;
      }
    }

    .user-desc-wrapper {
      display: inline-flex;
      align-items: center;
      padding: 6rpx 16rpx 6rpx 0;
      margin-top: 4rpx;

      .user-desc {
        font-size: 24rpx;
        color: $uni-text-color-grey;
        margin-right: 8rpx;
      }
    }
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
      color: $uni-text-color-placeholder;
    }
  }

  .menu-arrow {
    font-size: 32rpx;
    color: rgba(0, 0, 0, 0.2);
  }
}
</style>
