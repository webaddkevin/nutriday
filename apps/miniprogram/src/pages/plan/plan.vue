<template>
  <view class="plan-page">
    <!-- Tab 切换 -->
    <view class="tabs-container">
      <view class="tabs">
        <view
          :class="['tab', { active: activeTab === 'shopping' }]"
          @click="activeTab = 'shopping'"
        >
          <text class="tab-icon">🛒</text>
          <text class="tab-text">购物清单</text>
          <view v-if="shoppingItems.length > 0" class="tab-badge">{{ shoppingItems.length }}</view>
        </view>
        <view :class="['tab', { active: activeTab === 'meal' }]" @click="activeTab = 'meal'">
          <text class="tab-icon">📅</text>
          <text class="tab-text">备餐计划</text>
        </view>
      </view>
    </view>

    <!-- 购物清单 -->
    <view v-show="activeTab === 'shopping'" class="content">
      <!-- 添加区域 -->
      <view class="add-card">
        <view class="add-row">
          <view class="food-select" @click="showFoodSearch = true">
            <text v-if="!selectedFood" class="placeholder">点击选择食物...</text>
            <text v-else class="selected-food">{{ selectedFood.name }}</text>
            <text class="select-arrow">🔍</text>
          </view>
        </view>
        <view v-if="selectedFood" class="food-detail">
          <view class="detail-row">
            <text class="detail-label">数量</text>
            <view class="amount-input-wrap">
              <input
                v-model.number="newItemAmount"
                type="digit"
                class="amount-input"
                placeholder="100"
              />
              <picker mode="selector" :range="units" @change="onUnitChange">
                <view class="unit-picker">{{ selectedUnit }}</view>
              </picker>
            </view>
          </view>
          <view class="nutrition-preview">
            <view class="nutrition-item">
              <text class="nutrition-value">{{ estimatedCalories }}</text>
              <text class="nutrition-label">kcal</text>
            </view>
            <view class="nutrition-item">
              <text class="nutrition-value">{{ estimatedProtein }}g</text>
              <text class="nutrition-label">蛋白质</text>
            </view>
            <view class="nutrition-item">
              <text class="nutrition-value">{{ estimatedCarbs }}g</text>
              <text class="nutrition-label">碳水</text>
            </view>
            <view class="nutrition-item">
              <text class="nutrition-value">{{ estimatedFat }}g</text>
              <text class="nutrition-label">脂肪</text>
            </view>
          </view>
        </view>
        <view class="add-actions">
          <button v-if="selectedFood" class="clear-btn" @click="clearFoodSelect">清除</button>
          <button class="add-btn" :disabled="!selectedFood" @click="addShoppingItem">
            <text class="btn-text">{{ selectedFood ? '添加到清单' : '请先选择食物' }}</text>
          </button>
        </view>
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
                <view class="item-main">
                  <text class="item-name">{{ item.name }}</text>
                  <text class="item-amount">{{ item.amount }}{{ item.unit }}</text>
                </view>
                <view class="item-nutrition">
                  <text class="item-calories">{{ item.calories }} kcal</text>
                </view>
              </view>
              <view class="item-delete" @click="deleteItem(item)">
                <text class="delete-icon">🗑️</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view v-else class="empty-state">
        <text class="empty-icon">🛒</text>
        <text class="empty-title">购物清单为空</text>
        <text class="empty-hint">添加需要购买的食材吧</text>
      </view>

      <!-- 底部汇总 -->
      <view v-if="shoppingItems.length > 0" class="summary-card">
        <view class="summary-row">
          <text class="summary-label">总计</text>
          <text class="summary-value">{{ shoppingItems.length }} 项</text>
        </view>
        <view class="summary-row">
          <text class="summary-label">预估热量</text>
          <text class="summary-value highlight">{{ totalCalories }} kcal</text>
        </view>
        <view v-if="shoppingItems.some((i) => i.checked)" class="summary-actions">
          <button class="clear-checked-btn" @click="clearChecked">清空已勾选</button>
        </view>
      </view>
    </view>

    <!-- 备餐计划 -->
    <view v-show="activeTab === 'meal'" class="content">
      <!-- 日期选择 -->
      <view class="date-card">
        <view class="date-nav">
          <view class="nav-btn" @click="prevWeek">
            <text class="nav-icon">◀</text>
          </view>
          <text class="date-range">{{ weekRange }}</text>
          <view class="nav-btn" @click="nextWeek">
            <text class="nav-icon">▶</text>
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

      <!-- 每日营养汇总 -->
      <view class="daily-summary">
        <view class="summary-header">
          <text class="summary-title">今日营养</text>
          <text class="summary-date">{{ selectedDate }}</text>
        </view>
        <view class="summary-bars">
          <view class="bar-item">
            <view class="bar-header">
              <text class="bar-label">热量</text>
              <text class="bar-value">{{ dailyCalories }} / {{ targetCalories }} kcal</text>
            </view>
            <view class="bar-track">
              <view class="bar-fill calories" :style="{ width: caloriesProgress + '%' }"></view>
            </view>
          </view>
          <view class="bar-item">
            <view class="bar-header">
              <text class="bar-label">蛋白质</text>
              <text class="bar-value">{{ dailyProtein }}g</text>
            </view>
            <view class="bar-track">
              <view class="bar-fill protein" :style="{ width: proteinProgress + '%' }"></view>
            </view>
          </view>
        </view>
      </view>

      <!-- 当日计划 -->
      <view class="meal-plans">
        <view v-for="mealType in mealTypes" :key="mealType.value" class="meal-section">
          <view class="meal-header">
            <view class="meal-icon-wrap" :style="{ background: mealType.color }">
              <text class="meal-icon">{{ mealType.icon }}</text>
            </view>
            <view class="meal-info">
              <text class="meal-name">{{ mealType.label }}</text>
              <text class="meal-cal-total">{{ getMealCalories(mealType.value) }} kcal</text>
            </view>
            <view class="header-actions">
              <view class="add-food-btn" @click="showAddMealFood(mealType.value)">
                <text class="action-icon">🍽️</text>
                <text class="action-text">选食物</text>
              </view>
              <view class="add-custom-btn" @click="showAddMealCustom(mealType.value)">
                <text class="action-icon">✏️</text>
              </view>
            </view>
          </view>
          <view v-if="getMealPlansByType(mealType.value).length > 0" class="meal-items">
            <view
              v-for="plan in getMealPlansByType(mealType.value)"
              :key="plan.id"
              class="meal-item"
            >
              <view class="meal-item-content">
                <text class="meal-dish">{{ plan.foodName || plan.dishName }}</text>
                <text v-if="plan.amount" class="meal-amount">{{ plan.amount }}g</text>
              </view>
              <view class="meal-item-nutrition">
                <text class="meal-calories">{{ plan.calories }} kcal</text>
                <text v-if="plan.protein" class="meal-macro">P{{ plan.protein }}g</text>
              </view>
              <view class="meal-item-actions">
                <view v-if="!plan.logged" class="log-btn" @click="logToMeal(plan)">
                  <text class="log-icon">📝</text>
                </view>
                <view v-else class="logged-badge">
                  <text class="logged-icon">✓</text>
                </view>
                <view class="delete-btn" @click="deleteMealPlanHandler(plan)">
                  <text class="delete-icon">×</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 食物搜索弹窗 -->
    <view v-if="showFoodSearch" class="modal-overlay" @click="showFoodSearch = false">
      <view class="food-search-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">选择食物</text>
          <text class="modal-close" @click="showFoodSearch = false">×</text>
        </view>
        <view class="search-bar">
          <input
            v-model="foodSearchKeyword"
            placeholder="搜索食物..."
            class="search-input"
            @confirm="searchFoods"
          />
          <button class="search-btn" @click="searchFoods">搜索</button>
        </view>
        <scroll-view scroll-y class="food-list">
          <view
            v-for="food in foodSearchResults"
            :key="food.id"
            class="food-option"
            @click="selectFood(food)"
          >
            <view class="food-info">
              <text class="food-name">{{ food.name }}</text>
              <text class="food-category">{{ food.category }}</text>
            </view>
            <view class="food-nutrition">
              <text class="food-calories">{{ food.calories }} kcal/100g</text>
            </view>
          </view>
          <view v-if="foodSearchResults.length === 0 && foodSearchKeyword" class="no-result">
            <text>未找到相关食物</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 添加自定义菜品弹窗 -->
    <view v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ currentMealLabel }} - 添加菜品</text>
          <text class="modal-close" @click="showAddModal = false">×</text>
        </view>
        <view class="modal-body">
          <view class="input-group">
            <text class="input-label">菜品名称</text>
            <input v-model="newDishName" placeholder="例如：番茄炒蛋" class="modal-input" />
          </view>
          <view class="input-group">
            <text class="input-label">份量 (克)</text>
            <input
              v-model.number="newDishAmount"
              type="digit"
              placeholder="如：200"
              class="modal-input"
            />
          </view>
          <view class="input-group">
            <text class="input-label">预估热量 (kcal)</text>
            <input
              v-model.number="newDishCalories"
              type="digit"
              placeholder="可选，系统会估算"
              class="modal-input"
            />
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
import { request } from '@/utils/request';

