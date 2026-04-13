<template>
  <view class="compare-page">
    <!-- 食物选择区 -->
    <view class="food-selector">
      <view
        v-for="(food, index) in selectedFoods"
        :key="index"
        class="food-slot"
        :class="{ filled: food }"
        @tap="openFoodSearch(index)"
      >
        <view v-if="food" class="food-preview">
          <text class="food-name">{{ food.name }}</text>
          <text class="food-category">{{ food.category }}</text>
          <view class="remove-btn" @tap.stop="removeFood(index)">
            <text class="remove-icon">×</text>
          </view>
        </view>
        <view v-else class="add-food">
          <text class="add-icon">+</text>
          <text class="add-text">添加食物</text>
        </view>
      </view>
    </view>

    <!-- 对比结果 -->
    <view v-if="validFoods.length >= 2" class="compare-result">
      <!-- 热量对比 -->
      <view class="compare-section">
        <view class="section-header">
          <text class="section-title">热量对比</text>
          <text class="section-unit">kcal / 100g</text>
        </view>
        <view class="bar-chart">
          <view v-for="(food, index) in validFoods" :key="index" class="bar-item">
            <view class="bar-label">{{ food.name }}</view>
            <view class="bar-wrapper">
              <view
                class="bar-fill"
                :style="{
                  width: getBarWidth(food.calories, 'calories') + '%',
                  background: getBarColor(index),
                }"
              >
                <text class="bar-value">{{ food.calories }}</text>
              </view>
            </view>
          </view>
        </view>
        <view v-if="calorieWinner" class="winner-hint">
          <text class="hint-icon">🏆</text>
          <text class="hint-text">{{ calorieWinner.name }} 热量最高</text>
        </view>
      </view>

      <!-- 营养素对比 -->
      <view class="compare-section">
        <view class="section-header">
          <text class="section-title">营养素对比</text>
        </view>

        <view class="nutrient-compare">
          <!-- 蛋白质 -->
          <view class="nutrient-row">
            <text class="nutrient-label">蛋白质</text>
            <view class="nutrient-bars">
              <view v-for="(food, index) in validFoods" :key="index" class="nutrient-bar-item">
                <view
                  class="nutrient-fill"
                  :style="{
                    width: getBarWidth(food.protein, 'protein') + '%',
                    background: getBarColor(index),
                  }"
                />
                <text class="nutrient-value">{{ food.protein }}g</text>
              </view>
            </view>
          </view>

          <!-- 碳水 -->
          <view class="nutrient-row">
            <text class="nutrient-label">碳水</text>
            <view class="nutrient-bars">
              <view v-for="(food, index) in validFoods" :key="index" class="nutrient-bar-item">
                <view
                  class="nutrient-fill"
                  :style="{
                    width: getBarWidth(food.carbs, 'carbs') + '%',
                    background: getBarColor(index),
                  }"
                />
                <text class="nutrient-value">{{ food.carbs }}g</text>
              </view>
            </view>
          </view>

          <!-- 脂肪 -->
          <view class="nutrient-row">
            <text class="nutrient-label">脂肪</text>
            <view class="nutrient-bars">
              <view v-for="(food, index) in validFoods" :key="index" class="nutrient-bar-item">
                <view
                  class="nutrient-fill"
                  :style="{
                    width: getBarWidth(food.fat, 'fat') + '%',
                    background: getBarColor(index),
                  }"
                />
                <text class="nutrient-value">{{ food.fat }}g</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 详细数据表 -->
      <view class="compare-section">
        <view class="section-header">
          <text class="section-title">详细数据</text>
        </view>
        <view class="data-table">
          <view class="table-header">
            <text class="table-cell header-cell">营养素</text>
            <text
              v-for="(food, index) in validFoods"
              :key="index"
              class="table-cell header-cell"
              :style="{ color: getBarColor(index) }"
            >
              {{ food.name }}
            </text>
          </view>
          <view class="table-row">
            <text class="table-cell">热量</text>
            <text v-for="(food, index) in validFoods" :key="index" class="table-cell">
              {{ food.calories }} kcal
            </text>
          </view>
          <view class="table-row">
            <text class="table-cell">蛋白质</text>
            <text v-for="(food, index) in validFoods" :key="index" class="table-cell">
              {{ food.protein }}g
            </text>
          </view>
          <view class="table-row">
            <text class="table-cell">碳水</text>
            <text v-for="(food, index) in validFoods" :key="index" class="table-cell">
              {{ food.carbs }}g
            </text>
          </view>
          <view class="table-row">
            <text class="table-cell">脂肪</text>
            <text v-for="(food, index) in validFoods" :key="index" class="table-cell">
              {{ food.fat }}g
            </text>
          </view>
        </view>
      </view>

      <!-- 推荐建议 -->
      <view class="recommend-section">
        <view class="section-header">
          <text class="section-title">💡 智能建议</text>
        </view>
        <view class="recommend-content">
          <text class="recommend-text">{{ recommendText }}</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-else class="empty-state">
      <text class="empty-icon">⚖️</text>
      <text class="empty-title">选择食物进行对比</text>
      <text class="empty-desc">至少选择 2 种食物，查看营养成分对比</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import type { Food } from '@nutriday/shared-types';

