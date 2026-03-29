<template>
  <view class="goal-page">
    <!-- 目标类型选择 -->
    <view class="card">
      <view class="card-header">
        <text class="title">选择目标</text>
      </view>
      <view class="goal-options">
        <view
          v-for="option in goalOptions"
          :key="option.value"
          :class="['goal-option', { active: goal === option.value }]"
          @click="goal = option.value"
        >
          <text class="goal-icon">{{ option.icon }}</text>
          <text class="goal-name">{{ option.label }}</text>
          <text class="goal-desc">{{ option.desc }}</text>
        </view>
      </view>
    </view>

    <!-- 目标体重 -->
    <view class="card">
      <view class="card-header">
        <text class="title">目标体重</text>
        <text class="current">当前 {{ currentWeight?.toFixed(1) || '--' }} kg</text>
      </view>
      <view class="weight-input-row">
        <button class="adjust-btn" @click="adjustTargetWeight(-0.5)">−</button>
        <view class="weight-display">
          <text class="weight-value">{{ targetWeight || '--' }}</text>
          <text class="weight-unit">kg</text>
        </view>
        <button class="adjust-btn" @click="adjustTargetWeight(0.5)">+</button>
      </view>
      <view v-if="targetWeight && currentWeight" class="weight-change">
        <text :class="['change-text', weightChangeClass]">
          {{ weightChangeText }}
        </text>
      </view>
    </view>

    <!-- 目标日期 -->
    <view class="card">
      <view class="card-header">
        <text class="title">目标日期</text>
      </view>
      <picker mode="date" :value="targetDate" :start="minDate" @change="onDateChange">
        <view class="date-picker">
          <text class="date-value">{{ targetDate || '选择日期' }}</text>
          <text class="date-arrow">›</text>
        </view>
      </picker>
      <view class="quick-dates">
        <text
          v-for="d in quickDates"
          :key="d.days"
          :class="['quick-date', { active: selectedQuickDate === d.days }]"
          @click="setQuickDate(d.days)"
        >
          {{ d.label }}
        </text>
      </view>
    </view>

    <!-- 每周目标 -->
    <view class="card">
      <view class="card-header">
        <text class="title">每周目标</text>
      </view>
      <view class="weekly-options">
        <view
          v-for="option in weeklyOptions"
          :key="option.value"
          :class="['weekly-option', { active: weeklyGoal === option.value }]"
          @click="weeklyGoal = option.value"
        >
          <text class="weekly-value">{{ option.label }}</text>
          <text class="weekly-desc">{{ option.desc }}</text>
        </view>
      </view>
    </view>

    <!-- 目标热量 -->
    <view v-if="recommendedCalories" class="card">
      <view class="card-header">
        <text class="title">每日热量目标</text>
      </view>
      <view class="calories-display">
        <text class="calories-value">{{ targetCalories || recommendedCalories }}</text>
        <text class="calories-unit">kcal</text>
      </view>
      <view class="calories-hint">
        <text class="hint-text">根据您的目标，建议每日摄入 {{ recommendedCalories }} kcal</text>
      </view>
      <view class="calories-adjust">
        <input
          v-model="targetCaloriesInput"
          type="number"
          placeholder="自定义热量目标"
          class="calories-input"
        />
        <button class="reset-btn" @click="targetCaloriesInput = ''">重置</button>
      </view>
    </view>

    <!-- 进度预览 -->
    <view v-if="canPreview" class="card preview-card">
      <view class="card-header">
        <text class="title">目标预览</text>
      </view>
      <view class="preview-content">
        <view class="preview-item">
          <text class="preview-label">需要变化</text>
          <text class="preview-value">{{ totalChange.toFixed(1) }} kg</text>
        </view>
        <view class="preview-item">
          <text class="preview-label">剩余天数</text>
          <text class="preview-value">{{ daysRemaining }} 天</text>
        </view>
        <view class="preview-item">
          <text class="preview-label">每周需变化</text>
          <text class="preview-value">{{ weeklyRequired.toFixed(2) }} kg</text>
        </view>
        <view v-if="isRealistic" class="preview-item">
          <text class="preview-label realistic">目标合理 ✓</text>
        </view>
        <view v-else class="preview-item">
          <text class="preview-label warning">目标较激进，建议调整</text>
        </view>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="save-section">
      <button class="save-btn" :disabled="saving" @click="saveGoal">
        {{ saving ? '保存中...' : '保存目标' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { getProfile, saveProfile } from '@/api/profile-api';
import { getWeightStats } from '@/api/weight-api';

const USER_ID = 1;

const loading = ref(true);
const saving = ref(false);
const profile = ref<Awaited<ReturnType<typeof getProfile>> | null>(null);
const currentWeight = ref<number | null>(null);

const goal = ref('lose_fat');
const targetWeight = ref<number | null>(null);
const targetDate = ref('');
const weeklyGoal = ref<number | null>(null);
const targetCaloriesInput = ref('');

const goalOptions = [
  { value: 'lose_fat', label: '减脂', icon: '🔥', desc: '减少体脂，塑造线条' },
  { value: 'gain_muscle', label: '增肌', icon: '💪', desc: '增加肌肉，提升力量' },
  { value: 'maintain', label: '保持', icon: '⚖️', desc: '维持体重，保持健康' },
  { value: 'health_management', label: '健康管理', icon: '❤️', desc: '改善饮食，预防疾病' },
];

const weeklyOptions = computed(() => {
  if (goal.value === 'lose_fat') {
    return [
      { value: -0.25, label: '缓慢', desc: '每周 -0.25 kg' },
      { value: -0.5, label: '适中', desc: '每周 -0.5 kg' },
      { value: -0.75, label: '快速', desc: '每周 -0.75 kg' },
    ];
  } else if (goal.value === 'gain_muscle') {
    return [
      { value: 0.25, label: '缓慢', desc: '每周 +0.25 kg' },
      { value: 0.5, label: '适中', desc: '每周 +0.5 kg' },
    ];
  }
  return [{ value: 0, label: '保持', desc: '体重不变' }];
});

const quickDates = [
  { label: '30天', days: 30 },
  { label: '60天', days: 60 },
  { label: '90天', days: 90 },
  { label: '180天', days: 180 },
];

const minDate = computed(() => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
});

const selectedQuickDate = ref<number | null>(null);

const targetCalories = computed(() => {
  if (targetCaloriesInput.value) {
    return parseInt(targetCaloriesInput.value);
  }
  return null;
});

const recommendedCalories = computed(() => {
  if (!profile.value?.tdee) return null;
  const tdee = profile.value.tdee;

  if (goal.value === 'lose_fat') {
    return Math.round(tdee - 500);
  } else if (goal.value === 'gain_muscle') {
    return Math.round(tdee + 300);
  }
  return Math.round(tdee);
});

const weightChangeText = computed(() => {
  if (!targetWeight.value || !currentWeight.value) return '';
  const diff = targetWeight.value - currentWeight.value;
  if (Math.abs(diff) < 0.1) return '体重保持不变';
  const sign = diff > 0 ? '增加' : '减少';
  return `将${sign} ${Math.abs(diff).toFixed(1)} kg`;
});

const weightChangeClass = computed(() => {
  if (!targetWeight.value || !currentWeight.value) return '';
  const diff = targetWeight.value - currentWeight.value;
  if (diff < 0) return 'lose';
  if (diff > 0) return 'gain';
  return '';
});

const canPreview = computed(() => {
  return targetWeight.value && targetDate.value && currentWeight.value;
});

const totalChange = computed(() => {
  if (!targetWeight.value || !currentWeight.value) return 0;
  return Math.abs(targetWeight.value - currentWeight.value);
});

const daysRemaining = computed(() => {
  if (!targetDate.value) return 0;
  const target = new Date(targetDate.value);
  const today = new Date();
  return Math.max(0, Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
});

const weeklyRequired = computed(() => {
  if (!canPreview.value || daysRemaining.value === 0) return 0;
  const change = targetWeight.value! - currentWeight.value!;
  return change / (daysRemaining.value / 7);
});

const isRealistic = computed(() => {
  if (!weeklyRequired.value) return true;
  return Math.abs(weeklyRequired.value) <= 1; // 每周不超过1kg
});

function adjustTargetWeight(delta: number) {
  if (!targetWeight.value) {
    targetWeight.value = (currentWeight.value || 70) + delta;
  } else {
    targetWeight.value = Math.max(30, Math.min(200, targetWeight.value + delta));
  }
}

function onDateChange(e: { detail: { value: string } }) {
  targetDate.value = e.detail.value;
  selectedQuickDate.value = null;
}

function setQuickDate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  targetDate.value = d.toISOString().split('T')[0];
  selectedQuickDate.value = days;
}

async function loadData() {
  loading.value = true;
  try {
    const [profileData, weightStats] = await Promise.all([
      getProfile(USER_ID),
      getWeightStats(USER_ID),
    ]);

    profile.value = profileData;
    currentWeight.value = weightStats.current || profileData?.weight || null;

    // 填充已有设置
    if (profileData) {
      goal.value = profileData.goal || 'lose_fat';
      targetWeight.value = profileData.targetWeight || null;
      targetDate.value = profileData.targetDate || '';
      weeklyGoal.value = profileData.weeklyGoal || null;
      if (profileData.targetCalories) {
        targetCaloriesInput.value = profileData.targetCalories.toString();
      }
    }
  } catch (e) {
    console.error('加载数据失败', e);
  } finally {
    loading.value = false;
  }
}

async function saveGoal() {
  if (!profile.value) {
    uni.showToast({ title: '请先完善基本信息', icon: 'none' });
    return;
  }

  saving.value = true;
  try {
    await saveProfile({
      userId: USER_ID,
      gender: profile.value.gender,
      age: profile.value.age,
      height: profile.value.height,
      weight: profile.value.weight,
      goal: goal.value,
      tags: profile.value.tags as string[],
      activityLevel: profile.value.activityLevel,
      bmr: profile.value.bmr,
      tdee: profile.value.tdee,
      targetWeight: targetWeight.value || undefined,
      targetDate: targetDate.value || undefined,
      weeklyGoal: weeklyGoal.value || undefined,
      targetCalories: targetCalories.value || recommendedCalories.value || undefined,
    });

    uni.showToast({ title: '保存成功', icon: 'success' });
    uni.navigateBack();
  } catch (e) {
    console.error('保存失败', e);
    uni.showToast({ title: '保存失败', icon: 'none' });
  } finally {
    saving.value = false;
  }
}

// 根据目标类型自动设置每周目标
watch(goal, () => {
  const options = weeklyOptions.value;
  if (options.length > 0 && !weeklyGoal.value) {
    weeklyGoal.value = options[Math.floor(options.length / 2)].value;
  }
});

onMounted(loadData);
</script>

<style scoped lang="scss">
.goal-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 16px;
  padding-bottom: 100px;
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

  .current {
    font-size: 14px;
    color: #999;
  }
}

