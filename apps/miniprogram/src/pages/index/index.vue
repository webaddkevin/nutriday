<template>
  <view class="container">
    <!-- 顶部装饰背景 -->
    <view class="bg-decoration">
      <view class="bg-circle bg-circle-1"></view>
      <view class="bg-circle bg-circle-2"></view>
    </view>

    <view class="header">
      <view class="user-info">
        <text class="greeting"
          >{{ greeting }}，{{ userProfile?.gender === 'male' ? '先生' : '女士' }}</text
        >
        <text class="date">{{ today }}</text>
      </view>
      <view class="header-actions">
        <view class="action-btn" @tap="goToScan">
          <NutriIcon name="scan" size="sm" color="#64748b" />
        </view>
      </view>
    </view>

    <!-- 核心营养概览卡片 -->
    <view class="dashboard-card">
      <!-- 热量进度环 -->
      <view class="calorie-ring-container">
        <view class="calorie-ring">
          <view class="ring-bg"></view>
          <view class="ring-progress" :style="{ '--progress': caloriePercent }"></view>
          <view class="ring-center">
            <text class="ring-value">{{ remainingCalories }}</text>
            <text class="ring-label">剩余 kcal</text>
          </view>
        </view>
        <view class="calorie-detail">
          <view class="detail-item">
            <text class="detail-label">已摄入</text>
            <text class="detail-value">{{ consumed.calories }}</text>
          </view>
          <view class="detail-divider"></view>
          <view class="detail-item">
            <text class="detail-label">目标</text>
            <text class="detail-value target">{{ targetCalories }}</text>
          </view>
        </view>
      </view>

      <!-- 营养素进度 -->
      <view class="nutrient-row">
        <view v-for="item in nutrientStats" :key="item.label" class="nutrient-item">
          <view class="nutrient-header">
            <view class="nutrient-dot" :style="{ background: item.color }"></view>
            <text class="nutrient-label">{{ item.label }}</text>
            <text class="nutrient-value">{{ item.value }}g</text>
          </view>
          <view class="nutrient-bar">
            <view
              class="nutrient-fill"
              :style="{ width: Math.min(100, item.percent) + '%', background: item.color }"
            />
          </view>
        </view>
      </view>
    </view>

    <!-- 饮水提醒 -->
    <view class="water-card" @tap="goToWater">
      <view class="water-icon">
        <NutriIcon name="water" size="lg" color="#00bcd4" />
      </view>
      <view class="water-info">
        <text class="water-title">今日饮水</text>
        <text class="water-value">{{ waterAmount }} / 2000 ml</text>
      </view>
      <view class="water-progress">
        <view class="water-bar">
          <view class="water-fill" :style="{ width: Math.min(100, waterPercent) + '%' }"></view>
        </view>
      </view>
      <view class="water-arrow">
        <uni-icons type="right" size="18" color="#00bcd4"></uni-icons>
      </view>
    </view>

    <!-- 饮食时段卡片 -->
    <view class="meal-section">
      <view class="section-header">
        <text class="section-title">今日饮食</text>
        <text class="section-total">{{ totalMealCalories }} kcal</text>
      </view>
      <view class="meal-grid">
        <view
          v-for="meal in mealCards"
          :key="meal.type"
          class="meal-card"
          :class="{ 'has-items': meal.items.length > 0 }"
          @tap="goToFoodSearch(meal.type)"
        >
          <view class="meal-icon-wrap">
            <text class="meal-emoji">{{ meal.icon }}</text>
          </view>
          <view class="meal-info">
            <text class="meal-name">{{ meal.name }}</text>
            <text class="meal-cal">{{
              meal.calories > 0 ? meal.calories + ' kcal' : '未记录'
            }}</text>
          </view>
          <view v-if="meal.items.length > 0" class="meal-tags">
            <text v-for="item in meal.items.slice(0, 2)" :key="item.id" class="meal-tag">
              {{ item.foodName }}
            </text>
          </view>
          <view class="meal-add">
            <text class="add-icon">+</text>
          </view>
        </view>
      </view>
    </view>

    <!-- AI 推荐入口 -->
    <view class="ai-section">
      <view class="ai-card" @tap="goToRecommendation">
        <view class="ai-glow"></view>
        <view class="ai-icon-wrap">
          <NutriIcon name="ai" size="xl" color="#fff" />
        </view>
        <view class="ai-content">
          <text class="ai-title">AI 智能推荐</text>
          <text class="ai-desc">根据你的目标推荐健康餐食</text>
        </view>
        <view class="ai-arrow">
          <uni-icons type="right" size="20" color="rgba(255,255,255,0.8)"></uni-icons>
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
import CustomTabbar from '@/components/CustomTabbar/CustomTabbar.vue';
import NutriIcon from '@/components/NutriIcon/NutriIcon.vue';
import { calculateBMR, calculateTDEE } from '@nutriday/shared-utils';
import { getDailySummary } from '@/api/meal-log-api';
import { getWaterStats } from '@/api/water-api';
import { useUserStore } from '@/stores/user';
import type { UserProfile, MealType, DailySummary } from '@nutriday/shared-types';

