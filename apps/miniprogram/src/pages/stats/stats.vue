<template>
  <view class="stats-page">
    <!-- 时间范围选择 -->
    <view class="time-selector">
      <view
        v-for="range in timeRanges"
        :key="range.value"
        :class="['time-chip', { active: selectedRange === range.value }]"
        @tap="selectRange(range.value)"
      >
        {{ range.label }}
      </view>
    </view>

    <!-- 核心指标 -->
    <view class="main-stats">
      <view class="calorie-card">
        <view class="calorie-header">
          <view class="calorie-info">
            <text class="calorie-label">平均热量</text>
            <text class="calorie-value">{{ avgCalories }}</text>
            <text class="calorie-unit">kcal/天</text>
          </view>
          <view class="calorie-ring">
            <view class="ring-bg"></view>
            <view class="ring-fill" :style="{ '--percent': targetPercent }"></view>
            <text class="ring-text">{{ targetPercent }}%</text>
          </view>
        </view>
        <view class="target-info">
          <text class="target-label">目标: {{ targetCalories }} kcal</text>
          <text :class="['trend-badge', trendClass]">{{ trendText }}</text>
        </view>
      </view>

      <view class="nutrient-row">
        <view class="nutrient-card protein">
          <text class="nutrient-label">蛋白质</text>
          <text class="nutrient-value">{{ avgProtein }}<text class="unit">g</text></text>
        </view>
        <view class="nutrient-card carbs">
          <text class="nutrient-label">碳水</text>
          <text class="nutrient-value">{{ avgCarbs }}<text class="unit">g</text></text>
        </view>
        <view class="nutrient-card fat">
          <text class="nutrient-label">脂肪</text>
          <text class="nutrient-value">{{ avgFat }}<text class="unit">g</text></text>
        </view>
      </view>
    </view>

    <!-- 热量趋势图 -->
    <view class="chart-card">
      <view class="chart-header">
        <text class="chart-title">热量趋势</text>
        <view class="chart-legend">
          <view class="legend-item">
            <view class="legend-dot target"></view>
            <text class="legend-text">目标</text>
          </view>
        </view>
      </view>
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
                <text class="bar-value">{{ day.calories || '' }}</text>
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
      <view class="chart-header">
        <text class="chart-title">营养素分布</text>
      </view>
      <view class="nutrient-chart">
        <view class="nutrient-bar-item">
          <view class="nutrient-header">
            <view class="nutrient-dot protein"></view>
            <text class="nutrient-name">蛋白质</text>
            <text class="nutrient-percent">{{ proteinPercent }}%</text>
          </view>
          <view class="nutrient-bar">
            <view class="nutrient-fill protein" :style="{ width: proteinPercent + '%' }"></view>
          </view>
          <text class="nutrient-gram"
            >{{ avgProtein }}g / {{ Math.round((targetCalories * 0.25) / 4) }}g</text
          >
        </view>
        <view class="nutrient-bar-item">
          <view class="nutrient-header">
            <view class="nutrient-dot carbs"></view>
            <text class="nutrient-name">碳水化合物</text>
            <text class="nutrient-percent">{{ carbsPercent }}%</text>
          </view>
          <view class="nutrient-bar">
            <view class="nutrient-fill carbs" :style="{ width: carbsPercent + '%' }"></view>
          </view>
          <text class="nutrient-gram"
            >{{ avgCarbs }}g / {{ Math.round((targetCalories * 0.5) / 4) }}g</text
          >
        </view>
        <view class="nutrient-bar-item">
          <view class="nutrient-header">
            <view class="nutrient-dot fat"></view>
            <text class="nutrient-name">脂肪</text>
            <text class="nutrient-percent">{{ fatPercent }}%</text>
          </view>
          <view class="nutrient-bar">
            <view class="nutrient-fill fat" :style="{ width: fatPercent + '%' }"></view>
          </view>
          <text class="nutrient-gram"
            >{{ avgFat }}g / {{ Math.round((targetCalories * 0.25) / 9) }}g</text
          >
        </view>
      </view>
    </view>

    <!-- 统计摘要 -->
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

    <!-- 周报卡片 -->
    <view class="weekly-card">
      <view class="weekly-header">
        <NutriIcon name="stats" size="md" color="#9b59b6" />
        <text class="weekly-title">本周概览</text>
      </view>
      <view class="weekly-stats">
        <view class="weekly-stat">
          <text class="weekly-label">总热量</text>
          <text class="weekly-value">{{ weeklyTotalCalories }}</text>
          <text class="weekly-unit">kcal</text>
        </view>
        <view class="weekly-stat">
          <text class="weekly-label">日均热量</text>
          <text class="weekly-value">{{ weeklyAvgCalories }}</text>
          <text class="weekly-unit">kcal</text>
        </view>
        <view class="weekly-stat">
          <text class="weekly-label">达标天数</text>
          <text class="weekly-value">{{ weeklyGoalDays }}</text>
          <text class="weekly-unit">天</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import NutriIcon from '@/components/NutriIcon/NutriIcon.vue';
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
    mealLogs.value = await getMealLogsByRange(startDate, endDate);
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
  return Math.round(calculateTDEE(bmr, userProfile.value.activityLevel));
});

