<template>
  <view class="water-page">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="bg-wave"></view>
    </view>

    <!-- 今日饮水卡片 -->
    <view class="today-card">
      <view class="card-header">
        <view class="header-left">
          <NutriIcon name="water" size="md" color="#00bcd4" />
          <text class="title">今日饮水</text>
        </view>
        <text class="date">{{ todayFormatted }}</text>
      </view>

      <!-- 进度环 -->
      <view class="progress-section">
        <view class="progress-ring">
          <view class="ring-bg"></view>
          <view class="ring-progress" :style="{ '--progress': progress }"></view>
          <view class="ring-center">
            <text class="amount-value">{{ todayAmount }}</text>
            <text class="amount-unit">ml</text>
          </view>
        </view>
        <view class="progress-info">
          <view class="target-row">
            <text class="target-label">目标</text>
            <text class="target-value">{{ targetAmount }} ml</text>
          </view>
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: Math.min(progress, 100) + '%' }"></view>
          </view>
          <text class="progress-percent" :class="progressClass">{{ progress }}%</text>
        </view>
      </view>

      <!-- 快捷添加 -->
      <view class="quick-add">
        <view
          v-for="option in quickOptions"
          :key="option.value"
          class="quick-btn"
          @click="quickAdd(option.value)"
        >
          <text class="quick-icon">{{ option.icon }}</text>
          <text class="quick-label">{{ option.label }}</text>
        </view>
      </view>

      <!-- 快捷减少 -->
      <view class="quick-add reduce">
        <view
          v-for="option in adjustOptions"
          :key="option.value"
          class="quick-btn reduce-btn"
          @click="quickAdd(option.value)"
        >
          <text class="quick-icon">{{ option.icon }}</text>
          <text class="quick-label">{{ option.label }}</text>
        </view>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view v-if="stats" class="stats-card">
      <view class="stats-header">
        <text class="stats-title">饮水统计</text>
      </view>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-value">{{ stats.average7d }}</text>
          <text class="stat-label">7天平均</text>
          <text class="stat-unit">ml/天</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.total7d }}</text>
          <text class="stat-label">7天总量</text>
          <text class="stat-unit">ml</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.average30d }}</text>
          <text class="stat-label">30天平均</text>
          <text class="stat-unit">ml/天</text>
        </view>
      </view>
    </view>

    <!-- 目标设置 -->
    <view class="target-card">
      <view class="card-header">
        <text class="title">每日目标</text>
      </view>
      <view class="target-options">
        <view
          v-for="option in targetOptions"
          :key="option.value"
          :class="['target-option', { active: targetAmount === option.value }]"
          @click="setTarget(option.value)"
        >
          <text class="option-value">{{ option.label }}</text>
        </view>
      </view>
      <view class="custom-section">
        <input
          v-model="customTarget"
          type="number"
          placeholder="自定义目标 (ml)"
          class="custom-input"
        />
        <button class="custom-btn" @click="setCustomTarget">设置</button>
      </view>
    </view>

    <!-- 历史记录 -->
    <view v-if="stats?.logs?.length > 0" class="history-card">
      <view class="card-header">
        <text class="title">最近记录</text>
      </view>
      <view class="history-list">
        <view v-for="log in stats.logs.slice(-7).reverse()" :key="log.id" class="history-item">
          <view class="history-left">
            <text class="history-date">{{ formatDate(log.date) }}</text>
          </view>
          <view class="history-right">
            <view class="history-bar">
              <view
                class="history-fill"
                :style="{ width: Math.min((log.amount / targetAmount) * 100, 100) + '%' }"
              />
            </view>
            <text class="history-amount">{{ log.amount }} ml</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 提示卡片 -->
    <view class="tip-card">
      <view class="tip-icon">💡</view>
      <view class="tip-content">
        <text class="tip-title">健康小贴士</text>
        <text class="tip-text">建议每天饮水 2000-2500ml，分多次饮用效果更佳</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import NutriIcon from '@/components/NutriIcon/NutriIcon.vue';
import { getWaterStats, addWater } from '@/api/water-api';

const loading = ref(true);
const stats = ref<Awaited<ReturnType<typeof getWaterStats>> | null>(null);
const targetAmount = ref(2000);
const customTarget = ref('');

