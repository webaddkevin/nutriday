<template>
  <view class="export-page">
    <!-- 导出类型选择 -->
    <view class="section">
      <text class="section-title">选择导出内容</text>
      <view class="export-options">
        <view
          v-for="option in exportOptions"
          :key="option.value"
          class="export-option"
          :class="{ selected: selectedTypes.includes(option.value) }"
          @tap="toggleType(option.value)"
        >
          <view class="option-icon">{{ option.icon }}</view>
          <view class="option-info">
            <text class="option-title">{{ option.label }}</text>
            <text class="option-desc">{{ option.desc }}</text>
          </view>
          <view class="option-check">
            <view class="checkbox" :class="{ checked: selectedTypes.includes(option.value) }">
              <text v-if="selectedTypes.includes(option.value)" class="check-icon">✓</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 时间范围 -->
    <view class="section">
      <text class="section-title">时间范围</text>
      <view class="time-options">
        <view
          v-for="range in timeRanges"
          :key="range.value"
          class="time-option"
          :class="{ selected: selectedRange === range.value }"
          @tap="selectedRange = range.value"
        >
          {{ range.label }}
        </view>
      </view>
    </view>

    <!-- 导出格式 -->
    <view class="section">
      <text class="section-title">导出格式</text>
      <view class="format-options">
        <view
          v-for="format in formatOptions"
          :key="format.value"
          class="format-option"
          :class="{ selected: selectedFormat === format.value }"
          @tap="selectedFormat = format.value"
        >
          <view class="format-icon">{{ format.icon }}</view>
          <text class="format-label">{{ format.label }}</text>
        </view>
      </view>
    </view>

    <!-- 预览信息 -->
    <view class="preview-card">
      <view class="preview-header">
        <text class="preview-title">导出预览</text>
        <text class="preview-count">约 {{ estimatedRecords }} 条记录</text>
      </view>
      <view class="preview-content">
        <view class="preview-item">
          <text class="preview-label">数据类型</text>
          <text class="preview-value">{{ selectedTypes.length }} 种</text>
        </view>
        <view class="preview-item">
          <text class="preview-label">时间范围</text>
          <text class="preview-value">{{ timeRangeText }}</text>
        </view>
        <view class="preview-item">
          <text class="preview-label">文件格式</text>
          <text class="preview-value">{{ formatText }}</text>
        </view>
      </view>
    </view>

    <!-- 导出按钮 -->
    <view class="export-actions">
      <button
        class="export-btn"
        :disabled="selectedTypes.length === 0 || exporting"
        @tap="doExport"
      >
        <text v-if="exporting" class="btn-text">导出中...</text>
        <text v-else class="btn-text">开始导出</text>
      </button>
    </view>

    <!-- 导出成功弹窗 -->
    <view v-if="showSuccessModal" class="modal-overlay" @tap="showSuccessModal = false">
      <view class="modal-content" @tap.stop>
        <view class="modal-icon">✅</view>
        <text class="modal-title">导出成功</text>
        <text class="modal-desc">数据已保存到剪贴板，可粘贴分享</text>
        <button class="modal-btn" @tap="showSuccessModal = false">确定</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { request } from '@/utils/request';

const exporting = ref(false);
const showSuccessModal = ref(false);

const exportOptions = [
  { value: 'meal', label: '饮食记录', desc: '每日三餐及营养数据', icon: '🍽️' },
  { value: 'water', label: '饮水记录', desc: '每日饮水量统计', icon: '💧' },
  { value: 'weight', label: '体重记录', desc: '体重变化趋势', icon: '⚖️' },
];

const timeRanges = [
  { value: 7, label: '近 7 天' },
  { value: 14, label: '近 14 天' },
  { value: 30, label: '近 30 天' },
  { value: 90, label: '近 90 天' },
];

const formatOptions = [
  { value: 'csv', label: 'CSV', icon: '📄' },
  { value: 'json', label: 'JSON', icon: '📋' },
];

const selectedTypes = ref<string[]>(['meal']);
const selectedRange = ref(7);
const selectedFormat = ref('csv');
const estimatedRecords = ref(0);

const timeRangeText = computed(() => {
  const range = timeRanges.find((r) => r.value === selectedRange.value);
  return range?.label || '';
});

const formatText = computed(() => {
  const format = formatOptions.find((f) => f.value === selectedFormat.value);
  return format?.label || '';
});

onLoad(() => {
  uni.setNavigationBarTitle({ title: '数据导出' });
  estimateRecords();
});

