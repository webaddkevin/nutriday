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

    <!-- 快捷搜索标签 -->
    <view v-if="!keyword && foods.length === 0" class="quick-search">
      <text class="section-title">热门搜索</text>
      <view class="quick-tags">
        <view v-for="tag in hotSearchTags" :key="tag" class="quick-tag" @tap="quickSearch(tag)">
          {{ tag }}
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
        <text class="empty-text">{{
          keyword ? '未找到相关食物，试试其他关键词' : '点击上方分类或搜索食物'
        }}</text>
        <text v-if="keyword" class="empty-hint">提示：可以搜索食物名称或类别</text>
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
          <view class="food-footer">
            <text class="food-unit">每 100g</text>
            <view
              class="favorite-btn"
              :class="{ active: favoriteIds.includes(food.id) }"
              @tap.stop="toggleFavorite(food)"
            >
              <text class="favorite-icon">{{ favoriteIds.includes(food.id) ? '⭐' : '☆' }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { getFoodByCategory, getFoodCategories, enhancedSearchFood } from '@/api/food-api';
import { request } from '@/utils/request';
import { requireUserId } from '@/utils/user';
import type { Food, MealType } from '@nutriday/shared-types';

const keyword = ref('');
const foods = ref<Food[]>([]);
const categories = ref<string[]>(['全部']);
const selectedCategory = ref('全部');
const loading = ref(false);
const favoriteIds = ref<number[]>([]);

// 热门搜索标签
const hotSearchTags = [
  '鸡胸肉',
  '鸡蛋',
  '米饭',
  '苹果',
  '牛奶',
  '西兰花',
  '香蕉',
  '三文鱼',
  '豆腐',
  '燕麦',
];

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
    await loadFavorites();
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

// 快捷搜索
function quickSearch(tag: string) {
  keyword.value = tag;
  handleSearch();
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
    // 直接使用增强搜索（包含本地数据库 + 外部 API + AI 估算）
    const results = await enhancedSearchFood(keyword.value.trim());
    foods.value = results;
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

async function selectFood(food: Food) {
  // 如果食物没有 ID，先保存到本地数据库
  if (!food.id) {
    try {
      const res = await request({
        url: '/food/save-external',
        method: 'POST',
        data: {
          name: food.name,
          nameEn: food.nameEn,
          category: food.category || '其他',
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fiber: food.fiber,
          servingSize: food.servingSize || 100,
          unit: food.unit || 'g',
          source: food.source || 'external',
        },
      });

      if (res.data?.id) {
        food.id = res.data.id;
      } else {
        uni.showToast({ title: '保存食物失败', icon: 'none' });
        return;
      }
    } catch (e) {
      console.error('保存食物失败', e);
      uni.showToast({ title: '保存食物失败', icon: 'none' });
      return;
    }
  }

  uni.navigateTo({
    url: `/pages/meal-add/meal-add?foodId=${food.id}&mealType=${mealType.value}&date=${date.value}`,
  });
}

// 加载收藏列表
async function loadFavorites() {
  try {
    const userId = requireUserId();
    const res = await request({
      url: '/food-favorite',
      data: { userId },
    });
    favoriteIds.value = (res.data || []).map((item: { foodId: number }) => item.foodId);
  } catch (e) {
    console.error('加载收藏失败', e);
  }
}

// 切换收藏状态
async function toggleFavorite(food: Food) {
  const userId = requireUserId();
  const isFavorite = favoriteIds.value.includes(food.id);

  try {
    if (isFavorite) {
      await request({
        url: '/food-favorite',
        method: 'DELETE',
        data: { userId, foodId: food.id },
      });
      favoriteIds.value = favoriteIds.value.filter((id) => id !== food.id);
      uni.showToast({ title: '已取消收藏', icon: 'none' });
    } else {
      await request({
        url: '/food-favorite',
        method: 'POST',
        data: { userId, foodId: food.id },
      });
      favoriteIds.value.push(food.id);
      uni.showToast({ title: '已收藏', icon: 'success' });
    }
  } catch (e) {
    console.error('收藏操作失败', e);
    uni.showToast({ title: '操作失败', icon: 'none' });
  }
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

.quick-search {
  padding: 24rpx 30rpx;
  background: #fff;

  .section-title {
    font-size: 26rpx;
    color: #999;
    margin-bottom: 16rpx;
    display: block;
  }

  .quick-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  .quick-tag {
    padding: 12rpx 24rpx;
    background: #f0fdf4;
    border: 1rpx solid rgba(0, 177, 113, 0.2);
    border-radius: 24rpx;
    font-size: 26rpx;
    color: $nutri-primary;

    &:active {
      background: rgba(0, 177, 113, 0.1);
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
  padding: 24rpx 32rpx;
  box-sizing: border-box;
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

  .empty-hint {
    font-size: 24rpx;
    color: #ccc;
    margin-top: 12rpx;
  }
}

.food-items {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.food-card {
  @include glass-morphism;
  border-radius: 20rpx;
  padding: 24rpx 28rpx;

  .food-main {
    margin-bottom: 16rpx;

    .food-name {
      font-size: 30rpx;
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
      margin-top: 10rpx;
    }
  }

  .food-nutrition {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14rpx 0;
    border-top: 1px solid rgba(0, 0, 0, 0.05);

    .nutrition-item {
      @include flex-center;
      flex-direction: column;
      flex: 1;

      .nutrition-value {
        font-size: 26rpx;
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
      height: 36rpx;
      background: rgba(0, 0, 0, 0.05);
    }
  }

  .food-unit {
    font-size: 22rpx;
    color: $uni-text-color-placeholder;
  }

  .food-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10rpx;
  }

  .favorite-btn {
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    background: rgba(0, 0, 0, 0.05);

    &.active {
      background: rgba(255, 193, 7, 0.2);
    }

    .favorite-icon {
      font-size: 28rpx;
    }
  }
}
</style>
