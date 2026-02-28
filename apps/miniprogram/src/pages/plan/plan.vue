<template>
  <view class="container">
    <!-- 顶部 Tab 切换栏 -->
    <view class="tab-bar">
      <view
        class="tab-item"
        :class="{ active: activeTab === 'shopping' }"
        @click="activeTab = 'shopping'"
      >
        <text class="tab-text">🛒 购物清单</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'mealprep' }"
        @click="activeTab = 'mealprep'"
      >
        <text class="tab-text">🍱 备餐计划</text>
      </view>
      <!-- 滑块指示器 -->
      <view class="tab-indicator" :class="{ right: activeTab === 'mealprep' }"></view>
    </view>

    <!-- 购物清单视图 -->
    <view v-if="activeTab === 'shopping'" class="shopping-view">
      <view v-for="group in shoppingList" :key="group.category" class="shopping-group">
        <view class="group-header">
          <text class="group-icon">{{ group.icon }}</text>
          <text class="group-title">{{ group.category }}</text>
          <text class="group-count">{{ getCheckedCount(group) }}/{{ group.items.length }}</text>
        </view>
        <view class="item-list">
          <view
            v-for="item in group.items"
            :key="item.name"
            class="shopping-item"
            :class="{ checked: item.checked }"
            @click="toggleItem(item)"
          >
            <view class="checkbox" :class="{ checked: item.checked }">
              <text v-if="item.checked" class="check-mark">✓</text>
            </view>
            <view class="item-info">
              <text class="item-name">{{ item.name }}</text>
              <text class="item-amount">{{ item.amount }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 备餐计划视图 -->
    <view v-if="activeTab === 'mealprep'" class="mealprep-view">
      <view v-for="day in mealPrepDays" :key="day.label" class="day-section">
        <view class="day-header">
          <text class="day-label">{{ day.label }}</text>
          <text class="day-date">{{ day.date }}</text>
        </view>
        <view class="meals-grid">
          <view v-for="meal in day.meals" :key="meal.name" class="prep-card">
            <view class="prep-icon">{{ meal.icon }}</view>
            <view class="prep-info">
              <text class="prep-meal-name">{{ meal.name }}</text>
              <text class="prep-dish">{{ meal.dish }}</text>
              <text class="prep-cal">{{ meal.calories }} kcal</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';

const activeTab = ref<'shopping' | 'mealprep'>('shopping');

// 购物清单模拟数据
interface ShoppingItem {
  name: string;
  amount: string;
  checked: boolean;
}
interface ShoppingGroup {
  category: string;
  icon: string;
  items: ShoppingItem[];
}

const shoppingList = reactive<ShoppingGroup[]>([
  {
    category: '蛋白质',
    icon: '🥩',
    items: [
      { name: '鸡胸肉', amount: '500g', checked: false },
      { name: '鸡蛋', amount: '1盒（10枚）', checked: true },
      { name: '虾仁', amount: '300g', checked: false },
    ],
  },
  {
    category: '蔬菜',
    icon: '🥬',
    items: [
      { name: '西兰花', amount: '2颗', checked: false },
      { name: '菠菜', amount: '1把', checked: false },
      { name: '番茄', amount: '4个', checked: true },
    ],
  },
  {
    category: '主食',
    icon: '🍚',
    items: [
      { name: '糙米', amount: '1kg', checked: false },
      { name: '全麦面包', amount: '1袋', checked: false },
    ],
  },
  {
    category: '调味 & 其他',
    icon: '🧂',
    items: [
      { name: '橄榄油', amount: '1瓶', checked: true },
      { name: '低脂酸奶', amount: '4杯', checked: false },
    ],
  },
]);

// 备餐计划模拟数据
const today = new Date();

function formatDate(offset: number): string {
  const d = new Date(today);
  d.setDate(d.getDate() + offset);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

const mealPrepDays = ref([
  {
    label: '今天',
    date: formatDate(0),
    meals: [
      { name: '早餐', icon: '🍳', dish: '全麦吐司 + 煎蛋 + 牛油果', calories: 420 },
      { name: '午餐', icon: '🍲', dish: '糙米饭 + 鸡胸肉 + 西兰花', calories: 650 },
      { name: '晚餐', icon: '🥗', dish: '虾仁沙拉 + 番茄汤', calories: 480 },
    ],
  },
  {
    label: '明天',
    date: formatDate(1),
    meals: [
      { name: '早餐', icon: '🥣', dish: '酸奶燕麦碗 + 蓝莓', calories: 380 },
      { name: '午餐', icon: '🍜', dish: '荞麦面 + 水煮虾 + 菠菜', calories: 580 },
      { name: '晚餐', icon: '🥘', dish: '番茄炖牛肉 + 杂粮饭', calories: 620 },
    ],
  },
  {
    label: '后天',
    date: formatDate(2),
    meals: [
      { name: '早餐', icon: '🥞', dish: '全麦松饼 + 花生酱 + 香蕉', calories: 450 },
      { name: '午餐', icon: '🍱', dish: '鸡胸拌饭 + 蒸蛋 + 凉拌菠菜', calories: 600 },
      { name: '晚餐', icon: '🥗', dish: '三文鱼配藜麦沙拉', calories: 520 },
    ],
  },
]);

// 勾选相关方法
function toggleItem(item: ShoppingItem) {
  item.checked = !item.checked;
}

function getCheckedCount(group: ShoppingGroup): number {
  return group.items.filter((i) => i.checked).length;
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background-color: $nutri-dark;
  padding: 30rpx;
  color: $uni-text-color;
}

/* ===== 顶部 Tab 切换栏 ===== */
.tab-bar {
  position: relative;
  display: flex;
  background: rgba(255, 255, 255, 0.65);
  border-radius: 24rpx;
  padding: 8rpx;
  margin-bottom: 40rpx;

  .tab-item {
    flex: 1;
    text-align: center;
    padding: 20rpx 0;
    z-index: 1;
    transition: color 0.3s;

    &.active .tab-text {
      color: $uni-text-color;
      font-weight: 600;
    }
  }

  .tab-text {
    font-size: 28rpx;
    color: $uni-text-color-grey;
  }

  .tab-indicator {
    position: absolute;
    top: 8rpx;
    bottom: 8rpx;
    left: 8rpx;
    width: calc(50% - 8rpx);
    background: #fff;
    border-radius: 20rpx;
    box-shadow: 0 2px 8px rgb(0 0 0 / 6%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &.right {
      transform: translateX(100%);
    }
  }
}

/* ===== 购物清单 ===== */
.shopping-view {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.shopping-group {
  .group-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    padding: 0 10rpx;

    .group-icon {
      font-size: 36rpx;
      margin-right: 16rpx;
    }

    .group-title {
      flex: 1;
      font-size: 30rpx;
      font-weight: 600;
    }

    .group-count {
      font-size: 24rpx;
      color: $uni-text-color-placeholder;
    }
  }
}

.item-list {
  @include glass-morphism;
  border-radius: 24rpx;
  overflow: hidden;
}

.shopping-item {
  display: flex;
  align-items: center;
  padding: 28rpx 30rpx;
  border-bottom: 1px solid $uni-border-color;
  transition: opacity 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &.checked {
    opacity: 0.5;

    .item-name {
      text-decoration: line-through;
    }
  }

  .checkbox {
    width: 44rpx;
    height: 44rpx;
    border-radius: 12rpx;
    border: 2px solid $uni-border-color;
    margin-right: 24rpx;
    @include flex-center;
    flex-shrink: 0;
    transition: all 0.2s;

    &.checked {
      background: $nutri-primary;
      border-color: $nutri-primary;
    }

    .check-mark {
      font-size: 24rpx;
      color: #fff;
      font-weight: 700;
    }
  }

  .item-info {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .item-name {
      font-size: 30rpx;
    }

    .item-amount {
      font-size: 24rpx;
      color: $uni-text-color-grey;
    }
  }
}

/* ===== 备餐计划 ===== */
.mealprep-view {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

.day-section {
  .day-header {
    display: flex;
    align-items: baseline;
    margin-bottom: 20rpx;
    padding: 0 10rpx;

    .day-label {
      font-size: 34rpx;
      font-weight: 700;
      margin-right: 16rpx;
    }

    .day-date {
      font-size: 24rpx;
      color: $uni-text-color-grey;
    }
  }
}

.meals-grid {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.prep-card {
  @include glass-morphism;
  border-radius: 24rpx;
  padding: 30rpx;
  display: flex;
  align-items: center;

  .prep-icon {
    font-size: 48rpx;
    width: 80rpx;
    height: 80rpx;
    background: rgb(0 0 0 / 3%);
    border-radius: 20rpx;
    @include flex-center;
    margin-right: 24rpx;
    flex-shrink: 0;
  }

  .prep-info {
    flex: 1;

    .prep-meal-name {
      display: block;
      font-size: 26rpx;
      color: $uni-text-color-grey;
      margin-bottom: 6rpx;
    }

    .prep-dish {
      display: block;
      font-size: 30rpx;
      font-weight: 500;
      margin-bottom: 8rpx;
    }

    .prep-cal {
      font-size: 24rpx;
      color: $nutri-primary;
      font-weight: 600;
    }
  }
}
</style>
