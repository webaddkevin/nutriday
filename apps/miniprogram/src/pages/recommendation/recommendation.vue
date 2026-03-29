<template>
  <view class="container">
    <!-- 餐食类型选择 -->
    <view class="meal-tabs">
      <view
        v-for="meal in mealTypes"
        :key="meal.value"
        class="meal-tab"
        :class="{ active: selectedMeal === meal.value }"
        @tap="selectMeal(meal.value)"
      >
        <text class="meal-icon">{{ meal.icon }}</text>
        <text class="meal-name">{{ meal.label }}</text>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-state">
      <text class="loading-text">AI 正在为你生成推荐...</text>
    </view>

    <!-- 推荐内容 -->
    <view v-else-if="recommendations.length > 0" class="recommendations">
      <!-- 健康提示 -->
      <view v-if="tips.length > 0" class="tips-card">
        <view class="tips-header">
          <text class="tips-icon">💡</text>
          <text class="tips-title">健康建议</text>
        </view>
        <view class="tips-list">
          <text v-for="(tip, index) in tips" :key="index" class="tip-item">• {{ tip }}</text>
        </view>
      </view>

      <!-- 推荐套餐 -->
      <view class="section-title">推荐套餐</view>
      <view class="combo-list">
        <view
          v-for="(combo, index) in recommendations"
          :key="index"
          class="combo-card"
          @tap="selectCombo(combo)"
        >
          <view class="combo-header">
            <text class="combo-name">{{ combo.name }}</text>
            <text class="combo-calories">{{ combo.totalCalories }} kcal</text>
          </view>

          <view class="combo-foods">
            <view v-for="food in combo.foods" :key="food.name" class="food-tag">
              {{ food.name }} {{ food.amount }}{{ food.unit }}
            </view>
          </view>

          <view class="combo-nutrition">
            <view class="nutrition-item">
              <text class="nutrition-value">{{ combo.protein }}g</text>
              <text class="nutrition-label">蛋白质</text>
            </view>
            <view class="nutrition-item">
              <text class="nutrition-value">{{ combo.carbs }}g</text>
              <text class="nutrition-label">碳水</text>
            </view>
            <view class="nutrition-item">
              <text class="nutrition-value">{{ combo.fat }}g</text>
              <text class="nutrition-label">脂肪</text>
            </view>
          </view>

          <view class="combo-reason">
            <text class="reason-icon">✨</text>
            <text class="reason-text">{{ combo.reason }}</text>
          </view>

          <view class="combo-action">
            <text class="action-text">点击添加到今日饮食</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <text class="empty-icon">🍽️</text>
      <text class="empty-text">暂无推荐，请先完善个人信息</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getMealRecommendation } from '@/api/recommendation-api';
import { calculateBMR, calculateTDEE } from '@nutriday/shared-utils';
import type { MealRecommendation, MealType, UserProfile } from '@nutriday/shared-types';

const mealTypes = [
  { value: 'breakfast', label: '早餐', icon: '🍳' },
  { value: 'lunch', label: '午餐', icon: '🍲' },
  { value: 'dinner', label: '晚餐', icon: '🥗' },
  { value: 'snack', label: '加餐', icon: '🍎' },
];

const selectedMeal = ref<MealType>('breakfast');
const loading = ref(false);
const recommendations = ref<MealRecommendation[]>([]);
const tips = ref<string[]>([]);
const userProfile = ref<UserProfile | null>(null);

onLoad(() => {
  const profile = uni.getStorageSync('user_profile');
  if (profile) {
    userProfile.value = profile;
  }
  loadRecommendations();
});

function selectMeal(meal: MealType) {
  selectedMeal.value = meal;
  loadRecommendations();
}

