<template>
  <view class="achievement-page">
    <!-- 成就统计 -->
    <view class="stats-card">
      <view class="stats-item">
        <text class="stats-value">{{ unlockedCount }}</text>
        <text class="stats-label">已解锁</text>
      </view>
      <view class="stats-divider"></view>
      <view class="stats-item">
        <text class="stats-value">{{ totalCount }}</text>
        <text class="stats-label">总成就</text>
      </view>
      <view class="stats-divider"></view>
      <view class="stats-item">
        <text class="stats-value">{{ points }}</text>
        <text class="stats-label">积分</text>
      </view>
    </view>

    <!-- 成就列表 -->
    <view class="achievement-section">
      <text class="section-title">🏆 成就列表</text>

      <view class="achievement-list">
        <view
          v-for="achievement in achievements"
          :key="achievement.id"
          class="achievement-card"
          :class="{ unlocked: achievement.unlocked }"
        >
          <view class="achievement-icon-wrap">
            <text class="achievement-icon">{{
              achievement.unlocked ? achievement.icon : '🔒'
            }}</text>
          </view>
          <view class="achievement-info">
            <text class="achievement-name">{{ achievement.name }}</text>
            <text class="achievement-desc">{{ achievement.desc }}</text>
            <view
              v-if="!achievement.unlocked && achievement.progress !== undefined"
              class="progress-bar"
            >
              <view class="progress-fill" :style="{ width: achievement.progress + '%' }" />
            </view>
            <text v-if="!achievement.unlocked && achievement.progressText" class="progress-text">
              {{ achievement.progressText }}
            </text>
          </view>
          <view v-if="achievement.unlocked" class="achievement-points">
            <text class="points-value">+{{ achievement.points }}</text>
            <text class="points-label">积分</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 最近解锁 -->
    <view v-if="recentUnlocks.length > 0" class="recent-section">
      <text class="section-title">🎉 最近解锁</text>
      <view class="recent-list">
        <view v-for="item in recentUnlocks" :key="item.id" class="recent-item">
          <text class="recent-icon">{{ item.icon }}</text>
          <view class="recent-info">
            <text class="recent-name">{{ item.name }}</text>
            <text class="recent-time">{{ item.unlockedAt }}</text>
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

interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  progressText?: string;
  condition: (stats: UserStats) => boolean;
  progressCondition?: (stats: UserStats) => { current: number; target: number };
}

interface UserStats {
  totalDays: number;
  consecutiveDays: number;
  totalMeals: number;
  totalFoods: number;
  waterGoalDays: number;
  calorieGoalDays: number;
  weightLogs: number;
}

const STORAGE_KEY = 'nutriday_achievements';

const points = ref(0);
const recentUnlocks = ref<{ id: string; name: string; icon: string; unlockedAt: string }[]>([]);

const userStats = ref<UserStats>({
  totalDays: 0,
  consecutiveDays: 0,
  totalMeals: 0,
  totalFoods: 0,
  waterGoalDays: 0,
  calorieGoalDays: 0,
  weightLogs: 0,
});

