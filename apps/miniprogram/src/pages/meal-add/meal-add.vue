<template>
  <view class="container">
    <!-- 食物信息卡片 -->
    <view v-if="food" class="food-card shadow-glass">
      <view class="food-header">
        <view class="food-name">{{ food.name }}</view>
        <view v-if="food.nameEn" class="food-name-en">{{ food.nameEn }}</view>
        <view class="food-category">{{ food.category }}</view>
      </view>

      <view class="nutrition-grid">
        <view class="nutrition-item main">
          <text class="nutrition-value">{{ Math.round(food.calories * amountRatio) }}</text>
          <text class="nutrition-label">热量 (kcal)</text>
        </view>
        <view class="nutrition-item">
          <text class="nutrition-value">{{ (food.protein * amountRatio).toFixed(1) }}</text>
          <text class="nutrition-label">蛋白质 (g)</text>
        </view>
        <view class="nutrition-item">
          <text class="nutrition-value">{{ (food.carbs * amountRatio).toFixed(1) }}</text>
          <text class="nutrition-label">碳水 (g)</text>
        </view>
        <view class="nutrition-item">
          <text class="nutrition-value">{{ (food.fat * amountRatio).toFixed(1) }}</text>
          <text class="nutrition-label">脂肪 (g)</text>
        </view>
      </view>
    </view>

    <!-- 份量选择 -->
    <view class="amount-section">
      <view class="section-title">选择份量</view>

      <view class="quick-amounts">
        <view
          v-for="preset in presetAmounts"
          :key="preset.value"
          class="amount-chip"
          :class="{ active: amount === preset.value }"
          @tap="amount = preset.value"
        >
          {{ preset.label }}
        </view>
      </view>

      <view class="amount-slider">
        <slider
          :value="amount"
          :min="10"
          :max="500"
          :step="10"
          block-size="24"
          active-color="$nutri-primary"
          @change="onSliderChange"
        />
        <view class="amount-display">
          <input v-model="amount" type="number" class="amount-input" @blur="normalizeAmount" />
          <text class="amount-unit">克</text>
        </view>
      </view>
    </view>

    <!-- 备注 -->
    <view class="note-section">
      <view class="section-title">备注（可选）</view>
      <textarea
        v-model="note"
        class="note-input"
        placeholder="添加备注，如：少油、去皮..."
        :maxlength="100"
      />
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <button class="submit-btn" :disabled="submitting" @tap="submitLog">
        {{ submitting ? '记录中...' : '确认记录' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getFoodById } from '@/api/food-api';
import { createMealLog } from '@/api/meal-log-api';
import { requireUserId } from '@/utils/user';
import type { Food, MealType } from '@nutriday/shared-types';

const food = ref<Food | null>(null);
const amount = ref(100);
const note = ref('');
const submitting = ref(false);

let foodId = 0;
let mealType = '' as MealType;
let date = '';

const presetAmounts = [
  { label: '50g', value: 50 },
  { label: '100g', value: 100 },
  { label: '150g', value: 150 },
  { label: '200g', value: 200 },
  { label: '250g', value: 250 },
];

const amountRatio = computed(() => amount.value / 100);

onLoad(async (options) => {
  foodId = parseInt(options?.foodId || '0');
  mealType = (options?.mealType as MealType) || 'breakfast';
  date = options?.date || new Date().toISOString().split('T')[0];

  if (foodId) {
    try {
      food.value = await getFoodById(foodId);
    } catch (e) {
      console.error('获取食物信息失败', e);
      uni.showToast({ title: '获取食物信息失败', icon: 'none' });
    }
  }

  // 设置页面标题
  const mealLabels: Record<MealType, string> = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '加餐',
  };
  uni.setNavigationBarTitle({ title: `添加${mealLabels[mealType]}` });
});

function onSliderChange(e: { detail: { value: number } }) {
  amount.value = e.detail.value;
}

