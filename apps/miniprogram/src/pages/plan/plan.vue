<template>
  <view class="plan-page">
    <!-- Tab 切换 -->
    <view class="tabs-container">
      <view class="tabs">
        <view
          :class="['tab', { active: activeTab === 'shopping' }]"
          @click="activeTab = 'shopping'"
        >
          <NutriIcon
            name="star"
            size="sm"
            :color="activeTab === 'shopping' ? '#00b171' : '#94a3b8'"
          />
          <text class="tab-text">购物清单</text>
          <view v-if="shoppingItems.length > 0" class="tab-badge">{{ shoppingItems.length }}</view>
        </view>
        <view :class="['tab', { active: activeTab === 'meal' }]" @click="activeTab = 'meal'">
          <NutriIcon name="plan" size="sm" :color="activeTab === 'meal' ? '#00b171' : '#94a3b8'" />
          <text class="tab-text">备餐计划</text>
        </view>
      </view>
    </view>

    <!-- 购物清单 -->
    <view v-show="activeTab === 'shopping'" class="content">
      <!-- 添加区域 -->
      <view class="add-card">
        <view class="add-row">
          <input
            v-model="newItemName"
            placeholder="添加购物项..."
            class="add-input"
            @confirm="addShoppingItem"
          />
          <picker mode="selector" :range="categories" @change="onCategoryChange">
            <view class="category-picker">
              <text class="category-text">{{ selectedCategory }}</text>
              <text class="category-arrow">▼</text>
            </view>
          </picker>
        </view>
        <button class="add-btn" @click="addShoppingItem">
          <text class="btn-icon">+</text>
          <text class="btn-text">添加</text>
        </button>
      </view>

      <!-- 购物列表 -->
      <view v-if="Object.keys(groupedItems).length > 0" class="shopping-list">
        <view v-for="(items, category) in groupedItems" :key="category" class="category-section">
          <view class="category-header">
            <view class="category-dot" :style="{ background: getCategoryColor(category) }"></view>
            <text class="category-title">{{ category }}</text>
            <text class="category-count"
              >{{ items.filter((i) => i.checked).length }}/{{ items.length }}</text
            >
          </view>
          <view class="items-container">
            <view
              v-for="item in items"
              :key="item.id"
              :class="['shopping-item', { checked: item.checked }]"
            >
              <view class="item-check" @click="toggleItem(item)">
                <view :class="['checkbox', { checked: item.checked }]">
                  <text v-if="item.checked" class="check-mark">✓</text>
                </view>
              </view>
              <view class="item-content">
                <text class="item-name">{{ item.name }}</text>
                <text v-if="item.amount" class="item-amount">{{ item.amount }}</text>
              </view>
              <view class="item-delete" @click="deleteItem(item)">
                <uni-icons type="trash" size="18" color="#ef4444"></uni-icons>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <view class="empty-icon-wrap">
          <text class="empty-icon">🛒</text>
        </view>
        <text class="empty-title">购物清单为空</text>
        <text class="empty-hint">添加需要购买的食材吧</text>
      </view>

      <!-- 底部操作 -->
      <view v-if="shoppingItems.some((i) => i.checked)" class="bottom-actions">
        <button class="clear-btn" @click="clearChecked">
          <uni-icons type="trash" size="16" color="#fff" />
          <text>清空已勾选</text>
        </button>
      </view>
    </view>

    <!-- 备餐计划 -->
    <view v-show="activeTab === 'meal'" class="content">
      <!-- 日期选择 -->
      <view class="date-card">
        <view class="date-nav">
          <view class="nav-btn" @click="prevWeek">
            <uni-icons type="left" size="18" color="#00b171" />
          </view>
          <text class="date-range">{{ weekRange }}</text>
          <view class="nav-btn" @click="nextWeek">
            <uni-icons type="right" size="18" color="#00b171" />
          </view>
        </view>
        <view class="week-days">
          <view
            v-for="day in weekDays"
            :key="day.date"
            :class="['day-item', { active: selectedDate === day.date, today: day.isToday }]"
            @click="selectedDate = day.date"
          >
            <text class="day-name">{{ day.dayName }}</text>
            <text class="day-num">{{ day.dayNum }}</text>
            <view v-if="hasPlanOnDay(day.date)" class="day-dot"></view>
          </view>
        </view>
      </view>

      <!-- 当日计划 -->
      <view class="meal-plans">
        <view v-for="mealType in mealTypes" :key="mealType.value" class="meal-section">
          <view class="meal-header" @click="showAddMeal(mealType.value)">
            <view class="meal-icon-wrap" :style="{ background: mealType.color }">
              <text class="meal-icon">{{ mealType.icon }}</text>
            </view>
            <view class="meal-info">
              <text class="meal-name">{{ mealType.label }}</text>
              <text class="meal-cal-total">{{ getMealCalories(mealType.value) }} kcal</text>
            </view>
            <view class="add-meal-btn">
              <text class="add-icon">+</text>
            </view>
          </view>
          <view v-if="getMealPlansByType(mealType.value).length > 0" class="meal-items">
            <view
              v-for="plan in getMealPlansByType(mealType.value)"
              :key="plan.id"
              class="meal-item"
            >
              <view class="meal-item-content">
                <text class="meal-dish">{{ plan.dishName }}</text>
                <text v-if="plan.calories" class="meal-calories">{{ plan.calories }} kcal</text>
              </view>
              <view class="meal-item-delete" @click="deleteMealPlanHandler(plan)">
                <uni-icons type="closeempty" size="16" color="#94a3b8" />
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加菜品弹窗 -->
    <view v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">添加 {{ currentMealLabel }}</text>
          <view class="modal-close" @click="showAddModal = false">
            <uni-icons type="closeempty" size="20" color="#94a3b8" />
          </view>
        </view>
        <view class="modal-body">
          <view class="input-group">
            <text class="input-label">菜品名称</text>
            <input v-model="newDishName" placeholder="例如：番茄炒蛋" class="modal-input" />
          </view>
          <view class="input-group">
            <text class="input-label">预估热量 (kcal)</text>
            <input v-model="newDishCalories" placeholder="可选" type="number" class="modal-input" />
          </view>
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="showAddModal = false">取消</button>
          <button class="confirm-btn" @click="addMealPlan">确认添加</button>
        </view>
      </view>
    </view>

    <!-- 自定义 Tabbar -->
    <CustomTabbar current-path="/pages/plan/plan" />
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import CustomTabbar from '@/components/CustomTabbar/CustomTabbar.vue';
import NutriIcon from '@/components/NutriIcon/NutriIcon.vue';
import {
  getShoppingItems,
  createShoppingItem,
  toggleShoppingItem,
  deleteShoppingItem,
  clearCheckedItems,
  type ShoppingItem,
} from '@/api/shopping-api';
import {
  getMealPlansByRange,
  createMealPlan,
  deleteMealPlan as deleteMealPlanApi,
  type MealPlan,
} from '@/api/meal-plan-api';

