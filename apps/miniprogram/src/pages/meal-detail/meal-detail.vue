<template>
  <view class="container">
    <!-- 营养汇总卡片 -->
    <view class="summary-card">
      <view class="summary-header">
        <text class="meal-icon">{{ mealIcon }}</text>
        <view class="meal-info">
          <text class="meal-name">{{ mealTitle }}</text>
          <text class="meal-date">{{ date }}</text>
        </view>
        <view class="meal-calories">
          <text class="cal-value">{{ totalCalories }}</text>
          <text class="cal-unit">kcal</text>
        </view>
      </view>

      <view class="nutrient-grid">
        <view class="nutrient-item">
          <text class="nutrient-value">{{ totalProtein.toFixed(1) }}g</text>
          <text class="nutrient-label">蛋白质</text>
        </view>
        <view class="nutrient-item">
          <text class="nutrient-value">{{ totalCarbs.toFixed(1) }}g</text>
          <text class="nutrient-label">碳水</text>
        </view>
        <view class="nutrient-item">
          <text class="nutrient-value">{{ totalFat.toFixed(1) }}g</text>
          <text class="nutrient-label">脂肪</text>
        </view>
      </view>
    </view>

    <!-- 食物列表 -->
    <view class="food-list">
      <view class="list-header">
        <text class="list-title">食物明细</text>
        <text class="list-count">{{ mealLogs.length }} 项</text>
      </view>

      <view v-if="loading" class="loading-state">
        <text>加载中...</text>
      </view>

      <view v-else-if="mealLogs.length === 0" class="empty-state">
        <text class="empty-icon">🍽️</text>
        <text class="empty-text">暂无记录</text>
        <button class="add-btn" @tap="goToAdd">添加食物</button>
      </view>

      <view v-else class="food-items">
        <view v-for="log in mealLogs" :key="log.id" class="food-item" @tap="showActions(log)">
          <view class="food-main">
            <view class="food-info">
              <text class="food-name">{{ log.foodName }}</text>
              <text class="food-amount">{{ log.amount }}g</text>
            </view>
            <view class="food-nutrition">
              <text class="food-calories">{{ log.calories }} kcal</text>
              <text class="food-detail">
                P: {{ log.protein?.toFixed(1) || 0 }}g | C: {{ log.carbs?.toFixed(1) || 0 }}g | F:
                {{ log.fat?.toFixed(1) || 0 }}g
              </text>
            </view>
          </view>
          <view class="food-actions">
            <text class="action-icon">›</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 添加按钮 -->
    <view class="fab" @tap="goToAdd">
      <text class="fab-icon">+</text>
    </view>

    <!-- 操作菜单 -->
    <view v-if="showActionSheet" class="action-sheet-overlay" @tap="showActionSheet = false">
      <view class="action-sheet" @tap.stop>
        <view class="action-item edit" @tap="editLog">
          <text class="action-text">编辑份量</text>
        </view>
        <view class="action-item delete" @tap="deleteLog">
          <text class="action-text">删除</text>
        </view>
        <view class="action-item cancel" @tap="showActionSheet = false">
          <text class="action-text">取消</text>
        </view>
      </view>
    </view>

    <!-- 编辑弹窗 -->
    <view v-if="showEditModal" class="modal-overlay" @tap="showEditModal = false">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">编辑份量</text>
          <text class="modal-close" @tap="showEditModal = false">×</text>
        </view>
        <view class="modal-body">
          <view class="edit-food-name">{{ selectedLog?.foodName }}</view>
          <view class="amount-input-wrap">
            <input v-model="editAmount" type="digit" class="amount-input" placeholder="输入份量" />
            <text class="amount-unit">克</text>
          </view>
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @tap="showEditModal = false">取消</button>
          <button class="confirm-btn" @tap="saveEdit">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { request } from '@/utils/request';
import type { MealType, MealLog } from '@nutriday/shared-types';

