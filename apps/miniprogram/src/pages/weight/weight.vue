<template>
  <view class="weight-page">
    <!-- 体重输入卡片 -->
    <view class="card input-card">
      <view class="card-header">
        <text class="title">记录体重</text>
        <text class="date">{{ todayFormatted }}</text>
      </view>
      <view class="weight-input">
        <input
          v-model="weightInput"
          type="digit"
          placeholder="输入今日体重"
          class="input"
          @confirm="saveWeight"
        />
        <text class="unit">kg</text>
      </view>
      <textarea v-model="noteInput" placeholder="备注（可选）" class="note-input" maxlength="100" />
      <button class="save-btn" :disabled="saving" @click="saveWeight">
        {{ saving ? '保存中...' : '保存' }}
      </button>
    </view>

    <!-- 统计卡片 -->
    <view v-if="stats" class="card stats-card">
      <view class="card-header">
        <text class="title">体重趋势</text>
      </view>
      <view class="stats-grid">
        <view class="stat-item">
          <text class="stat-value">{{ stats.current?.toFixed(1) || '--' }}</text>
          <text class="stat-label">当前体重</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.lowest?.toFixed(1) || '--' }}</text>
          <text class="stat-label">最低体重</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ stats.highest?.toFixed(1) || '--' }}</text>
          <text class="stat-label">最高体重</text>
        </view>
      </view>
      <view class="change-row">
        <view class="change-item">
          <text :class="['change-value', getChangeClass(stats.change7d)]">
            {{ formatChange(stats.change7d) }}
          </text>
          <text class="change-label">7天变化</text>
        </view>
        <view class="change-item">
          <text :class="['change-value', getChangeClass(stats.change30d)]">
            {{ formatChange(stats.change30d) }}
          </text>
          <text class="change-label">30天变化</text>
        </view>
      </view>
    </view>

    <!-- 趋势图表 -->
    <view v-if="stats?.logs?.length > 0" class="card chart-card">
      <view class="card-header">
        <text class="title">体重曲线</text>
        <view class="period-tabs">
          <text
            v-for="p in periods"
            :key="p.value"
            :class="['tab', { active: period === p.value }]"
            @click="period = p.value"
          >
            {{ p.label }}
          </text>
        </view>
      </view>
      <view class="chart-container">
        <canvas id="weightChart" canvas-id="weightChart" class="chart" @touchstart="onChartTouch" />
      </view>
    </view>

    <!-- 历史记录 -->
    <view v-if="stats?.logs?.length > 0" class="card history-card">
      <view class="card-header">
        <text class="title">历史记录</text>
      </view>
      <view class="history-list">
        <view v-for="log in displayLogs" :key="log.id" class="history-item" @click="editLog(log)">
          <view class="history-left">
            <text class="history-date">{{ formatDate(log.date) }}</text>
            <text v-if="log.note" class="history-note">{{ log.note }}</text>
          </view>
          <view class="history-right">
            <text class="history-weight">{{ log.weight.toFixed(1) }} kg</text>
            <text class="delete-btn" @click.stop="deleteLog(log)">删除</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="!stats?.logs?.length && !loading" class="empty-state">
      <text class="empty-icon">📊</text>
      <text class="empty-text">还没有体重记录</text>
      <text class="empty-hint">开始记录你的体重变化吧</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import {
  getWeightStats,
  saveWeight as saveWeightApi,
  deleteWeight as deleteWeightApi,
  type WeightLog,
  type WeightStats,
} from '../../api/weight-api';

const USER_ID = 1;

const loading = ref(true);
const saving = ref(false);
const weightInput = ref('');
const noteInput = ref('');
const stats = ref<WeightStats | null>(null);
const period = ref(7);

const periods = [
  { label: '7天', value: 7 },
  { label: '14天', value: 14 },
  { label: '30天', value: 30 },
];

const today = new Date();
const todayFormatted = computed(() => {
  return `${today.getMonth() + 1}月${today.getDate()}日`;
});

const todayStr = computed(() => {
  return today.toISOString().split('T')[0];
});

const displayLogs = computed(() => {
  if (!stats.value?.logs) return [];
  return stats.value.logs.slice(-period.value).reverse();
});

function formatChange(change: number | null): string {
  if (change === null) return '--';
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(1)} kg`;
}

function getChangeClass(change: number | null): string {
  if (change === null) return 'neutral';
  if (change < 0) return 'down';
  if (change > 0) return 'up';
  return 'neutral';
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${month}月${day}日 ${weekdays[date.getDay()]}`;
}

async function loadData() {
  loading.value = true;
  try {
    stats.value = await getWeightStats(USER_ID);
    // 如果今天有记录，填充到输入框
    const todayLog = stats.value?.logs?.find((l) => l.date === todayStr.value);
    if (todayLog) {
      weightInput.value = todayLog.weight.toString();
      noteInput.value = todayLog.note || '';
    }
  } catch (e) {
    console.error('加载体重数据失败', e);
  } finally {
    loading.value = false;
  }
}