const _userStore = useUserStore();
const userProfile = ref<UserProfile | null>(null);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 9) return '早上好';
  if (hour < 12) return '上午好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  if (hour < 22) return '晚上好';
  return '夜深了';
});

const today = ref(
  new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' }),
);

const todayDate = new Date().toISOString().split('T')[0];
const dailySummary = ref<DailySummary | null>(null);
const waterAmount = ref(0);

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

const totalMealCalories = computed(() => mealCards.value.reduce((sum, m) => sum + m.calories, 0));

const consumed = computed(() => ({
  calories: Math.round(dailySummary.value?.calories || 0),
  protein: Math.round((dailySummary.value?.protein || 0) * 10) / 10,
  carbs: Math.round((dailySummary.value?.carbs || 0) * 10) / 10,
  fat: Math.round((dailySummary.value?.fat || 0) * 10) / 10,
}));

const targetCalories = computed(() => {
  if (!userProfile.value) return 2000;
  const bmr = calculateBMR(
    userProfile.value.gender,
    userProfile.value.age,
    userProfile.value.height,
    userProfile.value.weight,
  );
  return Math.round(calculateTDEE(bmr, userProfile.value.activityLevel));
});

const remainingCalories = computed(() =>
  Math.max(0, targetCalories.value - consumed.value.calories),
);

const caloriePercent = computed(() =>
  Math.min(100, (consumed.value.calories / targetCalories.value) * 100),
);

const waterPercent = computed(() => (waterAmount.value / 2000) * 100);

const colors = {
  protein: '#f59e0b',
  carbs: '#3b82f6',
  fat: '#ef4444',
};