const loading = ref(true);
const date = ref('');
const mealType = ref<MealType>('breakfast');
const mealLogs = ref<MealLog[]>([]);

const showActionSheet = ref(false);
const showEditModal = ref(false);
const selectedLog = ref<MealLog | null>(null);
const editAmount = ref(100);

const mealTitles: Record<MealType, string> = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐',
  snack: '加餐',
};

const mealIcons: Record<MealType, string> = {
  breakfast: '🍳',
  lunch: '🍲',
  dinner: '🥗',
  snack: '🍎',
};

const mealTitle = computed(() => mealTitles[mealType.value]);
const mealIcon = computed(() => mealIcons[mealType.value]);

const totalCalories = computed(() =>
  mealLogs.value.reduce((sum, log) => sum + (log.calories || 0), 0),
);

const totalProtein = computed(() =>
  mealLogs.value.reduce((sum, log) => sum + (log.protein || 0), 0),
);

const totalCarbs = computed(() => mealLogs.value.reduce((sum, log) => sum + (log.carbs || 0), 0));

const totalFat = computed(() => mealLogs.value.reduce((sum, log) => sum + (log.fat || 0), 0));

onLoad(async (options) => {
  date.value = options?.date || new Date().toISOString().split('T')[0];
  mealType.value = (options?.mealType as MealType) || 'breakfast';

  uni.setNavigationBarTitle({ title: mealTitles[mealType.value] });

  await loadMealLogs();
});