const achievementDefinitions: Omit<Achievement, 'unlocked' | 'progress' | 'progressText'>[] = [
  // 记录类
  {
    id: 'first_meal',
    name: '初来乍到',
    desc: '记录第一餐',
    icon: '🍽️',
    points: 10,
    condition: (s) => s.totalMeals >= 1,
    progressCondition: (s) => ({ current: s.totalMeals, target: 1 }),
  },
  {
    id: 'meal_10',
    name: '饮食达人',
    desc: '累计记录 10 餐',
    icon: '🍱',
    points: 20,
    condition: (s) => s.totalMeals >= 10,
    progressCondition: (s) => ({ current: s.totalMeals, target: 10 }),
  },
  {
    id: 'meal_100',
    name: '美食家',
    desc: '累计记录 100 餐',
    icon: '👨‍🍳',
    points: 50,
    condition: (s) => s.totalMeals >= 100,
    progressCondition: (s) => ({ current: Math.min(s.totalMeals, 100), target: 100 }),
  },
  {
    id: 'food_50',
    name: '尝鲜达人',
    desc: '记录过 50 种不同食物',
    icon: '🥗',
    points: 30,
    condition: (s) => s.totalFoods >= 50,
    progressCondition: (s) => ({ current: Math.min(s.totalFoods, 50), target: 50 }),
  },

  // 坚持类
  {
    id: 'streak_3',
    name: '三天成习',
    desc: '连续记录 3 天',
    icon: '🔥',
    points: 15,
    condition: (s) => s.consecutiveDays >= 3,
    progressCondition: (s) => ({ current: s.consecutiveDays, target: 3 }),
  },
  {
    id: 'streak_7',
    name: '周周坚持',
    desc: '连续记录 7 天',
    icon: '📅',
    points: 30,
    condition: (s) => s.consecutiveDays >= 7,
    progressCondition: (s) => ({ current: Math.min(s.consecutiveDays, 7), target: 7 }),
  },
  {
    id: 'streak_30',
    name: '月度之星',
    desc: '连续记录 30 天',
    icon: '⭐',
    points: 100,
    condition: (s) => s.consecutiveDays >= 30,
    progressCondition: (s) => ({ current: Math.min(s.consecutiveDays, 30), target: 30 }),
  },

  // 目标类
  {
    id: 'water_goal_7',
    name: '水润肌肤',
    desc: '连续 7 天达成饮水目标',
    icon: '💧',
    points: 25,
    condition: (s) => s.waterGoalDays >= 7,
    progressCondition: (s) => ({ current: Math.min(s.waterGoalDays, 7), target: 7 }),
  },
  {
    id: 'calorie_goal_7',
    name: '热量管理',
    desc: '连续 7 天达成热量目标',
    icon: '🎯',
    points: 40,
    condition: (s) => s.calorieGoalDays >= 7,
    progressCondition: (s) => ({ current: Math.min(s.calorieGoalDays, 7), target: 7 }),
  },

  // 体重类
  {
    id: 'weight_first',
    name: '第一步',
    desc: '记录第一次体重',
    icon: '⚖️',
    points: 10,
    condition: (s) => s.weightLogs >= 1,
    progressCondition: (s) => ({ current: s.weightLogs, target: 1 }),
  },
  {
    id: 'weight_10',
    name: '体重追踪者',
    desc: '记录 10 次体重',
    icon: '📊',
    points: 25,
    condition: (s) => s.weightLogs >= 10,
    progressCondition: (s) => ({ current: Math.min(s.weightLogs, 10), target: 10 }),
  },
];

const achievements = ref<Achievement[]>([]);

const unlockedCount = computed(() => achievements.value.filter((a) => a.unlocked).length);
const totalCount = computed(() => achievements.value.length);

onLoad(() => {
  uni.setNavigationBarTitle({ title: '我的成就' });
});

onMounted(async () => {
  await loadUserStats();
  await checkAchievements();
});

async function loadUserStats() {
  try {
    const res = await request({ url: '/stats/user' });
    if (res.data) {
      userStats.value = {
        totalDays: res.data.totalDays || 0,
        consecutiveDays: res.data.consecutiveDays || 0,
        totalMeals: res.data.totalMeals || 0,
        totalFoods: res.data.totalFoods || 0,
        waterGoalDays: res.data.waterGoalDays || 0,
        calorieGoalDays: res.data.calorieGoalDays || 0,
        weightLogs: res.data.weightLogs || 0,
      };
    }
  } catch (e) {
    console.error('加载统计数据失败', e);
  }
}