const activeTab = ref<'shopping' | 'meal'>('shopping');
const shoppingItems = ref<ShoppingItem[]>([]);
const mealPlans = ref<MealPlan[]>([]);

const newItemName = ref('');
const categories = ['蔬菜', '水果', '肉类', '海鲜', '乳制品', '主食', '调味料', '零食', '其他'];
const selectedCategory = ref('蔬菜');

const selectedDate = ref(new Date().toISOString().split('T')[0]);
const weekOffset = ref(0);

const showAddModal = ref(false);
const currentMealType = ref('');
const newDishName = ref('');
const newDishCalories = ref('');

const mealTypes = [
  { value: 'breakfast', label: '早餐', icon: '🍳', color: 'rgba(245, 158, 11, 0.1)' },
  { value: 'lunch', label: '午餐', icon: '🍱', color: 'rgba(59, 130, 246, 0.1)' },
  { value: 'dinner', label: '晚餐', icon: '🍲', color: 'rgba(0, 177, 113, 0.1)' },
  { value: 'snack', label: '加餐', icon: '🍎', color: 'rgba(239, 68, 68, 0.1)' },
];

const categoryColors: Record<string, string> = {
  蔬菜: '#22c55e',
  水果: '#f97316',
  肉类: '#ef4444',
  海鲜: '#06b6d4',
  乳制品: '#a855f7',
  主食: '#eab308',
  调味料: '#64748b',
  零食: '#ec4899',
  其他: '#94a3b8',
};

function getCategoryColor(category: string): string {
  return categoryColors[category] || '#94a3b8';
}

const groupedItems = computed(() => {
  const groups: Record<string, ShoppingItem[]> = {};
  for (const item of shoppingItems.value) {
    if (!groups[item.category]) {
      groups[item.category] = [];
    }
    groups[item.category].push(item);
  }
  return groups;
});

