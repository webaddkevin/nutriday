<template>
  <view class="weight-page">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="bg-circle"></view>
    </view>

    <!-- 今日体重卡片 -->
    <view class="today-card">
      <view class="card-header">
        <view class="header-left">
          <NutriIcon name="weight" size="md" color="#1abc9c" />
          <text class="title">今日体重</text>
        </view>
        <text class="date">{{ todayFormatted }}</text>
      </view>

      <view class="weight-display">
        <view class="weight-value-wrap">
          <text class="weight-value">{{ todayWeight || '--' }}</text>
          <text class="weight-unit">kg</text>
        </view>
        <view v-if="weightChange !== null" class="weight-change" :class="changeClass">
          <text class="change-icon">{{ weightChange >= 0 ? '↑' : '↓' }}</text>
          <text class="change-value">{{ Math.abs(weightChange).toFixed(1) }} kg</text>
        </view>
      </view>

      <view class="weight-input-section">
        <view class="input-row">
          <input v-model="newWeight" type="digit" placeholder="输入今日体重" class="weight-input" />
          <text class="input-unit">kg</text>
        </view>
        <button class="save-btn" @click="saveWeight">
          <text class="btn-text">记录体重</text>
        </button>
      </view>
    </view>

    <!-- 目标卡片 -->
    <view v-if="userProfile" class="goal-card">
      <view class="goal-header">
        <NutriIcon name="target" size="md" color="#3498db" />
        <text class="goal-title">目标体重</text>
      </view>
      <view class="goal-content">
        <view class="goal-item">
          <text class="goal-label">当前</text>
          <text class="goal-value">{{ todayWeight || userProfile.weight }} kg</text>
        </view>
        <view class="goal-arrow">
          <text class="arrow-text">→</text>
        </view>
        <view class="goal-item">
          <text class="goal-label">目标</text>
          <text class="goal-value target">{{ targetWeight }} kg</text>
        </view>
      </view>
      <view class="goal-progress">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: goalProgress + '%' }"></view>
        </view>
        <text class="progress-text">距离目标还差 {{ remainingWeight }} kg</text>
      </view>
    </view>

    <!-- 趋势图 -->
    <view class="chart-card">
      <view class="chart-header">
        <text class="chart-title">体重趋势</text>
        <view class="chart-tabs">
          <view
            v-for="tab in chartTabs"
            :key="tab.value"
            :class="['chart-tab', { active: selectedTab === tab.value }]"
            @click="selectedTab = tab.value"
          >
            {{ tab.label }}
          </view>
        </view>
      </view>
      <view class="chart-container">
        <view v-if="weightLogs.length > 0" class="weight-chart">
          <view class="chart-line">
            <view
              v-for="(log, index) in chartData"
              :key="log.date"
              class="chart-point"
              :style="{
                left: (index / (chartData.length - 1)) * 100 + '%',
                bottom: getPointBottom(log.weight) + '%',
              }"
            >
              <view class="point-dot"></view>
              <text class="point-value">{{ log.weight }}</text>
            </view>
          </view>
          <view class="chart-x-axis">
            <text
              v-for="log in chartData.filter((_, i) => i % 7 === 0)"
              :key="log.date"
              class="x-label"
            >
              {{ formatDateShort(log.date) }}
            </text>
          </view>
        </view>
        <view v-else class="empty-chart">
          <text class="empty-text">暂无数据</text>
          <text class="empty-hint">开始记录体重吧</text>
        </view>
      </view>
    </view>

    <!-- 历史记录 -->
    <view v-if="weightLogs.length > 0" class="history-card">
      <view class="card-header">
        <text class="title">历史记录</text>
      </view>
      <view class="history-list">
        <view v-for="log in weightLogs.slice(-10).reverse()" :key="log.id" class="history-item">
          <view class="history-left">
            <text class="history-date">{{ formatDate(log.date) }}</text>
          </view>
          <view class="history-right">
            <text class="history-weight">{{ log.weight }} kg</text>
            <view v-if="log.bmi" class="bmi-badge" :class="getBmiClass(log.bmi)">
              BMI {{ log.bmi }}
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- BMI 说明 -->
    <view class="bmi-card">
      <view class="bmi-header">
        <text class="bmi-title">BMI 参考范围</text>
      </view>
      <view class="bmi-ranges">
        <view class="bmi-range underweight">
          <text class="range-label">偏瘦</text>
          <text class="range-value">&lt; 18.5</text>
        </view>
        <view class="bmi-range normal">
          <text class="range-label">正常</text>
          <text class="range-value">18.5 - 24</text>
        </view>
        <view class="bmi-range overweight">
          <text class="range-label">超重</text>
          <text class="range-value">24 - 28</text>
        </view>
        <view class="bmi-range obese">
          <text class="range-label">肥胖</text>
          <text class="range-value">&gt; 28</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import NutriIcon from '@/components/NutriIcon/NutriIcon.vue';
