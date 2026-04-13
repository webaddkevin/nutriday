<template>
  <view class="template-page">
    <!-- 模板列表 -->
    <view class="template-list">
      <view v-if="templates.length === 0" class="empty-state">
        <text class="empty-icon">📋</text>
        <text class="empty-title">暂无模板</text>
        <text class="empty-desc">保存常用饮食组合，一键添加到今日记录</text>
      </view>

      <view v-else>
        <view v-for="template in templates" :key="template.id" class="template-card">
          <view class="template-header" @tap="useTemplate(template)">
            <view class="template-info">
              <text class="template-name">{{ template.name }}</text>
              <text class="template-calories">{{ template.totalCalories }} kcal</text>
            </view>
            <view class="template-actions">
              <view class="action-btn" @tap.stop="editTemplate(template)">
                <text class="action-icon">✏️</text>
              </view>
              <view class="action-btn" @tap.stop="deleteTemplate(template)">
                <text class="action-icon">🗑️</text>
              </view>
            </view>
          </view>

          <view class="template-foods">
            <view v-for="food in template.foods" :key="food.id" class="food-tag">
              {{ food.name }} {{ food.amount }}g
            </view>
          </view>

          <view class="template-footer">
            <text class="template-time">创建于 {{ template.createdAt }}</text>
            <button class="use-btn" @tap="useTemplate(template)">一键添加</button>
          </view>
        </view>
      </view>
    </view>

    <!-- 创建模板按钮 -->
    <view class="fab" @tap="showCreateModal = true">
      <text class="fab-icon">+</text>
    </view>

    <!-- 创建/编辑模板弹窗 -->
    <view v-if="showCreateModal" class="modal-overlay" @tap="showCreateModal = false">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingTemplate ? '编辑模板' : '创建模板' }}</text>
          <text class="modal-close" @tap="closeModal">×</text>
        </view>

        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">模板名称</text>
            <input
              v-model="templateForm.name"
              class="form-input"
              placeholder="如：标准早餐、健身餐"
            />
          </view>

          <view class="form-item">
            <text class="form-label">食物列表</text>
            <view class="food-list">
              <view v-for="(food, index) in templateForm.foods" :key="index" class="food-item">
                <input v-model="food.name" class="food-name-input" placeholder="食物名称" />
                <input
                  v-model.number="food.amount"
                  type="number"
                  class="food-amount-input"
                  placeholder="克数"
                />
                <text class="remove-food" @tap="removeFood(index)">×</text>
              </view>
            </view>
            <button class="add-food-btn" @tap="addFood">
              <text class="add-icon">+</text>
              <text>添加食物</text>
            </button>
          </view>

          <view class="form-item">
            <text class="form-label">营养估算</text>
            <view class="nutrition-preview">
              <view class="nutrition-item">
                <text class="nutrition-value">{{ estimatedCalories }}</text>
                <text class="nutrition-label">kcal</text>
              </view>
              <view class="nutrition-item">
                <text class="nutrition-value">{{ estimatedProtein }}</text>
                <text class="nutrition-label">蛋白质</text>
              </view>
              <view class="nutrition-item">
                <text class="nutrition-value">{{ estimatedCarbs }}</text>
                <text class="nutrition-label">碳水</text>
              </view>
              <view class="nutrition-item">
                <text class="nutrition-value">{{ estimatedFat }}</text>
                <text class="nutrition-label">脂肪</text>
              </view>
            </view>
          </view>
        </view>

        <view class="modal-footer">
          <button class="cancel-btn" @tap="closeModal">取消</button>
          <button class="confirm-btn" @tap="saveTemplate">保存</button>
        </view>
      </view>
    </view>

    <!-- 选择餐食类型弹窗 -->
    <view v-if="showMealTypeModal" class="modal-overlay" @tap="showMealTypeModal = false">
      <view class="modal-content meal-type-modal" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">选择添加到</text>
        </view>
        <view class="meal-type-list">
          <view
            v-for="meal in mealTypes"
            :key="meal.value"
            class="meal-type-item"
            @tap="selectMealType(meal.value)"
          >
            <text class="meal-icon">{{ meal.icon }}</text>
            <text class="meal-name">{{ meal.label }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { request } from '@/utils/request';

interface TemplateFood {
  id?: number;
  name: string;
  amount: number;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface Template {
  id: string;
  name: string;
  foods: TemplateFood[];
  totalCalories: number;
  createdAt: string;
}

const STORAGE_KEY = 'nutriday_meal_templates';

const templates = ref<Template[]>([]);
const showCreateModal = ref(false);
const showMealTypeModal = ref(false);
const editingTemplate = ref<Template | null>(null);
const selectedTemplate = ref<Template | null>(null);

const templateForm = ref({
  name: '',
  foods: [{ name: '', amount: 100 }] as TemplateFood[],
});

const mealTypes = [
  { value: 'breakfast', label: '早餐', icon: '🍳' },
  { value: 'lunch', label: '午餐', icon: '🍱' },
  { value: 'dinner', label: '晚餐', icon: '🍲' },
  { value: 'snack', label: '加餐', icon: '🍎' },
];

const estimatedCalories = computed(() => {
  return templateForm.value.foods.reduce((sum, f) => {
    // 假设平均每100g约100kcal
    return sum + (f.amount || 0) * 1;
  }, 0);
});

const estimatedProtein = computed(() => {
  return Math.round(estimatedCalories.value * 0.25);
});

const estimatedCarbs = computed(() => {
  return Math.round(estimatedCalories.value * 0.5);
});

const estimatedFat = computed(() => {
  return Math.round(estimatedCalories.value * 0.25);
});

onLoad(() => {
  uni.setNavigationBarTitle({ title: '饮食模板' });
});

onMounted(() => {
  loadTemplates();
});

function loadTemplates() {
  const stored = uni.getStorageSync(STORAGE_KEY);
  if (stored && Array.isArray(stored)) {
    templates.value = stored;
  }
}

function saveTemplates() {
  uni.setStorageSync(STORAGE_KEY, templates.value);
}

function addFood() {
  templateForm.value.foods.push({ name: '', amount: 100 });
}

function removeFood(index: number) {
  if (templateForm.value.foods.length > 1) {
    templateForm.value.foods.splice(index, 1);
  }
}

function closeModal() {
  showCreateModal.value = false;
  editingTemplate.value = null;
  templateForm.value = {
    name: '',
    foods: [{ name: '', amount: 100 }],
  };
}

function editTemplate(template: Template) {
  editingTemplate.value = template;
  templateForm.value = {
    name: template.name,
    foods: [...template.foods],
  };
  showCreateModal.value = true;
}

function saveTemplate() {
  if (!templateForm.value.name.trim()) {
    uni.showToast({ title: '请输入模板名称', icon: 'none' });
    return;
  }

  const validFoods = templateForm.value.foods.filter((f) => f.name.trim() && f.amount > 0);
  if (validFoods.length === 0) {
    uni.showToast({ title: '请添加至少一种食物', icon: 'none' });
    return;
  }

  const template: Template = {
    id: editingTemplate.value?.id || `template-${Date.now()}`,
    name: templateForm.value.name,
    foods: validFoods,
    totalCalories: estimatedCalories.value,
    createdAt: editingTemplate.value?.createdAt || new Date().toLocaleDateString('zh-CN'),
  };

  if (editingTemplate.value) {
    const index = templates.value.findIndex((t) => t.id === editingTemplate.value!.id);
    if (index > -1) {
      templates.value[index] = template;
    }
  } else {
    templates.value.push(template);
  }

  saveTemplates();
  closeModal();
  uni.showToast({ title: '保存成功', icon: 'success' });
}

function deleteTemplate(template: Template) {
  uni.showModal({
    title: '确认删除',
    content: `确定要删除模板「${template.name}」吗？`,
    success: (res) => {
      if (res.confirm) {
        const index = templates.value.findIndex((t) => t.id === template.id);
        if (index > -1) {
          templates.value.splice(index, 1);
          saveTemplates();
        }
        uni.showToast({ title: '已删除', icon: 'none' });
      }
    },
  });
}

function useTemplate(template: Template) {
  selectedTemplate.value = template;
  showMealTypeModal.value = true;
}

async function selectMealType(mealType: string) {
  if (!selectedTemplate.value) return;

  showMealTypeModal.value = false;

  try {
    const date = new Date().toISOString().split('T')[0];

    // 批量添加食物
    for (const food of selectedTemplate.value.foods) {
      await request({
        url: '/meal-log',
        method: 'POST',
        data: {
          date,
          mealType,
          foodId: food.id || null,
          foodName: food.name,
          amount: food.amount,
          calories: Math.round((food.calories || food.amount) * (food.amount / 100)),
          protein: Math.round((food.protein || food.amount * 0.25) * (food.amount / 100)),
          carbs: Math.round((food.carbs || food.amount * 0.5) * (food.amount / 100)),
          fat: Math.round((food.fat || food.amount * 0.25) * (food.amount / 100)),
        },
      });
    }

    uni.showToast({ title: '添加成功', icon: 'success' });

    // 跳转到首页
    setTimeout(() => {
      uni.switchTab({ url: '/pages/index/index' });
    }, 1000);
  } catch (e) {
    console.error('添加失败', e);
    uni.showToast({ title: '添加失败', icon: 'none' });
  }
}
</script>

<style lang="scss" scoped>
.template-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 24rpx;
  padding-bottom: 120rpx;
}

.template-list {
  margin-bottom: 24rpx;
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

.template-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;

  .template-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .template-info {
      .template-name {
        display: block;
        font-size: 30rpx;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 4rpx;
      }

      .template-calories {
        font-size: 24rpx;
        color: #00b171;
      }
    }

    .template-actions {
      display: flex;
      gap: 16rpx;

      .action-btn {
        width: 56rpx;
        height: 56rpx;
        background: #f8fafc;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;

        .action-icon {
          font-size: 28rpx;
        }
      }
    }
  }

  .template-foods {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-bottom: 16rpx;

    .food-tag {
      padding: 8rpx 16rpx;
      background: #f0fdf4;
      border-radius: 16rpx;
      font-size: 24rpx;
      color: #00b171;
    }
  }

  .template-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 16rpx;
    border-top: 1rpx solid #f1f5f9;

    .template-time {
      font-size: 22rpx;
      color: #94a3b8;
    }

    .use-btn {
      padding: 12rpx 32rpx;
      background: #00b171;
      color: #fff;
      border: none;
      border-radius: 24rpx;
      font-size: 26rpx;
    }
  }
}

