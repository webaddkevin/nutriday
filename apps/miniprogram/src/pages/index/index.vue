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
        <view
          v-for="meal in mealCards"
          :key="meal.type"
          class="meal-card"
          @tap="goToFoodSearch(meal.type)"
        >
          <view class="meal-icon">{{ meal.icon }}</view>
          <view class="meal-info">
            <text class="meal-name">{{ meal.name }}</text>
            <text class="meal-status">
              {{ meal.calories > 0 ? meal.calories + ' kcal' : '点击记录' }}
            </text>
            <view v-if="meal.items.length > 0" class="meal-items">
              <text v-for="item in meal.items.slice(0, 2)" :key="item.id" class="meal-item-tag">
                {{ item.foodName }}
              </text>
              <text v-if="meal.items.length > 2" class="meal-item-more">
                +{{ meal.items.length - 2 }}
              </text>
            </view>
          </view>
          <view class="meal-action">
            <view class="action-icon">+</view>
          </view>
        </view>
      </view>
    </view>

    <!-- AI 推荐入口 -->
    <view class="ai-section">
      <view class="ai-card" @tap="goToRecommendation">
        <view class="ai-icon">🤖</view>
        <view class="ai-content">
          <text class="ai-title">AI 智能推荐</text>
          <text class="ai-desc">根据你的目标和饮食习惯，为你推荐健康餐食</text>
        </view>
        <view class="ai-arrow">
          <uni-icons type="right" size="20" color="#fff"></uni-icons>
        </view>
      </view>

      <!-- 扫码入口 -->
      <view class="scan-card" @tap="goToScan">
        <view class="scan-icon">📷</view>
        <view class="scan-content">
          <text class="scan-title">扫码识别</text>
          <text class="scan-desc">扫描食品条码，快速获取营养信息</text>
        </view>
        <view class="scan-arrow">
          <uni-icons type="right" size="20" color="#4caf50"></uni-icons>
        </view>
      </view>
    </view>
  </view>

  <!-- 自定义 Tabbar -->
  <CustomTabbar current-path="/pages/index/index" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad, onShow } from '@dcloudio/uni-app';
import NutritionRing from '@/components/NutritionRing/NutritionRing.vue';
import CustomTabbar from '@/components/CustomTabbar/CustomTabbar.vue';
import { calculateBMR, calculateTDEE } from '@nutriday/shared-utils';
import { getDailySummary } from '@/api/meal-log-api';
import type { UserProfile, MealType, DailySummary } from '@nutriday/shared-types';

const userProfile = ref<UserProfile | null>(null);
const today = ref(
  new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' }),
);

const todayDate = new Date().toISOString().split('T')[0];
const dailySummary = ref<DailySummary | null>(null);

const mealCards = computed(() => {
  const meals = [
    { type: 'breakfast' as MealType, name: '早餐', icon: '🍳' },
    { type: 'lunch' as MealType, name: '午餐', icon: '🍲' },
    { type: 'dinner' as MealType, name: '晚餐', icon: '🥗' },
    { type: 'snack' as MealType, name: '加餐', icon: '🍎' },
  ];

  return meals.map((meal) => ({
    ...meal,
    calories: dailySummary.value?.meals[meal.type]?.calories || 0,
    items: dailySummary.value?.meals[meal.type]?.items || [],
  }));
});

const consumed = computed(() => ({
  calories: dailySummary.value?.calories || 0,
  protein: dailySummary.value?.protein || 0,
  carbs: dailySummary.value?.carbs || 0,
  fat: dailySummary.value?.fat || 0,
}));

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
  protein: '#f59e0b',
  carbs: '#3b82f6',
  fat: '#ef4444',
};

const caloriesColor = computed(() => {
  if (caloriePercent.value > 100) return colors.fat;
  return '#00B171';
});

// 目标营养素（简化计算）
const targetNutrients = computed(() => ({
  protein: Math.round((targetCalories.value * 0.25) / 4), // 25% 热量来自蛋白质
  carbs: Math.round((targetCalories.value * 0.5) / 4), // 50% 热量来自碳水
  fat: Math.round((targetCalories.value * 0.25) / 9), // 25% 热量来自脂肪
}));