const targetPercent = computed(() => {
  if (targetCalories.value === 0) return 0;
  return Math.min(100, Math.round((avgCalories.value / targetCalories.value) * 100));
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

// 本周统计
const weeklyTotalCalories = computed(() => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  let total = 0;
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    total += dailyStats.value.get(dateStr)?.calories || 0;
  }
  return total;
});

const weeklyAvgCalories = computed(() => {
  const daysWithData = Math.min(recordDays.value, 7);
  return daysWithData > 0 ? Math.round(weeklyTotalCalories.value / daysWithData) : 0;
});

const weeklyGoalDays = computed(() => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());

  let count = 0;
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const stats = dailyStats.value.get(dateStr);
    if (stats && stats.calories > 0) {
      const ratio = stats.calories / targetCalories.value;
      if (ratio >= 0.9 && ratio <= 1.1) count++;
    }
  }
  return count;
});

// 图表辅助函数
function getBarHeight(calories: number): number {
  const maxCal = 2500;
  return Math.min(100, (calories / maxCal) * 100);
}

function getBarColor(calories: number): string {
  const ratio = calories / targetCalories.value;
  if (ratio >= 0.9 && ratio <= 1.1) return '#00b171';
  if (ratio < 0.9) return '#f59e0b';
  return '#ef4444';
}
</script>

<style lang="scss" scoped>
.stats-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 24rpx;
  padding-bottom: 60rpx;
}

// 时间选择器
.time-selector {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;

  .time-chip {
    padding: 16rpx 32rpx;
    border-radius: 24rpx;
    background: #fff;
    font-size: 26rpx;
    color: #64748b;
    font-weight: 500;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
    transition: all 0.2s ease;

    &.active {
      background: linear-gradient(135deg, #00b171 0%, #00d387 100%);
      color: #fff;
      box-shadow: 0 4rpx 16rpx rgba(0, 177, 113, 0.3);
    }
  }
}

// 主要统计
.main-stats {
  margin-bottom: 24rpx;
}

.calorie-card {
  background: #fff;
  border-radius: 28rpx;
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);

  .calorie-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
  }

  .calorie-info {
    .calorie-label {
      display: block;
      font-size: 26rpx;
      color: #94a3b8;
      margin-bottom: 8rpx;
    }

    .calorie-value {
      font-size: 72rpx;
      font-weight: 800;
      color: #1e293b;
      line-height: 1;
    }

    .calorie-unit {
      font-size: 26rpx;
      color: #64748b;
      margin-left: 8rpx;
    }
  }

  .calorie-ring {
    width: 120rpx;
    height: 120rpx;
    position: relative;

    .ring-bg {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: #f1f5f9;
    }

    .ring-fill {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: conic-gradient(
        #00b171 0deg,
        #00b171 calc(var(--percent, 0) * 3.6deg),
        #f1f5f9 calc(var(--percent, 0) * 3.6deg)
      );

      &::before {
        content: '';
        position: absolute;
        inset: 20rpx;
        background: #fff;
        border-radius: 50%;
      }
    }

    .ring-text {
      position: absolute;
      inset: 0;
      @include flex-center;
      font-size: 28rpx;
      font-weight: 700;
      color: #00b171;
      z-index: 1;
    }
  }

  .target-info {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .target-label {
      font-size: 24rpx;
      color: #64748b;
    }

    .trend-badge {
      font-size: 24rpx;
      padding: 8rpx 20rpx;
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
}

.nutrient-row {
  display: flex;
  gap: 16rpx;

  .nutrient-card {
    flex: 1;
    background: #fff;
    border-radius: 20rpx;
    padding: 24rpx;
    text-align: center;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

    .nutrient-label {
      display: block;
      font-size: 24rpx;
      color: #94a3b8;
      margin-bottom: 8rpx;
    }

    .nutrient-value {
      font-size: 40rpx;
      font-weight: 700;
      color: #1e293b;

      .unit {
        font-size: 22rpx;
        font-weight: 400;
        color: #94a3b8;
      }
    }

    &.protein {
      border-left: 6rpx solid #f59e0b;
    }

    &.carbs {
      border-left: 6rpx solid #3b82f6;
    }

    &.fat {
      border-left: 6rpx solid #ef4444;
    }
  }
}

// 图表卡片
.chart-card {
  background: #fff;
  border-radius: 28rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .chart-title {
      font-size: 30rpx;
      font-weight: 600;
      color: #1e293b;
    }

    .chart-legend {
      display: flex;
      gap: 16rpx;

      .legend-item {
        display: flex;
        align-items: center;
        gap: 8rpx;

        .legend-dot {
          width: 12rpx;
          height: 12rpx;
          border-radius: 50%;

          &.target {
            background: #00b171;
          }
        }

        .legend-text {
          font-size: 22rpx;
          color: #94a3b8;
        }
      }
    }
  }
}