.fab {
  position: fixed;
  right: 40rpx;
  bottom: 40rpx;
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
  }
}

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
  width: 90%;
  max-width: 600rpx;
  max-height: 80vh;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f1f5f9;

  .modal-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1e293b;
  }

  .modal-close {
    font-size: 40rpx;
    color: #94a3b8;
    line-height: 1;
  }
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24rpx;
}

.form-item {
  margin-bottom: 24rpx;

  .form-label {
    display: block;
    font-size: 26rpx;
    color: #64748b;
    margin-bottom: 12rpx;
  }

  .form-input {
    width: 100%;
    height: 80rpx;
    padding: 0 20rpx;
    background: #f8fafc;
    border-radius: 12rpx;
    font-size: 28rpx;
  }
}

.food-list {
  .food-item {
    display: flex;
    gap: 12rpx;
    margin-bottom: 12rpx;

    .food-name-input {
      flex: 1;
      height: 72rpx;
      padding: 0 16rpx;
      background: #f8fafc;
      border-radius: 12rpx;
      font-size: 26rpx;
    }

    .food-amount-input {
      width: 120rpx;
      height: 72rpx;
      padding: 0 16rpx;
      background: #f8fafc;
      border-radius: 12rpx;
      font-size: 26rpx;
      text-align: center;
    }

    .remove-food {
      width: 72rpx;
      height: 72rpx;
      background: #fef2f2;
      border-radius: 12rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      color: #ef4444;
    }
  }
}