const weekDays = computed(() => {
  const days = [];
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + weekOffset.value * 7);

  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      dayName: dayNames[date.getDay()],
      dayNum: date.getDate(),
      isToday: dateStr === today.toISOString().split('T')[0],
    });
  }
  return days;
});

const weekRange = computed(() => {
  if (weekDays.value.length === 0) return '';
  const first = weekDays.value[0];
  const last = weekDays.value[6];
  return `${first.date.slice(5)} ~ ${last.date.slice(5)}`;
});

const currentMealLabel = computed(() => {
  return mealTypes.find((m) => m.value === currentMealType.value)?.label || '';
});

function onCategoryChange(e: { detail: { value: number } }) {
  selectedCategory.value = categories[e.detail.value];
}

async function loadShoppingItems() {
  try {
    shoppingItems.value = await getShoppingItems();
  } catch (e) {
    console.error('加载购物清单失败', e);
  }
}

async function addShoppingItem() {
  const name = newItemName.value.trim();
  if (!name) return;

  try {
    await createShoppingItem({
      name,
      category: selectedCategory.value,
    });
    newItemName.value = '';
    await loadShoppingItems();
    uni.showToast({ title: '添加成功', icon: 'success' });
  } catch (e) {
    console.error('添加失败', e);
    uni.showToast({ title: '添加失败', icon: 'none' });
  }
}

async function toggleItem(item: ShoppingItem) {
  try {
    await toggleShoppingItem(item.id);
    await loadShoppingItems();
  } catch (e) {
    console.error('切换状态失败', e);
  }
}

async function deleteItem(item: ShoppingItem) {
  try {
    await deleteShoppingItem(item.id);
    await loadShoppingItems();
    uni.showToast({ title: '已删除', icon: 'success' });
  } catch (e) {
    console.error('删除失败', e);
  }
}

async function clearChecked() {
  try {
    await clearCheckedItems();
    await loadShoppingItems();
    uni.showToast({ title: '已清空', icon: 'success' });
  } catch (e) {
    console.error('清空失败', e);
  }
}

function prevWeek() {
  weekOffset.value--;
}

function nextWeek() {
  weekOffset.value++;
}

async function loadMealPlans() {
  if (weekDays.value.length === 0) return;
  const startDate = weekDays.value[0].date;
  const endDate = weekDays.value[6].date;

  try {
    mealPlans.value = await getMealPlansByRange(startDate, endDate);
  } catch (e) {
    console.error('加载备餐计划失败', e);
  }
}

function getMealPlansByType(mealType: string): MealPlan[] {
  return mealPlans.value.filter((p) => p.date === selectedDate.value && p.mealType === mealType);
}

function getMealCalories(mealType: string): number {
  return getMealPlansByType(mealType).reduce((sum, p) => sum + (p.calories || 0), 0);
}

function hasPlanOnDay(date: string): boolean {
  return mealPlans.value.some((p) => p.date === date);
}

function showAddMeal(mealType: string) {
  currentMealType.value = mealType;
  newDishName.value = '';
  newDishCalories.value = '';
  showAddModal.value = true;
}

async function addMealPlan() {
  const dishName = newDishName.value.trim();
  if (!dishName) {
    uni.showToast({ title: '请输入菜品名称', icon: 'none' });
    return;
  }

  try {
    await createMealPlan({
      date: selectedDate.value,
      mealType: currentMealType.value,
      dishName,
      calories: newDishCalories.value ? parseInt(newDishCalories.value) : undefined,
    });
    showAddModal.value = false;
    await loadMealPlans();
    uni.showToast({ title: '添加成功', icon: 'success' });
  } catch (e) {
    console.error('添加失败', e);
    uni.showToast({ title: '添加失败', icon: 'none' });
  }
}

async function deleteMealPlanHandler(plan: MealPlan) {
  try {
    await deleteMealPlanApi(plan.id);
    await loadMealPlans();
    uni.showToast({ title: '已删除', icon: 'success' });
  } catch (e) {
    console.error('删除失败', e);
  }
}

watch(weekOffset, loadMealPlans);
watch(activeTab, (val) => {
  if (val === 'meal') {
    loadMealPlans();
  }
});

onMounted(() => {
  loadShoppingItems();
});
</script>

<style lang="scss" scoped>
.plan-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding-bottom: 180rpx;
}

