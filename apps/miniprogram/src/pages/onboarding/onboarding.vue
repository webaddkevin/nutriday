<template>
  <view class="onboarding-container">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 加载状态 -->
    <view v-if="isLoading" class="loading-state">
      <view class="loading-spinner"></view>
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else class="content">
      <view class="progress-bar">
        <view class="progress-fill" :style="{ width: progressWidth }"></view>
      </view>

      <!-- Step 1: Basic Info -->
      <view v-if="currentStep === 1" class="step-content">
        <text class="title">让我们了解你</text>
        <text class="subtitle">这些信息将用于计算你的能量需求</text>

        <view class="form-group">
          <text class="label">性别</text>
          <view class="gender-selector">
            <view
              class="gender-item"
              :class="{ active: profile.gender === Gender.MALE }"
              @tap="profile.gender = Gender.MALE"
            >
              <text class="icon">♂</text>
              <text>男</text>
            </view>
            <view
              class="gender-item"
              :class="{ active: profile.gender === Gender.FEMALE }"
              @tap="profile.gender = Gender.FEMALE"
            >
              <text class="icon">♀</text>
              <text>女</text>
            </view>
          </view>
        </view>

        <view class="form-group">
          <text class="label">年龄</text>
          <input v-model="profile.age" type="number" placeholder="请输入年龄" class="input" />
        </view>

        <view class="form-row">
          <view class="form-group half">
            <text class="label">身高 (cm)</text>
            <input v-model="profile.height" type="number" placeholder="cm" class="input" />
          </view>
          <view class="form-group half">
            <text class="label">体重 (kg)</text>
            <input v-model="profile.weight" type="number" placeholder="kg" class="input" />
          </view>
        </view>
      </view>

      <!-- Step 2: Activity Level -->
      <view v-if="currentStep === 2" class="step-content">
        <text class="title">你的活动量</text>
        <text class="subtitle">选择最符合你日常活动水平的选项</text>

        <view class="activity-list">
          <view
            v-for="level in activityLevels"
            :key="level.value"
            class="activity-card"
            :class="{ active: profile.activityLevel === level.value }"
            @tap="profile.activityLevel = level.value"
          >
            <view class="activity-info">
              <text class="activity-title">{{ level.label }}</text>
              <text class="activity-desc">{{ level.desc }}</text>
            </view>
            <view class="radio-circle"></view>
          </view>
        </view>
      </view>

      <!-- Step 3: Health Goal -->
      <view v-if="currentStep === 3" class="step-content">
        <text class="title">你的健康目标</text>
        <text class="subtitle">选择一个最符合你现状的目标</text>

        <view class="goal-list">
          <view
            v-for="goal in goals"
            :key="goal.value"
            class="goal-card"
            :class="{ active: profile.goal === goal.value }"
            @tap="profile.goal = goal.value"
          >
            <view class="goal-info">
              <text class="goal-title">{{ goal.label }}</text>
              <text class="goal-desc">{{ goal.desc }}</text>
            </view>
            <view class="radio-circle"></view>
          </view>
        </view>
      </view>

      <!-- Step 4: Special Tags -->
      <view v-if="currentStep === 4" class="step-content">
        <text class="title">特殊情况</text>
        <text class="subtitle">如有特殊需求，请勾选（多选）</text>

        <view class="tag-grid">
          <view
            v-for="tag in availableTags"
            :key="tag.value"
            class="tag-item"
            :class="{ active: profile.tags.includes(tag.value) }"
            @tap="toggleTag(tag.value)"
          >
            {{ tag.label }}
          </view>
        </view>
      </view>

      <!-- Step 5: Result -->
      <view v-if="currentStep === 5" class="step-content result-step">
        <text class="title">计算完成!</text>
        <text class="subtitle">以下是根据你的资料得出的建议值</text>

        <!-- 主要结果卡片 -->
        <view class="main-result-card">
          <view class="result-header">
            <text class="result-icon">🎯</text>
            <text class="result-title">每日热量目标</text>
          </view>
          <view class="result-body">
            <text class="big-number">{{ tdee }}</text>
            <text class="unit">kcal</text>
          </view>
          <view class="result-footer">
            <text class="goal-tag">{{ goalLabel }}</text>
          </view>
        </view>

        <!-- 计算过程 -->
        <view class="calc-process">
          <text class="process-title">计算过程</text>
          <view class="process-steps">
            <view class="process-step">
              <view class="step-left">
                <text class="step-num">1</text>
              </view>
              <view class="step-right">
                <text class="step-name">基础代谢 (BMR)</text>
                <text class="step-formula">Mifflin-St Jeor 公式</text>
              </view>
              <text class="step-value">{{ bmr }} kcal</text>
            </view>
            <view class="process-step">
              <view class="step-left">
                <text class="step-num">2</text>
              </view>
              <view class="step-right">
                <text class="step-name">× 活动系数</text>
                <text class="step-formula">{{ activityLabel }}</text>
              </view>
              <text class="step-value">{{ activityCoefficient }}</text>
            </view>
            <view class="process-step">
              <view class="step-left">
                <text class="step-num">3</text>
              </view>
              <view class="step-right">
                <text class="step-name">+ 目标调整</text>
                <text class="step-formula">{{
                  calorieAdjust > 0 ? '热量盈余' : calorieAdjust < 0 ? '热量缺口' : '无调整'
                }}</text>
              </view>
              <text
                class="step-value"
                :class="{ negative: calorieAdjust < 0, positive: calorieAdjust > 0 }"
                >{{ calorieAdjust > 0 ? '+' : '' }}{{ calorieAdjust }} kcal</text
              >
            </view>
          </view>
        </view>

        <!-- 三大营养素分配 -->
        <view v-if="macros" class="macro-section">
          <text class="section-title">营养素分配</text>
          <view class="macro-cards">
            <view class="macro-card protein">
              <view class="macro-header">
                <text class="macro-icon">🥩</text>
                <text class="macro-name">蛋白质</text>
              </view>
              <text class="macro-grams">{{ macros.protein }}g</text>
              <view class="macro-bar-wrap">
                <view
                  class="macro-bar"
                  :style="{ width: (macros.proteinKcal / tdee) * 100 + '%' }"
                ></view>
              </view>
              <text class="macro-kcal">{{ Math.round((macros.proteinKcal / tdee) * 100) }}%</text>
            </view>
            <view class="macro-card carbs">
              <view class="macro-header">
                <text class="macro-icon">🍚</text>
                <text class="macro-name">碳水</text>
              </view>
              <text class="macro-grams">{{ macros.carbs }}g</text>
              <view class="macro-bar-wrap">
                <view
                  class="macro-bar"
                  :style="{ width: (macros.carbsKcal / tdee) * 100 + '%' }"
                ></view>
              </view>
              <text class="macro-kcal">{{ Math.round((macros.carbsKcal / tdee) * 100) }}%</text>
            </view>
            <view class="macro-card fat">
              <view class="macro-header">
                <text class="macro-icon">🥑</text>
                <text class="macro-name">脂肪</text>
              </view>
              <text class="macro-grams">{{ macros.fat }}g</text>
              <view class="macro-bar-wrap">
                <view
                  class="macro-bar"
                  :style="{ width: (macros.fatKcal / tdee) * 100 + '%' }"
                ></view>
              </view>
              <text class="macro-kcal">{{ Math.round((macros.fatKcal / tdee) * 100) }}%</text>
            </view>
          </view>
        </view>

        <!-- 提示信息 -->
        <view class="tips-card">
          <text class="tips-icon">💡</text>
          <text class="tips-text"
            >以上数值仅供参考，建议根据实际感受适当调整。如有特殊健康状况，请咨询专业营养师。</text
          >
        </view>
      </view>
    </view>

    <view class="footer">
      <button v-if="currentStep > 1 && currentStep < 5" class="btn btn-secondary" @tap="prevStep">
        上一步
      </button>
      <button v-if="currentStep < 5" class="btn btn-primary" :disabled="!canNext" @tap="nextStep">
        下一步
      </button>
      <button v-if="currentStep === 5" class="btn btn-primary" @tap="finish">
        开启我的营养生活
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue';
import {
  calculateBMR,
  calculateTDEE,
  calculateTargetCalories,
  calculateMacroDistribution,
} from '@nutriday/shared-utils';
import { Gender, HealthGoal, SpecialTag, ActivityLevel } from '@nutriday/shared-types';
import { saveProfile, getProfile } from '@/api/profile-api';
import { useUserStore } from '@/stores/user';
import { getToken } from '@/utils/request';