// Types
interface Food {
  id: number;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface ShoppingItem {
  id: number;
  name: string;
  category: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  checked: boolean;
}

interface MealPlanItem {
  id: number;
  date: string;
  mealType: string;
  foodId?: number;
  foodName?: string;
  dishName?: string;
  amount?: number;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  logged?: boolean;
}

// State
const activeTab = ref<'shopping' | 'meal'>('shopping');
const shoppingItems = ref<ShoppingItem[]>([]);
const mealPlans = ref<MealPlanItem[]>([]);

// 购物清单相关
const showFoodSearch = ref(false);
const foodSearchKeyword = ref('');
const foodSearchResults = ref<Food[]>([]);
const selectedFood = ref<Food | null>(null);
const newItemAmount = ref(100);
const selectedUnit = ref('g');
const units = ['g', 'kg', '个', '份', '盒', '袋'];

// 备餐计划相关
const selectedDate = ref(new Date().toISOString().split('T')[0]);
const weekOffset = ref(0);
const showAddModal = ref(false);
const currentMealType = ref('');
const newDishName = ref('');
const newDishAmount = ref(200);
const newDishCalories = ref<number | undefined>(undefined);
const targetCalories = ref(2000);

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

// Computed
const estimatedCalories = computed(() => {
  if (!selectedFood.value) return 0;
  const factor = selectedUnit.value === 'kg' ? 10 : selectedUnit.value === 'g' ? 0.01 : 1;
  return Math.round(selectedFood.value.calories * newItemAmount.value * factor);
});

const estimatedProtein = computed(() => {
  if (!selectedFood.value) return 0;
  const factor = selectedUnit.value === 'kg' ? 10 : selectedUnit.value === 'g' ? 0.01 : 1;
  return Math.round(selectedFood.value.protein * newItemAmount.value * factor * 10) / 10;
});

const estimatedCarbs = computed(() => {
  if (!selectedFood.value) return 0;
  const factor = selectedUnit.value === 'kg' ? 10 : selectedUnit.value === 'g' ? 0.01 : 1;
  return Math.round(selectedFood.value.carbs * newItemAmount.value * factor * 10) / 10;
});

const estimatedFat = computed(() => {
  if (!selectedFood.value) return 0;
  const factor = selectedUnit.value === 'kg' ? 10 : selectedUnit.value === 'g' ? 0.01 : 1;
  return Math.round(selectedFood.value.fat * newItemAmount.value * factor * 10) / 10;
});

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

const totalCalories = computed(() => {
  return shoppingItems.value.reduce((sum, item) => sum + item.calories, 0);
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

const dailyCalories = computed(() => {
  return mealPlans.value
    .filter((p) => p.date === selectedDate.value)
    .reduce((sum, p) => sum + p.calories, 0);
});

const dailyProtein = computed(() => {
  return (
    Math.round(
      mealPlans.value
        .filter((p) => p.date === selectedDate.value)
        .reduce((sum, p) => sum + (p.protein || 0), 0) * 10,
    ) / 10
  );
});

const caloriesProgress = computed(() => {
  return Math.min((dailyCalories.value / targetCalories.value) * 100, 100);
});

const proteinProgress = computed(() => {
  const target = (targetCalories.value * 0.25) / 4; // 25%热量来自蛋白质
  return Math.min((dailyProtein.value / target) * 100, 100);
});

// Methods
function getCategoryColor(category: string): string {
  return categoryColors[category] || '#94a3b8';
}

function onUnitChange(e: { detail: { value: number } }) {
  selectedUnit.value = units[e.detail.value];
}

// 购物清单方法
async function searchFoods() {
  if (!foodSearchKeyword.value.trim()) return;

  try {
    const res = await request({
      url: '/food/search',
      data: { keyword: foodSearchKeyword.value },
    });
    foodSearchResults.value = res.data || [];
  } catch (e) {
    console.error('搜索失败', e);
    foodSearchResults.value = [];
  }
}

function selectFood(food: Food) {
  selectedFood.value = food;
  showFoodSearch.value = false;
  foodSearchKeyword.value = '';
  foodSearchResults.value = [];
}

function clearFoodSelect() {
  selectedFood.value = null;
  newItemAmount.value = 100;
  selectedUnit.value = 'g';
}

async function addShoppingItem() {
  if (!selectedFood.value) return;

  try {
    await request({
      url: '/shopping',
      method: 'POST',
      data: {
        foodId: selectedFood.value.id,
        name: selectedFood.value.name,
        category: selectedFood.value.category,
        amount: newItemAmount.value,
        unit: selectedUnit.value,
        calories: estimatedCalories.value,
        protein: estimatedProtein.value,
        carbs: estimatedCarbs.value,
        fat: estimatedFat.value,
      },
    });
    clearFoodSelect();
    await loadShoppingItems();
    uni.showToast({ title: '添加成功', icon: 'success' });
  } catch (e) {
    console.error('添加失败', e);
    uni.showToast({ title: '添加失败', icon: 'none' });
  }
}

async function loadShoppingItems() {
  try {
    const res = await request({ url: '/shopping' });
    shoppingItems.value = res.data || [];
  } catch (e) {
    console.error('加载购物清单失败', e);
  }
}

async function toggleItem(item: ShoppingItem) {
  try {
    await request({
      url: `/shopping/${item.id}/toggle`,
      method: 'PUT',
    });
    await loadShoppingItems();
  } catch (e) {
    console.error('切换状态失败', e);
  }
}

async function deleteItem(item: ShoppingItem) {
  try {
    await request({
      url: `/shopping/${item.id}`,
      method: 'DELETE',
    });
    await loadShoppingItems();
    uni.showToast({ title: '已删除', icon: 'success' });
  } catch (e) {
    console.error('删除失败', e);
  }
}

async function clearChecked() {
  try {
    await request({
      url: '/shopping/clear-checked',
      method: 'DELETE',
    });
    await loadShoppingItems();
    uni.showToast({ title: '已清空', icon: 'success' });
  } catch (e) {
    console.error('清空失败', e);
  }
}

// 备餐计划方法
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
    const res = await request({
      url: '/meal-plan',
      data: { startDate, endDate },
    });
    mealPlans.value = res.data || [];
  } catch (e) {
    console.error('加载备餐计划失败', e);
  }
}

function getMealPlansByType(mealType: string): MealPlanItem[] {
  return mealPlans.value.filter((p) => p.date === selectedDate.value && p.mealType === mealType);
}

function getMealCalories(mealType: string): number {
  return getMealPlansByType(mealType).reduce((sum, p) => sum + p.calories, 0);
}

function hasPlanOnDay(date: string): boolean {
  return mealPlans.value.some((p) => p.date === date);
}

function showAddMealFood(mealType: string) {
  currentMealType.value = mealType;
  // 打开食物搜索
  showFoodSearch.value = true;
}

function showAddMealCustom(mealType: string) {
  currentMealType.value = mealType;
  newDishName.value = '';
  newDishAmount.value = 200;
  newDishCalories.value = undefined;
  showAddModal.value = true;
}

async function addMealPlan() {
  const dishName = newDishName.value.trim();
  if (!dishName) {
    uni.showToast({ title: '请输入菜品名称', icon: 'none' });
    return;
  }

  // 如果没有输入热量，估算一个（假设平均 150kcal/100g）
  const calories = newDishCalories.value || Math.round(newDishAmount.value * 1.5);

  try {
    await request({
      url: '/meal-plan',
      method: 'POST',
      data: {
        date: selectedDate.value,
        mealType: currentMealType.value,
        dishName,
        amount: newDishAmount.value,
        calories,
      },
    });
    showAddModal.value = false;
    await loadMealPlans();
    uni.showToast({ title: '添加成功', icon: 'success' });
  } catch (e) {
    console.error('添加失败', e);
    uni.showToast({ title: '添加失败', icon: 'none' });
  }
}

async function deleteMealPlanHandler(plan: MealPlanItem) {
  try {
    await request({
      url: `/meal-plan/${plan.id}`,
      method: 'DELETE',
    });
    await loadMealPlans();
    uni.showToast({ title: '已删除', icon: 'success' });
  } catch (e) {
    console.error('删除失败', e);
  }
}

// 一键记录到饮食日志
async function logToMeal(plan: MealPlanItem) {
  try {
    await request({
      url: '/meal-log',
      method: 'POST',
      data: {
        date: plan.date,
        mealType: plan.mealType,
        foodId: plan.foodId,
        foodName: plan.foodName || plan.dishName,
        amount: plan.amount || 100,
        calories: plan.calories,
        protein: plan.protein,
        carbs: plan.carbs,
        fat: plan.fat,
      },
    });

    // 标记为已记录
    plan.logged = true;
    uni.showToast({ title: '已记录到饮食日志', icon: 'success' });
  } catch (e) {
    console.error('记录失败', e);
    uni.showToast({ title: '记录失败', icon: 'none' });
  }
}

// 加载用户目标
async function loadUserTarget() {
  try {
    const res = await request({ url: '/profile' });
    targetCalories.value = res.data?.targetCalories || res.data?.tdee || 2000;
  } catch (e) {
    console.error('加载用户目标失败', e);
  }
}

// Watch
watch(weekOffset, loadMealPlans);
watch(activeTab, (val) => {
  if (val === 'meal') {
    loadMealPlans();
    loadUserTarget();
  }
});

// 监听食物选择后添加到备餐计划
watch(showFoodSearch, (val) => {
  if (!val && selectedFood.value && currentMealType.value) {
    // 从食物搜索选择后，添加到备餐计划
    addFoodToMealPlan();
  }
});

async function addFoodToMealPlan() {
  if (!selectedFood.value || !currentMealType.value) return;

  try {
    await request({
      url: '/meal-plan',
      method: 'POST',
      data: {
        date: selectedDate.value,
        mealType: currentMealType.value,
        foodId: selectedFood.value.id,
        foodName: selectedFood.value.name,
        amount: 100,
        calories: selectedFood.value.calories,
        protein: selectedFood.value.protein,
        carbs: selectedFood.value.carbs,
        fat: selectedFood.value.fat,
      },
    });
    clearFoodSelect();
    currentMealType.value = '';
    await loadMealPlans();
    uni.showToast({ title: '添加成功', icon: 'success' });
  } catch (e) {
    console.error('添加失败', e);
  }
}

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