const selectedFoods = ref<(Food | null)[]>([null, null]);
const currentSlot = ref(0);

// 过滤出有效的食物
const validFoods = computed(() => selectedFoods.value.filter((f): f is Food => f !== null));

const maxValues = computed(() => {
  const foods = validFoods.value;
  if (foods.length === 0) return { calories: 1, protein: 1, carbs: 1, fat: 1 };

  return {
    calories: Math.max(...foods.map((f) => f.calories || 0)),
    protein: Math.max(...foods.map((f) => f.protein || 0)),
    carbs: Math.max(...foods.map((f) => f.carbs || 0)),
    fat: Math.max(...foods.map((f) => f.fat || 0)),
  };
});

const calorieWinner = computed(() => {
  const foods = validFoods.value;
  if (foods.length < 2) return null;
  return foods.reduce((max, f) => ((f.calories || 0) > (max.calories || 0) ? f : max));
});

const recommendText = computed(() => {
  const foods = validFoods.value;
  if (foods.length < 2) return '';

  const [food1, food2] = foods;

  // 比较蛋白质
  if ((food1.protein || 0) > (food2.protein || 0) * 1.5) {
    return `${food1.name} 的蛋白质含量更高，适合增肌期食用。${food2.name} 则相对低热量，适合控制体重。`;
  }

  // 比较热量
  if ((food1.calories || 0) < (food2.calories || 0) * 0.7) {
    return `${food1.name} 热量较低，更适合减脂期食用。如果需要更多能量，可以选择 ${food2.name}。`;
  }

  // 比较碳水
  if ((food1.carbs || 0) > (food2.carbs || 0) * 1.5) {
    return `${food1.name} 碳水含量更高，适合运动前后补充能量。${food2.name} 更适合低碳饮食。`;
  }

  return `${food1.name} 和 ${food2.name} 营养成分各有特点，可以根据个人目标选择。`;
});

onLoad(() => {
  uni.setNavigationBarTitle({ title: '食物对比' });
});

function openFoodSearch(index: number) {
  currentSlot.value = index;
  uni.navigateTo({
    url: '/pages/food-search/food-search?mode=compare',
  });
}

function removeFood(index: number) {
  selectedFoods.value[index] = null;
}

function getBarWidth(value: number | undefined, type: 'calories' | 'protein' | 'carbs' | 'fat') {
  const max = maxValues.value[type];
  const val = value || 0;
  return Math.min(100, (val / max) * 100);
}

function getBarColor(index: number) {
  const colors = ['#00b171', '#3b82f6', '#f59e0b', '#ef4444'];
  return colors[index % colors.length];
}

