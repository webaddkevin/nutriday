<template>
  <view class="plan-page">
    <!-- Tab 切换 -->
    <view class="tabs">
      <view :class="['tab', { active: activeTab === 'shopping' }]" @click="activeTab = 'shopping'">
        <text class="tab-text">购物清单</text>
        <text v-if="shoppingItems.length > 0" class="tab-count">{{ shoppingItems.length }}</text>
      </view>
      <view :class="['tab', { active: activeTab === 'meal' }]" @click="activeTab = 'meal'">
        <text class="tab-text">备餐计划</text>
      </view>
    </view>

    <!-- 购物清单 -->
    <view v-show="activeTab === 'shopping'" class="content">
      <!-- 添加按钮 -->
      <view class="add-section">
        <input
          v-model="newItemName"
          placeholder="添加购物项"
          class="add-input"
          @confirm="addShoppingItem"
        />
        <picker mode="selector" :range="categories" @change="onCategoryChange">
          <view class="category-picker">
            <text class="category-text">{{ selectedCategory }}</text>
            <text class="category-arrow">▼</text>
          </view>
        </picker>
        <button class="add-btn" @click="addShoppingItem">添加</button>
      </view>

      <!-- 购物列表 -->
      <view v-if="Object.keys(groupedItems).length > 0" class="shopping-list">
        <view v-for="(items, category) in groupedItems" :key="category" class="category-group">
          <view class="category-header">
            <text class="category-title">{{ category }}</text>
            <text class="category-count">{{ items.length }} 项</text>
          </view>
          <view
            v-for="item in items"
            :key="item.id"
            :class="['shopping-item', { checked: item.checked }]"
          >
            <view class="item-check" @click="toggleItem(item)">
              <text class="check-icon">{{ item.checked ? '✅' : '⬜' }}</text>
            </view>
            <view class="item-content">
              <text class="item-name">{{ item.name }}</text>
              <text v-if="item.amount" class="item-amount">{{ item.amount }}</text>
            </view>
            <view class="item-actions">
              <text class="delete-btn" @click="deleteItem(item)">删除</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-icon">🛒</text>
        <text class="empty-text">购物清单为空</text>
        <text class="empty-hint">添加需要购买的食材吧</text>
      </view>

      <!-- 清空按钮 -->
      <view v-if="shoppingItems.length > 0" class="clear-section">
        <button class="clear-btn" @click="clearChecked">清空已勾选</button>
      </view>
    </view>

    <!-- 备餐计划 -->
    <view v-show="activeTab === 'meal'" class="content">
      <!-- 日期选择 -->
      <view class="date-section">
        <view class="date-nav">
          <text class="nav-btn" @click="prevWeek">‹</text>
          <text class="date-range">{{ weekRange }}</text>
          <text class="nav-btn" @click="nextWeek">›</text>
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
          </view>
        </view>
      </view>

      <!-- 当日计划 -->
      <view class="meal-plans">
        <view v-for="mealType in mealTypes" :key="mealType.value" class="meal-section">
          <view class="meal-header">
            <text class="meal-icon">{{ mealType.icon }}</text>
            <text class="meal-name">{{ mealType.label }}</text>
            <text class="add-meal" @click="showAddMeal(mealType.value)">+ 添加</text>
          </view>
          <view class="meal-items">
            <view
              v-for="plan in getMealPlansByType(mealType.value)"
              :key="plan.id"
              class="meal-item"
            >
              <view class="meal-info">
                <text class="meal-dish">{{ plan.dishName }}</text>
                <text v-if="plan.calories" class="meal-calories">{{ plan.calories }} kcal</text>
              </view>
              <text class="meal-delete" @click="deleteMealPlanHandler(plan)">删除</text>
            </view>
            <view v-if="getMealPlansByType(mealType.value).length === 0" class="no-meal">
              <text class="no-meal-text">暂无计划</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加菜品弹窗 -->
    <view v-if="showAddModal" class="modal" @click="showAddModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">添加 {{ currentMealLabel }}</text>
        </view>
        <view class="modal-body">
          <input v-model="newDishName" placeholder="菜品名称" class="modal-input" />
          <input
            v-model="newDishCalories"
            placeholder="预估热量 (kcal，可选)"
            type="number"
            class="modal-input"
          />
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="showAddModal = false">取消</button>
          <button class="confirm-btn" @click="addMealPlan">确认</button>
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
  { value: 'breakfast', label: '早餐', icon: '🍳' },
  { value: 'lunch', label: '午餐', icon: '🍱' },
  { value: 'dinner', label: '晚餐', icon: '🍲' },
  { value: 'snack', label: '加餐', icon: '🍎' },
];

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

<style scoped lang="scss">
.plan-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 180rpx;
}