const targetNutrients = computed(() => ({
  protein: Math.round((targetCalories.value * 0.25) / 4),
  carbs: Math.round((targetCalories.value * 0.5) / 4),
  fat: Math.round((targetCalories.value * 0.25) / 9),
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
  // 每次显示页面时都重新加载最新数据
  await Promise.all([loadDailySummary(), loadWaterStats()]);
});

async function loadDailySummary() {
  try {
    dailySummary.value = await getDailySummary(todayDate);
  } catch (e) {
    console.warn('获取每日汇总失败', e);
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

async function loadWaterStats() {
  try {
    const stats = await getWaterStats();
    console.log('饮水统计数据:', stats);
    waterAmount.value = stats.today || 0;
  } catch (e) {
    console.error('获取饮水数据失败', e);
    waterAmount.value = 0;
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

function goToWater() {
  uni.navigateTo({ url: '/pages/water/water' });
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f0f4f8 0%, #e8f0e8 100%);
  padding: 40rpx;
  padding-bottom: 180rpx;
  color: $uni-text-color;
  position: relative;
  overflow: hidden;
}

// 背景装饰
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 600rpx;
  pointer-events: none;

  .bg-circle {
    position: absolute;
    border-radius: 50%;
    opacity: 0.5;

    &.bg-circle-1 {
      width: 400rpx;
      height: 400rpx;
      background: radial-gradient(circle, rgba(0, 177, 113, 0.15) 0%, transparent 70%);
      top: -100rpx;
      right: -100rpx;
    }

    &.bg-circle-2 {
      width: 300rpx;
      height: 300rpx;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
      top: 200rpx;
      left: -80rpx;
    }
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32rpx;
  position: relative;
  z-index: 1;

  .greeting {
    font-size: 44rpx;
    font-weight: 700;
    display: block;
    color: #1e293b;
  }

  .date {
    font-size: 26rpx;
    color: #64748b;
    margin-top: 8rpx;
    display: block;
  }

  .header-actions {
    .action-btn {
      width: 72rpx;
      height: 72rpx;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 20rpx;
      @include flex-center;
      box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
    }
  }
}

// 仪表盘卡片
.dashboard-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.04);
  position: relative;
  z-index: 1;
}

// 热量环形进度
.calorie-ring-container {
  display: flex;
  align-items: center;
  gap: 32rpx;
  padding-bottom: 28rpx;
  border-bottom: 1rpx solid #f1f5f9;
  margin-bottom: 24rpx;
}

.calorie-ring {
  width: 180rpx;
  height: 180rpx;
  position: relative;
  flex-shrink: 0;

  .ring-bg {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: conic-gradient(#f1f5f9 0deg, #f1f5f9 360deg);
  }

  .ring-progress {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: conic-gradient(
      #00b171 0deg,
      #00b171 calc(var(--progress, 0) * 3.6deg),
      transparent calc(var(--progress, 0) * 3.6deg)
    );
    transition: background 0.5s ease;
  }

  .ring-bg,
  .ring-progress {
    &::before {
      content: '';
      position: absolute;
      inset: 16rpx;
      background: #fff;
      border-radius: 50%;
    }
  }

  .ring-center {
    position: absolute;
    inset: 0;
    @include flex-center;
    flex-direction: column;
    z-index: 1;

    .ring-value {
      font-size: 48rpx;
      font-weight: 800;
      color: #00b171;
      line-height: 1;
    }

    .ring-label {
      font-size: 20rpx;
      color: #94a3b8;
      margin-top: 4rpx;
    }
  }
}

.calorie-detail {
  flex: 1;
  display: flex;
  gap: 24rpx;

  .detail-item {
    flex: 1;
    text-align: center;

    .detail-label {
      font-size: 22rpx;
      color: #94a3b8;
      display: block;
    }

    .detail-value {
      font-size: 36rpx;
      font-weight: 700;
      color: #1e293b;
      margin-top: 4rpx;

      &.target {
        color: #00b171;
      }
    }
  }

  .detail-divider {
    width: 1rpx;
    background: #e2e8f0;
    margin: 8rpx 0;
  }
}

// 营养素进度
.nutrient-row {
  display: flex;
  flex-direction: column;
  gap: 16rpx;

  .nutrient-item {
    .nutrient-header {
      display: flex;
      align-items: center;
      gap: 8rpx;
      margin-bottom: 8rpx;

      .nutrient-dot {
        width: 12rpx;
        height: 12rpx;
        border-radius: 50%;
      }

      .nutrient-label {
        font-size: 24rpx;
        color: #64748b;
        flex: 1;
      }

      .nutrient-value {
        font-size: 24rpx;
        font-weight: 600;
        color: #1e293b;
      }
    }

    .nutrient-bar {
      height: 8rpx;
      background: #f1f5f9;
      border-radius: 4rpx;
      overflow: hidden;

      .nutrient-fill {
        height: 100%;
        border-radius: 4rpx;
        transition: width 0.3s ease;
      }
    }
  }
}

// 饮水卡片
.water-card {
  background: linear-gradient(135deg, rgba(0, 188, 212, 0.08) 0%, rgba(0, 188, 212, 0.02) 100%);
  border: 1rpx solid rgba(0, 188, 212, 0.15);
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  position: relative;
  z-index: 1;

  .water-icon {
    width: 80rpx;
    height: 80rpx;
    background: rgba(0, 188, 212, 0.1);
    border-radius: 20rpx;
    @include flex-center;
  }

  .water-info {
    flex: 1;

    .water-title {
      font-size: 26rpx;
      color: #64748b;
      display: block;
    }

    .water-value {
      font-size: 32rpx;
      font-weight: 600;
      color: #00838f;
      margin-top: 4rpx;
    }
  }

  .water-progress {
    width: 100rpx;

    .water-bar {
      height: 8rpx;
      background: rgba(0, 188, 212, 0.2);
      border-radius: 4rpx;
      overflow: hidden;

      .water-fill {
        height: 100%;
        background: #00bcd4;
        border-radius: 4rpx;
        transition: width 0.3s ease;
      }
    }
  }
}

// 饮食区块
.meal-section {
  margin-bottom: 24rpx;
  position: relative;
  z-index: 1;

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #1e293b;
    }

    .section-total {
      font-size: 26rpx;
      color: #00b171;
      font-weight: 600;
    }
  }
}

.meal-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.meal-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  position: relative;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
  }

  &.has-items {
    background: linear-gradient(135deg, #fff 0%, rgba(0, 177, 113, 0.03) 100%);
  }

  .meal-icon-wrap {
    width: 64rpx;
    height: 64rpx;
    background: #f8fafc;
    border-radius: 16rpx;
    @include flex-center;
    margin-bottom: 12rpx;

    .meal-emoji {
      font-size: 36rpx;
    }
  }

  .meal-info {
    .meal-name {
      font-size: 28rpx;
      font-weight: 600;
      color: #1e293b;
      display: block;
    }

    .meal-cal {
      font-size: 22rpx;
      color: #94a3b8;
      margin-top: 4rpx;
    }
  }

  .meal-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8rpx;
    margin-top: 12rpx;

    .meal-tag {
      font-size: 18rpx;
      color: #00b171;
      background: rgba(0, 177, 113, 0.08);
      padding: 4rpx 12rpx;
      border-radius: 8rpx;
    }
  }

  .meal-add {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
    width: 48rpx;
    height: 48rpx;
    background: linear-gradient(135deg, #00b171 0%, #00d387 100%);
    border-radius: 50%;
    @include flex-center;
    box-shadow: 0 4rpx 12rpx rgba(0, 177, 113, 0.25);

    .add-icon {
      color: #fff;
      font-size: 32rpx;
      font-weight: 300;
    }
  }
}

// AI 推荐卡片
.ai-section {
  position: relative;
  z-index: 1;

  .ai-card {
    background: linear-gradient(135deg, #00b171 0%, #009b63 100%);
    border-radius: 28rpx;
    padding: 32rpx;
    display: flex;
    align-items: center;
    position: relative;
    overflow: hidden;

    .ai-glow {
      position: absolute;
      width: 200rpx;
      height: 200rpx;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
      top: -50rpx;
      right: -50rpx;
    }

    .ai-icon-wrap {
      width: 88rpx;
      height: 88rpx;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 24rpx;
      @include flex-center;
      margin-right: 24rpx;
    }

    .ai-content {
      flex: 1;

      .ai-title {
        display: block;
        font-size: 32rpx;
        font-weight: 600;
        color: #fff;
        margin-bottom: 6rpx;
      }

      .ai-desc {
        font-size: 24rpx;
        color: rgba(255, 255, 255, 0.8);
      }
    }

    .ai-arrow {
      width: 56rpx;
      height: 56rpx;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 50%;
      @include flex-center;
    }
  }
}
</style>
