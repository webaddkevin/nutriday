<template>
  <view class="onboarding-container">
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <view class="content">
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

      <!-- Step 2: Health Goal -->
      <view v-if="currentStep === 2" class="step-content">
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

      <!-- Step 3: Special Tags -->
      <view v-if="currentStep === 3" class="step-content">
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

      <!-- Step 4: Result -->
      <view v-if="currentStep === 4" class="step-content result-step">
        <text class="title">计算完成!</text>
        <text class="subtitle">以下是根据你的资料得出的建议值</text>

        <view class="result-card">
          <view class="result-item">
            <text class="res-val">{{ bmr }}</text>
            <text class="res-label">基础代谢 (BMR)</text>
          </view>
          <view class="divider"></view>
          <view class="result-item">
            <text class="res-val highlight">{{ tdee }}</text>
            <text class="res-label">每日热量目标 (TDEE)</text>
          </view>
        </view>

        <view class="tips">
          <text>💡 我们建议每日摄入热量在此基础上根据目标增减 300-500 kcal。</text>
        </view>
      </view>
    </view>

    <view class="footer">
      <button v-if="currentStep > 1 && currentStep < 4" class="btn btn-secondary" @tap="prevStep">
        上一步
      </button>
      <button v-if="currentStep < 4" class="btn btn-primary" :disabled="!canNext" @tap="nextStep">
        下一步
      </button>
      <button v-if="currentStep === 4" class="btn btn-primary" @tap="finish">
        开启我的营养生活
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { calculateBMR, calculateTDEE } from '@nutriday/shared-utils';
import { Gender, HealthGoal, SpecialTag, ActivityLevel } from '@nutriday/shared-types';
import { saveProfile } from '@/api/profile-api';

const statusBarHeight = ref(uni.getSystemInfoSync().statusBarHeight || 0);
const currentStep = ref(1);

const profile = reactive({
  gender: Gender.MALE,
  age: undefined,
  height: undefined,
  weight: undefined,
  goal: HealthGoal.HEALTH_MANAGEMENT,
  tags: [] as SpecialTag[],
  activityLevel: ActivityLevel.SEDENTARY,
});

const goals = [
  { label: '减脂', value: HealthGoal.LOSE_FAT, desc: '合理热量差，科学瘦身' },
  { label: '增肌', value: HealthGoal.GAIN_MUSCLE, desc: '高蛋白摄入，力量增长' },
  { label: '健康管理', value: HealthGoal.HEALTH_MANAGEMENT, desc: '均衡饮食，优化体格' },
  { label: '维持现状', value: HealthGoal.MAINTAIN, desc: '保持当前体重与状态' },
];

const availableTags = [
  { label: '糖尿病', value: SpecialTag.DIABETES },
  { label: '高血压', value: SpecialTag.HYPERTENSION },
  { label: '孕期/哺乳期', value: SpecialTag.PREGNANCY },
  { label: '素食者', value: SpecialTag.VEGETARIAN },
];

const progressWidth = computed(() => {
  return (currentStep.value / 4) * 100 + '%';
});

const canNext = computed(() => {
  if (currentStep.value === 1) {
    return profile.gender && profile.age && profile.height && profile.weight;
  }
  return true;
});

const bmr = computed(() => {
  if (!profile.age || !profile.height || !profile.weight) return 0;
  return calculateBMR(profile.gender, profile.age, profile.height, profile.weight);
});

const tdee = computed(() => {
  return calculateTDEE(bmr.value, profile.activityLevel);
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
  if (currentStep.value < 4) currentStep.value++;
};

const prevStep = () => {
  if (currentStep.value > 1) currentStep.value--;
};

const finish = async () => {
  // 本地持久化（兜底）
  const profileData = {
    ...profile,
    bmr: bmr.value,
    tdee: tdee.value,
  };
  uni.setStorageSync('user_profile', profileData);

  // 调用后端接口保存用户画像
  try {
    await saveProfile({
      gender: profile.gender,
      age: Number(profile.age),
      height: Number(profile.height),
      weight: Number(profile.weight),
      goal: profile.goal,
      tags: profile.tags,
      activityLevel: profile.activityLevel,
      bmr: bmr.value,
      tdee: tdee.value,
    });
  } catch (e) {
    console.warn('保存用户画像到服务器失败：', e);
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

.result-card {
  background: linear-gradient(135deg, #4cd964 0%, #2ecc71 100%);
  border-radius: 32rpx;
  padding: 60rpx 40rpx;
  color: white;
  display: flex;
  align-items: center;
  margin-bottom: 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(76, 217, 100, 0.3);

  .result-item {
    flex: 1;
    text-align: center;

    .res-val {
      font-size: 48rpx;
      font-weight: bold;
      display: block;
    }

    .res-label {
      font-size: 24rpx;
      opacity: 0.8;
    }

    .highlight {
      font-size: 64rpx;
    }
  }

  .divider {
    width: 2rpx;
    height: 80rpx;
    background-color: rgba(255, 255, 255, 0.3);
  }
}

.tips {
  padding: 30rpx;
  background-color: #fdf6ec;
  border-radius: 20rpx;
  color: #e6a23c;
  font-size: 24rpx;
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