// 使用新 API 获取窗口信息
const statusBarHeight = ref(uni.getWindowInfo().statusBarHeight || 0);
const currentStep = ref(1);
const totalSteps = 5;
const isLoading = ref(true);

const profile = reactive({
  gender: Gender.MALE,
  age: undefined as number | undefined,
  height: undefined as number | undefined,
  weight: undefined as number | undefined,
  goal: HealthGoal.HEALTH_MANAGEMENT,
  tags: [] as SpecialTag[],
  activityLevel: ActivityLevel.SEDENTARY,
});

// 加载已有资料
onMounted(async () => {
  try {
    // 先尝试从本地存储加载
    const localProfile = uni.getStorageSync('user_profile');
    if (localProfile) {
      fillProfile(localProfile);
      isLoading.value = false;
      return;
    }

    // 如果已登录，从服务器加载
    const token = getToken();
    if (token) {
      try {
        const serverProfile = await getProfile();
        if (serverProfile) {
          fillProfile(serverProfile);
          // 同步到本地存储
          uni.setStorageSync('user_profile', serverProfile);
        }
      } catch (e) {
        console.warn('从服务器加载资料失败:', e);
      }
    }
  } finally {
    isLoading.value = false;
  }
});

// 填充表单数据
function fillProfile(data: {
  gender?: string;
  age?: number;
  height?: number;
  weight?: number;
  goal?: string;
  activityLevel?: number;
  tags?: string[];
}) {
  if (data.gender !== undefined) profile.gender = data.gender;
  if (data.age !== undefined) profile.age = Number(data.age);
  if (data.height !== undefined) profile.height = Number(data.height);
  if (data.weight !== undefined) profile.weight = Number(data.weight);
  if (data.goal !== undefined) profile.goal = data.goal;
  if (data.activityLevel !== undefined) profile.activityLevel = data.activityLevel;
  if (data.tags && Array.isArray(data.tags)) {
    profile.tags = data.tags;
  }
}

