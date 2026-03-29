<template>
  <view class="container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrapper">
        <uni-icons type="search" size="18" color="#999"></uni-icons>
        <input
          v-model="keyword"
          class="search-input"
          placeholder="搜索食物，如：鸡胸肉、苹果..."
          :focus="true"
          @confirm="handleSearch"
          @input="debounceSearch"
        />
        <view v-if="keyword" class="clear-btn" @tap="clearKeyword">
          <uni-icons type="clear" size="18" color="#ccc"></uni-icons>
        </view>
      </view>
    </view>

    <!-- 分类标签 -->
    <scroll-view class="category-scroll" scroll-x :show-scrollbar="false">
      <view class="category-list">
        <view
          v-for="cat in categories"
          :key="cat"
          class="category-item"
          :class="{ active: selectedCategory === cat }"
          @tap="selectCategory(cat)"
        >
          {{ cat }}
        </view>
      </view>
    </scroll-view>

    <!-- 搜索结果 / 食物列表 -->
    <scroll-view class="food-list" scroll-y :show-scrollbar="false">
      <view v-if="loading" class="loading-state">
        <text>搜索中...</text>
      </view>

      <view v-else-if="foods.length === 0" class="empty-state">
        <text class="empty-icon">🔍</text>
        <text class="empty-text">{{ keyword ? '未找到相关食物' : '请输入食物名称搜索' }}</text>
      </view>

      <view v-else class="food-items">
        <view v-for="food in foods" :key="food.id" class="food-card" @tap="selectFood(food)">
          <view class="food-main">
            <view class="food-name">{{ food.name }}</view>
            <view v-if="food.nameEn" class="food-name-en">{{ food.nameEn }}</view>
            <view class="food-category">{{ food.category }}</view>
          </view>
          <view class="food-nutrition">
            <view class="nutrition-item">
              <text class="nutrition-value">{{ food.calories }}</text>
              <text class="nutrition-label">kcal</text>
            </view>
            <view class="nutrition-divider"></view>
            <view class="nutrition-item">
              <text class="nutrition-value">{{ food.protein }}g</text>
              <text class="nutrition-label">蛋白质</text>
            </view>
            <view class="nutrition-divider"></view>
            <view class="nutrition-item">
              <text class="nutrition-value">{{ food.carbs }}g</text>
              <text class="nutrition-label">碳水</text>
            </view>
            <view class="nutrition-divider"></view>
            <view class="nutrition-item">
              <text class="nutrition-value">{{ food.fat }}g</text>
              <text class="nutrition-label">脂肪</text>
            </view>
          </view>
          <view class="food-unit">每 100g</view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { searchFood, getFoodByCategory, getFoodCategories } from '@/api/food-api';
import type { Food, MealType } from '@nutriday/shared-types';

const keyword = ref('');
const foods = ref<Food[]>([]);
const categories = ref<string[]>(['全部']);
const selectedCategory = ref('全部');
const loading = ref(false);

let searchTimer: ReturnType<typeof setTimeout> | null = null;
let mealType = ref<MealType>('breakfast' as MealType);
let date = ref('');

onLoad((options) => {
  mealType.value = (options?.mealType as MealType) || 'breakfast';
  date.value = options?.date || new Date().toISOString().split('T')[0];
});

onMounted(async () => {
  try {
    const cats = await getFoodCategories();
    categories.value = ['全部', ...cats];
  } catch (e) {
    console.error('获取分类失败', e);
  }
});

function debounceSearch() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    handleSearch();
  }, 300);
}

async function handleSearch() {
  if (!keyword.value.trim()) {
    if (selectedCategory.value !== '全部') {
      await loadByCategory(selectedCategory.value);
    } else {
      foods.value = [];
    }
    return;
  }

  loading.value = true;
  try {
    foods.value = await searchFood(keyword.value.trim());
  } catch (e) {
    console.error('搜索失败', e);
    uni.showToast({ title: '搜索失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

async function selectCategory(cat: string) {
  selectedCategory.value = cat;
  keyword.value = '';

  if (cat === '全部') {
    foods.value = [];
    return;
  }

  loading.value = true;
  try {
    foods.value = await getFoodByCategory(cat);
  } catch (e) {
    console.error('获取分类食物失败', e);
  } finally {
    loading.value = false;
  }
}

async function loadByCategory(cat: string) {
  loading.value = true;
  try {
    foods.value = await getFoodByCategory(cat);
  } catch (e) {
    console.error('获取分类食物失败', e);
  } finally {
    loading.value = false;
  }
}

function clearKeyword() {
  keyword.value = '';
  if (selectedCategory.value !== '全部') {
    loadByCategory(selectedCategory.value);
  } else {
    foods.value = [];
  }
}

function selectFood(food: Food) {
  uni.navigateTo({
    url: `/pages/meal-add/meal-add?foodId=${food.id}&mealType=${mealType.value}&date=${date.value}`,
  });
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: $nutri-dark;
  display: flex;
  flex-direction: column;
}

.search-bar {
  padding: 20rpx 30rpx;
  background: #fff;

  .search-input-wrapper {
    display: flex;
    align-items: center;
    background: #f5f5f5;
    border-radius: 40rpx;
    padding: 16rpx 24rpx;

    .search-input {
      flex: 1;
      margin-left: 16rpx;
      font-size: 28rpx;
    }

    .clear-btn {
      padding: 8rpx;
    }
  }
}

.category-scroll {
  background: #fff;
  border-top: 1px solid #f0f0f0;
  white-space: nowrap;

  .category-list {
    display: inline-flex;
    padding: 20rpx 30rpx;
    gap: 20rpx;
  }

  .category-item {
    padding: 12rpx 28rpx;
    border-radius: 30rpx;
    font-size: 26rpx;
    background: #f5f5f5;
    color: #666;
    flex-shrink: 0;

    &.active {
      background: $nutri-primary;
      color: #fff;
    }
  }
}

.food-list {
  flex: 1;
  padding: 20rpx 30rpx;
}

.loading-state,
.empty-state {
  @include flex-center;
  flex-direction: column;
  padding: 100rpx 0;

  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
  }

  .empty-text {
    font-size: 28rpx;
    color: $uni-text-color-grey;
  }
}

.food-items {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.food-card {
  @include glass-morphism;
  border-radius: 24rpx;
  padding: 28rpx;

  .food-main {
    margin-bottom: 20rpx;

    .food-name {
      font-size: 32rpx;
      font-weight: 600;
      color: $uni-text-color;
    }

    .food-name-en {
      font-size: 24rpx;
      color: $uni-text-color-grey;
      margin-top: 4rpx;
    }

    .food-category {
      display: inline-block;
      font-size: 22rpx;
      color: $nutri-primary;
      background: rgba(0, 177, 113, 0.1);
      padding: 4rpx 12rpx;
      border-radius: 8rpx;
      margin-top: 12rpx;
    }
  }

  .food-nutrition {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16rpx 0;
    border-top: 1px solid rgba(0, 0, 0, 0.05);

    .nutrition-item {
      @include flex-center;
      flex-direction: column;
      flex: 1;

      .nutrition-value {
        font-size: 28rpx;
        font-weight: 600;
        color: $uni-text-color;
      }

      .nutrition-label {
        font-size: 20rpx;
        color: $uni-text-color-grey;
        margin-top: 4rpx;
      }
    }

    .nutrition-divider {
      width: 1px;
      height: 40rpx;
      background: rgba(0, 0, 0, 0.05);
    }
  }

  .food-unit {
    font-size: 22rpx;
    color: $uni-text-color-placeholder;
    text-align: right;
    margin-top: 12rpx;
  }
}
</style>