    .tab-icon {
      font-size: 28rpx;
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

  .add-row {
    margin-bottom: 16rpx;
  }

  .food-select {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 88rpx;
    padding: 0 24rpx;
    background: #f8fafc;
    border: 2rpx solid #e2e8f0;
    border-radius: 16rpx;

    .placeholder {
      color: #94a3b8;
      font-size: 28rpx;
    }

    .selected-food {
      color: #1e293b;
      font-size: 28rpx;
      font-weight: 500;
    }

    .select-arrow {
      font-size: 28rpx;
    }
  }

  .food-detail {
    background: #f8fafc;
    border-radius: 16rpx;
    padding: 20rpx;
    margin-bottom: 16rpx;

    .detail-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16rpx;

      .detail-label {
        font-size: 26rpx;
        color: #64748b;
      }

      .amount-input-wrap {
        display: flex;
        align-items: center;
        gap: 12rpx;

        .amount-input {
          width: 120rpx;
          height: 64rpx;
          text-align: center;
          background: #fff;
          border: 2rpx solid #e2e8f0;
          border-radius: 12rpx;
          font-size: 28rpx;
        }

        .unit-picker {
          padding: 0 20rpx;
          height: 64rpx;
          background: #fff;
          border: 2rpx solid #e2e8f0;
          border-radius: 12rpx;
          font-size: 26rpx;
          color: #64748b;
          line-height: 64rpx;
        }
      }
    }

    .nutrition-preview {
      display: flex;
      gap: 12rpx;

      .nutrition-item {
        flex: 1;
        text-align: center;
        padding: 12rpx;
        background: #fff;
        border-radius: 12rpx;

        .nutrition-value {
          display: block;
          font-size: 26rpx;
          font-weight: 600;
          color: #1e293b;
        }

        .nutrition-label {
          font-size: 20rpx;
          color: #94a3b8;
        }
      }
    }
  }