function toggleType(type: string) {
  const index = selectedTypes.value.indexOf(type);
  if (index > -1) {
    selectedTypes.value.splice(index, 1);
  } else {
    selectedTypes.value.push(type);
  }
  estimateRecords();
}

async function estimateRecords() {
  if (selectedTypes.value.length === 0) {
    estimatedRecords.value = 0;
    return;
  }

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - selectedRange.value);

    let total = 0;
    for (const type of selectedTypes.value) {
      const res = await request({
        url: `/export/count?type=${type}&startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`,
      });
      total += res.data?.count || 0;
    }
    estimatedRecords.value = total;
  } catch {
    // 估算
    estimatedRecords.value = selectedTypes.value.length * selectedRange.value;
  }
}

async function doExport() {
  if (selectedTypes.value.length === 0) return;

  exporting.value = true;

  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - selectedRange.value);

    const res = await request({
      url: '/export',
      method: 'POST',
      data: {
        types: selectedTypes.value,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        format: selectedFormat.value,
      },
    });

    if (res.data?.content) {
      // 复制到剪贴板
      uni.setClipboardData({
        data: res.data.content,
        success: () => {
          showSuccessModal.value = true;
        },
      });
    }
  } catch (e) {
    console.error('导出失败', e);
    uni.showToast({ title: '导出失败', icon: 'none' });
  } finally {
    exporting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.export-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 24rpx;
  padding-bottom: 120rpx;
}

.section {
  margin-bottom: 32rpx;

  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 16rpx;
    display: block;
  }
}

.export-options {
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.export-option {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-bottom: 1rpx solid #f1f5f9;

  &:last-child {
    border-bottom: none;
  }

  &.selected {
    background: rgba(0, 177, 113, 0.03);
  }

  .option-icon {
    font-size: 40rpx;
    margin-right: 20rpx;
  }

  .option-info {
    flex: 1;

    .option-title {
      font-size: 28rpx;
      font-weight: 500;
      color: #1e293b;
      display: block;
    }

    .option-desc {
      font-size: 24rpx;
      color: #64748b;
      margin-top: 4rpx;
    }
  }

  .checkbox {
    width: 44rpx;
    height: 44rpx;
    border: 2rpx solid #cbd5e1;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    &.checked {
      background: #00b171;
      border-color: #00b171;
    }

    .check-icon {
      color: #fff;
      font-size: 24rpx;
    }
  }
}

.time-options,
.format-options {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.time-option {
  padding: 16rpx 32rpx;
  background: #fff;
  border-radius: 24rpx;
  font-size: 26rpx;
  color: #64748b;

  &.selected {
    background: #00b171;
    color: #fff;
  }
}

.format-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24rpx;
  background: #fff;
  border-radius: 20rpx;

  &.selected {
    background: rgba(0, 177, 113, 0.1);
    border: 2rpx solid #00b171;
  }

  .format-icon {
    font-size: 40rpx;
    margin-bottom: 8rpx;
  }

  .format-label {
    font-size: 26rpx;
    color: #1e293b;
  }
}

.preview-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 32rpx;

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .preview-title {
      font-size: 28rpx;
      font-weight: 600;
      color: #1e293b;
    }

    .preview-count {
      font-size: 24rpx;
      color: #00b171;
    }
  }

  .preview-content {
    .preview-item {
      display: flex;
      justify-content: space-between;
      padding: 12rpx 0;

      .preview-label {
        font-size: 26rpx;
        color: #64748b;
      }

      .preview-value {
        font-size: 26rpx;
        color: #1e293b;
        font-weight: 500;
      }
    }
  }
}

.export-actions {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: 40rpx;
}

.export-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #00b171 0%, #00d68f 100%);
  border-radius: 48rpx;
  border: none;

  .btn-text {
    font-size: 32rpx;
    color: #fff;
    font-weight: 600;
  }

  &[disabled] {
    opacity: 0.5;
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
  width: 560rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 48rpx;
  text-align: center;

  .modal-icon {
    font-size: 80rpx;
    margin-bottom: 24rpx;
  }

  .modal-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1e293b;
    display: block;
    margin-bottom: 12rpx;
  }

  .modal-desc {
    font-size: 26rpx;
    color: #64748b;
    display: block;
    margin-bottom: 32rpx;
  }

  .modal-btn {
    width: 100%;
    height: 80rpx;
    background: #00b171;
    border-radius: 40rpx;
    border: none;
    font-size: 28rpx;
    color: #fff;
  }
}
</style>