async function saveWeight() {
  const weight = parseFloat(weightInput.value);
  if (!weight || weight < 20 || weight > 300) {
    uni.showToast({ title: '请输入有效体重', icon: 'none' });
    return;
  }

  saving.value = true;
  try {
    await saveWeightApi({
      userId: USER_ID,
      date: todayStr.value,
      weight,
      note: noteInput.value || undefined,
    });
    uni.showToast({ title: '保存成功', icon: 'success' });
    await loadData();
    drawChart();
  } catch (e) {
    console.error('保存体重失败', e);
    uni.showToast({ title: '保存失败', icon: 'none' });
  } finally {
    saving.value = false;
  }
}

async function deleteLog(log: WeightLog) {
  const res = await uni.showModal({
    title: '确认删除',
    content: `确定删除 ${formatDate(log.date)} 的记录吗？`,
  });
  if (!res.confirm) return;

  try {
    await deleteWeightApi(USER_ID, log.date);
    uni.showToast({ title: '删除成功', icon: 'success' });
    await loadData();
    drawChart();
  } catch (e) {
    console.error('删除失败', e);
    uni.showToast({ title: '删除失败', icon: 'none' });
  }
}

function editLog(_log: WeightLog) {
  // TODO: 跳转到编辑页面或弹出编辑框
  uni.showToast({ title: '长按可删除', icon: 'none' });
}

function onChartTouch(_e: unknown) {
  // TODO: 实现触摸显示具体数值
}

function drawChart() {
  if (!stats.value?.logs?.length) return;

  const logs = stats.value.logs.slice(-period.value);
  if (logs.length < 2) return;

  const ctx = uni.createCanvasContext('weightChart');
  const width = uni.getSystemInfoSync().windowWidth - 64;
  const height = 200;
  const padding = 20;

  // 计算数据范围
  const weights = logs.map((l) => l.weight);
  const minWeight = Math.floor(Math.min(...weights) - 1);
  const maxWeight = Math.ceil(Math.max(...weights) + 1);
  const weightRange = maxWeight - minWeight;

  // 绘制背景网格
  ctx.setStrokeStyle('#f0f0f0');
  ctx.setLineWidth(1);
  for (let i = 0; i <= 4; i++) {
    const y = padding + (height - padding * 2) * (i / 4);
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
  }
  ctx.stroke();

  // 绘制折线
  ctx.setStrokeStyle('#2ECC71');
  ctx.setLineWidth(2);
  ctx.beginPath();

  logs.forEach((log, i) => {
    const x = padding + (width - padding * 2) * (i / (logs.length - 1));
    const y = padding + (height - padding * 2) * (1 - (log.weight - minWeight) / weightRange);
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.stroke();

  // 绘制数据点
  ctx.setFillStyle('#2ECC71');
  logs.forEach((log, i) => {
    const x = padding + (width - padding * 2) * (i / (logs.length - 1));
    const y = padding + (height - padding * 2) * (1 - (log.weight - minWeight) / weightRange);
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();
  });

  ctx.draw();
}

watch(period, () => {
  drawChart();
});

onMounted(async () => {
  await loadData();
  setTimeout(drawChart, 100);
});
</script>

<style scoped lang="scss">
.weight-page {
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

.input-card {
  .weight-input {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    .input {
      flex: 1;
      font-size: 32px;
      font-weight: 600;
      color: #333;
      text-align: center;
    }

    .unit {
      font-size: 16px;
      color: #999;
      margin-left: 8px;
    }
  }

  .note-input {
    width: 100%;
    height: 60px;
    padding: 12px;
    border: 1px solid #eee;
    border-radius: 8px;
    font-size: 14px;
    box-sizing: border-box;
    margin-bottom: 12px;
  }

  .save-btn {
    width: 100%;
    height: 44px;
    background: #2ecc71;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;

    &[disabled] {
      background: #ccc;
    }
  }
}

.stats-card {
  .stats-grid {
    display: flex;
    justify-content: space-around;
    margin-bottom: 16px;
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

  .change-row {
    display: flex;
    justify-content: space-around;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
  }

  .change-item {
    text-align: center;
  }

  .change-value {
    display: block;
    font-size: 18px;
    font-weight: 600;

    &.down {
      color: #2ecc71;
    }
    &.up {
      color: #e74c3c;
    }
    &.neutral {
      color: #999;
    }
  }

  .change-label {
    display: block;
    font-size: 12px;
    color: #999;
    margin-top: 4px;
  }
}

.chart-card {
  .period-tabs {
    display: flex;
    gap: 8px;
  }

  .tab {
    font-size: 12px;
    color: #999;
    padding: 4px 8px;
    border-radius: 4px;

    &.active {
      color: #2ecc71;
      background: rgba(46, 204, 113, 0.1);
    }
  }

  .chart-container {
    width: 100%;
    height: 200px;
  }

  .chart {
    width: 100%;
    height: 200px;
  }
}

.history-card {
  .history-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .history-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }

  .history-left {
    display: flex;
    flex-direction: column;
  }

  .history-date {
    font-size: 14px;
    color: #333;
  }

  .history-note {
    font-size: 12px;
    color: #999;
    margin-top: 4px;
  }

  .history-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .history-weight {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  .delete-btn {
    font-size: 12px;
    color: #e74c3c;
    padding: 4px 8px;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 0;

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .empty-text {
    font-size: 16px;
    color: #333;
    margin-bottom: 8px;
  }

  .empty-hint {
    font-size: 14px;
    color: #999;
  }
}
</style>
