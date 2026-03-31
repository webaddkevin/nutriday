<template>
  <view class="water-page">
    <!-- 今日饮水卡片 -->
    <view class="card today-card">
      <view class="card-header">
        <text class="title">今日饮水</text>
        <text class="date">{{ todayFormatted }}</text>
      </view>
      <view class="water-display">
        <view class="water-circle" :style="{ background: progressGradient }">
          <view class="water-inner">
            <text class="water-amount">{{ todayAmount }}</text>
            <text class="water-unit">ml</text>
          </view>
        </view>
        <view class="water-target">
          <text class="target-text">目标 {{ targetAmount }} ml</text>
          <text class="progress-text">已完成 {{ progress }}%</text>
        </view>
      </view>
      <view class="quick-add">
        <view
          v-for="option in quickOptions"
          :key="option.value"
          class="quick-btn"
          @click="quickAdd(option.value)"
        >
          <text class="quick-icon">{{ option.icon }}</text>
          <text class="quick-text">{{ option.label }}</text>
        </view>
      </view>
    </view>

    <!-- 统计卡片 -->
    <view v-if="stats" class="card stats-card">
      <view class="card-header">
        <text class="title">饮水统计</text>
      </view>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-value">{{ stats.average7d }}</text>
          <text class="stat-label">7天平均 (ml)</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.average30d }}</text>
          <text class="stat-label">30天平均 (ml)</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.total7d }}</text>
          <text class="stat-label">7天总量 (ml)</text>
        </view>
      </view>
    </view>

    <!-- 目标设置 -->
    <view class="card target-card">
      <view class="card-header">
        <text class="title">每日目标</text>
      </view>
      <view class="target-options">
        <view
          v-for="option in targetOptions"
          :key="option.value"
          :class="['target-option', { active: targetAmount === option.value }]"
          @click="targetAmount = option.value"
        >
          <text class="target-value">{{ option.label }}</text>
        </view>
      </view>
      <view class="custom-target">
        <input
          v-model="customTarget"
          type="number"
          placeholder="自定义目标 (ml)"
          class="target-input"
        />
        <button class="set-btn" @click="setCustomTarget">设置</button>
      </view>
    </view>

    <!-- 历史记录 -->
    <view v-if="stats?.logs?.length > 0" class="card history-card">
      <view class="card-header">
        <text class="title">历史记录</text>
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
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
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

const progressGradient = computed(() => {
  const percent = Math.min(progress.value, 100);
  if (percent < 30) {
    return `conic-gradient(#e74c3c 0% ${percent}%, #f5f5f5 ${percent}% 100%)`;
  } else if (percent < 70) {
    return `conic-gradient(#f39c12 0% ${percent}%, #f5f5f5 ${percent}% 100%)`;
  } else {
    return `conic-gradient(#2ecc71 0% ${percent}%, #f5f5f5 ${percent}% 100%)`;
  }
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
    await addWater(todayStr.value, amount);
    uni.showToast({ title: `+${amount}ml`, icon: 'success' });
    await loadData();
  } catch (e) {
    console.error('添加饮水失败', e);
    uni.showToast({ title: '添加失败', icon: 'none' });
  }
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

onMounted(loadData);
</script>

<style scoped lang="scss">
.water-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 16px;
  box-sizing: border-box;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  .date {
    font-size: 14px;
    color: #999;
  }
}

.today-card {
  .water-display {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    margin-bottom: 20px;
  }

  .water-circle {
    width: 120px;
    height: 120px;
    border-radius: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .water-inner {
    width: 100px;
    height: 100px;
    border-radius: 50px;
    background: #fff;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .water-amount {
    font-size: 28px;
    font-weight: 600;
    color: #333;
  }

  .water-unit {
    font-size: 12px;
    color: #999;
  }

  .water-target {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .target-text {
    font-size: 14px;
    color: #666;
  }

  .progress-text {
    font-size: 18px;
    font-weight: 600;
    color: #2ecc71;
  }

  .quick-add {
    display: flex;
    justify-content: space-around;
    gap: 12px;
  }

  .quick-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 8px;
    background: #f8f9fa;
    border-radius: 12px;
    transition: all 0.2s;

    &:active {
      background: #e8f5e9;
    }

    .quick-icon {
      font-size: 24px;
      margin-bottom: 4px;
    }

    .quick-text {
      font-size: 12px;
      color: #666;
    }
  }
}

.stats-card {
  .stats-grid {
    display: flex;
    justify-content: space-around;
  }

  .stat-item {
    text-align: center;
  }

  .stat-value {
    display: block;
    font-size: 24px;
    font-weight: 600;
    color: #333;
  }

  .stat-label {
    display: block;
    font-size: 12px;
    color: #999;
    margin-top: 4px;
  }
}

.target-card {
  .target-options {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }

  .target-option {
    flex: 1;
    text-align: center;
    padding: 10px;
    border: 1px solid #eee;
    border-radius: 8px;

    &.active {
      border-color: #2ecc71;
      background: rgba(46, 204, 113, 0.1);

      .target-value {
        color: #2ecc71;
      }
    }

    .target-value {
      font-size: 14px;
      color: #666;
    }
  }

  .custom-target {
    display: flex;
    gap: 8px;

    .target-input {
      flex: 1;
      height: 40px;
      padding: 0 12px;
      border: 1px solid #eee;
      border-radius: 8px;
      font-size: 14px;
    }

    .set-btn {
      padding: 0 16px;
      height: 40px;
      background: #2ecc71;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 14px;
    }
  }
}

.history-card {
  .history-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .history-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .history-left {
    width: 80px;
  }

  .history-date {
    font-size: 13px;
    color: #666;
  }

  .history-right {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .history-bar {
    flex: 1;
    height: 8px;
    background: #f0f0f0;
    border-radius: 4px;
    overflow: hidden;
  }

  .history-fill {
    height: 100%;
    background: #2ecc71;
    border-radius: 4px;
  }

  .history-amount {
    font-size: 13px;
    color: #333;
    width: 70px;
    text-align: right;
  }
}
</style>
