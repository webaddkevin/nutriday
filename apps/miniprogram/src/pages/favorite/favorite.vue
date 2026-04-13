<template>
  <view class="favorite-page">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <input
        v-model="searchKeyword"
        placeholder="搜索收藏的食物"
        class="search-input"
        @confirm="searchFavorites"
      />
      <button class="search-btn" @click="searchFavorites">搜索</button>
    </view>

    <!-- 统计卡片 -->
    <view class="card stats-card">
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-value">{{ favorites.length }}</text>
          <text class="stat-label">收藏食物</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ filteredFavorites.length }}</text>
          <text class="stat-label">搜索结果</text>
        </view>
      </view>
      <view class="action-row">
        <button class="compare-btn" @click="goToCompare">
          <text class="btn-icon">⚖️</text>
          <text class="btn-text">食物对比</text>
        </button>
      </view>
    </view>

    <!-- 收藏列表 -->
    <view v-if="filteredFavorites.length > 0" class="card list-card">
      <view class="favorite-list">
        <view
          v-for="item in filteredFavorites"
          :key="item.id"
          class="favorite-item"
          @click="selectFood(item)"
        >
          <view class="food-info">
            <text class="food-name">{{ item.food?.name || '未知食物' }}</text>
            <view class="food-meta">
              <text class="food-category">{{ item.food?.category || '未分类' }}</text>
              <text v-if="item.note" class="food-note">{{ item.note }}</text>
            </view>
            <view class="food-nutrition">
              <text class="nutrition-item">{{ item.food?.calories || 0 }} 千卡</text>
              <text class="nutrition-divider">|</text>
              <text class="nutrition-item">蛋白质 {{ item.food?.protein || 0 }}g</text>
              <text class="nutrition-divider">|</text>
              <text class="nutrition-item">碳水 {{ item.food?.carbs || 0 }}g</text>
              <text class="nutrition-divider">|</text>
              <text class="nutrition-item">脂肪 {{ item.food?.fat || 0 }}g</text>
            </view>
          </view>
          <view class="actions">
            <text class="edit-btn" @click.stop="editNote(item)">编辑</text>
            <text class="delete-btn" @click.stop="removeFavorite(item)">移除</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view v-if="favorites.length === 0 && !loading" class="empty-state">
      <text class="empty-icon">⭐</text>
      <text class="empty-text">还没有收藏的食物</text>
      <text class="empty-hint">在食物搜索页面点击收藏按钮，添加常吃的食物</text>
    </view>

    <view
      v-if="favorites.length > 0 && filteredFavorites.length === 0 && searchKeyword"
      class="empty-state"
    >
      <text class="empty-icon">🔍</text>
      <text class="empty-text">没有找到匹配的食物</text>
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>

    <!-- 编辑备注弹窗 -->
    <view v-if="showNoteModal" class="modal-overlay" @click="closeNoteModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">编辑备注</text>
          <text class="modal-close" @click="closeNoteModal">×</text>
        </view>
        <view class="modal-body">
          <textarea
            v-model="editingNote"
            placeholder="添加备注（如：早餐常吃、搭配牛奶等）"
            class="note-textarea"
            maxlength="100"
          />
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @click="closeNoteModal">取消</button>
          <button class="confirm-btn" @click="saveNote">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { request } from '@/utils/request';
import { requireUserId } from '@/utils/user';