.add-food-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  width: 100%;
  height: 72rpx;
  background: #f8fafc;
  border: 2rpx dashed #cbd5e1;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #64748b;

  .add-icon {
    font-size: 28rpx;
  }
}

.nutrition-preview {
  display: flex;
  gap: 16rpx;

  .nutrition-item {
    flex: 1;
    text-align: center;
    padding: 16rpx;
    background: #f8fafc;
    border-radius: 12rpx;

    .nutrition-value {
      display: block;
      font-size: 28rpx;
      font-weight: 600;
      color: #1e293b;
    }

    .nutrition-label {
      font-size: 22rpx;
      color: #64748b;
    }
  }
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 24rpx;
  border-top: 1rpx solid #f1f5f9;

  button {
    flex: 1;
    height: 80rpx;
    border-radius: 40rpx;
    font-size: 28rpx;
    border: none;
  }

  .cancel-btn {
    background: #f1f5f9;
    color: #64748b;
  }

  .confirm-btn {
    background: #00b171;
    color: #fff;
  }
}

.meal-type-modal {
  .meal-type-list {
    padding: 24rpx;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16rpx;
  }

  .meal-type-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12rpx;
    padding: 32rpx;
    background: #f8fafc;
    border-radius: 16rpx;

    &:active {
      background: #f0fdf4;
    }

    .meal-icon {
      font-size: 48rpx;
    }

    .meal-name {
      font-size: 28rpx;
      color: #1e293b;
    }
  }
}
</style>