async function checkAchievements() {
  const stored = uni.getStorageSync(STORAGE_KEY) || {};
  const stats = userStats.value;

  achievements.value = achievementDefinitions.map((def) => {
    const unlocked = stored[def.id]?.unlocked || false;
    let progress = 0;
    let progressText = '';

    if (!unlocked && def.progressCondition) {
      const { current, target } = def.progressCondition(stats);
      progress = Math.round((current / target) * 100);
      progressText = `${current} / ${target}`;
    }

    return {
      ...def,
      unlocked,
      unlockedAt: stored[def.id]?.unlockedAt,
      progress,
      progressText,
    };
  });

  // 检查新解锁的成就
  for (const def of achievementDefinitions) {
    if (!stored[def.id]?.unlocked && def.condition(stats)) {
      await unlockAchievement(def);
    }
  }

  // 计算积分
  points.value = achievements.value.filter((a) => a.unlocked).reduce((sum, a) => sum + a.points, 0);

  // 最近解锁
  recentUnlocks.value = achievements.value
    .filter((a) => a.unlocked && a.unlockedAt)
    .sort((a, b) => (b.unlockedAt || '').localeCompare(a.unlockedAt || ''))
    .slice(0, 5)
    .map((a) => ({
      id: a.id,
      name: a.name,
      icon: a.icon,
      unlockedAt: a.unlockedAt!,
    }));
}

async function unlockAchievement(
  achievement: Omit<Achievement, 'unlocked' | 'progress' | 'progressText'>,
) {
  const stored = uni.getStorageSync(STORAGE_KEY) || {};
  const now = new Date().toLocaleDateString('zh-CN');

  stored[achievement.id] = {
    unlocked: true,
    unlockedAt: now,
  };

  uni.setStorageSync(STORAGE_KEY, stored);

  // 显示解锁提示
  uni.showToast({
    title: `🏆 解锁成就：${achievement.name}`,
    icon: 'none',
    duration: 2000,
  });
}
</script>

<style lang="scss" scoped>
.achievement-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 24rpx;
}

.stats-card {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: linear-gradient(135deg, #00b171 0%, #00d68f 100%);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;

  .stats-item {
    text-align: center;

    .stats-value {
      display: block;
      font-size: 48rpx;
      font-weight: 700;
      color: #fff;
    }

    .stats-label {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.8);
    }
  }

  .stats-divider {
    width: 1rpx;
    height: 60rpx;
    background: rgba(255, 255, 255, 0.3);
  }
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16rpx;
  display: block;
}

.achievement-section {
  margin-bottom: 24rpx;
}

.achievement-list {
  .achievement-card {
    display: flex;
    align-items: center;
    gap: 20rpx;
    background: #fff;
    border-radius: 20rpx;
    padding: 24rpx;
    margin-bottom: 16rpx;
    opacity: 0.6;

    &.unlocked {
      opacity: 1;
      background: linear-gradient(135deg, rgba(0, 177, 113, 0.05) 0%, #fff 100%);
      border: 1rpx solid rgba(0, 177, 113, 0.2);
    }

    .achievement-icon-wrap {
      width: 80rpx;
      height: 80rpx;
      background: #f8fafc;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      .achievement-icon {
        font-size: 40rpx;
      }
    }

    .achievement-info {
      flex: 1;

      .achievement-name {
        display: block;
        font-size: 28rpx;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 4rpx;
      }

      .achievement-desc {
        font-size: 24rpx;
        color: #64748b;
        margin-bottom: 8rpx;
      }

      .progress-bar {
        height: 8rpx;
        background: #e2e8f0;
        border-radius: 4rpx;
        overflow: hidden;
        margin-bottom: 4rpx;

        .progress-fill {
          height: 100%;
          background: #00b171;
          border-radius: 4rpx;
        }
      }

      .progress-text {
        font-size: 22rpx;
        color: #94a3b8;
      }
    }

    .achievement-points {
      text-align: center;

      .points-value {
        display: block;
        font-size: 28rpx;
        font-weight: 600;
        color: #f59e0b;
      }

      .points-label {
        font-size: 20rpx;
        color: #94a3b8;
      }
    }
  }
}

.recent-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
}

.recent-list {
  .recent-item {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f1f5f9;

    &:last-child {
      border-bottom: none;
    }

    .recent-icon {
      font-size: 36rpx;
    }

    .recent-info {
      flex: 1;

      .recent-name {
        display: block;
        font-size: 26rpx;
        color: #1e293b;
      }

      .recent-time {
        font-size: 22rpx;
        color: #94a3b8;
      }
    }
  }
}
</style>