.tabs {
  display: flex;
  background: #fff;
  padding: 0 16px;
  border-bottom: 1px solid #eee;

  .tab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 14px 0;
    position: relative;

    &.active {
      .tab-text {
        color: #2ecc71;
        font-weight: 600;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 40px;
        height: 3px;
        background: #2ecc71;
        border-radius: 2px;
      }
    }

    .tab-text {
      font-size: 15px;
      color: #666;
    }

    .tab-count {
      font-size: 12px;
      color: #fff;
      background: #2ecc71;
      padding: 2px 6px;
      border-radius: 10px;
    }
  }
}

.content {
  padding: 16px;
}

.add-section {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;

  .add-input {
    flex: 1;
    height: 40px;
    padding: 0 12px;
    border: 1px solid #eee;
    border-radius: 8px;
    font-size: 14px;
  }

  .category-picker {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 12px;
    height: 40px;
    background: #f5f5f5;
    border-radius: 8px;

    .category-text {
      font-size: 14px;
      color: #666;
    }

    .category-arrow {
      font-size: 10px;
      color: #999;
    }
  }

  .add-btn {
    padding: 0 16px;
    height: 40px;
    background: #2ecc71;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 14px;
  }
}

.shopping-list {
  .category-group {
    margin-bottom: 16px;
  }

  .category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #eee;

    .category-title {
      font-size: 14px;
      font-weight: 600;
      color: #333;
    }

    .category-count {
      font-size: 12px;
      color: #999;
    }
  }

  .shopping-item {
    display: flex;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid #f5f5f5;

    &.checked {
      .item-name {
        color: #999;
        text-decoration: line-through;
      }
    }

    .item-check {
      margin-right: 12px;

      .check-icon {
        font-size: 20px;
      }
    }

    .item-content {
      flex: 1;

      .item-name {
        font-size: 15px;
        color: #333;
      }

      .item-amount {
        font-size: 12px;
        color: #999;
        margin-left: 8px;
      }
    }

    .item-actions {
      .delete-btn {
        font-size: 13px;
        color: #e74c3c;
      }
    }
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

.clear-section {
  margin-top: 16px;

  .clear-btn {
    width: 100%;
    height: 44px;
    background: #f5f5f5;
    color: #666;
    border: none;
    border-radius: 8px;
    font-size: 14px;
  }
}

.date-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;

  .date-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .nav-btn {
      font-size: 20px;
      color: #2ecc71;
      padding: 4px 12px;
    }

    .date-range {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }
  }

  .week-days {
    display: flex;
    gap: 8px;

    .day-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 0;
      border-radius: 8px;

      &.active {
        background: #2ecc71;

        .day-name,
        .day-num {
          color: #fff;
        }
      }

      &.today:not(.active) {
        .day-num {
          color: #2ecc71;
          font-weight: 600;
        }
      }

      .day-name {
        font-size: 12px;
        color: #999;
        margin-bottom: 4px;
      }

      .day-num {
        font-size: 16px;
        color: #333;
        font-weight: 500;
      }
    }
  }
}

.meal-plans {
  .meal-section {
    background: #fff;
    border-radius: 12px;
    margin-bottom: 12px;
    overflow: hidden;

    .meal-header {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background: #f8f9fa;

      .meal-icon {
        font-size: 20px;
        margin-right: 8px;
      }

      .meal-name {
        flex: 1;
        font-size: 15px;
        font-weight: 600;
        color: #333;
      }

      .add-meal {
        font-size: 13px;
        color: #2ecc71;
      }
    }

    .meal-items {
      padding: 8px 16px;

      .meal-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #f5f5f5;

        &:last-child {
          border-bottom: none;
        }

        .meal-info {
          .meal-dish {
            font-size: 14px;
            color: #333;
          }

          .meal-calories {
            font-size: 12px;
            color: #999;
            margin-left: 8px;
          }
        }

        .meal-delete {
          font-size: 13px;
          color: #e74c3c;
        }
      }

      .no-meal {
        padding: 16px 0;
        text-align: center;

        .no-meal-text {
          font-size: 13px;
          color: #999;
        }
      }
    }
  }
}

.modal {
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

  .modal-content {
    width: 80%;
    background: #fff;
    border-radius: 12px;
    overflow: hidden;
  }

  .modal-header {
    padding: 16px;
    border-bottom: 1px solid #eee;

    .modal-title {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }

  .modal-body {
    padding: 16px;

    .modal-input {
      width: 100%;
      height: 44px;
      padding: 0 12px;
      border: 1px solid #eee;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 12px;
      box-sizing: border-box;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }

  .modal-footer {
    display: flex;
    border-top: 1px solid #eee;

    .cancel-btn,
    .confirm-btn {
      flex: 1;
      height: 48px;
      border: none;
      border-radius: 0;
      font-size: 15px;
    }

    .cancel-btn {
      background: #fff;
      color: #666;
      border-right: 1px solid #eee;
    }

    .confirm-btn {
      background: #fff;
      color: #2ecc71;
      font-weight: 500;
    }
  }
}
</style>