function normalizeAmount() {
  let val = parseInt(String(amount.value)) || 100;
  val = Math.max(10, Math.min(500, val));
  amount.value = val;
}

async function submitLog() {
  if (!food.value || submitting.value) return;

  submitting.value = true;
  try {
    await createMealLog({
      date,
      mealType,
      foodId: food.value.id,
      amount: amount.value,
      note: note.value || undefined,
    });

    uni.showToast({ title: '记录成功', icon: 'success' });

    setTimeout(() => {
      uni.navigateBack();
    }, 1000);
  } catch (e) {
    console.error('记录失败', e);
    uni.showToast({ title: '记录失败', icon: 'none' });
  } finally {
    submitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: $nutri-dark;
  padding: 30rpx;
  padding-bottom: 200rpx;
}

.shadow-glass {
  @include glass-morphism;
}

.food-card {
  border-radius: 30rpx;
  padding: 36rpx;
  margin-bottom: 40rpx;

  .food-header {
    margin-bottom: 30rpx;

    .food-name {
      font-size: 40rpx;
      font-weight: 700;
      color: $uni-text-color;
    }

    .food-name-en {
      font-size: 26rpx;
      color: $uni-text-color-grey;
      margin-top: 8rpx;
    }

    .food-category {
      display: inline-block;
      font-size: 24rpx;
      color: $nutri-primary;
      background: rgba(0, 177, 113, 0.1);
      padding: 6rpx 16rpx;
      border-radius: 10rpx;
      margin-top: 16rpx;
    }
  }

  .nutrition-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;

    .nutrition-item {
      background: rgba(0, 0, 0, 0.03);
      border-radius: 16rpx;
      padding: 24rpx;
      text-align: center;

      &.main {
        grid-column: span 2;
        background: rgba(0, 177, 113, 0.08);

        .nutrition-value {
          font-size: 56rpx;
          color: $nutri-primary;
        }
      }

      .nutrition-value {
        display: block;
        font-size: 36rpx;
        font-weight: 700;
        color: $uni-text-color;
      }

      .nutrition-label {
        display: block;
        font-size: 22rpx;
        color: $uni-text-color-grey;
        margin-top: 8rpx;
      }
    }
  }
}

.amount-section,
.note-section {
  margin-bottom: 40rpx;

  .section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: $uni-text-color;
    margin-bottom: 24rpx;
  }
}

.quick-amounts {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 30rpx;

  .amount-chip {
    padding: 16rpx 32rpx;
    border-radius: 30rpx;
    background: rgba(255, 255, 255, 0.6);
    font-size: 26rpx;
    color: $uni-text-color-grey;
    border: 2rpx solid transparent;

    &.active {
      background: rgba(0, 177, 113, 0.1);
      color: $nutri-primary;
      border-color: $nutri-primary;
    }
  }
}

.amount-slider {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 24rpx;
  padding: 30rpx;

  .amount-display {
    display: flex;
    align-items: baseline;
    justify-content: center;
    margin-top: 20rpx;

    .amount-input {
      font-size: 48rpx;
      font-weight: 700;
      color: $nutri-primary;
      width: 160rpx;
      text-align: right;
    }

    .amount-unit {
      font-size: 28rpx;
      color: $uni-text-color-grey;
      margin-left: 8rpx;
    }
  }
}

.note-input {
  width: 100%;
  min-height: 160rpx;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 20rpx;
  padding: 24rpx;
  font-size: 28rpx;
  color: $uni-text-color;
}

.submit-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 30rpx;
  background: #fff;
  box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.05);
  z-index: 100;

  .submit-btn {
    width: 100%;
    height: 96rpx;
    background: $nutri-primary;
    color: #fff;
    font-size: 32rpx;
    font-weight: 600;
    border-radius: 48rpx;
    border: none;

    &[disabled] {
      opacity: 0.6;
    }
  }
}
</style>