const quickOptions = [
  { value: 200, label: '200ml', icon: '🥤' },
  { value: 300, label: '300ml', icon: '🥛' },
  { value: 500, label: '500ml', icon: '🍶' },
  { value: 800, label: '800ml', icon: '🫗' },
];

const adjustOptions = [
  { value: -200, label: '-200ml', icon: '➖' },
  { value: -300, label: '-300ml', icon: '➖' },
];

const targetOptions = [
  { value: 1500, label: '1500ml' },
  { value: 2000, label: '2000ml' },
  { value: 2500, label: '2500ml' },
  { value: 3000, label: '3000ml' },
];

const today = new Date();
const todayFormatted = computed(() => {
  return `${today.getMonth() + 1}月${today.getDate()}日`;
});

const todayStr = computed(() => {
  return today.toISOString().split('T')[0];
});

const todayAmount = computed(() => {
  return stats.value?.today || 0;
});

const progress = computed(() => {
  if (targetAmount.value === 0) return 0;
  return Math.min(Math.round((todayAmount.value / targetAmount.value) * 100), 100);
});

const progressClass = computed(() => {
  if (progress.value >= 100) return 'complete';
  if (progress.value >= 70) return 'good';
  return 'low';
});

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${month}/${day} ${weekdays[date.getDay()]}`;
}

async function loadData() {
  loading.value = true;
  try {
    stats.value = await getWaterStats();
  } catch (e) {
    console.error('加载饮水数据失败', e);
  } finally {
    loading.value = false;
  }
}

async function quickAdd(amount: number) {
  try {
    // 如果是减少操作，检查当前饮水量是否足够
    if (amount < 0 && todayAmount.value + amount < 0) {
      uni.showToast({ title: '饮水量不能为负数', icon: 'none' });
      return;
    }

    await addWater(todayStr.value, amount);
    const action = amount > 0 ? `+${amount}` : `${amount}`;
    uni.showToast({ title: `${action}ml`, icon: 'success' });
    await loadData();
  } catch (e) {
    console.error('添加饮水失败', e);
    uni.showToast({ title: '操作失败', icon: 'none' });
  }
}

function setTarget(value: number) {
  targetAmount.value = value;
  uni.showToast({ title: '设置成功', icon: 'success' });
}

function setCustomTarget() {
  const value = parseInt(customTarget.value);
  if (value && value >= 500 && value <= 5000) {
    targetAmount.value = value;
    customTarget.value = '';
    uni.showToast({ title: '设置成功', icon: 'success' });
  } else {
    uni.showToast({ title: '请输入500-5000之间的数值', icon: 'none' });
  }
}

onShow(loadData);
</script>

<style lang="scss" scoped>
.water-page {
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
  overflow: hidden;

  .bg-wave {
    position: absolute;
    top: -100rpx;
    left: -50rpx;
    right: -50rpx;
    height: 300rpx;
    background: linear-gradient(180deg, rgba(0, 188, 212, 0.1) 0%, transparent 100%);
    border-radius: 0 0 50% 50%;
  }
}

// 卡片通用样式
.today-card,
.stats-card,
.target-card,
.history-card,
.tip-card {
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

// 今日饮水
.progress-section {
  display: flex;
  align-items: center;
  gap: 32rpx;
  margin-bottom: 28rpx;
}

.progress-ring {
  width: 180rpx;
  height: 180rpx;
  position: relative;
  flex-shrink: 0;

  .ring-bg {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: #f1f5f9;
  }

  .ring-progress {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: conic-gradient(
      #00bcd4 0deg,
      #00bcd4 calc(var(--progress, 0) * 3.6deg),
      #f1f5f9 calc(var(--progress, 0) * 3.6deg)
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

    .amount-value {
      font-size: 48rpx;
      font-weight: 800;
      color: #00bcd4;
      line-height: 1;
    }

    .amount-unit {
      font-size: 22rpx;
      color: #94a3b8;
      margin-top: 4rpx;
    }
  }
}

.progress-info {
  flex: 1;

  .target-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12rpx;

    .target-label {
      font-size: 24rpx;
      color: #94a3b8;
    }

    .target-value {
      font-size: 24rpx;
      color: #1e293b;
      font-weight: 600;
    }
  }

  .progress-bar {
    height: 12rpx;
    background: #f1f5f9;
    border-radius: 6rpx;
    overflow: hidden;
    margin-bottom: 12rpx;

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #00bcd4 0%, #26c6da 100%);
      border-radius: 6rpx;
      transition: width 0.3s ease;
    }
  }

  .progress-percent {
    font-size: 32rpx;
    font-weight: 700;
    color: #00bcd4;

    &.complete {
      color: #00b171;
    }

    &.good {
      color: #00bcd4;
    }

    &.low {
      color: #f59e0b;
    }
  }
}

// 快捷添加
.quick-add {
  display: flex;
  gap: 16rpx;

  .quick-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20rpx 12rpx;
    background: #f8fafc;
    border-radius: 20rpx;
    transition: all 0.2s ease;

    &:active {
      background: rgba(0, 188, 212, 0.1);
      transform: scale(0.98);
    }

    .quick-icon {
      font-size: 36rpx;
      margin-bottom: 8rpx;
    }

    .quick-label {
      font-size: 24rpx;
      color: #64748b;
    }
  }

  &.reduce {
    margin-top: 16rpx;

    .reduce-btn {
      background: #fef2f2;

      &:active {
        background: rgba(239, 68, 68, 0.1);
      }

      .quick-label {
        color: #ef4444;
      }
    }
  }
}

// 统计卡片
.stats-card {
  .stats-header {
    margin-bottom: 20rpx;

    .stats-title {
      font-size: 30rpx;
      font-weight: 600;
      color: #1e293b;
    }
  }

  .stats-grid {
    display: flex;
    align-items: center;

    .stat-item {
      flex: 1;
      text-align: center;

      .stat-value {
        display: block;
        font-size: 40rpx;
        font-weight: 700;
        color: #1e293b;
      }

      .stat-label {
        display: block;
        font-size: 22rpx;
        color: #94a3b8;
        margin-top: 4rpx;
      }

      .stat-unit {
        display: block;
        font-size: 20rpx;
        color: #cbd5e1;
      }
    }

    .stat-divider {
      width: 1rpx;
      height: 80rpx;
      background: #f1f5f9;
    }
  }
}

// 目标设置
.target-options {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;

  .target-option {
    flex: 1;
    text-align: center;
    padding: 20rpx 0;
    border: 2rpx solid #e2e8f0;
    border-radius: 16rpx;
    transition: all 0.2s ease;

    &.active {
      border-color: #00bcd4;
      background: rgba(0, 188, 212, 0.08);

      .option-value {
        color: #00bcd4;
        font-weight: 600;
      }
    }

    .option-value {
      font-size: 26rpx;
      color: #64748b;
    }
  }
}

.custom-section {
  display: flex;
  gap: 16rpx;

  .custom-input {
    flex: 1;
    height: 80rpx;
    padding: 0 24rpx;
    border: 2rpx solid #e2e8f0;
    border-radius: 16rpx;
    font-size: 28rpx;
    background: #f8fafc;
  }

  .custom-btn {
    padding: 0 32rpx;
    height: 80rpx;
    background: linear-gradient(135deg, #00bcd4 0%, #26c6da 100%);
    color: #fff;
    border: none;
    border-radius: 16rpx;
    font-size: 28rpx;
    font-weight: 600;
  }
}

// 历史记录
.history-list {
  .history-item {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f8fafc;

    &:last-child {
      border-bottom: none;
    }

    .history-left {
      width: 140rpx;

      .history-date {
        font-size: 26rpx;
        color: #64748b;
      }
    }

    .history-right {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 16rpx;

      .history-bar {
        flex: 1;
        height: 10rpx;
        background: #f1f5f9;
        border-radius: 5rpx;
        overflow: hidden;

        .history-fill {
          height: 100%;
          background: #00bcd4;
          border-radius: 5rpx;
        }
      }

      .history-amount {
        font-size: 26rpx;
        color: #1e293b;
        font-weight: 500;
        width: 120rpx;
        text-align: right;
      }
    }
  }
}

// 提示卡片
.tip-card {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
  background: linear-gradient(135deg, rgba(0, 188, 212, 0.08) 0%, rgba(0, 188, 212, 0.02) 100%);
  border: 1rpx solid rgba(0, 188, 212, 0.15);

  .tip-icon {
    font-size: 40rpx;
    line-height: 1;
  }

  .tip-content {
    flex: 1;

    .tip-title {
      display: block;
      font-size: 28rpx;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 8rpx;
    }

    .tip-text {
      font-size: 24rpx;
      color: #64748b;
      line-height: 1.5;
    }
  }
}
</style>