  .add-actions {
    display: flex;
    gap: 16rpx;

    button {
      flex: 1;
      height: 80rpx;
      border-radius: 16rpx;
      font-size: 28rpx;
      font-weight: 600;
      border: none;
    }

    .clear-btn {
      background: #f1f5f9;
      color: #64748b;
    }

    .add-btn {
      background: linear-gradient(135deg, #00b171 0%, #00d387 100%);
      color: #fff;

      &[disabled] {
        opacity: 0.5;
      }
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
        display: flex;
        align-items: center;
        justify-content: center;

        &.checked {
          background: #00b171;
          border-color: #00b171;
        }

        .check-mark {
          color: #fff;
          font-size: 24rpx;
        }
      }
    }

    .item-content {
      flex: 1;

      .item-main {
        margin-bottom: 4rpx;

        .item-name {
          font-size: 28rpx;
          color: #1e293b;
        }

        .item-amount {
          font-size: 24rpx;
          color: #64748b;
          margin-left: 12rpx;
        }
      }

      .item-nutrition {
        .item-calories {
          font-size: 22rpx;
          color: #00b171;
        }
      }
    }

    .item-delete {
      padding: 8rpx;

      .delete-icon {
        font-size: 28rpx;
      }
    }
  }
}

// 汇总卡片
.summary-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-top: 24rpx;

  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12rpx 0;

    .summary-label {
      font-size: 26rpx;
      color: #64748b;
    }

    .summary-value {
      font-size: 28rpx;
      font-weight: 600;
      color: #1e293b;

      &.highlight {
        color: #00b171;
      }
    }
  }

  .summary-actions {
    margin-top: 16rpx;
    padding-top: 16rpx;
    border-top: 1rpx solid #f1f5f9;

    .clear-checked-btn {
      width: 100%;
      height: 72rpx;
      background: #fef2f2;
      color: #ef4444;
      border: none;
      border-radius: 12rpx;
      font-size: 26rpx;
    }
  }
}

