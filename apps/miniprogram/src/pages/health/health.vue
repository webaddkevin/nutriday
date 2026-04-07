<template>
  <view class="health-page">
    <!-- 过敏原 -->
    <view class="card">
      <view class="card-header">
        <text class="title">食物过敏</text>
        <text class="hint">选择您过敏的食物</text>
      </view>
      <view class="tag-grid">
        <view
          v-for="item in allergyOptions"
          :key="item"
          :class="['tag-item', { active: allergies.includes(item) }]"
          @click="toggleItem(allergies, item)"
        >
          <text class="tag-text">{{ item }}</text>
        </view>
      </view>
      <view class="custom-input">
        <input
          v-model="customAllergy"
          placeholder="添加其他过敏原"
          class="input"
          @confirm="addCustomItem(allergies, customAllergy, () => (customAllergy = ''))"
        />
        <button
          class="add-btn"
          @click="addCustomItem(allergies, customAllergy, () => (customAllergy = ''))"
        >
          添加
        </button>
      </view>
      <view v-if="allergies.length > 0" class="selected-tags">
        <text class="selected-label">已选择：</text>
        <view class="tag-list">
          <view v-for="item in allergies" :key="item" class="selected-tag">
            <text class="tag-name">{{ item }}</text>
            <text class="tag-remove" @click="removeItem(allergies, item)">×</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 慢性疾病 -->
    <view class="card">
      <view class="card-header">
        <text class="title">慢性疾病</text>
        <text class="hint">选择您的健康状况</text>
      </view>
      <view class="tag-grid">
        <view
          v-for="item in diseaseOptions"
          :key="item"
          :class="['tag-item', { active: diseases.includes(item) }]"
          @click="toggleItem(diseases, item)"
        >
          <text class="tag-text">{{ item }}</text>
        </view>
      </view>
      <view class="custom-input">
        <input
          v-model="customDisease"
          placeholder="添加其他疾病"
          class="input"
          @confirm="addCustomItem(diseases, customDisease, () => (customDisease = ''))"
        />
        <button
          class="add-btn"
          @click="addCustomItem(diseases, customDisease, () => (customDisease = ''))"
        >
          添加
        </button>
      </view>
      <view v-if="diseases.length > 0" class="selected-tags">
        <text class="selected-label">已选择：</text>
        <view class="tag-list">
          <view v-for="item in diseases" :key="item" class="selected-tag">
            <text class="tag-name">{{ item }}</text>
            <text class="tag-remove" @click="removeItem(diseases, item)">×</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 用药情况 -->
    <view class="card">
      <view class="card-header">
        <text class="title">用药情况</text>
        <text class="hint">记录您正在服用的药物</text>
      </view>
      <view class="custom-input">
        <input
          v-model="customMedication"
          placeholder="输入药物名称"
          class="input"
          @confirm="addCustomItem(medications, customMedication, () => (customMedication = ''))"
        />
        <button
          class="add-btn"
          @click="addCustomItem(medications, customMedication, () => (customMedication = ''))"
        >
          添加
        </button>
      </view>
      <view v-if="medications.length > 0" class="selected-tags">
        <text class="selected-label">已添加：</text>
        <view class="tag-list">
          <view v-for="item in medications" :key="item" class="selected-tag">
            <text class="tag-name">{{ item }}</text>
            <text class="tag-remove" @click="removeItem(medications, item)">×</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 饮食限制 -->
    <view class="card">
      <view class="card-header">
        <text class="title">饮食限制</text>
        <text class="hint">选择您的饮食偏好</text>
      </view>
      <view class="tag-grid">
        <view
          v-for="item in restrictionOptions"
          :key="item"
          :class="['tag-item', { active: dietaryRestrictions.includes(item) }]"
          @click="toggleItem(dietaryRestrictions, item)"
        >
          <text class="tag-text">{{ item }}</text>
        </view>
      </view>
      <view class="custom-input">
        <input
          v-model="customRestriction"
          placeholder="添加其他饮食限制"
          class="input"
          @confirm="
            addCustomItem(dietaryRestrictions, customRestriction, () => (customRestriction = ''))
          "
        />
        <button
          class="add-btn"
          @click="
            addCustomItem(dietaryRestrictions, customRestriction, () => (customRestriction = ''))
          "
        >
          添加
        </button>
      </view>
      <view v-if="dietaryRestrictions.length > 0" class="selected-tags">
        <text class="selected-label">已选择：</text>
        <view class="tag-list">
          <view v-for="item in dietaryRestrictions" :key="item" class="selected-tag">
            <text class="tag-name">{{ item }}</text>
            <text class="tag-remove" @click="removeItem(dietaryRestrictions, item)">×</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 其他健康备注 -->
    <view class="card">
      <view class="card-header">
        <text class="title">其他健康备注</text>
      </view>
      <textarea
        v-model="healthNotes"
        placeholder="记录其他需要关注的健康信息，如手术史、特殊情况等..."
        class="notes-input"
        maxlength="500"
      />
    </view>

    <!-- 保存按钮 -->
    <view class="save-section">
      <button class="save-btn" :disabled="saving" @click="saveHealth">
        {{ saving ? '保存中...' : '保存健康档案' }}
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getProfile, saveProfile } from '@/api/profile-api';