.goal-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.goal-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 12px;
  border: 2px solid #eee;
  border-radius: 12px;
  transition: all 0.2s;

  &.active {
    border-color: #2ecc71;
    background: rgba(46, 204, 113, 0.05);
  }

  .goal-icon {
    font-size: 28px;
    margin-bottom: 8px;
  }

  .goal-name {
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
  }

  .goal-desc {
    font-size: 12px;
    color: #999;
    text-align: center;
  }
}

.weight-input-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-bottom: 12px;

  .adjust-btn {
    width: 44px;
    height: 44px;
    border-radius: 22px;
    background: #f5f5f5;
    border: none;
    font-size: 24px;
    color: #333;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .weight-display {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }

  .weight-value {
    font-size: 40px;
    font-weight: 600;
    color: #333;
  }

  .weight-unit {
    font-size: 16px;
    color: #999;
  }
}

.weight-change {
  text-align: center;

  .change-text {
    font-size: 14px;

    &.lose {
      color: #2ecc71;
    }
    &.gain {
      color: #e67e22;
    }
  }
}

.date-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 12px;

  .date-value {
    font-size: 16px;
    color: #333;
  }

  .date-arrow {
    font-size: 18px;
    color: #999;
  }
}

.quick-dates {
  display: flex;
  gap: 8px;

  .quick-date {
    flex: 1;
    text-align: center;
    padding: 8px;
    border-radius: 8px;
    background: #f5f5f5;
    font-size: 13px;
    color: #666;

    &.active {
      background: rgba(46, 204, 113, 0.1);
      color: #2ecc71;
    }
  }
}

