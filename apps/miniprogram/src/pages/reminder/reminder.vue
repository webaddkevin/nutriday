<template>
  <view class="reminder-page">
    <!-- 提醒列表 -->
    <view class="reminder-list">
      <view
        v-for="reminder in reminders"
        :key="reminder.id"
        class="reminder-card"
        :class="{ disabled: !reminder.enabled }"
      >
        <view class="reminder-main" @tap="editReminder(reminder)">
          <view class="reminder-icon">{{ reminder.icon }}</view>
          <view class="reminder-info">
            <text class="reminder-title">{{ reminder.title }}</text>
            <text class="reminder-time">{{ reminder.time }}</text>
            <text class="reminder-desc">{{ reminder.desc }}</text>
          </view>
        </view>
        <switch
          :checked="reminder.enabled"
          color="#00b171"
          @change="toggleReminder(reminder, $event)"
        />
      </view>
    </view>

    <!-- 添加自定义提醒 -->
    <view class="add-section">
      <button class="add-btn" @tap="showAddModal = true">
        <text class="add-icon">+</text>
        <text class="add-text">添加自定义提醒</text>
      </button>
    </view>

    <!-- 说明 -->
    <view class="tips-section">
      <text class="tips-title">💡 提示</text>
      <text class="tips-content">开启提醒后，将在设定时间收到通知，帮助你养成健康习惯</text>
    </view>

    <!-- 添加提醒弹窗 -->
    <view v-if="showAddModal" class="modal-overlay" @tap="showAddModal = false">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">添加提醒</text>
          <text class="modal-close" @tap="showAddModal = false">×</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">提醒类型</text>
            <picker :value="newReminder.typeIndex" :range="reminderTypes" @change="onTypeChange">
              <view class="picker-value">
                {{ reminderTypes[newReminder.typeIndex] }}
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">提醒时间</text>
            <picker mode="time" :value="newReminder.time" @change="onTimeChange">
              <view class="picker-value">
                {{ newReminder.time || '选择时间' }}
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">重复</text>
            <view class="repeat-options">
              <view
                v-for="(day, index) in weekDays"
                :key="index"
                class="day-chip"
                :class="{ active: newReminder.repeatDays.includes(index) }"
                @tap="toggleDay(index)"
              >
                {{ day }}
              </view>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="cancel-btn" @tap="showAddModal = false">取消</button>
          <button class="confirm-btn" @tap="saveReminder">保存</button>
        </view>
      </view>
    </view>

    <!-- 编辑提醒弹窗 -->
    <view v-if="showEditModal" class="modal-overlay" @tap="showEditModal = false">
      <view class="modal-content" @tap.stop>
        <view class="modal-header">
          <text class="modal-title">编辑提醒</text>
          <text class="modal-close" @tap="showEditModal = false">×</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">提醒时间</text>
            <picker mode="time" :value="editingReminder.time" @change="onEditTimeChange">
              <view class="picker-value">
                {{ editingReminder.time }}
                <text class="picker-arrow">▼</text>
              </view>
            </picker>
          </view>
          <view class="form-item">
            <text class="form-label">重复</text>
            <view class="repeat-options">
              <view
                v-for="(day, index) in weekDays"
                :key="index"
                class="day-chip"
                :class="{ active: editingReminder.repeatDays.includes(index) }"
                @tap="toggleEditDay(index)"
              >
                {{ day }}
              </view>
            </view>
          </view>
        </view>
        <view class="modal-footer">
          <button class="delete-btn" @tap="deleteReminder">删除</button>
          <button class="confirm-btn" @tap="updateReminder">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

interface Reminder {
  id: string;
  type: string;
  title: string;
  icon: string;
  time: string;
  desc: string;
  enabled: boolean;
  repeatDays: number[];
  isDefault?: boolean;
}

const STORAGE_KEY = 'nutriday_reminders';

const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
const reminderTypes = ['喝水提醒', '吃饭提醒', '称重提醒', '自定义'];

