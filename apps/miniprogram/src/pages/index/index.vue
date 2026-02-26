<template>
  <view class="container">
    <view class="header">
      <view class="user-info">
        <text class="greeting">你好，{{ userProfile?.gender === 'male' ? '先生' : '女士' }}</text>
        <text class="date">{{ today }}</text>
      </view>
    </view>

    <!-- 核心营养概览卡片 -->
    <view class="dashboard-card shadow-glass">
      <view class="main-stats">
        <NutritionRing
          :percent="caloriePercent"
          :size="340"
          :stroke-width="24"
          :color="caloriesColor"
        >
          <view class="ring-label">剩余热量</view>
          <view class="ring-value">{{ remainingCalories }}</view>
          <view class="ring-unit">kcal</view>
        </NutritionRing>
      </view>

      <view class="sub-stats">
        <view v-for="item in nutrientStats" :key="item.label" class="stat-item">
          <NutritionRing
            :percent="item.percent"
            :size="120"
            :stroke-width="10"
            :color="item.color"
          />
          <text class="item-label">{{ item.label }}</text>
          <text class="item-value" :style="{ color: item.color }">{{ item.value }}g</text>
        </view>
      </view>
    </view>

    <!-- 饮食时段卡片 -->
    <view class="meal-section">
      <view class="section-title">今日饮食</view>
      <view class="meal-list">
        <view v-for="meal in meals" :key="meal.name" class="meal-card">
          <view class="meal-icon">{{ meal.icon }}</view>
          <view class="meal-info">
            <text class="meal-name">{{ meal.name }}</text>
            <text class="meal-status">{{
              meal.calories > 0 ? meal.calories + ' kcal' : '尚未记录'
            }}</text>
          </view>
          <view class="meal-action">+</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import NutritionRing from '@/components/NutritionRing/NutritionRing.vue';
import { calculateBMR, calculateTDEE } from '@nutriday/shared-utils';
import type { UserProfile } from '@nutriday/shared-types';

const userProfile = ref<UserProfile | null>(null);
const today = ref(
  new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' }),
);

// 模拟今日已摄入数据
const consumed = ref({
  calories: 1200,
  protein: 45,
  carbs: 150,
  fat: 35,
});

const meals = ref([
  { name: '早餐', icon: '🍳', calories: 450 },
  { name: '午餐', icon: '🍲', calories: 750 },
  { name: '晚餐', icon: '🥗', calories: 0 },
  { name: '加餐', icon: '🍎', calories: 0 },
]);

const targetCalories = computed(() => {
  if (!userProfile.value) return 2000;
  const bmr = calculateBMR(
    userProfile.value.gender,
    userProfile.value.age,
    userProfile.value.height,
    userProfile.value.weight,
  );
  return calculateTDEE(bmr, userProfile.value.activityLevel);
});

const remainingCalories = computed(() =>
  Math.max(0, targetCalories.value - consumed.value.calories),
);
const caloriePercent = computed(() =>
  Math.min(100, (consumed.value.calories / targetCalories.value) * 100),
);

const colors = {
  protein: '#f59e0b', // Amber 500
  carbs: '#3b82f6', // Blue 500
  fat: '#ef4444', // Red 500
};

const caloriesColor = computed(() => {
  if (caloriePercent.value > 100) return colors.fat;
  return '#00B171'; // 使用新的品牌翠绿色
});

const nutrientStats = computed(() => [
  { label: '蛋白质', value: consumed.value.protein, percent: 45, color: colors.protein },
  { label: '碳水', value: consumed.value.carbs, percent: 60, color: colors.carbs },
  { label: '脂肪', value: consumed.value.fat, percent: 30, color: colors.fat },
]);

onLoad(() => {
  const profile = uni.getStorageSync('user_profile');
  if (!profile) {
    uni.reLaunch({ url: '/pages/onboarding/onboarding' });
  } else {
    userProfile.value = profile;
  }
});
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  /* 使用在 uni.scss 中统一定义的明亮高级背景色 */
  background-color: $nutri-dark;
  padding: 40rpx;
  /* 主文字变为深蓝色 */
  color: $uni-text-color;
}

.header {
  margin-bottom: 40rpx;
  .greeting {
    font-size: 48rpx;
    font-weight: 600;
    display: block;
  }
  .date {
    font-size: 28rpx;
    color: $uni-text-color-grey;
  }
}

.dashboard-card {
  @include glass-morphism;
  border-radius: 40rpx;
  padding: 40rpx;
  margin-bottom: 60rpx;

  .main-stats {
    @include flex-center;
    padding: 20rpx 0;

    .ring-label {
      font-size: 26rpx;
      color: $uni-text-color; /* 加深为最高对比度的主颜色 */
      font-weight: 500;
    }
    .ring-value {
      font-size: 72rpx;
      font-weight: 800;
      line-height: 1;
      margin: 12rpx 0;
    }
    .ring-unit {
      font-size: 24rpx;
      color: $uni-text-color; /* 加深为最高对比度的主颜色 */
      font-weight: 500;
    }
  }

  .sub-stats {
    display: flex;
    justify-content: space-around;
    margin-top: 40rpx;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    padding-top: 40rpx;

    .stat-item {
      @include flex-center;
      flex-direction: column;

      .item-label {
        font-size: 24rpx;
        color: $uni-text-color-grey;
        margin-top: 16rpx;
      }
      .item-value {
        font-size: 32rpx;
        font-weight: 700;
        margin-top: 8rpx;
      }
    }
  }
}

.meal-section {
  .section-title {
    font-size: 36rpx;
    font-weight: 600;
    margin-bottom: 30rpx;
  }
}

.meal-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.meal-card {
  @include glass-morphism;
  border-radius: 30rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;

  .meal-icon {
    font-size: 48rpx;
    margin-right: 30rpx;
    width: 80rpx;
    height: 80rpx;
    background: rgba(0, 0, 0, 0.03);
    border-radius: 20rpx;
    @include flex-center;
  }

  .meal-info {
    flex: 1;
    .meal-name {
      display: block;
      font-size: 32rpx;
      font-weight: 500;
    }
    .meal-status {
      font-size: 24rpx;
      color: $uni-text-color-placeholder;
    }
  }

  .meal-action {
    width: 60rpx;
    height: 60rpx;
    border-radius: 30rpx;
    background: $nutri-primary;
    @include flex-center;
    color: white;
    font-weight: 300;
  }
}
</style>