.weekly-options {
  display: flex;
  gap: 12px;
}

.weekly-option {
  flex: 1;
  text-align: center;
  padding: 12px;
  border: 2px solid #eee;
  border-radius: 8px;

  &.active {
    border-color: #2ecc71;
    background: rgba(46, 204, 113, 0.05);
  }

  .weekly-value {
    display: block;
    font-size: 15px;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
  }

  .weekly-desc {
    display: block;
    font-size: 12px;
    color: #999;
  }
}

.calories-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  margin-bottom: 8px;

  .calories-value {
    font-size: 32px;
    font-weight: 600;
    color: #333;
  }

  .calories-unit {
    font-size: 14px;
    color: #999;
  }
}

.calories-hint {
  text-align: center;
  margin-bottom: 12px;

  .hint-text {
    font-size: 13px;
    color: #999;
  }
}

.calories-adjust {
  display: flex;
  gap: 8px;

  .calories-input {
    flex: 1;
    height: 40px;
    padding: 0 12px;
    border: 1px solid #eee;
    border-radius: 8px;
    font-size: 14px;
  }

  .reset-btn {
    padding: 0 16px;
    height: 40px;
    background: #f5f5f5;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    color: #666;
  }
}

.preview-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .card-header .title {
    color: #fff;
  }

  .preview-content {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .preview-item {
    text-align: center;
    padding: 12px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
  }

  .preview-label {
    display: block;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 4px;

    &.realistic {
      color: #2ecc71;
    }

    &.warning {
      color: #f39c12;
    }
  }

  .preview-value {
    display: block;
    font-size: 18px;
    font-weight: 600;
    color: #fff;
  }
}

.save-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);

  .save-btn {
    width: 100%;
    height: 48px;
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
</style>
