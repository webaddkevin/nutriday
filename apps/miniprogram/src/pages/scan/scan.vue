<template>
  <view class="scan-page">
    <!-- 扫码区域 -->
    <view class="scan-container">
      <camera
        v-if="showCamera"
        class="camera"
        device-position="back"
        flash="auto"
        @error="onCameraError"
      >
        <cover-view class="scan-frame">
          <cover-view class="scan-line"></cover-view>
        </cover-view>
        <cover-view class="scan-tip">将条形码放入框内，即可自动扫描</cover-view>
      </camera>

      <view v-else class="camera-placeholder">
        <text class="placeholder-icon">📷</text>
        <text class="placeholder-text">点击下方按钮开始扫码</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-bar">
      <button class="scan-btn" @click="startScan">
        <text class="btn-icon">📷</text>
        <text>扫码识别</text>
      </button>
      <button class="manual-btn" @click="manualInput">
        <text class="btn-icon">⌨️</text>
        <text>手动输入</text>
      </button>
    </view>

    <!-- 扫描结果 -->
    <view v-if="scanResult" class="result-card">
      <view class="result-header">
        <text class="result-title">扫描结果</text>
        <text class="result-source" :class="scanResult.source">
          {{ scanResult.source === 'local' ? '本地数据库' : 'Open Food Facts' }}
        </text>
      </view>

      <view v-if="scanResult.imageUrl" class="result-image">
        <image :src="scanResult.imageUrl" mode="aspectFit" />
      </view>

      <view class="result-info">
        <view class="info-row">
          <text class="info-label">食品名称</text>
          <text class="info-value">{{ scanResult.name }}</text>
        </view>
        <view v-if="scanResult.brand" class="info-row">
          <text class="info-label">品牌</text>
          <text class="info-value">{{ scanResult.brand }}</text>
        </view>
        <view class="info-row">
          <text class="info-label">分类</text>
          <text class="info-value">{{ scanResult.category }}</text>
        </view>
      </view>

      <view class="nutrition-info">
        <view class="nutrition-title">营养成分 (每100g)</view>
        <view class="nutrition-grid">
          <view class="nutrition-item">
            <text class="nutrition-value">{{ scanResult.calories }}</text>
            <text class="nutrition-label">千卡</text>
          </view>
          <view class="nutrition-item">
            <text class="nutrition-value">{{ scanResult.protein }}g</text>
            <text class="nutrition-label">蛋白质</text>
          </view>
          <view class="nutrition-item">
            <text class="nutrition-value">{{ scanResult.carbs }}g</text>
            <text class="nutrition-label">碳水</text>
          </view>
          <view class="nutrition-item">
            <text class="nutrition-value">{{ scanResult.fat }}g</text>
            <text class="nutrition-label">脂肪</text>
          </view>
        </view>
      </view>

      <view class="result-actions">
        <button class="add-btn" @click="addToMeal">添加到饮食记录</button>
        <button class="save-btn" @click="saveToLocal">保存到本地</button>
      </view>
    </view>

    <!-- 手动输入弹窗 -->
    <view v-if="showManualInput" class="modal-overlay" @click="closeManualInput">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">手动输入条码</text>
          <text class="modal-close" @click="closeManualInput">×</text>
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
          <button class="cancel-btn" @click="closeManualInput">取消</button>
          <button class="confirm-btn" @click="lookupManualBarcode">查询</button>
        </view>
      </view>
    </view>

    <!-- 加载中 -->
    <view v-if="loading" class="loading-overlay">
      <view class="loading-content">
        <text class="loading-icon">🔍</text>
        <text class="loading-text">正在查询...</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { request } from '@/utils/request';

interface FoodInfo {
  barcode: string;
  name: string;
  brand?: string;
  category?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sodium?: number;
  servingSize?: number;
  unit: string;
  imageUrl?: string;
  source: string;
}

const showCamera = ref(false);
const loading = ref(false);
const scanResult = ref<FoodInfo | null>(null);
const showManualInput = ref(false);
const manualBarcode = ref('');

// 开始扫码
const startScan = () => {
  uni.scanCode({
    scanType: ['barCode'],
    success: (res) => {
      const barcode = res.result;
      lookupBarcode(barcode);
    },
    fail: (err) => {
      console.error('扫码失败:', err);
      uni.showToast({ title: '扫码失败', icon: 'none' });
    },
  });
};