.tabs-container {
  background: #fff;
  padding: 16rpx 32rpx;
  position: sticky;
  top: 0;
  z-index: 10;
}

.tabs {
  display: flex;
  background: #f1f5f9;
  border-radius: 20rpx;
  padding: 6rpx;

  .tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    padding: 20rpx;
    border-radius: 16rpx;
    transition: all 0.2s ease;

    &.active {
      background: #fff;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    }

    .tab-text {
      font-size: 28rpx;
      color: #64748b;
      font-weight: 500;
    }

    &.active .tab-text {
      color: #1e293b;
      font-weight: 600;
    }

    .tab-badge {
      font-size: 20rpx;
      color: #fff;
      background: #00b171;
      padding: 2rpx 12rpx;
      border-radius: 16rpx;
      min-width: 32rpx;
      text-align: center;
    }
  }
}

.content {
  padding: 24rpx;
}

// 添加卡片
.add-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

  .add-row {
    display: flex;
    gap: 16rpx;
    margin-bottom: 16rpx;
  }

  .add-input {
    flex: 1;
    height: 80rpx;
    padding: 0 24rpx;
    border: 2rpx solid #e2e8f0;
    border-radius: 16rpx;
    font-size: 28rpx;
    background: #f8fafc;

    &:focus {
      border-color: #00b171;
      background: #fff;
    }
  }

  .category-picker {
    display: flex;
    align-items: center;
    gap: 8rpx;
    padding: 0 24rpx;
    height: 80rpx;
    background: #f8fafc;
    border-radius: 16rpx;
    border: 2rpx solid #e2e8f0;

    .category-text {
      font-size: 26rpx;
      color: #64748b;
    }

    .category-arrow {
      font-size: 18rpx;
      color: #94a3b8;
    }
  }

  .add-btn {
    width: 100%;
    height: 80rpx;
    background: linear-gradient(135deg, #00b171 0%, #00d387 100%);
    border: none;
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;

    .btn-icon {
      color: #fff;
      font-size: 32rpx;
    }

    .btn-text {
      color: #fff;
      font-size: 28rpx;
      font-weight: 600;
    }
  }
}

// 购物列表
.shopping-list {
  .category-section {
    background: #fff;
    border-radius: 24rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  }

  .category-header {
    display: flex;
    align-items: center;
    gap: 12rpx;
    padding: 24rpx;
    border-bottom: 1rpx solid #f1f5f9;

    .category-dot {
      width: 12rpx;
      height: 12rpx;
      border-radius: 50%;
    }

    .category-title {
      flex: 1;
      font-size: 28rpx;
      font-weight: 600;
      color: #1e293b;
    }

    .category-count {
      font-size: 24rpx;
      color: #94a3b8;
    }
  }

  .items-container {
    padding: 8rpx 24rpx;
  }

  .shopping-item {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f8fafc;

    &:last-child {
      border-bottom: none;
    }

    &.checked {
      .item-name {
        color: #94a3b8;
        text-decoration: line-through;
      }
    }

    .item-check {
      margin-right: 16rpx;

      .checkbox {
        width: 40rpx;
        height: 40rpx;
        border: 2rpx solid #cbd5e1;
        border-radius: 10rpx;
        @include flex-center;
        transition: all 0.2s ease;

        &.checked {
          background: #00b171;
          border-color: #00b171;
        }

        .check-mark {
          color: #fff;
          font-size: 24rpx;
          font-weight: 600;
        }
      }
    }

    .item-content {
      flex: 1;

      .item-name {
        font-size: 28rpx;
        color: #1e293b;
      }

      .item-amount {
        font-size: 24rpx;
        color: #94a3b8;
        margin-left: 12rpx;
      }
    }

    .item-delete {
      padding: 8rpx;
    }
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;

  .empty-icon-wrap {
    width: 120rpx;
    height: 120rpx;
    background: #f1f5f9;
    border-radius: 40rpx;
    @include flex-center;
    margin-bottom: 24rpx;
  }

  .empty-icon {
    font-size: 56rpx;
  }

  .empty-title {
    font-size: 32rpx;
    color: #1e293b;
    font-weight: 600;
    margin-bottom: 8rpx;
  }

  .empty-hint {
    font-size: 26rpx;
    color: #94a3b8;
  }
}

// 底部操作
.bottom-actions {
  position: fixed;
  bottom: 180rpx;
  left: 24rpx;
  right: 24rpx;
  z-index: 100;

  .clear-btn {
    width: 100%;
    height: 88rpx;
    background: #ef4444;
    border: none;
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    color: #fff;
    font-size: 28rpx;
    font-weight: 600;
    box-shadow: 0 8rpx 24rpx rgba(239, 68, 68, 0.3);
  }
}

// 日期卡片
.date-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

  .date-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .nav-btn {
      width: 56rpx;
      height: 56rpx;
      background: #f1f5f9;
      border-radius: 50%;
      @include flex-center;
    }

    .date-range {
      font-size: 28rpx;
      font-weight: 600;
      color: #1e293b;
    }
  }

  .week-days {
    display: flex;
    gap: 8rpx;

    .day-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16rpx 0;
      border-radius: 16rpx;
      position: relative;

      &.active {
        background: linear-gradient(135deg, #00b171 0%, #00d387 100%);

        .day-name,
        .day-num {
          color: #fff;
        }

        .day-dot {
          background: #fff;
        }
      }

      &.today:not(.active) {
        .day-num {
          color: #00b171;
          font-weight: 700;
        }
      }

      .day-name {
        font-size: 22rpx;
        color: #94a3b8;
        margin-bottom: 4rpx;
      }

      .day-num {
        font-size: 30rpx;
        color: #1e293b;
        font-weight: 600;
      }

      .day-dot {
        width: 6rpx;
        height: 6rpx;
        background: #00b171;
        border-radius: 50%;
        margin-top: 6rpx;
      }
    }
  }
}

