<template>
  <view class="scan-page">
    <!-- 顶部 Tab 切换 -->
    <view class="tab-bar">
      <view
        class="tab-item"
        :class="{ active: activeTab === 'barcode' }"
        @tap="activeTab = 'barcode'"
      >
        <text class="tab-icon">📊</text>
        <text class="tab-text">条码扫描</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'photo' }" @tap="activeTab = 'photo'">
        <text class="tab-icon">📷</text>
        <text class="tab-text">拍照识别</text>
      </view>
      <view class="tab-item" :class="{ active: activeTab === 'text' }" @tap="activeTab = 'text'">
        <text class="tab-icon">✏️</text>
        <text class="tab-text">文字搜索</text>
      </view>
    </view>

    <!-- 条码扫描 -->
    <view v-if="activeTab === 'barcode'" class="scan-container">
      <view class="scan-area">
        <view class="scan-icon">📊</view>
        <text class="scan-title">扫描食品条形码</text>
        <text class="scan-desc">扫描包装上的条形码，快速获取营养信息</text>
      </view>

      <view class="action-buttons">
        <button class="primary-btn" @tap="startBarcodeScan">
          <text class="btn-icon">📷</text>
          <text>开始扫描</text>
        </button>
        <button class="secondary-btn" @tap="showManualInput = true">
          <text class="btn-icon">⌨️</text>
          <text>手动输入</text>
        </button>
      </view>
    </view>

    <!-- 拍照识别 -->
    <view v-if="activeTab === 'photo'" class="photo-container">
      <view v-if="!photoPreview" class="photo-area" @tap="takePhoto">
        <view class="photo-icon">🍽️</view>
        <text class="photo-title">拍摄食物照片</text>
        <text class="photo-desc">AI 将自动识别食物并估算营养成分</text>
        <button class="photo-btn">
          <text class="btn-icon">📸</text>
          <text>拍照识别</text>
        </button>
      </view>

      <view v-else class="photo-preview">
        <image :src="photoPreview" mode="aspectFit" class="preview-image" />
        <view class="preview-actions">
          <button class="retry-btn" @tap="takePhoto">重新拍摄</button>
          <button class="confirm-btn" :disabled="analyzing" @tap="analyzePhoto">
            {{ analyzing ? '识别中...' : '开始识别' }}
          </button>
        </view>
      </view>

      <!-- AI 识别提示 -->
      <view class="ai-tips">
        <view class="tip-item">
          <text class="tip-icon">💡</text>
          <text class="tip-text">拍摄清晰的食物照片效果更佳</text>
        </view>
        <view class="tip-item">
          <text class="tip-icon">🎯</text>
          <text class="tip-text">尽量将食物放在画面中央</text>
        </view>
        <view class="tip-item">
          <text class="tip-icon">☀️</text>
          <text class="tip-text">光线充足时识别更准确</text>
        </view>
      </view>
    </view>

    <!-- 文字搜索 -->
    <view v-if="activeTab === 'text'" class="search-container">
      <view class="search-box">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="输入食物名称，如：苹果、米饭..."
          class="search-input"
          @confirm="searchFood"
        />
        <button class="search-btn" @tap="searchFood">
          <text class="btn-icon">🔍</text>
        </button>
      </view>

      <!-- 搜索结果 -->
      <view v-if="searchResults.length > 0" class="search-results">
        <view
          v-for="food in searchResults"
          :key="food.name"
          class="result-item"
          @tap="selectFood(food)"
        >
          <view class="result-info">
            <text class="result-name">{{ food.name }}</text>
            <text v-if="food.category" class="result-category">{{ food.category }}</text>
          </view>
          <view class="result-nutrition">
            <text class="nutrition-value">{{ food.calories }} kcal</text>
            <text class="nutrition-detail">
              P: {{ food.protein }}g | C: {{ food.carbs }}g | F: {{ food.fat }}g
            </text>
          </view>
        </view>
      </view>

      <!-- 热门搜索 -->
      <view v-if="!searchKeyword && searchResults.length === 0" class="hot-foods">
        <text class="section-title">热门食物</text>
        <view class="food-tags">
          <view v-for="food in hotFoods" :key="food" class="food-tag" @tap="quickSearch(food)">
            {{ food }}
          </view>
        </view>
      </view>
    </view>

    <!-- 扫描/识别结果 -->
    <view v-if="scanResult" class="result-card">
      <view class="result-header">
        <text class="result-title">识别结果</text>
        <text class="result-badge" :class="scanResult.source">
          {{ getSourceLabel(scanResult.source) }}
        </text>
      </view>

      <view v-if="scanResult.foods && scanResult.foods.length > 1" class="multi-foods">
        <text class="foods-count">共识别 {{ scanResult.foods.length }} 种食物</text>
        <view class="foods-list">
          <view v-for="food in scanResult.foods" :key="food.name" class="food-item">
            <view class="food-info">
              <text class="food-name">{{ food.name }}</text>
              <text v-if="food.confidence" class="food-confidence">
                置信度: {{ (food.confidence * 100).toFixed(0) }}%
              </text>
            </view>
            <text class="food-calories">{{ food.calories }} kcal</text>
          </view>
        </view>
        <view class="total-calories">
          <text class="total-label">总热量</text>
          <text class="total-value">{{ scanResult.totalCalories || 0 }} kcal</text>
        </view>
      </view>

      <view v-else class="single-food">
        <view class="food-detail">
          <view class="detail-row">
            <text class="detail-label">食物名称</text>
            <text class="detail-value">{{ scanResult.name || scanResult.foods?.[0]?.name }}</text>
          </view>
          <view v-if="scanResult.brand" class="detail-row">
            <text class="detail-label">品牌</text>
            <text class="detail-value">{{ scanResult.brand }}</text>
          </view>
          <view v-if="scanResult.category" class="detail-row">
            <text class="detail-label">分类</text>
            <text class="detail-value">{{ scanResult.category }}</text>
          </view>
        </view>

        <view class="nutrition-card">
          <text class="nutrition-title">营养成分 (每100g)</text>
          <view class="nutrition-grid">
            <view class="nutrition-item">
              <text class="nutrition-value">{{ getFoodCalories(scanResult) }}</text>
              <text class="nutrition-label">千卡</text>
            </view>
            <view class="nutrition-item">
              <text class="nutrition-value">{{ getFoodProtein(scanResult) }}g</text>
              <text class="nutrition-label">蛋白质</text>
            </view>
            <view class="nutrition-item">
              <text class="nutrition-value">{{ getFoodCarbs(scanResult) }}g</text>
              <text class="nutrition-label">碳水</text>
            </view>
            <view class="nutrition-item">
              <text class="nutrition-value">{{ getFoodFat(scanResult) }}g</text>
              <text class="nutrition-label">脂肪</text>
            </view>
          </view>
        </view>
      </view>

      <view class="result-actions">
        <button class="add-btn" @tap="addToMeal">
          <text class="btn-icon">➕</text>
          <text>添加到饮食记录</text>
        </button>
      </view>
    </view>

    <!-- 手动输入条码弹窗 -->
    <view v-if="showManualInput" class="modal-overlay" @tap="showManualInput = false">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">手动输入条码</text>
          <text class="modal-close" @tap="showManualInput = false">×</text>
        </view>
        <view class="modal-body">
          <input
            v-model="manualBarcode"
            type="number"
            placeholder="请输入条形码数字"
            class="barcode-input"
            maxlength="13"
          />
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @tap="showManualInput = false">取消</button>
          <button class="confirm-btn" @tap="lookupBarcode">查询</button>
        </view>
      </view>
    </view>

    <!-- 添加份量弹窗 -->
    <view v-if="showAmountModal" class="modal-overlay" @tap="showAmountModal = false">
      <view class="modal-content amount-modal" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">设置份量</text>
          <text class="modal-close" @tap="showAmountModal = false">×</text>
        </view>
        <view class="modal-body">
          <view class="amount-info">
            <text class="amount-food-name">{{ selectedFood?.name }}</text>
            <text class="amount-unit">单位: {{ selectedFood?.unit || 'g' }}</text>
          </view>
          <view class="amount-input-wrap">
            <button class="amount-btn" @tap="adjustAmount(-50)">-50</button>
            <input v-model="inputAmount" type="digit" class="amount-input" />
            <button class="amount-btn" @tap="adjustAmount(50)">+50</button>
          </view>
          <view class="quick-amounts">
            <view
              v-for="amount in quickAmounts"
              :key="amount"
              class="quick-amount"
              :class="{ active: inputAmount === amount }"
              @tap="inputAmount = amount"
            >
              {{ amount }}g
            </view>
          </view>
          <view class="estimated-nutrition">
            <text class="estimated-label">预估营养</text>
            <view class="estimated-values">
              <text class="estimated-item">热量: {{ estimatedCalories }} kcal</text>
              <text class="estimated-item">蛋白质: {{ estimatedProtein }}g</text>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="confirm-btn full" @tap="confirmAdd">确认添加</button>
        </view>
      </view>
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="loading-overlay">
      <view class="loading-content">
        <view class="loading-spinner"></view>
        <text class="loading-text">{{ loadingText }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { request } from '@/utils/request';

interface FoodInfo {
  id?: number;
  name: string;
  nameEn?: string;
  brand?: string;
  category?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sodium?: number;
  servingSize?: number;
  unit?: string;
  imageUrl?: string;
  source: string;
  confidence?: number;
  foods?: FoodInfo[];
  totalCalories?: number;
}

const activeTab = ref<'barcode' | 'photo' | 'text'>('barcode');
const loading = ref(false);
const loadingText = ref('正在查询...');
const scanResult = ref<FoodInfo | null>(null);
const showManualInput = ref(false);
const manualBarcode = ref('');

// 拍照相关
const photoPreview = ref('');
const photoPath = ref('');
const analyzing = ref(false);

// 搜索相关
const searchKeyword = ref('');
const searchResults = ref<FoodInfo[]>([]);
const hotFoods = ['米饭', '鸡胸肉', '鸡蛋', '牛奶', '苹果', '香蕉', '西兰花', '面包'];

// 添加份量相关
const showAmountModal = ref(false);
const selectedFood = ref<FoodInfo | null>(null);
const inputAmount = ref(100);
const quickAmounts = [50, 100, 150, 200, 250];

// 计算预估营养
const estimatedCalories = computed(() => {
  if (!selectedFood.value) return 0;
  const ratio = inputAmount.value / 100;
  return Math.round(selectedFood.value.calories * ratio);
});

const estimatedProtein = computed(() => {
  if (!selectedFood.value) return 0;
  const ratio = inputAmount.value / 100;
  return Math.round(selectedFood.value.protein * ratio * 10) / 10;
});

// 获取来源标签
const getSourceLabel = (source: string) => {
  const labels: Record<string, string> = {
    local: '本地数据库',
    usda: 'USDA',
    estimated: 'AI 估算',
    ai: 'AI 识别',
  };
  return labels[source] || source;
};

// 获取食物热量
const getFoodCalories = (food: FoodInfo) => {
  return food.foods?.[0]?.calories || food.calories || 0;
};

const getFoodProtein = (food: FoodInfo) => {
  return food.foods?.[0]?.protein || food.protein || 0;
};

const getFoodCarbs = (food: FoodInfo) => {
  return food.foods?.[0]?.carbs || food.carbs || 0;
};

const getFoodFat = (food: FoodInfo) => {
  return food.foods?.[0]?.fat || food.fat || 0;
};

// 条码扫描
const startBarcodeScan = () => {
  uni.scanCode({
    scanType: ['barCode'],
    success: (res) => {
      lookupBarcode(res.result);
    },
    fail: (err) => {
      console.error('扫码失败:', err);
      uni.showToast({ title: '扫码失败', icon: 'none' });
    },
  });
};

// 查询条码
const lookupBarcode = async (barcode?: string) => {
  const code = barcode || manualBarcode.value;
  if (!code) {
    uni.showToast({ title: '请输入条码', icon: 'none' });
    return;
  }

  showManualInput.value = false;
  loading.value = true;
  loadingText.value = '正在查询...';

  try {
    const res = await request({
      url: `/barcode/${code}`,
    });

    if (res.success && res.data) {
      scanResult.value = res.data;
    } else {
      uni.showToast({ title: '未找到该食品信息', icon: 'none' });
    }
  } catch (error) {
    console.error('查询失败:', error);
    uni.showToast({ title: '查询失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

// 拍照
const takePhoto = () => {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['camera', 'album'],
    success: (res) => {
      photoPath.value = res.tempFilePaths[0];
      photoPreview.value = res.tempFilePaths[0];
    },
  });
};

// AI 分析照片
const analyzePhoto = async () => {
  if (!photoPath.value) return;

  analyzing.value = true;
  loading.value = true;
  loadingText.value = 'AI 正在识别...';

  try {
    // 上传图片到服务器进行识别
    uni.uploadFile({
      url: `${import.meta.env.VITE_API_URL}/food/recognize`,
      filePath: photoPath.value,
      name: 'image',
      success: (res) => {
        const data = JSON.parse(res.data);
        if (data.success && data.foods) {
          scanResult.value = {
            name: data.foods.map((f: FoodInfo) => f.name).join('、'),
            foods: data.foods,
            totalCalories: data.totalCalories,
            source: 'ai',
          };
        } else {
          uni.showToast({ title: data.message || '识别失败', icon: 'none' });
        }
        analyzing.value = false;
        loading.value = false;
      },
      fail: (err) => {
        console.error('上传失败:', err);
        uni.showToast({ title: '上传失败', icon: 'none' });
        analyzing.value = false;
        loading.value = false;
      },
    });
  } catch (error) {
    console.error('识别失败:', error);
    uni.showToast({ title: '识别失败', icon: 'none' });
    analyzing.value = false;
    loading.value = false;
  }
};

// 搜索食物
const searchFood = async () => {
  if (!searchKeyword.value.trim()) {
    uni.showToast({ title: '请输入食物名称', icon: 'none' });
    return;
  }

  loading.value = true;
  loadingText.value = '正在搜索...';

  try {
    const res = await request({
      url: `/food/search/enhanced?keyword=${encodeURIComponent(searchKeyword.value)}`,
    });

    if (res.success && res.data) {
      searchResults.value = res.data;
      if (res.data.length === 0) {
        uni.showToast({ title: '未找到相关食物', icon: 'none' });
      }
    }
  } catch (error) {
    console.error('搜索失败:', error);
    uni.showToast({ title: '搜索失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

// 快速搜索
const quickSearch = (keyword: string) => {
  searchKeyword.value = keyword;
  searchFood();
};

// 选择食物
const selectFood = (food: FoodInfo) => {
  selectedFood.value = food;
  inputAmount.value = food.servingSize || 100;
  showAmountModal.value = true;
};

// 调整份量
const adjustAmount = (delta: number) => {
  const newAmount = inputAmount.value + delta;
  if (newAmount > 0) {
    inputAmount.value = newAmount;
  }
};

// 确认添加
const confirmAdd = async () => {
  if (!selectedFood.value) return;

  showAmountModal.value = false;
  loading.value = true;
  loadingText.value = '正在添加...';

  try {
    // 如果食物没有 ID，先保存到本地数据库
    let foodId = selectedFood.value.id || selectedFood.value.foods?.[0]?.id;

    if (!foodId) {
      // 保存到本地数据库
      const saveRes = await request({
        url: '/food/save-external',
        method: 'POST',
        data: {
          name: selectedFood.value.name,
          nameEn: selectedFood.value.nameEn,
          category: selectedFood.value.category || '其他',
          calories: selectedFood.value.calories,
          protein: selectedFood.value.protein,
          carbs: selectedFood.value.carbs,
          fat: selectedFood.value.fat,
          fiber: selectedFood.value.fiber,
          servingSize: selectedFood.value.servingSize || 100,
          unit: selectedFood.value.unit || 'g',
          source: selectedFood.value.source || 'external',
        },
      });

      if (saveRes.data?.id) {
        foodId = saveRes.data.id;
      } else {
        throw new Error('保存食物失败');
      }
    }

    const ratio = inputAmount.value / 100;
    const res = await request({
      url: '/meal-log',
      method: 'POST',
      data: {
        foodId: foodId,
        foodName: selectedFood.value.name,
        mealType: 'snack', // 默认加餐，用户可在详情页修改
        amount: inputAmount.value,
        unit: selectedFood.value.unit || 'g',
        calories: Math.round(selectedFood.value.calories * ratio),
        protein: Math.round(selectedFood.value.protein * ratio * 10) / 10,
        carbs: Math.round(selectedFood.value.carbs * ratio * 10) / 10,
        fat: Math.round(selectedFood.value.fat * ratio * 10) / 10,
        date: new Date().toISOString().split('T')[0],
      },
    });

    if (res.success || res.data) {
      uni.showToast({ title: '添加成功', icon: 'success' });
      scanResult.value = null;
      photoPreview.value = '';
      photoPath.value = '';
      searchResults.value = [];
      searchKeyword.value = '';
    }
  } catch (error: any) {
    console.error('添加失败:', error);
    uni.showToast({ title: error.message || '添加失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

// 添加到饮食记录
const addToMeal = () => {
  if (!scanResult.value) return;

  if (scanResult.value.foods && scanResult.value.foods.length > 0) {
    // 多个食物，选择第一个
    selectedFood.value = scanResult.value.foods[0];
  } else {
    selectedFood.value = scanResult.value;
  }

  inputAmount.value = selectedFood.value.servingSize || 100;
  showAmountModal.value = true;
};
</script>

<style lang="scss" scoped>
.scan-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
  padding-bottom: 120rpx;
}

// Tab 栏
.tab-bar {
  display: flex;
  background: #fff;
  padding: 24rpx;
  gap: 16rpx;
  box-shadow: 0 2rpx 20rpx rgba(0, 0, 0, 0.04);
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  padding: 24rpx 16rpx;
  background: #f8fafc;
  border-radius: 16rpx;
  transition: all 0.3s ease;

  .tab-icon {
    font-size: 40rpx;
  }

  .tab-text {
    font-size: 24rpx;
    color: #64748b;
    font-weight: 500;
  }

  &.active {
    background: linear-gradient(135deg, #00b171 0%, #00d68f 100%);

    .tab-text {
      color: #fff;
    }
  }
}

// 扫描区域
.scan-container {
  padding: 32rpx;
}

.scan-area {
  background: #fff;
  border-radius: 24rpx;
  padding: 64rpx 32rpx;
  text-align: center;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
}

.scan-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.scan-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12rpx;
}

.scan-desc {
  display: block;
  font-size: 26rpx;
  color: #64748b;
}

// 操作按钮
.action-buttons {
  display: flex;
  gap: 24rpx;
  margin-top: 32rpx;
}

.primary-btn,
.secondary-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  height: 96rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 500;
  border: none;

  .btn-icon {
    font-size: 36rpx;
  }
}

.primary-btn {
  background: linear-gradient(135deg, #00b171 0%, #00d68f 100%);
  color: #fff;
}

.secondary-btn {
  background: #fff;
  color: #64748b;
  border: 2rpx solid #e2e8f0;
}

// 拍照区域
.photo-container {
  padding: 32rpx;
}

.photo-area {
  background: #fff;
  border-radius: 24rpx;
  padding: 64rpx 32rpx;
  text-align: center;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
}

.photo-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.photo-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12rpx;
}

.photo-desc {
  display: block;
  font-size: 26rpx;
  color: #64748b;
  margin-bottom: 32rpx;
}

.photo-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 24rpx 48rpx;
  background: linear-gradient(135deg, #00b171 0%, #00d68f 100%);
  color: #fff;
  border-radius: 48rpx;
  font-size: 30rpx;
  font-weight: 500;
  border: none;

  .btn-icon {
    font-size: 36rpx;
  }
}

// 照片预览
.photo-preview {
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
}

.preview-image {
  width: 100%;
  height: 400rpx;
  background: #f8fafc;
}

.preview-actions {
  display: flex;
  gap: 24rpx;
  padding: 24rpx;
}

.retry-btn,
.confirm-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
}

.retry-btn {
  background: #f1f5f9;
  color: #64748b;
}

.confirm-btn {
  background: linear-gradient(135deg, #00b171 0%, #00d68f 100%);
  color: #fff;

  &:disabled {
    opacity: 0.6;
  }
}

// AI 提示
.ai-tips {
  margin-top: 32rpx;
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 12rpx 0;

  .tip-icon {
    font-size: 28rpx;
  }

  .tip-text {
    font-size: 26rpx;
    color: #64748b;
  }
}

// 搜索区域
.search-container {
  padding: 32rpx;
}

.search-box {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.search-input {
  flex: 1;
  height: 88rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  border: 2rpx solid #e2e8f0;
}

.search-btn {
  width: 88rpx;
  height: 88rpx;
  background: linear-gradient(135deg, #00b171 0%, #00d68f 100%);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;

  .btn-icon {
    font-size: 36rpx;
  }
}

// 搜索结果
.search-results {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }
}

.result-info {
  .result-name {
    display: block;
    font-size: 28rpx;
    font-weight: 500;
    color: #1e293b;
    margin-bottom: 4rpx;
  }

  .result-category {
    font-size: 24rpx;
    color: #94a3b8;
  }
}

.result-nutrition {
  text-align: right;

  .nutrition-value {
    display: block;
    font-size: 28rpx;
    font-weight: 600;
    color: #00b171;
  }

  .nutrition-detail {
    font-size: 22rpx;
    color: #94a3b8;
  }
}

// 热门食物
.hot-foods {
  padding: 24rpx;
  background: #fff;
  border-radius: 16rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 20rpx;
}

.food-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.food-tag {
  padding: 12rpx 24rpx;
  background: #f8fafc;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #64748b;
  transition: all 0.2s ease;

  &:active {
    background: #00b171;
    color: #fff;
  }
}

// 结果卡片
.result-card {
  margin: 32rpx;
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.04);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f1f5f9;
}

.result-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
}

.result-badge {
  padding: 6rpx 16rpx;
  border-radius: 12rpx;
  font-size: 22rpx;
  font-weight: 500;

  &.local {
    background: #dbeafe;
    color: #2563eb;
  }

  &.usda {
    background: #fef3c7;
    color: #d97706;
  }

  &.estimated,
  &.ai {
    background: #d1fae5;
    color: #059669;
  }
}

// 多个食物
.multi-foods {
  padding: 24rpx;
}

.foods-count {
  display: block;
  font-size: 26rpx;
  color: #64748b;
  margin-bottom: 20rpx;
}

.foods-list {
  margin-bottom: 24rpx;
}

.food-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }
}

.food-info {
  .food-name {
    display: block;
    font-size: 28rpx;
    color: #1e293b;
    margin-bottom: 4rpx;
  }

  .food-confidence {
    font-size: 22rpx;
    color: #94a3b8;
  }
}

.food-calories {
  font-size: 28rpx;
  font-weight: 600;
  color: #00b171;
}

.total-calories {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: linear-gradient(135deg, #00b171 0%, #00d68f 100%);
  border-radius: 16rpx;

  .total-label {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.9);
  }

  .total-value {
    font-size: 36rpx;
    font-weight: 700;
    color: #fff;
  }
}

// 单个食物
.single-food {
  padding: 24rpx;
}

.food-detail {
  margin-bottom: 24rpx;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }
}

.detail-label {
  font-size: 26rpx;
  color: #94a3b8;
}

.detail-value {
  font-size: 26rpx;
  font-weight: 500;
  color: #1e293b;
}

.nutrition-card {
  background: #f8fafc;
  border-radius: 16rpx;
  padding: 24rpx;
}

.nutrition-title {
  display: block;
  font-size: 26rpx;
  color: #64748b;
  margin-bottom: 20rpx;
}

.nutrition-grid {
  display: flex;
  justify-content: space-around;
}

.nutrition-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nutrition-value {
  font-size: 36rpx;
  font-weight: 700;
  color: #00b171;
}

.nutrition-label {
  font-size: 24rpx;
  color: #94a3b8;
  margin-top: 8rpx;
}

// 操作按钮
.result-actions {
  padding: 24rpx;
  border-top: 1rpx solid #f1f5f9;
}

.add-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #00b171 0%, #00d68f 100%);
  color: #fff;
  border-radius: 16rpx;
  font-size: 30rpx;
  font-weight: 500;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;

  .btn-icon {
    font-size: 32rpx;
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
  width: 640rpx;
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

.barcode-input {
  width: 100%;
  height: 88rpx;
  background: #f8fafc;
  border-radius: 16rpx;
  padding: 0 24rpx;
  font-size: 32rpx;
  text-align: center;
  letter-spacing: 4rpx;
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

  &.full {
    flex: none;
    width: 100%;
  }
}

// 份量弹窗
.amount-modal {
  width: 680rpx;
}

.amount-info {
  text-align: center;
  margin-bottom: 32rpx;

  .amount-food-name {
    display: block;
    font-size: 36rpx;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 8rpx;
  }

  .amount-unit {
    font-size: 26rpx;
    color: #94a3b8;
  }
}

.amount-input-wrap {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.amount-btn {
  width: 80rpx;
  height: 80rpx;
  background: #f1f5f9;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #64748b;
  border: none;
}

.amount-input {
  flex: 1;
  height: 80rpx;
  background: #f8fafc;
  border-radius: 12rpx;
  text-align: center;
  font-size: 40rpx;
  font-weight: 600;
  color: #1e293b;
}

.quick-amounts {
  display: flex;
  justify-content: space-between;
  margin-bottom: 32rpx;
}

.quick-amount {
  padding: 12rpx 24rpx;
  background: #f8fafc;
  border-radius: 12rpx;
  font-size: 26rpx;
  color: #64748b;

  &.active {
    background: #00b171;
    color: #fff;
  }
}

.estimated-nutrition {
  background: #f8fafc;
  border-radius: 16rpx;
  padding: 20rpx;
}

.estimated-label {
  display: block;
  font-size: 24rpx;
  color: #94a3b8;
  margin-bottom: 12rpx;
}

.estimated-values {
  display: flex;
  gap: 32rpx;
}

.estimated-item {
  font-size: 28rpx;
  color: #00b171;
  font-weight: 500;
}

// 加载中
.loading-overlay {
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

.loading-content {
  background: #fff;
  padding: 48rpx 64rpx;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-spinner {
  width: 60rpx;
  height: 60rpx;
  border: 4rpx solid #e2e8f0;
  border-top-color: #00b171;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 20rpx;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 28rpx;
  color: #64748b;
}
</style>
