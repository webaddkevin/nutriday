<template>
  <view class="container">
    <!-- 时间范围选择 -->
    <view class="time-selector">
      <view
        v-for="range in timeRanges"
        :key="range.value"
        class="time-chip"
        :class="{ active: selectedRange === range.value }"
        @tap="selectRange(range.value)"
      >
        {{ range.label }}
      </view>
    </view>

    <!-- 核心指标卡片 -->
    <view class="stats-cards">
      <view class="stat-card main">
        <view class="stat-header">
          <text class="stat-title">平均热量</text>
          <text class="stat-trend" :class="trendClass">{{ trendText }}</text>
        </view>
        <view class="stat-value">{{ avgCalories }}</view>
        <view class="stat-unit">kcal/天</view>
        <view class="stat-target">
          目标: {{ targetCalories }} kcal
          <text class="target-percent">({{ targetPercent }}%)</text>
        </view>
      </view>

      <view class="stat-row">
        <view class="stat-card small">
          <text class="stat-title">蛋白质</text>
          <view class="stat-value">{{ avgProtein }}<text class="unit">g</text></view>
        </view>
        <view class="stat-card small">
          <text class="stat-title">碳水</text>
          <view class="stat-value">{{ avgCarbs }}<text class="unit">g</text></view>
        </view>
        <view class="stat-card small">
          <text class="stat-title">脂肪</text>
          <view class="stat-value">{{ avgFat }}<text class="unit">g</text></view>
        </view>
      </view>
    </view>

    <!-- 热量趋势图 -->
    <view class="chart-card">
      <view class="chart-title">热量趋势</view>
      <view class="chart-container">
        <view class="chart-y-axis">
          <text v-for="tick in yTicks" :key="tick" class="y-tick">{{ tick }}</text>
        </view>
        <view class="chart-area">
          <view class="chart-bars">
            <view v-for="day in chartData" :key="day.date" class="bar-wrapper">
              <view
                class="bar"
                :style="{
                  height: getBarHeight(day.calories) + '%',
                  background: getBarColor(day.calories),
                }"
              >
                <view class="bar-value">{{ day.calories }}</view>
              </view>
              <text class="bar-label">{{ day.label }}</text>
            </view>
          </view>
          <view class="target-line" :style="{ bottom: getBarHeight(targetCalories) + '%' }">
            <text class="target-label">目标</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 营养素分布 -->
    <view class="chart-card">
      <view class="chart-title">营养素分布</view>
      <view class="nutrient-bars">
        <view class="nutrient-item">
          <view class="nutrient-header">
            <text class="nutrient-name">蛋白质</text>
            <text class="nutrient-value">{{ proteinPercent }}%</text>
          </view>
          <view class="nutrient-bar">
            <view class="nutrient-fill protein" :style="{ width: proteinPercent + '%' }"></view>
          </view>
        </view>
        <view class="nutrient-item">
          <view class="nutrient-header">
            <text class="nutrient-name">碳水化合物</text>
            <text class="nutrient-value">{{ carbsPercent }}%</text>
          </view>
          <view class="nutrient-bar">
            <view class="nutrient-fill carbs" :style="{ width: carbsPercent + '%' }"></view>
          </view>
        </view>
        <view class="nutrient-item">
          <view class="nutrient-header">
            <text class="nutrient-name">脂肪</text>
            <text class="nutrient-value">{{ fatPercent }}%</text>
          </view>
          <view class="nutrient-bar">
            <view class="nutrient-fill fat" :style="{ width: fatPercent + '%' }"></view>
          </view>
        </view>
      </view>
    </view>

    <!-- 记录天数 -->
    <view class="summary-card">
      <view class="summary-item">
        <text class="summary-value">{{ recordDays }}</text>
        <text class="summary-label">记录天数</text>
      </view>
      <view class="summary-divider"></view>
      <view class="summary-item">
        <text class="summary-value">{{ totalMeals }}</text>
        <text class="summary-label">记录餐数</text>
      </view>
      <view class="summary-divider"></view>
      <view class="summary-item">
        <text class="summary-value">{{ streakDays }}</text>
        <text class="summary-label">连续打卡</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { getMealLogsByRange } from '@/api/meal-log-api';
import { calculateBMR, calculateTDEE } from '@nutriday/shared-utils';
import type { MealLog, UserProfile } from '@nutriday/shared-types';

const timeRanges = [
  { label: '7天', value: 7 },
  { label: '14天', value: 14 },
  { label: '30天', value: 30 },
];

const selectedRange = ref(7);
const mealLogs = ref<MealLog[]>([]);
const userProfile = ref<UserProfile | null>(null);

const yTicks = [2500, 2000, 1500, 1000, 500];