const goals = [
  { label: '减脂', value: HealthGoal.LOSE_FAT, desc: '合理热量差，科学瘦身' },
  { label: '增肌', value: HealthGoal.GAIN_MUSCLE, desc: '高蛋白摄入，力量增长' },
  { label: '健康管理', value: HealthGoal.HEALTH_MANAGEMENT, desc: '均衡饮食，优化体格' },
  { label: '维持现状', value: HealthGoal.MAINTAIN, desc: '保持当前体重与状态' },
];

const activityLevels = [
  { label: '久坐', value: ActivityLevel.SEDENTARY, desc: '办公室工作，很少运动' },
  { label: '轻度活跃', value: ActivityLevel.LIGHTLY_ACTIVE, desc: '每周运动 1-3 次' },
  { label: '中度活跃', value: ActivityLevel.MODERATELY_ACTIVE, desc: '每周运动 3-5 次' },
  { label: '高度活跃', value: ActivityLevel.VERY_ACTIVE, desc: '每周运动 6-7 次' },
];

const availableTags = [
  { label: '糖尿病', value: SpecialTag.DIABETES },
  { label: '高血压', value: SpecialTag.HYPERTENSION },
  { label: '孕期/哺乳期', value: SpecialTag.PREGNANCY },
  { label: '素食者', value: SpecialTag.VEGETARIAN },
];