const nutrientStats = computed(() => [
  {
    label: '蛋白质',
    value: consumed.value.protein,
    percent: Math.min(100, (consumed.value.protein / targetNutrients.value.protein) * 100),
    color: colors.protein,
  },
  {
    label: '碳水',
    value: consumed.value.carbs,
    percent: Math.min(100, (consumed.value.carbs / targetNutrients.value.carbs) * 100),
    color: colors.carbs,
  },
  {
    label: '脂肪',
    value: consumed.value.fat,
    percent: Math.min(100, (consumed.value.fat / targetNutrients.value.fat) * 100),
    color: colors.fat,
  },
]);

onLoad(() => {
  const profile = uni.getStorageSync('user_profile');
  if (!profile) {
    uni.reLaunch({ url: '/pages/onboarding/onboarding' });
  } else {
    userProfile.value = profile;
  }
});

onShow(async () => {
  if (userProfile.value) {
    await loadDailySummary();
  }
});

async function loadDailySummary() {
  try {
    dailySummary.value = await getDailySummary(1, todayDate);
  } catch (e) {
    console.warn('获取每日汇总失败，可能服务未启动', e);
    // 使用默认空数据
    dailySummary.value = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      meals: {
        breakfast: { calories: 0, items: [] },
        lunch: { calories: 0, items: [] },
        dinner: { calories: 0, items: [] },
        snack: { calories: 0, items: [] },
      },
    };
  }
}

function goToFoodSearch(mealType: MealType) {
  uni.navigateTo({
    url: `/pages/food-search/food-search?mealType=${mealType}&date=${todayDate}`,
  });
}

function goToRecommendation() {
  uni.navigateTo({
    url: '/pages/recommendation/recommendation',
  });
}

function goToScan() {
  uni.navigateTo({ url: '/pages/scan/scan' });
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: $nutri-dark;
  padding: 40rpx;
  padding-bottom: 180rpx;
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
      color: $uni-text-color;
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
      color: $uni-text-color;
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
    .meal-items {
      display: flex;
      flex-wrap: wrap;
      gap: 8rpx;
      margin-top: 12rpx;
      .meal-item-tag {
        font-size: 20rpx;
        color: $nutri-primary;
        background: rgba(0, 177, 113, 0.1);
        padding: 4rpx 12rpx;
        border-radius: 8rpx;
      }
      .meal-item-more {
        font-size: 20rpx;
        color: $uni-text-color-grey;
      }
    }
  }

  .meal-action {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #4caf50 0%, #2ecc71 100%);
    @include flex-center;
    box-shadow: 0 4rpx 16rpx rgba(46, 204, 113, 0.3);

    .action-icon {
      color: white;
      font-size: 40rpx;
      font-weight: 300;
      line-height: 1;
    }
  }
}

.ai-section {
  margin-top: 40rpx;

  .ai-card {
    background: linear-gradient(135deg, #00b171 0%, #009b63 100%);
    border-radius: 30rpx;
    padding: 36rpx;
    display: flex;
    align-items: center;

    .ai-icon {
      font-size: 56rpx;
      margin-right: 24rpx;
    }

    .ai-content {
      flex: 1;

      .ai-title {
        display: block;
        font-size: 32rpx;
        font-weight: 600;
        color: #fff;
        margin-bottom: 8rpx;
      }

      .ai-desc {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.8);
      }
    }

    .ai-arrow {
      width: 56rpx;
      height: 56rpx;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 28rpx;
      @include flex-center;
    }
  }

  .scan-card {
    background: #fff;
    border-radius: 30rpx;
    padding: 36rpx;
    display: flex;
    align-items: center;
    margin-top: 24rpx;

    .scan-icon {
      font-size: 56rpx;
      margin-right: 24rpx;
    }

    .scan-content {
      flex: 1;

      .scan-title {
        display: block;
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 8rpx;
      }

      .scan-desc {
        font-size: 24rpx;
        color: #999;
      }
    }

    .scan-arrow {
      width: 56rpx;
      height: 56rpx;
      background: rgba(76, 175, 80, 0.1);
      border-radius: 28rpx;
      @include flex-center;
    }
  }
}
</style>