async function loadMealLogs() {
  loading.value = true;
  try {
    const res = await request({
      url: `/meal-log/meal?date=${date.value}&mealType=${mealType.value}`,
    });

    if (res.data) {
      mealLogs.value = Array.isArray(res.data) ? res.data : [];
    }
  } catch (e) {
    console.error('加载饮食记录失败', e);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
}

function goToAdd() {
  uni.navigateTo({
    url: `/pages/food-search/food-search?mealType=${mealType.value}&date=${date.value}`,
  });
}

function showActions(log: MealLog) {
  selectedLog.value = log;
  editAmount.value = log.amount;
  showActionSheet.value = true;
}

function editLog() {
  showActionSheet.value = false;
  showEditModal.value = true;
}

async function saveEdit() {
  if (!selectedLog.value) return;

  const amount = parseInt(String(editAmount.value)) || 100;

  try {
    // 计算新的营养值
    const ratio = amount / selectedLog.value.amount;
    const newCalories = Math.round((selectedLog.value.calories || 0) * ratio);
    const newProtein = Math.round((selectedLog.value.protein || 0) * ratio * 10) / 10;
    const newCarbs = Math.round((selectedLog.value.carbs || 0) * ratio * 10) / 10;
    const newFat = Math.round((selectedLog.value.fat || 0) * ratio * 10) / 10;

    await request({
      url: `/meal-log/${selectedLog.value.id}`,
      method: 'PUT',
      data: {
        amount,
        calories: newCalories,
        protein: newProtein,
        carbs: newCarbs,
        fat: newFat,
      },
    });

    uni.showToast({ title: '修改成功', icon: 'success' });
    showEditModal.value = false;
    await loadMealLogs();
  } catch (e) {
    console.error('修改失败', e);
    uni.showToast({ title: '修改失败', icon: 'none' });
  }
}

async function deleteLog() {
  if (!selectedLog.value) return;

  try {
    await request({
      url: `/meal-log/${selectedLog.value.id}`,
      method: 'DELETE',
    });

    uni.showToast({ title: '删除成功', icon: 'success' });
    showActionSheet.value = false;
    await loadMealLogs();
  } catch (e) {
    console.error('删除失败', e);
    uni.showToast({ title: '删除失败', icon: 'none' });
  }
}
</script>

<style lang="scss" scoped>
.container {
  min-height: 100vh;
  background: #f8fafc;
  padding-bottom: 120rpx;
}

// 汇总卡片
.summary-card {
  background: linear-gradient(135deg, #00b171 0%, #00d68f 100%);
  margin: 24rpx;
  border-radius: 24rpx;
  padding: 32rpx;
  color: #fff;
}

.summary-header {
  display: flex;
  align-items: center;
  margin-bottom: 24rpx;
}

.meal-icon {
  font-size: 48rpx;
  margin-right: 16rpx;
}

.meal-info {
  flex: 1;

  .meal-name {
    display: block;
    font-size: 32rpx;
    font-weight: 600;
  }

  .meal-date {
    font-size: 24rpx;
    opacity: 0.8;
  }
}

.meal-calories {
  text-align: right;

  .cal-value {
    font-size: 48rpx;
    font-weight: 700;
  }

  .cal-unit {
    font-size: 24rpx;
    margin-left: 4rpx;
  }
}

.nutrient-grid {
  display: flex;
  justify-content: space-around;
  padding-top: 24rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.2);
}

.nutrient-item {
  text-align: center;

  .nutrient-value {
    display: block;
    font-size: 32rpx;
    font-weight: 600;
  }

  .nutrient-label {
    font-size: 22rpx;
    opacity: 0.8;
  }
}

// 食物列表
.food-list {
  margin: 24rpx;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.list-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1e293b;
}

.list-count {
  font-size: 26rpx;
  color: #94a3b8;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  background: #fff;
  border-radius: 24rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #94a3b8;
  margin-bottom: 24rpx;
}

.add-btn {
  background: linear-gradient(135deg, #00b171 0%, #00d68f 100%);
  color: #fff;
  font-size: 28rpx;
  padding: 16rpx 48rpx;
  border-radius: 32rpx;
  border: none;
}

.food-items {
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.food-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }
}

.food-main {
  flex: 1;
}

.food-info {
  display: flex;
  align-items: baseline;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.food-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #1e293b;
}

.food-amount {
  font-size: 24rpx;
  color: #94a3b8;
}

.food-nutrition {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.food-calories {
  font-size: 28rpx;
  font-weight: 600;
  color: #00b171;
}

.food-detail {
  font-size: 22rpx;
  color: #94a3b8;
}

.food-actions {
  padding-left: 16rpx;
}

.action-icon {
  font-size: 32rpx;
  color: #cbd5e1;
}

// 添加按钮
.fab {
  position: fixed;
  right: 32rpx;
  bottom: 120rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #00b171 0%, #00d68f 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 177, 113, 0.4);

  .fab-icon {
    font-size: 48rpx;
    color: #fff;
    font-weight: 300;
  }
}

// 操作菜单
.action-sheet-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.action-sheet {
  width: 100%;
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.action-item {
  padding: 32rpx;
  text-align: center;
  border-bottom: 1rpx solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }

  &.edit .action-text {
    color: #00b171;
  }

  &.delete .action-text {
    color: #ef4444;
  }

  &.cancel .action-text {
    color: #64748b;
  }

  .action-text {
    font-size: 32rpx;
  }
}

// 编辑弹窗
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
  z-index: 1001;
}

.modal-content {
  width: 600rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f1f5f9;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
}

.modal-close {
  font-size: 48rpx;
  color: #94a3b8;
  line-height: 1;
}

.modal-body {
  padding: 24rpx;
}

.edit-food-name {
  font-size: 28rpx;
  color: #1e293b;
  text-align: center;
  margin-bottom: 24rpx;
}

.amount-input-wrap {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.amount-input {
  flex: 1;
  height: 80rpx;
  background: #f8fafc;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 32rpx;
  text-align: center;
}

.amount-unit {
  font-size: 28rpx;
  color: #64748b;
}

.modal-footer {
  display: flex;
  gap: 16rpx;
  padding: 24rpx;
  border-top: 1rpx solid #f1f5f9;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
}

.cancel-btn {
  background: #f1f5f9;
  color: #64748b;
}

.confirm-btn {
  background: linear-gradient(135deg, #00b171 0%, #00d68f 100%);
  color: #fff;
}
</style>