onShow(() => {
  const profile = uni.getStorageSync('user_profile');
  if (profile) {
    userProfile.value = profile;
  }
  loadData();
});

async function loadData() {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - (selectedRange.value - 1) * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  try {
    mealLogs.value = await getMealLogsByRange(1, startDate, endDate);
  } catch (e) {
    console.warn('获取数据失败', e);
    mealLogs.value = [];
  }
}

function selectRange(range: number) {
  selectedRange.value = range;
  loadData();
}

// 按日期分组统计
const dailyStats = computed(() => {
  const map = new Map<string, { calories: number; protein: number; carbs: number; fat: number }>();

  for (const log of mealLogs.value) {
    const existing = map.get(log.date) || { calories: 0, protein: 0, carbs: 0, fat: 0 };
    existing.calories += log.calories;
    existing.protein += log.protein;
    existing.carbs += log.carbs;
    existing.fat += log.fat;
    map.set(log.date, existing);
  }

  return map;
});

// 图表数据
const chartData = computed(() => {
  const result: { date: string; label: string; calories: number }[] = [];
  const today = new Date();

  for (let i = selectedRange.value - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const stats = dailyStats.value.get(dateStr);

    result.push({
      date: dateStr,
      label: i === 0 ? '今' : i === 1 ? '昨' : `${date.getMonth() + 1}/${date.getDate()}`,
      calories: stats?.calories || 0,
    });
  }

  return result;
});

// 平均值计算
const avgCalories = computed(() => {
  const days = Array.from(dailyStats.value.values());
  if (days.length === 0) return 0;
  return Math.round(days.reduce((sum, d) => sum + d.calories, 0) / days.length);
});

const avgProtein = computed(() => {
  const days = Array.from(dailyStats.value.values());
  if (days.length === 0) return 0;
  return Math.round(days.reduce((sum, d) => sum + d.protein, 0) / days.length);
});

const avgCarbs = computed(() => {
  const days = Array.from(dailyStats.value.values());
  if (days.length === 0) return 0;
  return Math.round(days.reduce((sum, d) => sum + d.carbs, 0) / days.length);
});

const avgFat = computed(() => {
  const days = Array.from(dailyStats.value.values());
  if (days.length === 0) return 0;
  return Math.round(days.reduce((sum, d) => sum + d.fat, 0) / days.length);
});

// 目标热量
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

const targetPercent = computed(() => {
  if (targetCalories.value === 0) return 0;
  return Math.round((avgCalories.value / targetCalories.value) * 100);
});

// 趋势分析
const trendClass = computed(() => {
  const percent = targetPercent.value;
  if (percent >= 90 && percent <= 110) return 'good';
  if (percent < 90) return 'low';
  return 'high';
});

const trendText = computed(() => {
  const percent = targetPercent.value;
  if (percent >= 90 && percent <= 110) return '达标 ✓';
  if (percent < 90) return '偏低 ↓';
  return '超标 ↑';
});

// 营养素占比
const totalMacro = computed(() => avgProtein.value * 4 + avgCarbs.value * 4 + avgFat.value * 9);

const proteinPercent = computed(() => {
  if (totalMacro.value === 0) return 0;
  return Math.round(((avgProtein.value * 4) / totalMacro.value) * 100);
});

const carbsPercent = computed(() => {
  if (totalMacro.value === 0) return 0;
  return Math.round(((avgCarbs.value * 4) / totalMacro.value) * 100);
});

const fatPercent = computed(() => {
  if (totalMacro.value === 0) return 0;
  return Math.round(((avgFat.value * 9) / totalMacro.value) * 100);
});