interface Food {
  id: number;
  name: string;
  category?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface FoodFavorite {
  id: number;
  userId: number;
  foodId: number;
  note?: string;
  createdAt: string;
  food?: Food;
}

const favorites = ref<FoodFavorite[]>([]);
const searchKeyword = ref('');
const loading = ref(false);
const showNoteModal = ref(false);
const editingItem = ref<FoodFavorite | null>(null);
const editingNote = ref('');

// 过滤后的收藏列表
const filteredFavorites = computed(() => {
  if (!searchKeyword.value) {
    return favorites.value;
  }
  const keyword = searchKeyword.value.toLowerCase();
  return favorites.value.filter(
    (item) =>
      item.food?.name?.toLowerCase().includes(keyword) ||
      item.note?.toLowerCase().includes(keyword) ||
      item.food?.category?.toLowerCase().includes(keyword),
  );
});

// 加载收藏列表
const loadFavorites = async () => {
  loading.value = true;
  try {
    const userId = requireUserId();
    const res = await request({
      url: '/food-favorite',
      data: { userId },
    });
    favorites.value = res.data || [];
  } catch (error) {
    console.error('加载收藏失败:', error);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

// 搜索收藏
const searchFavorites = () => {
  // 过滤逻辑已在 computed 中实现
};

// 选择食物（跳转到添加饮食记录）
const selectFood = (item: FoodFavorite) => {
  uni.navigateTo({
    url: `/pages/meal-add/meal-add?foodId=${item.foodId}`,
  });
};

// 跳转食物对比页
const goToCompare = () => {
  uni.navigateTo({
    url: '/pages/food-compare/food-compare',
  });
};

// 编辑备注
const editNote = (item: FoodFavorite) => {
  editingItem.value = item;
  editingNote.value = item.note || '';
  showNoteModal.value = true;
};

// 关闭备注弹窗
const closeNoteModal = () => {
  showNoteModal.value = false;
  editingItem.value = null;
  editingNote.value = '';
};

// 保存备注
const saveNote = async () => {
  if (!editingItem.value) return;

  try {
    const userId = requireUserId();
    await request({
      url: '/food-favorite/note',
      method: 'POST',
      data: {
        userId,
        foodId: editingItem.value.foodId,
        note: editingNote.value,
      },
    });

    // 更新本地数据
    const index = favorites.value.findIndex((f) => f.id === editingItem.value!.id);
    if (index !== -1) {
      favorites.value[index].note = editingNote.value;
    }

    uni.showToast({ title: '保存成功', icon: 'success' });
    closeNoteModal();
  } catch (error) {
    console.error('保存备注失败:', error);
    uni.showToast({ title: '保存失败', icon: 'none' });
  }
};

// 移除收藏
const removeFavorite = async (item: FoodFavorite) => {
  const res = await uni.showModal({
    title: '确认移除',
    content: `确定要移除「${item.food?.name || '该食物'}」的收藏吗？`,
  });

  if (!res.confirm) return;

  try {
    const userId = requireUserId();
    await request({
      url: '/food-favorite',
      method: 'DELETE',
      data: { userId, foodId: item.foodId },
    });

    favorites.value = favorites.value.filter((f) => f.id !== item.id);
    uni.showToast({ title: '已移除', icon: 'success' });
  } catch (error) {
    console.error('移除收藏失败:', error);
    uni.showToast({ title: '移除失败', icon: 'none' });
  }
};

onMounted(() => {
  loadFavorites();
});
</script>

<style scoped>
.favorite-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
  box-sizing: border-box;
}

.search-bar {
  display: flex;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.search-input {
  flex: 1;
  height: 80rpx;
  background: #fff;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
}

.search-btn {
  width: 140rpx;
  height: 80rpx;
  background: #4caf50;
  color: #fff;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.stats-card {
  padding: 32rpx 24rpx;
}

.stats-row {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #4caf50;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.action-row {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f1f5f9;
}

.compare-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  width: 100%;
  height: 80rpx;
  background: linear-gradient(135deg, #00b171 0%, #00d68f 100%);
  border: none;
  border-radius: 12rpx;

  .btn-icon {
    font-size: 28rpx;
  }

  .btn-text {
    font-size: 28rpx;
    color: #fff;
    font-weight: 500;
  }
}

.list-card {
  padding: 0;
}

.favorite-list {
  display: flex;
  flex-direction: column;
}

.favorite-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.favorite-item:last-child {
  border-bottom: none;
}

.food-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.food-name {
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
}

.food-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.food-category {
  font-size: 24rpx;
  color: #4caf50;
  background: #e8f5e9;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.food-note {
  font-size: 24rpx;
  color: #999;
}

.food-nutrition {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 4rpx;
}

.nutrition-item {
  font-size: 22rpx;
  color: #666;
}

.nutrition-divider {
  font-size: 22rpx;
  color: #ddd;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  align-items: flex-end;
}

.edit-btn {
  font-size: 24rpx;
  color: #2196f3;
  padding: 8rpx 16rpx;
}

.delete-btn {
  font-size: 24rpx;
  color: #f44336;
  padding: 8rpx 16rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.empty-hint {
  font-size: 26rpx;
  color: #bbb;
  text-align: center;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 40rpx;
  color: #999;
}

/* 弹窗样式 */
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
  width: 600rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 500;
}

.modal-close {
  font-size: 40rpx;
  color: #999;
  padding: 0 16rpx;
}

.modal-body {
  padding: 24rpx;
}

.note-textarea {
  width: 100%;
  height: 200rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 16rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.modal-footer {
  display: flex;
  gap: 16rpx;
  padding: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  height: 80rpx;
  border: none;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background: #4caf50;
  color: #fff;
}
</style>