// 监听从食物搜索页返回的数据
uni.$on('food-selected', (food: Food) => {
  if (currentSlot.value < selectedFoods.value.length) {
    selectedFoods.value[currentSlot.value] = food;
  }
});
</script>

<style lang="scss" scoped>
.compare-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 24rpx;
  padding-bottom: 120rpx;
}

.food-selector {
  display: flex;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.food-slot {
  flex: 1;
  min-height: 160rpx;
  background: #fff;
  border-radius: 20rpx;
  border: 2rpx dashed #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &.filled {
    border-style: solid;
    border-color: #00b171;
    background: rgba(0, 177, 113, 0.02);
  }
}

.food-preview {
  width: 100%;
  padding: 20rpx;
  position: relative;

  .food-name {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 4rpx;
  }

  .food-category {
    font-size: 22rpx;
    color: #64748b;
  }

  .remove-btn {
    position: absolute;
    top: 12rpx;
    right: 12rpx;
    width: 40rpx;
    height: 40rpx;
    background: #f1f5f9;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    .remove-icon {
      font-size: 28rpx;
      color: #64748b;
    }
  }
}

.add-food {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;

  .add-icon {
    font-size: 48rpx;
    color: #cbd5e1;
  }

  .add-text {
    font-size: 24rpx;
    color: #94a3b8;
  }
}

.compare-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;

  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1e293b;
  }

  .section-unit {
    font-size: 22rpx;
    color: #94a3b8;
  }
}

.bar-chart {
  .bar-item {
    margin-bottom: 16rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .bar-label {
      font-size: 24rpx;
      color: #64748b;
      margin-bottom: 8rpx;
    }

    .bar-wrapper {
      height: 40rpx;
      background: #f1f5f9;
      border-radius: 8rpx;
      overflow: hidden;
    }

    .bar-fill {
      height: 100%;
      border-radius: 8rpx;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 12rpx;
      transition: width 0.3s ease;

      .bar-value {
        font-size: 22rpx;
        color: #fff;
        font-weight: 600;
      }
    }
  }
}

.winner-hint {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-top: 16rpx;
  padding: 12rpx 16rpx;
  background: rgba(0, 177, 113, 0.05);
  border-radius: 12rpx;

  .hint-icon {
    font-size: 24rpx;
  }

  .hint-text {
    font-size: 24rpx;
    color: #00b171;
  }
}

.nutrient-compare {
  .nutrient-row {
    display: flex;
    align-items: center;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f1f5f9;

    &:last-child {
      border-bottom: none;
    }

    .nutrient-label {
      width: 100rpx;
      font-size: 26rpx;
      color: #64748b;
    }

    .nutrient-bars {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8rpx;
    }

    .nutrient-bar-item {
      display: flex;
      align-items: center;
      gap: 12rpx;

      .nutrient-fill {
        height: 16rpx;
        border-radius: 4rpx;
        transition: width 0.3s ease;
      }

      .nutrient-value {
        font-size: 22rpx;
        color: #1e293b;
        min-width: 60rpx;
      }
    }
  }
}

.data-table {
  .table-header,
  .table-row {
    display: flex;
    border-bottom: 1rpx solid #f1f5f9;

    &:last-child {
      border-bottom: none;
    }
  }

  .table-header {
    background: #f8fafc;
  }

  .table-cell {
    flex: 1;
    padding: 16rpx;
    font-size: 24rpx;
    color: #64748b;

    &.header-cell {
      font-weight: 600;
      color: #1e293b;
    }
  }
}

.recommend-section {
  background: linear-gradient(135deg, rgba(0, 177, 113, 0.05) 0%, rgba(0, 177, 113, 0.02) 100%);
  border: 1rpx solid rgba(0, 177, 113, 0.1);
}

.recommend-content {
  .recommend-text {
    font-size: 26rpx;
    color: #1e293b;
    line-height: 1.6;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 40rpx;

  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
  }

  .empty-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 12rpx;
  }

  .empty-desc {
    font-size: 26rpx;
    color: #64748b;
    text-align: center;
  }
}
</style>