const defaultReminders: Reminder[] = [
  {
    id: 'water-morning',
    type: 'water',
    title: '晨起喝水',
    icon: '💧',
    time: '08:00',
    desc: '每天早上提醒喝水',
    enabled: true,
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
    isDefault: true,
  },
  {
    id: 'water-afternoon',
    type: 'water',
    title: '下午喝水',
    icon: '💧',
    time: '15:00',
    desc: '下午补充水分',
    enabled: true,
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
    isDefault: true,
  },
  {
    id: 'water-evening',
    type: 'water',
    title: '晚间喝水',
    icon: '💧',
    time: '20:00',
    desc: '睡前适量饮水',
    enabled: false,
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
    isDefault: true,
  },
  {
    id: 'breakfast',
    type: 'meal',
    title: '早餐提醒',
    icon: '🍳',
    time: '07:30',
    desc: '记得吃早餐',
    enabled: true,
    repeatDays: [1, 2, 3, 4, 5],
    isDefault: true,
  },
  {
    id: 'lunch',
    type: 'meal',
    title: '午餐提醒',
    icon: '🍱',
    time: '12:00',
    desc: '午餐时间到',
    enabled: true,
    repeatDays: [1, 2, 3, 4, 5],
    isDefault: true,
  },
  {
    id: 'dinner',
    type: 'meal',
    title: '晚餐提醒',
    icon: '🍲',
    time: '18:30',
    desc: '晚餐时间到',
    enabled: true,
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
    isDefault: true,
  },
  {
    id: 'weight',
    type: 'weight',
    title: '称重提醒',
    icon: '⚖️',
    time: '07:00',
    desc: '每天早上记录体重',
    enabled: false,
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
    isDefault: true,
  },
];

const reminders = ref<Reminder[]>([]);
const showAddModal = ref(false);
const showEditModal = ref(false);
const newReminder = ref({
  typeIndex: 0,
  time: '09:00',
  repeatDays: [0, 1, 2, 3, 4, 5, 6] as number[],
});
const editingReminder = ref<Reminder | null>(null);

onLoad(() => {
  uni.setNavigationBarTitle({ title: '提醒设置' });
});

onMounted(() => {
  loadReminders();
});

function loadReminders() {
  const stored = uni.getStorageSync(STORAGE_KEY);
  if (stored && Array.isArray(stored)) {
    reminders.value = stored;
  } else {
    reminders.value = [...defaultReminders];
    saveReminders();
  }
}

function saveReminders() {
  uni.setStorageSync(STORAGE_KEY, reminders.value);
}

function toggleReminder(reminder: Reminder, event: { detail: { value: boolean } }) {
  reminder.enabled = event.detail.value;
  saveReminders();

  if (reminder.enabled) {
    scheduleNotification(reminder);
    uni.showToast({ title: '已开启提醒', icon: 'success' });
  } else {
    cancelNotification(reminder);
    uni.showToast({ title: '已关闭提醒', icon: 'none' });
  }
}

function scheduleNotification(reminder: Reminder) {
  // 使用小程序本地通知 API
  // 注意：小程序需要用户授权通知权限
  console.log('设置提醒:', reminder.title, reminder.time);
}

function cancelNotification(reminder: Reminder) {
  console.log('取消提醒:', reminder.title);
}

function editReminder(reminder: Reminder) {
  editingReminder.value = { ...reminder };
  showEditModal.value = true;
}

function onTypeChange(e: { detail: { value: number } }) {
  newReminder.value.typeIndex = e.detail.value;
}

function onTimeChange(e: { detail: { value: string } }) {
  newReminder.value.time = e.detail.value;
}

function onEditTimeChange(e: { detail: { value: string } }) {
  if (editingReminder.value) {
    editingReminder.value.time = e.detail.value;
  }
}

function toggleDay(index: number) {
  const days = newReminder.value.repeatDays;
  const pos = days.indexOf(index);
  if (pos > -1) {
    days.splice(pos, 1);
  } else {
    days.push(index);
    days.sort();
  }
}

function toggleEditDay(index: number) {
  if (!editingReminder.value) return;
  const days = editingReminder.value.repeatDays;
  const pos = days.indexOf(index);
  if (pos > -1) {
    days.splice(pos, 1);
  } else {
    days.push(index);
    days.sort();
  }
}