// 空状态
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 0;

  .empty-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
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

// 日期卡片
.date-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;

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
      display: flex;
      align-items: center;
      justify-content: center;

      .nav-icon {
        font-size: 24rpx;
        color: #00b171;
      }
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

// 每日营养汇总
.daily-summary {
  background: #fff;
  border-radius: 24rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;

  .summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;

    .summary-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #1e293b;
    }

    .summary-date {
      font-size: 24rpx;
      color: #94a3b8;
    }
  }

  .summary-bars {
    .bar-item {
      margin-bottom: 16rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .bar-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8rpx;

        .bar-label {
          font-size: 24rpx;
          color: #64748b;
        }

        .bar-value {
          font-size: 24rpx;
          color: #1e293b;
          font-weight: 500;
        }
      }

      .bar-track {
        height: 12rpx;
        background: #f1f5f9;
        border-radius: 6rpx;
        overflow: hidden;

        .bar-fill {
          height: 100%;
          border-radius: 6rpx;
          transition: width 0.3s ease;

          &.calories {
            background: linear-gradient(90deg, #00b171 0%, #00d387 100%);
          }

          &.protein {
            background: linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%);
          }
        }
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

    .meal-header {
      display: flex;
      align-items: center;
      padding: 24rpx;
      gap: 16rpx;

      .meal-icon-wrap {
        width: 64rpx;
        height: 64rpx;
        border-radius: 18rpx;
        display: flex;
        align-items: center;
        justify-content: center;

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

      .header-actions {
        display: flex;
        gap: 12rpx;

        .add-food-btn,
        .add-custom-btn {
          padding: 12rpx 20rpx;
          border-radius: 12rpx;
          display: flex;
          align-items: center;
          gap: 6rpx;
        }

        .add-food-btn {
          background: #00b171;

          .action-icon,
          .action-text {
            color: #fff;
            font-size: 24rpx;
          }
        }

        .add-custom-btn {
          background: #f1f5f9;

          .action-icon {
            font-size: 24rpx;
          }
        }
      }
    }

    .meal-items {
      padding: 0 24rpx 16rpx;

      .meal-item {
        display: flex;
        align-items: center;
        padding: 16rpx;
        background: #f8fafc;
        border-radius: 12rpx;
        margin-bottom: 12rpx;

        &:last-child {
          margin-bottom: 0;
        }

        .meal-item-content {
          flex: 1;

          .meal-dish {
            font-size: 28rpx;
            color: #1e293b;
          }

          .meal-amount {
            font-size: 24rpx;
            color: #64748b;
            margin-left: 8rpx;
          }
        }

        .meal-item-nutrition {
          text-align: right;
          margin-right: 16rpx;

          .meal-calories {
            display: block;
            font-size: 24rpx;
            color: #00b171;
            font-weight: 500;
          }

          .meal-macro {
            font-size: 20rpx;
            color: #94a3b8;
          }
        }

        .meal-item-actions {
          display: flex;
          gap: 8rpx;

          .log-btn,
          .logged-badge,
          .delete-btn {
            width: 48rpx;
            height: 48rpx;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .log-btn {
            background: #00b171;

            .log-icon {
              font-size: 24rpx;
            }
          }

          .logged-badge {
            background: #f0fdf4;

            .logged-icon {
              color: #00b171;
              font-size: 24rpx;
            }
          }

          .delete-btn {
            background: #fef2f2;

            .delete-icon {
              color: #ef4444;
              font-size: 28rpx;
            }
          }
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
    font-size: 40rpx;
    color: #94a3b8;
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
    }
  }
}

.modal-footer {
  display: flex;
  border-top: 1rpx solid #f1f5f9;

  button {
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

// 食物搜索弹窗
.food-search-modal {
  width: 90%;
  max-height: 80vh;
  background: #fff;
  border-radius: 28rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .search-bar {
    display: flex;
    gap: 16rpx;
    padding: 24rpx;
    border-bottom: 1rpx solid #f1f5f9;

    .search-input {
      flex: 1;
      height: 80rpx;
      padding: 0 24rpx;
      background: #f8fafc;
      border: 2rpx solid #e2e8f0;
      border-radius: 16rpx;
      font-size: 28rpx;
    }

    .search-btn {
      width: 140rpx;
      height: 80rpx;
      background: #00b171;
      color: #fff;
      border: none;
      border-radius: 16rpx;
      font-size: 28rpx;
    }
  }

  .food-list {
    flex: 1;
    max-height: 60vh;

    .food-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24rpx;
      border-bottom: 1rpx solid #f1f5f9;

      &:active {
        background: #f8fafc;
      }

      .food-info {
        .food-name {
          display: block;
          font-size: 28rpx;
          color: #1e293b;
          margin-bottom: 4rpx;
        }

        .food-category {
          font-size: 22rpx;
          color: #94a3b8;
        }
      }

      .food-nutrition {
        .food-calories {
          font-size: 24rpx;
          color: #00b171;
        }
      }
    }

    .no-result {
      padding: 60rpx;
      text-align: center;
      color: #94a3b8;
      font-size: 26rpx;
    }
  }
}
</style>