const saving = ref(false);
const profile = ref<Awaited<ReturnType<typeof getProfile>> | null>(null);

const allergies = ref<string[]>([]);
const diseases = ref<string[]>([]);
const medications = ref<string[]>([]);
const dietaryRestrictions = ref<string[]>([]);
const healthNotes = ref('');

const customAllergy = ref('');
const customDisease = ref('');
const customMedication = ref('');
const customRestriction = ref('');

const allergyOptions = [
  '花生',
  '牛奶',
  '鸡蛋',
  '海鲜',
  '坚果',
  '大豆',
  '小麦',
  '芝麻',
  '芒果',
  '菠萝',
];

const diseaseOptions = [
  '糖尿病',
  '高血压',
  '高血脂',
  '冠心病',
  '痛风',
  '甲状腺疾病',
  '肾病',
  '肝病',
  '胃病',
  '贫血',
];

const restrictionOptions = ['素食', '纯素食', '无麸质', '低盐', '低糖', '低脂', '清真', '犹太洁食'];

function toggleItem(list: string[], item: string) {
  const index = list.indexOf(item);
  if (index > -1) {
    list.splice(index, 1);
  } else {
    list.push(item);
  }
}

function addCustomItem(list: string[], item: string, clear: () => void) {
  const trimmed = item.trim();
  if (trimmed && !list.includes(trimmed)) {
    list.push(trimmed);
    clear();
  }
}

function removeItem(list: string[], item: string) {
  const index = list.indexOf(item);
  if (index > -1) {
    list.splice(index, 1);
  }
}

async function loadData() {
  try {
    profile.value = await getProfile();
    if (profile.value) {
      allergies.value = profile.value.allergies || [];
      diseases.value = profile.value.diseases || [];
      medications.value = profile.value.medications || [];
      dietaryRestrictions.value = profile.value.dietaryRestrictions || [];
      healthNotes.value = profile.value.healthNotes || '';
    }
  } catch (e) {
    console.error('加载健康档案失败', e);
  }
}

async function saveHealth() {
  if (!profile.value) {
    uni.showToast({ title: '请先完善基本信息', icon: 'none' });
    return;
  }

  saving.value = true;
  try {
    await saveProfile({
      gender: profile.value.gender,
      age: profile.value.age,
      height: profile.value.height,
      weight: profile.value.weight,
      goal: profile.value.goal,
      tags: profile.value.tags as string[],
      activityLevel: profile.value.activityLevel,
      bmr: profile.value.bmr,
      tdee: profile.value.tdee,
      targetWeight: profile.value.targetWeight,
      targetDate: profile.value.targetDate,
      weeklyGoal: profile.value.weeklyGoal,
      targetCalories: profile.value.targetCalories,
      allergies: allergies.value,
      diseases: diseases.value,
      medications: medications.value,
      dietaryRestrictions: dietaryRestrictions.value,
      healthNotes: healthNotes.value || undefined,
    });

    uni.showToast({ title: '保存成功', icon: 'success' });
    uni.navigateBack();
  } catch (e) {
    console.error('保存失败', e);
    uni.showToast({ title: '保存失败', icon: 'none' });
  } finally {
    saving.value = false;
  }
}

onMounted(loadData);
</script>

<style scoped lang="scss">
.health-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 16px;
  padding-bottom: 100px;
  box-sizing: border-box;
}

.card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card-header {
  margin-bottom: 16px;

  .title {
    display: block;
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 4px;
  }

  .hint {
    font-size: 13px;
    color: #999;
  }
}

.tag-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 12px;
}

.tag-item {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  background: #fafafa;

  &.active {
    border-color: #2ecc71;
    background: rgba(46, 204, 113, 0.1);

    .tag-text {
      color: #2ecc71;
    }
  }

  .tag-text {
    font-size: 14px;
    color: #666;
  }
}

.custom-input {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;

  .input {
    flex: 1;
    height: 40px;
    padding: 0 12px;
    border: 1px solid #eee;
    border-radius: 8px;
    font-size: 14px;
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

.selected-tags {
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;

  .selected-label {
    font-size: 13px;
    color: #999;
    margin-bottom: 8px;
    display: block;
  }

  .tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .selected-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: #f5f5f5;
    border-radius: 16px;

    .tag-name {
      font-size: 13px;
      color: #333;
    }

    .tag-remove {
      font-size: 16px;
      color: #999;
      line-height: 1;
    }
  }
}

.notes-input {
  width: 100%;
  height: 120px;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.save-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  z-index: 100;

  .save-btn {
    width: 100%;
    height: 48px;
    background: #2ecc71;
    color: #fff;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;

    &[disabled] {
      background: #ccc;
    }
  }
}
</style>