// 手动输入
const manualInput = () => {
  showManualInput.value = true;
};

const closeManualInput = () => {
  showManualInput.value = false;
  manualBarcode.value = '';
};

// 查询手动输入的条码
const lookupManualBarcode = () => {
  if (!manualBarcode.value) {
    uni.showToast({ title: '请输入条码', icon: 'none' });
    return;
  }
  closeManualInput();
  lookupBarcode(manualBarcode.value);
};

// 查询条码
const lookupBarcode = async (barcode: string) => {
  loading.value = true;
  try {
    const res = await request({
      url: `/barcode/${barcode}`,
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

// 添加到饮食记录
const addToMeal = () => {
  if (!scanResult.value) return;

  // 先保存到本地数据库
  saveToLocal().then((foodId) => {
    if (foodId) {
      uni.navigateTo({
        url: `/pages/meal-add/meal-add?foodId=${foodId}`,
      });
    }
  });
};

// 保存到本地数据库
const saveToLocal = async (): Promise<number | null> => {
  if (!scanResult.value) return null;

  try {
    const res = await request({
      url: '/barcode/save',
      method: 'POST',
      data: scanResult.value,
    });

    if (res.success) {
      uni.showToast({ title: '保存成功', icon: 'success' });
      return res.data.id;
    }
    return null;
  } catch (error) {
    console.error('保存失败:', error);
    uni.showToast({ title: '保存失败', icon: 'none' });
    return null;
  }
};

// 相机错误
const onCameraError = (e: any) => {
  console.error('相机错误:', e);
  uni.showToast({ title: '相机打开失败', icon: 'none' });
};
</script>

<style scoped>
.scan-page {
  min-height: 100vh;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.scan-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
  min-height: 400rpx;
}

.camera {
  width: 100%;
  height: 500rpx;
}

.scan-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500rpx;
  height: 200rpx;
  border: 4rpx solid #4caf50;
  border-radius: 16rpx;
}

.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4rpx;
  background: linear-gradient(90deg, transparent, #4caf50, transparent);
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0% {
    top: 0;
  }
  100% {
    top: 100%;
  }
}

.scan-tip {
  position: absolute;
  bottom: 40rpx;
  left: 0;
  right: 0;
  text-align: center;
  color: #fff;
  font-size: 28rpx;
}

.camera-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx;
}

.placeholder-icon {
  font-size: 80rpx;
  margin-bottom: 24rpx;
}

.placeholder-text {
  color: #999;
  font-size: 28rpx;
}

.action-bar {
  display: flex;
  gap: 24rpx;
  padding: 32rpx;
  background: #fff;
}

.scan-btn,
.manual-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  height: 88rpx;
  border-radius: 16rpx;
  font-size: 30rpx;
  border: none;
}

.scan-btn {
  background: #4caf50;
  color: #fff;
}

.manual-btn {
  background: #f5f5f5;
  color: #333;
}

.btn-icon {
  font-size: 36rpx;
}

.result-card {
  margin: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.result-title {
  font-size: 32rpx;
  font-weight: 500;
}

.result-source {
  font-size: 24rpx;
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.result-source.local {
  background: #e3f2fd;
  color: #1976d2;
}

.result-source.openfoodfacts {
  background: #fff3e0;
  color: #f57c00;
}

.result-image {
  width: 100%;
  height: 300rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.result-image image {
  max-width: 100%;
  max-height: 100%;
}

.result-info {
  padding: 24rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 12rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: #999;
  font-size: 28rpx;
}

.info-value {
  color: #333;
  font-size: 28rpx;
  font-weight: 500;
}

.nutrition-info {
  padding: 24rpx;
  background: #f9f9f9;
}

.nutrition-title {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
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
  font-weight: bold;
  color: #4caf50;
}

.nutrition-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
}

.result-actions {
  display: flex;
  gap: 24rpx;
  padding: 24rpx;
}

.add-btn,
.save-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
  border: none;
}

.add-btn {
  background: #4caf50;
  color: #fff;
}

.save-btn {
  background: #f5f5f5;
  color: #333;
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

.barcode-input {
  width: 100%;
  height: 80rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 32rpx;
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

/* 加载中 */
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
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-icon {
  font-size: 60rpx;
  margin-bottom: 16rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}
</style>