.chart-container {
  display: flex;
  height: 320rpx;

  .chart-y-axis {
    width: 80rpx;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-right: 16rpx;

    .y-tick {
      font-size: 20rpx;
      color: #94a3b8;
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
      padding-bottom: 48rpx;

      .bar-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        max-width: 60rpx;

        .bar {
          width: 32rpx;
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
            color: #94a3b8;
            white-space: nowrap;
          }
        }

        .bar-label {
          font-size: 20rpx;
          color: #94a3b8;
          margin-top: 8rpx;
        }
      }
    }

    .target-line {
      position: absolute;
      left: 0;
      right: 0;
      height: 2rpx;
      background: #00b171;
      opacity: 0.5;

      .target-label {
        position: absolute;
        right: 0;
        top: -24rpx;
        font-size: 18rpx;
        color: #00b171;
      }
    }
  }
}

// 营养素分布
.nutrient-chart {
  .nutrient-bar-item {
    margin-bottom: 24rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .nutrient-header {
      display: flex;
      align-items: center;
      gap: 12rpx;
      margin-bottom: 12rpx;

      .nutrient-dot {
        width: 12rpx;
        height: 12rpx;
        border-radius: 50%;

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

      .nutrient-name {
        flex: 1;
        font-size: 26rpx;
        color: #1e293b;
      }

      .nutrient-percent {
        font-size: 26rpx;
        font-weight: 600;
        color: #64748b;
      }
    }

    .nutrient-bar {
      height: 12rpx;
      background: #f1f5f9;
      border-radius: 6rpx;
      overflow: hidden;
      margin-bottom: 8rpx;

      .nutrient-fill {
        height: 100%;
        border-radius: 6rpx;
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

    .nutrient-gram {
      font-size: 22rpx;
      color: #94a3b8;
    }
  }
}

// 统计摘要
.summary-card {
  background: #fff;
  border-radius: 28rpx;
  padding: 28rpx;
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);

  .summary-item {
    flex: 1;
    text-align: center;

    .summary-value {
      display: block;
      font-size: 48rpx;
      font-weight: 700;
      color: #00b171;
    }

    .summary-label {
      font-size: 24rpx;
      color: #94a3b8;
      margin-top: 8rpx;
    }
  }

  .summary-divider {
    width: 1rpx;
    height: 60rpx;
    background: #f1f5f9;
  }
}

// 周报卡片
.weekly-card {
  background: linear-gradient(135deg, rgba(155, 89, 182, 0.08) 0%, rgba(155, 89, 182, 0.02) 100%);
  border: 1rpx solid rgba(155, 89, 182, 0.15);
  border-radius: 28rpx;
  padding: 28rpx;

  .weekly-header {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 24rpx;

    .weekly-title {
      font-size: 30rpx;
      font-weight: 600;
      color: #1e293b;
    }
  }

  .weekly-stats {
    display: flex;

    .weekly-stat {
      flex: 1;
      text-align: center;

      .weekly-label {
        display: block;
        font-size: 22rpx;
        color: #94a3b8;
        margin-bottom: 8rpx;
      }

      .weekly-value {
        font-size: 36rpx;
        font-weight: 700;
        color: #1e293b;
      }

      .weekly-unit {
        font-size: 20rpx;
        color: #94a3b8;
        margin-left: 4rpx;
      }
    }
  }
}
</style>