import { getWeightLogs, saveWeightLog, type WeightLog } from '@/api/weight-api';
import type { UserProfile } from '@nutriday/shared-types';

const userProfile = ref<UserProfile | null>(null);
const weightLogs = ref<WeightLog[]>([]);
const newWeight = ref('');
const selectedTab = ref(30);

const chartTabs = [
  { label: '7天', value: 7 },
  { label: '30天', value: 30 },
  { label: '90天', value: 90 },
];

const today = new Date();
const todayFormatted = computed(() => {
  return `${today.getMonth() + 1}月${today.getDate()}日`;
});

const todayStr = computed(() => today.toISOString().split('T')[0]);

const todayWeight = computed(() => {
  const todayLog = weightLogs.value.find((log) => log.date === todayStr.value);
  return todayLog?.weight || null;
});

const weightChange = computed(() => {
  if (weightLogs.value.length < 2) return null;
  const sorted = [...weightLogs.value].sort((a, b) => b.date.localeCompare(a.date));
  return sorted[0].weight - sorted[1].weight;
});

const changeClass = computed(() => {
  if (weightChange.value === null) return '';
  return weightChange.value >= 0 ? 'increase' : 'decrease';
});

const targetWeight = computed(() => {
  if (!userProfile.value) return 60;
  // 根据目标计算目标体重
  const currentWeight = userProfile.value.weight;
  const goal = userProfile.value.goal;

  if (goal === 'lose') return Math.max(currentWeight - 5, 45);
  if (goal === 'gain') return currentWeight + 5;
  return currentWeight;
});

const goalProgress = computed(() => {
  if (!userProfile.value || !todayWeight.value) return 0;
  const startWeight = userProfile.value.weight;
  const target = targetWeight.value;
  const current = todayWeight.value;

  if (startWeight === target) return 100;
  const progress = Math.abs((current - startWeight) / (target - startWeight)) * 100;
  return Math.min(100, Math.max(0, progress));
});

const remainingWeight = computed(() => {
  if (!todayWeight.value) return Math.abs(targetWeight.value - (userProfile.value?.weight || 0));
  return Math.abs(targetWeight.value - todayWeight.value);
});