const progressWidth = computed(() => {
  return (currentStep.value / totalSteps) * 100 + '%';
});

const canNext = computed(() => {
  if (currentStep.value === 1) {
    return profile.gender && profile.age && profile.height && profile.weight;
  }
  return true;
});

const bmr = computed(() => {
  if (!profile.age || !profile.height || !profile.weight) return 0;
  return Math.round(calculateBMR(profile.gender, profile.age, profile.height, profile.weight));
});

const baseTdee = computed(() => {
  return Math.round(calculateTDEE(bmr.value, profile.activityLevel));
});

const activityCoefficient = computed(() => {
  return profile.activityLevel;
});

const targetCalories = computed(() => {
  return calculateTargetCalories(baseTdee.value, profile.goal, profile.tags);
});

const calorieAdjust = computed(() => {
  return targetCalories.value - baseTdee.value;
});

const tdee = computed(() => {
  return targetCalories.value;
});

const macros = computed(() => {
  if (!profile.weight) return null;
  return calculateMacroDistribution(targetCalories.value, profile.weight, profile.goal);
});

const goalLabel = computed(() => {
  const goal = goals.find((g) => g.value === profile.goal);
  return goal?.label || '';
});

const activityLabel = computed(() => {
  const level = activityLevels.find((l) => l.value === profile.activityLevel);
  return level?.label || '';
});

const toggleTag = (tag: SpecialTag) => {
  const index = profile.tags.indexOf(tag);
  if (index > -1) {
    profile.tags.splice(index, 1);
  } else {
    profile.tags.push(tag);
  }
};

const nextStep = () => {
  if (currentStep.value < totalSteps) currentStep.value++;
};

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--;
};

const finish = async () => {
  // 转换并验证数据
  const age = Number(profile.age);
  const height = Number(profile.height);
  const weight = Number(profile.weight);

  // 验证必填数据
  if (!age || isNaN(age) || !height || isNaN(height) || !weight || isNaN(weight)) {
    uni.showToast({ title: '请完善基本信息', icon: 'none' });
    return;
  }

  // 检查登录状态
  const userStore = useUserStore();
  let token = getToken();

  if (!token) {
    // 未登录，先登录
    try {
      uni.showLoading({ title: '登录中...' });
      await userStore.login();
      token = getToken();
      uni.hideLoading();
    } catch (e) {
      uni.hideLoading();
      console.error('登录失败:', e);
      uni.showToast({ title: '登录失败，请重试', icon: 'none' });
      return;
    }
  }

  // 本地持久化（兜底）
  const profileData = {
    ...profile,
    age,
    height,
    weight,
    bmr: bmr.value,
    tdee: tdee.value,
    targetCalories: tdee.value,
  };
  uni.setStorageSync('user_profile', profileData);

  // 调用后端接口保存用户画像
  try {
    uni.showLoading({ title: '保存中...' });

    const saveData = {
      gender: profile.gender,
      age,
      height,
      weight,
      goal: profile.goal,
      tags: profile.tags as string[],
      activityLevel: profile.activityLevel,
      bmr: bmr.value,
      tdee: tdee.value,
      targetCalories: tdee.value,
    };

    await saveProfile(saveData);
    uni.hideLoading();
  } catch (e) {
    uni.hideLoading();
    console.warn('保存用户画像到服务器失败：', e);
    // 即使保存失败，也允许继续
  }

  uni.reLaunch({
    url: '/pages/index/index',
  });
};
</script>

<style lang="scss" scoped>
.onboarding-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 0 40rpx;
  background-color: #ffffff;
}