async function loadRecommendations() {
  loading.value = true;
  try {
    let targetCalories = 2000;
    if (userProfile.value) {
      const bmr = calculateBMR(
        userProfile.value.gender,
        userProfile.value.age,
        userProfile.value.height,
        userProfile.value.weight,
      );
      targetCalories = calculateTDEE(bmr, userProfile.value.activityLevel);
    }

    const result = await getMealRecommendation(1, selectedMeal.value, targetCalories);
    recommendations.value = result.recommendations;
    tips.value = result.tips;
  } catch (e) {
    console.error('获取推荐失败', e);
    uni.showToast({ title: '获取推荐失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

async function selectCombo(combo: MealRecommendation) {
  uni.showModal({
    title: '添加推荐套餐',
    content: `确定要将「${combo.name}」添加到今日${getMealLabel(selectedMeal.value)}吗？`,
    success: async (res) => {
      if (res.confirm) {
        // TODO: 实际添加逻辑需要根据食物 ID 添加
        uni.showToast({ title: '功能开发中', icon: 'none' });
      }
    },
  });
}

function getMealLabel(meal: MealType): string {
  const labels: Record<MealType, string> = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '加餐',
  };
  return labels[meal];
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: $nutri-dark;
  padding: 30rpx;
}

.meal-tabs {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;

  .meal-tab {
    flex: 1;
    @include glass-morphism;
    border-radius: 20rpx;
    padding: 24rpx 16rpx;
    text-align: center;
    border: 2rpx solid transparent;

    &.active {
      border-color: $nutri-primary;
      background: rgba(0, 177, 113, 0.1);
    }

    .meal-icon {
      display: block;
      font-size: 40rpx;
      margin-bottom: 8rpx;
    }

    .meal-name {
      font-size: 24rpx;
      color: $uni-text-color-grey;
    }
  }
}

.loading-state {
  @include flex-center;
  flex-direction: column;
  padding: 100rpx 0;

  .loading-text {
    font-size: 28rpx;
    color: $uni-text-color-grey;
    margin-top: 20rpx;
  }
}

.tips-card {
  @include glass-morphism;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;

  .tips-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;

    .tips-icon {
      font-size: 32rpx;
      margin-right: 12rpx;
    }

    .tips-title {
      font-size: 28rpx;
      font-weight: 600;
      color: $uni-text-color;
    }
  }

  .tips-list {
    .tip-item {
      display: block;
      font-size: 26rpx;
      color: $uni-text-color-grey;
      line-height: 1.8;
    }
  }
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: $uni-text-color;
  margin-bottom: 24rpx;
}

.combo-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.combo-card {
  @include glass-morphism;
  border-radius: 24rpx;
  padding: 30rpx;

  .combo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .combo-name {
      font-size: 34rpx;
      font-weight: 600;
      color: $uni-text-color;
    }

    .combo-calories {
      font-size: 28rpx;
      font-weight: 600;
      color: $nutri-primary;
    }
  }

  .combo-foods {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-bottom: 20rpx;

    .food-tag {
      font-size: 24rpx;
      color: $uni-text-color-grey;
      background: rgba(0, 0, 0, 0.03);
      padding: 8rpx 16rpx;
      border-radius: 12rpx;
    }
  }

  .combo-nutrition {
    display: flex;
    gap: 40rpx;
    padding: 20rpx 0;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    margin-bottom: 20rpx;

    .nutrition-item {
      text-align: center;

      .nutrition-value {
        display: block;
        font-size: 28rpx;
        font-weight: 600;
        color: $uni-text-color;
      }

      .nutrition-label {
        font-size: 22rpx;
        color: $uni-text-color-grey;
      }
    }
  }

  .combo-reason {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20rpx;

    .reason-icon {
      font-size: 24rpx;
      margin-right: 8rpx;
    }

    .reason-text {
      font-size: 24rpx;
      color: $uni-text-color-grey;
      line-height: 1.5;
    }
  }

  .combo-action {
    text-align: center;

    .action-text {
      font-size: 26rpx;
      color: $nutri-primary;
    }
  }
}

.empty-state {
  @include flex-center;
  flex-direction: column;
  padding: 100rpx 0;

  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: $uni-text-color-grey;
  }
}
</style>