// 备餐计划
.meal-plans {
  .meal-section {
    background: #fff;
    border-radius: 24rpx;
    margin-bottom: 20rpx;
    overflow: hidden;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);

    .meal-header {
      display: flex;
      align-items: center;
      padding: 24rpx;
      gap: 16rpx;

      .meal-icon-wrap {
        width: 64rpx;
        height: 64rpx;
        border-radius: 18rpx;
        @include flex-center;

        .meal-icon {
          font-size: 32rpx;
        }
      }

      .meal-info {
        flex: 1;

        .meal-name {
          display: block;
          font-size: 30rpx;
          font-weight: 600;
          color: #1e293b;
        }

        .meal-cal-total {
          font-size: 24rpx;
          color: #00b171;
          margin-top: 4rpx;
        }
      }

      .add-meal-btn {
        width: 56rpx;
        height: 56rpx;
        background: #f1f5f9;
        border-radius: 50%;
        @include flex-center;

        .add-icon {
          font-size: 32rpx;
          color: #00b171;
          font-weight: 300;
        }
      }
    }

    .meal-items {
      padding: 0 24rpx 16rpx;

      .meal-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16rpx;
        background: #f8fafc;
        border-radius: 12rpx;
        margin-bottom: 12rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .meal-item-content {
          .meal-dish {
            font-size: 28rpx;
            color: #1e293b;
          }

          .meal-calories {
            font-size: 24rpx;
            color: #94a3b8;
            margin-left: 12rpx;
          }
        }

        .meal-item-delete {
          padding: 8rpx;
        }
      }
    }
  }
}

// 弹窗
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 85%;
  background: #fff;
  border-radius: 28rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #f1f5f9;

  .modal-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1e293b;
  }

  .modal-close {
    padding: 8rpx;
  }
}

.modal-body {
  padding: 32rpx;

  .input-group {
    margin-bottom: 24rpx;

    &:last-child {
      margin-bottom: 0;
    }

    .input-label {
      display: block;
      font-size: 26rpx;
      color: #64748b;
      margin-bottom: 12rpx;
    }

    .modal-input {
      width: 100%;
      height: 88rpx;
      padding: 0 24rpx;
      border: 2rpx solid #e2e8f0;
      border-radius: 16rpx;
      font-size: 28rpx;
      box-sizing: border-box;

      &:focus {
        border-color: #00b171;
      }
    }
  }
}

.modal-footer {
  display: flex;
  border-top: 1rpx solid #f1f5f9;

  .cancel-btn,
  .confirm-btn {
    flex: 1;
    height: 100rpx;
    border: none;
    border-radius: 0;
    font-size: 30rpx;
    background: #fff;
  }

  .cancel-btn {
    color: #64748b;
    border-right: 1rpx solid #f1f5f9;
  }

  .confirm-btn {
    color: #00b171;
    font-weight: 600;
  }
}
</style>