.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .loading-spinner {
    width: 60rpx;
    height: 60rpx;
    border: 4rpx solid #f0f0f0;
    border-top-color: #4cd964;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  .loading-text {
    margin-top: 20rpx;
    font-size: 28rpx;
    color: #999;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.progress-bar {
  height: 8rpx;
  background-color: #f0f0f0;
  border-radius: 4rpx;
  margin: 40rpx 0;

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4cd964, #28cdff);
    border-radius: 4rpx;
    transition: width 0.3s ease;
  }
}

.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;

  .title {
    font-size: 48rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 16rpx;
  }

  .subtitle {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 60rpx;
  }
}

.form-group {
  margin-bottom: 40rpx;

  .label {
    display: block;
    font-size: 30rpx;
    font-weight: 500;
    margin-bottom: 20rpx;
    color: #444;
  }
}

.gender-selector {
  display: flex;
  gap: 30rpx;

  .gender-item {
    flex: 1;
    height: 120rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f7f7f7;
    border-radius: 20rpx;
    border: 2rpx solid transparent;
    transition: all 0.2s;

    .icon {
      margin-right: 12rpx;
      font-size: 36rpx;
    }

    &.active {
      background-color: #eaffee;
      border-color: #4cd964;
      color: #4cd964;
    }
  }
}

.input {
  width: 100%;
  height: 100rpx;
  background-color: #f7f7f7;
  border-radius: 20rpx;
  padding: 0 30rpx;
  box-sizing: border-box;
}