const chartData = computed(() => {
  const days = selectedTab.value;
  const result: { date: string; weight: number }[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const log = weightLogs.value.find((l) => l.date === dateStr);

    if (log) {
      result.push({ date: dateStr, weight: log.weight });
    }
  }

  return result;
});

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${month}月${day}日 ${weekdays[date.getDay()]}`;
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function getPointBottom(weight: number): number {
  if (chartData.value.length === 0) return 0;
  const weights = chartData.value.map((d) => d.weight);
  const min = Math.min(...weights) - 1;
  const max = Math.max(...weights) + 1;
  return ((weight - min) / (max - min)) * 80 + 10;
}

function getBmiClass(bmi: number): string {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 24) return 'normal';
  if (bmi < 28) return 'overweight';
  return 'obese';
}

async function loadData() {
  try {
    weightLogs.value = await getWeightLogs();
  } catch (e) {
    console.error('加载体重数据失败', e);
  }
}

async function saveWeight() {
  const weight = parseFloat(newWeight.value);
  if (!weight || weight < 30 || weight > 200) {
    uni.showToast({ title: '请输入有效体重', icon: 'none' });
    return;
  }

  try {
    await saveWeightLog({
      date: todayStr.value,
      weight,
    });
    newWeight.value = '';
    uni.showToast({ title: '记录成功', icon: 'success' });
    await loadData();
  } catch (e) {
    console.error('保存失败', e);
    uni.showToast({ title: '保存失败', icon: 'none' });
  }
}

onMounted(() => {
  const profile = uni.getStorageSync('user_profile');
  if (profile) {
    userProfile.value = profile;
  }
  loadData();
});
</script>

<style lang="scss" scoped>
.weight-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 24rpx;
  padding-bottom: 60rpx;
  position: relative;
}

// 背景装饰
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 400rpx;
  pointer-events: none;

  .bg-circle {
    position: absolute;
    width: 300rpx;
    height: 300rpx;
    background: radial-gradient(circle, rgba(26, 188, 156, 0.1) 0%, transparent 70%);
    top: -50rpx;
    right: -50rpx;
  }
}

// 卡片通用样式
.today-card,
.goal-card,
.chart-card,
.history-card,
.bmi-card {
  background: #fff;
  border-radius: 28rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
  position: relative;
  z-index: 1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1e293b;
  }

  .date {
    font-size: 26rpx;
    color: #94a3b8;
  }
}

// 今日体重
.weight-display {
  display: flex;
  align-items: baseline;
  gap: 24rpx;
  margin-bottom: 28rpx;

  .weight-value-wrap {
    display: flex;
    align-items: baseline;

    .weight-value {
      font-size: 80rpx;
      font-weight: 800;
      color: #1e293b;
      line-height: 1;
    }

    .weight-unit {
      font-size: 28rpx;
      color: #64748b;
      margin-left: 8rpx;
    }
  }

  .weight-change {
    display: flex;
    align-items: center;
    gap: 4rpx;
    padding: 8rpx 16rpx;
    border-radius: 16rpx;

    &.increase {
      background: rgba(239, 68, 68, 0.1);

      .change-icon,
      .change-value {
        color: #ef4444;
      }
    }

    &.decrease {
      background: rgba(0, 177, 113, 0.1);

      .change-icon,
      .change-value {
        color: #00b171;
      }
    }

    .change-icon {
      font-size: 24rpx;
    }

    .change-value {
      font-size: 24rpx;
      font-weight: 600;
    }
  }
}

.weight-input-section {
  .input-row {
    display: flex;
    align-items: center;
    background: #f8fafc;
    border-radius: 20rpx;
    padding: 0 24rpx;
    margin-bottom: 20rpx;

    .weight-input {
      flex: 1;
      height: 88rpx;
      font-size: 36rpx;
      font-weight: 600;
      color: #1e293b;
    }

    .input-unit {
      font-size: 28rpx;
      color: #94a3b8;
    }
  }

  .save-btn {
    width: 100%;
    height: 88rpx;
    background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%);
    border: none;
    border-radius: 20rpx;

    .btn-text {
      color: #fff;
      font-size: 30rpx;
      font-weight: 600;
    }
  }
}

// 目标卡片
.goal-card {
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.08) 0%, rgba(52, 152, 219, 0.02) 100%);
  border: 1rpx solid rgba(52, 152, 219, 0.15);

  .goal-header {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 20rpx;

    .goal-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #1e293b;
    }
  }

  .goal-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 32rpx;
    margin-bottom: 24rpx;

    .goal-item {
      text-align: center;

      .goal-label {
        display: block;
        font-size: 24rpx;
        color: #94a3b8;
        margin-bottom: 8rpx;
      }

      .goal-value {
        font-size: 36rpx;
        font-weight: 700;
        color: #1e293b;

        &.target {
          color: #3498db;
        }
      }
    }

    .goal-arrow {
      .arrow-text {
        font-size: 32rpx;
        color: #cbd5e1;
      }
    }
  }

  .goal-progress {
    .progress-bar {
      height: 12rpx;
      background: #e2e8f0;
      border-radius: 6rpx;
      overflow: hidden;
      margin-bottom: 12rpx;

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #3498db 0%, #2980b9 100%);
        border-radius: 6rpx;
        transition: width 0.3s ease;
      }
    }

    .progress-text {
      font-size: 24rpx;
      color: #64748b;
      text-align: center;
      display: block;
    }
  }
}

// 趋势图
.chart-card {
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

    .chart-tabs {
      display: flex;
      gap: 8rpx;

      .chart-tab {
        padding: 8rpx 20rpx;
        font-size: 24rpx;
        color: #94a3b8;
        border-radius: 16rpx;
        transition: all 0.2s ease;

        &.active {
          background: #1abc9c;
          color: #fff;
        }
      }
    }
  }

  .chart-container {
    height: 300rpx;
    position: relative;
  }

  .weight-chart {
    height: 100%;
    position: relative;

    .chart-line {
      position: absolute;
      inset: 0;
    }

    .chart-point {
      position: absolute;
      transform: translateX(-50%);

      .point-dot {
        width: 16rpx;
        height: 16rpx;
        background: #1abc9c;
        border-radius: 50%;
        border: 4rpx solid #fff;
        box-shadow: 0 2rpx 8rpx rgba(26, 188, 156, 0.3);
      }

      .point-value {
        position: absolute;
        top: -32rpx;
        left: 50%;
        transform: translateX(-50%);
        font-size: 20rpx;
        color: #64748b;
        white-space: nowrap;
      }
    }

    .chart-x-axis {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;

      .x-label {
        font-size: 20rpx;
        color: #94a3b8;
      }
    }
  }

  .empty-chart {
    height: 100%;
    @include flex-center;
    flex-direction: column;

    .empty-text {
      font-size: 28rpx;
      color: #94a3b8;
    }

    .empty-hint {
      font-size: 24rpx;
      color: #cbd5e1;
      margin-top: 8rpx;
    }
  }
}

// 历史记录
.history-list {
  .history-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f8fafc;

    &:last-child {
      border-bottom: none;
    }

    .history-left {
      .history-date {
        font-size: 26rpx;
        color: #64748b;
      }
    }

    .history-right {
      display: flex;
      align-items: center;
      gap: 16rpx;

      .history-weight {
        font-size: 30rpx;
        font-weight: 600;
        color: #1e293b;
      }

      .bmi-badge {
        font-size: 22rpx;
        padding: 4rpx 12rpx;
        border-radius: 12rpx;

        &.underweight {
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        }

        &.normal {
          background: rgba(0, 177, 113, 0.1);
          color: #00b171;
        }

        &.overweight {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        &.obese {
          background: rgba(220, 38, 38, 0.1);
          color: #dc2626;
        }
      }
    }
  }
}

// BMI 说明
.bmi-card {
  .bmi-header {
    margin-bottom: 20rpx;

    .bmi-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #1e293b;
    }
  }

  .bmi-ranges {
    display: flex;
    gap: 12rpx;

    .bmi-range {
      flex: 1;
      text-align: center;
      padding: 16rpx 8rpx;
      border-radius: 12rpx;

      .range-label {
        display: block;
        font-size: 22rpx;
        margin-bottom: 4rpx;
      }

      .range-value {
        display: block;
        font-size: 20rpx;
      }

      &.underweight {
        background: rgba(245, 158, 11, 0.1);
        .range-label,
        .range-value {
          color: #f59e0b;
        }
      }

      &.normal {
        background: rgba(0, 177, 113, 0.1);
        .range-label,
        .range-value {
          color: #00b171;
        }
      }

      &.overweight {
        background: rgba(239, 68, 68, 0.1);
        .range-label,
        .range-value {
          color: #ef4444;
        }
      }

      &.obese {
        background: rgba(220, 38, 38, 0.1);
        .range-label,
        .range-value {
          color: #dc2626;
        }
      }
    }
  }
}
</style>