function saveReminder() {
  if (newReminder.value.repeatDays.length === 0) {
    uni.showToast({ title: '请选择重复日期', icon: 'none' });
    return;
  }

  const typeMap: Record<number, { type: string; icon: string }> = {
    0: { type: 'water', icon: '💧' },
    1: { type: 'meal', icon: '🍽️' },
    2: { type: 'weight', icon: '⚖️' },
    3: { type: 'custom', icon: '⏰' },
  };

  const reminder: Reminder = {
    id: `custom-${Date.now()}`,
    type: typeMap[newReminder.value.typeIndex].type,
    title: reminderTypes[newReminder.value.typeIndex],
    icon: typeMap[newReminder.value.typeIndex].icon,
    time: newReminder.value.time,
    desc: `每${formatRepeatDays(newReminder.value.repeatDays)}提醒`,
    enabled: true,
    repeatDays: [...newReminder.value.repeatDays],
  };

  reminders.value.push(reminder);
  saveReminders();
  showAddModal.value = false;

  // 重置表单
  newReminder.value = {
    typeIndex: 0,
    time: '09:00',
    repeatDays: [0, 1, 2, 3, 4, 5, 6],
  };

  uni.showToast({ title: '添加成功', icon: 'success' });
}

function updateReminder() {
  if (!editingReminder.value) return;

  const index = reminders.value.findIndex((r) => r.id === editingReminder.value!.id);
  if (index > -1) {
    editingReminder.value.desc = `每${formatRepeatDays(editingReminder.value.repeatDays)}提醒`;
    reminders.value[index] = { ...editingReminder.value };
    saveReminders();
  }

  showEditModal.value = false;
  uni.showToast({ title: '保存成功', icon: 'success' });
}

function deleteReminder() {
  if (!editingReminder.value) return;

  const index = reminders.value.findIndex((r) => r.id === editingReminder.value!.id);
  if (index > -1) {
    reminders.value.splice(index, 1);
    saveReminders();
  }

  showEditModal.value = false;
  uni.showToast({ title: '已删除', icon: 'none' });
}

function formatRepeatDays(days: number[]): string {
  if (days.length === 7) return '天';
  if (JSON.stringify(days.sort()) === JSON.stringify([1, 2, 3, 4, 5])) return '工作日';
  if (JSON.stringify(days.sort()) === JSON.stringify([0, 6])) return '周末';
  return days.map((d) => '周' + weekDays[d]).join('、');
}
</script>

<style lang="scss" scoped>
.reminder-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 24rpx;
  padding-bottom: 120rpx;
}

.reminder-list {
  margin-bottom: 24rpx;
}

.reminder-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;

  &.disabled {
    opacity: 0.6;
  }

  .reminder-main {
    display: flex;
    align-items: center;
    flex: 1;
  }

  .reminder-icon {
    font-size: 48rpx;
    margin-right: 20rpx;
  }

  .reminder-info {
    .reminder-title {
      display: block;
      font-size: 30rpx;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 4rpx;
    }

    .reminder-time {
      display: block;
      font-size: 26rpx;
      color: #00b171;
      margin-bottom: 4rpx;
    }

    .reminder-desc {
      font-size: 24rpx;
      color: #94a3b8;
    }
  }
}

.add-section {
  margin-bottom: 24rpx;
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  width: 100%;
  height: 96rpx;
  background: #fff;
  border: 2rpx dashed #cbd5e1;
  border-radius: 20rpx;

  .add-icon {
    font-size: 40rpx;
    color: #00b171;
  }

  .add-text {
    font-size: 28rpx;
    color: #64748b;
  }
}

.tips-section {
  background: rgba(0, 177, 113, 0.05);
  border-radius: 16rpx;
  padding: 20rpx;

  .tips-title {
    display: block;
    font-size: 26rpx;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 8rpx;
  }

  .tips-content {
    font-size: 24rpx;
    color: #64748b;
    line-height: 1.5;
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
  padding: 24rpx;
}

.form-item {
  margin-bottom: 24rpx;

  &:last-child {
    margin-bottom: 0;
  }

  .form-label {
    display: block;
    font-size: 26rpx;
    color: #64748b;
    margin-bottom: 12rpx;
  }
}

.picker-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  background: #f8fafc;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #1e293b;

  .picker-arrow {
    font-size: 20rpx;
    color: #94a3b8;
  }
}

.repeat-options {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.day-chip {
  padding: 12rpx 20rpx;
  background: #f8fafc;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #64748b;

  &.active {
    background: #00b171;
    color: #fff;
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

  .delete-btn {
    background: #fef2f2;
    color: #ef4444;
  }

  .confirm-btn {
    background: #00b171;
    color: #fff;
  }
}
</style>