.form-row {
  display: flex;
  gap: 30rpx;

  .half {
    flex: 1;
  }
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.activity-card {
  padding: 30rpx;
  background-color: #f7f7f7;
  border-radius: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 2rpx solid transparent;

  .activity-title {
    font-size: 32rpx;
    font-weight: 600;
    display: block;
    margin-bottom: 8rpx;
  }

  .activity-desc {
    font-size: 24rpx;
    color: #999;
  }

  .radio-circle {
    width: 40rpx;
    height: 40rpx;
    border: 4rpx solid #ddd;
    border-radius: 50%;
  }

  &.active {
    background-color: #eaffee;
    border-color: #4cd964;

    .radio-circle {
      border-color: #4cd964;
      background-color: #4cd964;
      position: relative;
      &::after {
        content: '';
        position: absolute;
        width: 16rpx;
        height: 16rpx;
        background-color: #fff;
        border-radius: 50%;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }
}

.goal-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.goal-card {
  padding: 30rpx;
  background-color: #f7f7f7;
  border-radius: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 2rpx solid transparent;

  .goal-title {
    font-size: 32rpx;
    font-weight: 600;
    display: block;
    margin-bottom: 8rpx;
  }

  .goal-desc {
    font-size: 24rpx;
    color: #999;
  }

  .radio-circle {
    width: 40rpx;
    height: 40rpx;
    border: 4rpx solid #ddd;
    border-radius: 50%;
  }

  &.active {
    background-color: #eaffee;
    border-color: #4cd964;

    .radio-circle {
      border-color: #4cd964;
      background-color: #4cd964;
      position: relative;
      &::after {
        content: '';
        position: absolute;
        width: 16rpx;
        height: 16rpx;
        background-color: #fff;
        border-radius: 50%;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }
}

.tag-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.tag-item {
  height: 100rpx;
  background-color: #f7f7f7;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  border: 2rpx solid transparent;

  &.active {
    background-color: #eaffee;
    border-color: #4cd964;
    color: #4cd964;
  }
}

// 结果页面样式
.main-result-card {
  background: linear-gradient(135deg, #00b171 0%, #00d387 100%);
  border-radius: 32rpx;
  padding: 48rpx 40rpx;
  color: white;
  text-align: center;
  margin-bottom: 32rpx;
  box-shadow: 0 12rpx 40rpx rgba(0, 177, 113, 0.3);

  .result-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    margin-bottom: 24rpx;

    .result-icon {
      font-size: 40rpx;
    }

    .result-title {
      font-size: 30rpx;
      font-weight: 500;
      opacity: 0.9;
    }
  }

  .result-body {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 8rpx;

    .big-number {
      font-size: 96rpx;
      font-weight: 700;
      line-height: 1;
    }

    .unit {
      font-size: 32rpx;
      opacity: 0.8;
    }
  }

  .result-footer {
    margin-top: 24rpx;

    .goal-tag {
      display: inline-block;
      background: rgba(255, 255, 255, 0.2);
      padding: 8rpx 24rpx;
      border-radius: 20rpx;
      font-size: 26rpx;
    }
  }
}

.calc-process {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);

  .process-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 24rpx;
    display: block;
  }

  .process-steps {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
  }

  .process-step {
    display: flex;
    align-items: center;
    padding: 20rpx;
    background: #f8f9fa;
    border-radius: 16rpx;

    .step-left {
      width: 48rpx;
      height: 48rpx;
      background: linear-gradient(135deg, #00b171, #00d387);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20rpx;

      .step-num {
        color: white;
        font-size: 24rpx;
        font-weight: 600;
      }
    }

    .step-right {
      flex: 1;

      .step-name {
        font-size: 28rpx;
        font-weight: 500;
        color: #333;
        display: block;
      }

      .step-formula {
        font-size: 22rpx;
        color: #999;
        margin-top: 4rpx;
      }
    }

    .step-value {
      font-size: 28rpx;
      font-weight: 600;
      color: #333;

      &.negative {
        color: #ef4444;
      }

      &.positive {
        color: #00b171;
      }
    }
  }
}

.macro-section {
  margin-bottom: 32rpx;

  .section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 20rpx;
    display: block;
  }

  .macro-cards {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
  }

  .macro-card {
    display: flex;
    align-items: center;
    padding: 24rpx;
    background: #fff;
    border-radius: 20rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);

    .macro-header {
      width: 140rpx;
      display: flex;
      align-items: center;
      gap: 8rpx;

      .macro-icon {
        font-size: 32rpx;
      }

      .macro-name {
        font-size: 26rpx;
        color: #666;
      }
    }

    .macro-grams {
      width: 120rpx;
      font-size: 36rpx;
      font-weight: 700;
      color: #333;
    }

    .macro-bar-wrap {
      flex: 1;
      height: 12rpx;
      background: #f0f0f0;
      border-radius: 6rpx;
      overflow: hidden;
      margin: 0 20rpx;

      .macro-bar {
        height: 100%;
        border-radius: 6rpx;
        transition: width 0.3s ease;
      }
    }

    .macro-kcal {
      width: 80rpx;
      text-align: right;
      font-size: 26rpx;
      font-weight: 500;
      color: #666;
    }

    &.protein {
      .macro-bar {
        background: linear-gradient(90deg, #ef4444, #f87171);
      }
      .macro-grams {
        color: #ef4444;
      }
    }

    &.carbs {
      .macro-bar {
        background: linear-gradient(90deg, #f59e0b, #fbbf24);
      }
      .macro-grams {
        color: #f59e0b;
      }
    }

    &.fat {
      .macro-bar {
        background: linear-gradient(90deg, #8b5cf6, #a78bfa);
      }
      .macro-grams {
        color: #8b5cf6;
      }
    }
  }
}

.tips-card {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
  padding: 24rpx;
  background: #fffbeb;
  border-radius: 20rpx;
  border: 1rpx solid #fcd34d;

  .tips-icon {
    font-size: 32rpx;
    flex-shrink: 0;
  }

  .tips-text {
    font-size: 24rpx;
    color: #92400e;
    line-height: 1.6;
  }
}

.footer {
  padding: 40rpx 0;
  display: flex;
  gap: 20rpx;

  .btn {
    flex: 1;
    height: 100rpx;
    border-radius: 50rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32rpx;
    font-weight: 600;

    &::after {
      border: none;
    }
  }

  .btn-primary {
    background-color: #4cd964;
    color: white;

    &[disabled] {
      opacity: 0.5;
    }
  }

  .btn-secondary {
    background-color: #f7f7f7;
    color: #666;
  }
}
</style>