// 统计数据
const recordDays = computed(() => dailyStats.value.size);
const totalMeals = computed(() => mealLogs.value.length);
const streakDays = computed(() => {
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  const sortedDates = Array.from(dailyStats.value.keys()).sort().reverse();

  for (const date of sortedDates) {
    if (streak === 0 && date !== today) continue;
    const stats = dailyStats.value.get(date);
    if (stats && stats.calories > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
});

// 图表辅助函数
function getBarHeight(calories: number): number {
  const maxCal = 2500;
  return Math.min(100, (calories / maxCal) * 100);
}

function getBarColor(calories: number): string {
  const ratio = calories / targetCalories.value;
  if (ratio >= 0.9 && ratio <= 1.1) return '#00B171';
  if (ratio < 0.9) return '#f59e0b';
  return '#ef4444';
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: $nutri-dark;
  padding: 30rpx;
  padding-bottom: 60rpx;
}

.time-selector {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;

  .time-chip {
    padding: 16rpx 32rpx;
    border-radius: 30rpx;
    background: rgba(255, 255, 255, 0.6);
    font-size: 26rpx;
    color: $uni-text-color-grey;

    &.active {
      background: $nutri-primary;
      color: #fff;
    }
  }
}

.stats-cards {
  margin-bottom: 30rpx;

  .stat-card {
    @include glass-morphism;
    border-radius: 24rpx;
    padding: 30rpx;

    &.main {
      margin-bottom: 20rpx;

      .stat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16rpx;

        .stat-title {
          font-size: 28rpx;
          color: $uni-text-color-grey;
        }

        .stat-trend {
          font-size: 24rpx;
          padding: 6rpx 16rpx;
          border-radius: 20rpx;

          &.good {
            background: rgba(0, 177, 113, 0.1);
            color: #00b171;
          }

          &.low {
            background: rgba(245, 158, 11, 0.1);
            color: #f59e0b;
          }

          &.high {
            background: rgba(239, 68, 68, 0.1);
            color: #ef4444;
          }
        }
      }

      .stat-value {
        font-size: 72rpx;
        font-weight: 800;
        color: $uni-text-color;
        line-height: 1;
      }

      .stat-unit {
        font-size: 28rpx;
        color: $uni-text-color-grey;
        margin-top: 8rpx;
      }

      .stat-target {
        font-size: 24rpx;
        color: $uni-text-color-grey;
        margin-top: 16rpx;

        .target-percent {
          color: $nutri-primary;
          margin-left: 8rpx;
        }
      }
    }

    &.small {
      flex: 1;
      text-align: center;

      .stat-title {
        font-size: 24rpx;
        color: $uni-text-color-grey;
        margin-bottom: 12rpx;
      }

      .stat-value {
        font-size: 40rpx;
        font-weight: 700;
        color: $uni-text-color;

        .unit {
          font-size: 24rpx;
          font-weight: 400;
          color: $uni-text-color-grey;
        }
      }
    }
  }

  .stat-row {
    display: flex;
    gap: 20rpx;
  }
}

.chart-card {
  @include glass-morphism;
  border-radius: 24rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;

  .chart-title {
    font-size: 30rpx;
    font-weight: 600;
    color: $uni-text-color;
    margin-bottom: 30rpx;
  }
}

.chart-container {
  display: flex;
  height: 300rpx;

  .chart-y-axis {
    width: 80rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-right: 16rpx;

    .y-tick {
      font-size: 20rpx;
      color: $uni-text-color-grey;
      text-align: right;
    }
  }

  .chart-area {
    flex: 1;
    position: relative;

    .chart-bars {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      height: 100%;
      padding-bottom: 40rpx;

      .bar-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 60rpx;

        .bar {
          width: 36rpx;
          min-height: 8rpx;
          border-radius: 8rpx 8rpx 0 0;
          position: relative;
          transition: height 0.3s;

          .bar-value {
            position: absolute;
            top: -32rpx;
            left: 50%;
            transform: translateX(-50%);
            font-size: 18rpx;
            color: $uni-text-color-grey;
            white-space: nowrap;
          }
        }

        .bar-label {
          font-size: 20rpx;
          color: $uni-text-color-grey;
          margin-top: 8rpx;
        }
      }
    }

    .target-line {
      position: absolute;
      left: 0;
      right: 0;
      height: 2rpx;
      background: $nutri-primary;
      opacity: 0.5;

      .target-label {
        position: absolute;
        right: 0;
        top: -24rpx;
        font-size: 18rpx;
        color: $nutri-primary;
      }
    }
  }
}

.nutrient-bars {
  .nutrient-item {
    margin-bottom: 24rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .nutrient-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12rpx;

      .nutrient-name {
        font-size: 26rpx;
        color: $uni-text-color;
      }

      .nutrient-value {
        font-size: 26rpx;
        font-weight: 600;
        color: $uni-text-color-grey;
      }
    }

    .nutrient-bar {
      height: 16rpx;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 8rpx;
      overflow: hidden;

      .nutrient-fill {
        height: 100%;
        border-radius: 8rpx;
        transition: width 0.3s;

        &.protein {
          background: #f59e0b;
        }

        &.carbs {
          background: #3b82f6;
        }

        &.fat {
          background: #ef4444;
        }
      }
    }
  }
}

.summary-card {
  @include glass-morphism;
  border-radius: 24rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;

  .summary-item {
    flex: 1;
    text-align: center;

    .summary-value {
      display: block;
      font-size: 48rpx;
      font-weight: 700;
      color: $nutri-primary;
    }

    .summary-label {
      font-size: 24rpx;
      color: $uni-text-color-grey;
      margin-top: 8rpx;
    }
  }

  .summary-divider {
    width: 1rpx;
    height: 60rpx;
    background: rgba(0, 0, 0, 0.05);
  }
}
</style>
