<template>
  <view class="score-page">
    <!-- 评分卡片 -->
    <view class="score-card">
      <view class="score-header">
        <text class="score-title">今日营养评分</text>
        <text class="score-date">{{ today }}</text>
      </view>

      <view class="score-main">
        <view class="score-ring">
          <view class="ring-bg"></view>
          <view class="ring-progress" :style="{ '--progress': score }"></view>
          <view class="ring-center">
            <text class="score-value">{{ score }}</text>
            <text class="score-label">分</text>
          </view>
        </view>
        <view class="score-level">
          <text class="level-badge" :class="levelClass">{{ levelText }}</text>
          <text class="level-desc">{{ levelDesc }}</text>
        </view>
      </view>
    </view>

    <!-- 详细评分 -->
    <view class="detail-section">
      <text class="section-title">各项评分</text>
      <view class="detail-list">
        <view v-for="item in scoreDetails" :key="item.key" class="detail-item">
          <view class="detail-header">
            <text class="detail-icon">{{ item.icon }}</text>
            <text class="detail-name">{{ item.name }}</text>
            <text class="detail-score" :class="item.scoreClass">{{ item.score }}分</text>
          </view>
          <view class="detail-bar">
            <view class="bar-fill" :style="{ width: item.score + '%', background: item.color }" />
          </view>
          <text class="detail-tip">{{ item.tip }}</text>
        </view>
      </view>
    </view>

    <!-- 改进建议 -->
    <view class="suggest-section">
      <text class="section-title">💡 改进建议</text>
      <view class="suggest-list">
        <view v-for="(suggest, index) in suggestions" :key="index" class="suggest-item">
          <text class="suggest-icon">{{ suggest.icon }}</text>
          <view class="suggest-content">
            <text class="suggest-title">{{ suggest.title }}</text>
            <text class="suggest-desc">{{ suggest.desc }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 营养对比 -->
    <view class="compare-section">
      <text class="section-title">与目标对比</text>
      <view class="compare-list">
        <view v-for="item in nutrientCompare" :key="item.key" class="compare-item">
          <view class="compare-info">
            <text class="compare-name">{{ item.name }}</text>
            <text class="compare-values">
              {{ item.actual }} / {{ item.target }}{{ item.unit }}
            </text>
          </view>
          <view class="compare-bar">
            <view
              class="bar-fill"
              :style="{
                width: Math.min(item.percent, 100) + '%',
                background:
                  item.percent > 110 ? '#ef4444' : item.percent > 90 ? '#00b171' : '#f59e0b',
              }"
            />
          </view>
          <text class="compare-percent" :class="item.percentClass">{{ item.percent }}%</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { request } from '@/utils/request';

interface NutrientData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

interface ScoreDetail {
  key: string;
  name: string;
  icon: string;
  score: number;
  color: string;
  tip: string;
  scoreClass: string;
}

const today = ref('');
const score = ref(0);
const nutrientData = ref<NutrientData>({
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sodium: 0,
});
const targetData = ref<NutrientData>({
  calories: 2000,
  protein: 60,
  carbs: 250,
  fat: 65,
  fiber: 25,
  sodium: 2000,
});

const levelText = computed(() => {
  if (score.value >= 90) return '优秀';
  if (score.value >= 80) return '良好';
  if (score.value >= 60) return '及格';
  return '需改进';
});

const levelDesc = computed(() => {
  if (score.value >= 90) return '营养均衡，继续保持！';
  if (score.value >= 80) return '整体不错，还有提升空间';
  if (score.value >= 60) return '部分营养需要调整';
  return '建议关注营养搭配';
});

const levelClass = computed(() => {
  if (score.value >= 90) return 'excellent';
  if (score.value >= 80) return 'good';
  if (score.value >= 60) return 'pass';
  return 'need-improve';
});

const scoreDetails = computed<ScoreDetail[]>(() => {
  const data = nutrientData.value;
  const target = targetData.value;

  const calcScore = (actual: number, target: number, weight: number = 1) => {
    if (target === 0) return 0;
    const ratio = actual / target;
    // 最佳范围是 90%-110%
    if (ratio >= 0.9 && ratio <= 1.1) return 100 * weight;
    if (ratio >= 0.8 && ratio <= 1.2) return 80 * weight;
    if (ratio >= 0.7 && ratio <= 1.3) return 60 * weight;
    return 40 * weight;
  };

  const getTip = (actual: number, target: number, name: string) => {
    if (target === 0) return '暂无目标';
    const ratio = actual / target;
    if (ratio >= 0.9 && ratio <= 1.1) return `${name}摄入合理`;
    if (ratio < 0.9) return `${name}摄入不足，建议增加`;
    return `${name}摄入过多，建议减少`;
  };

  const getScoreClass = (s: number) => {
    if (s >= 80) return 'good';
    if (s >= 60) return 'medium';
    return 'bad';
  };

  return [
    {
      key: 'calories',
      name: '热量',
      icon: '🔥',
      score: calcScore(data.calories, target.calories),
      color: '#f97316',
      tip: getTip(data.calories, target.calories, '热量'),
      scoreClass: getScoreClass(calcScore(data.calories, target.calories)),
    },
    {
      key: 'protein',
      name: '蛋白质',
      icon: '🥩',
      score: calcScore(data.protein, target.protein),
      color: '#ef4444',
      tip: getTip(data.protein, target.protein, '蛋白质'),
      scoreClass: getScoreClass(calcScore(data.protein, target.protein)),
    },
    {
      key: 'carbs',
      name: '碳水',
      icon: '🍚',
      score: calcScore(data.carbs, target.carbs),
      color: '#eab308',
      tip: getTip(data.carbs, target.carbs, '碳水'),
      scoreClass: getScoreClass(calcScore(data.carbs, target.carbs)),
    },
    {
      key: 'fat',
      name: '脂肪',
      icon: '🥑',
      score: calcScore(data.fat, target.fat),
      color: '#84cc16',
      tip: getTip(data.fat, target.fat, '脂肪'),
      scoreClass: getScoreClass(calcScore(data.fat, target.fat)),
    },
    {
      key: 'fiber',
      name: '膳食纤维',
      icon: '🥬',
      score: data.fiber >= target.fiber ? 100 : (data.fiber / target.fiber) * 100,
      color: '#22c55e',
      tip: data.fiber >= target.fiber ? '膳食纤维充足' : '建议增加蔬菜水果摄入',
      scoreClass: getScoreClass(
        data.fiber >= target.fiber ? 100 : (data.fiber / target.fiber) * 100,
      ),
    },
  ];
});

const suggestions = computed(() => {
  const result: { icon: string; title: string; desc: string }[] = [];
  const data = nutrientData.value;
  const target = targetData.value;

  // 蛋白质不足
  if (data.protein < target.protein * 0.9) {
    result.push({
      icon: '🥚',
      title: '增加蛋白质',
      desc: '建议多吃鸡蛋、瘦肉、鱼类或豆制品',
    });
  }

  // 膳食纤维不足
  if (data.fiber < target.fiber * 0.8) {
    result.push({
      icon: '🥦',
      title: '多吃蔬菜水果',
      desc: '每天至少 500g 蔬菜，200g 水果',
    });
  }

  // 热量过高
  if (data.calories > target.calories * 1.1) {
    result.push({
      icon: '🏃',
      title: '控制热量摄入',
      desc: '今天热量超标，可以增加运动消耗',
    });
  }

  // 热量过低
  if (data.calories < target.calories * 0.8) {
    result.push({
      icon: '🍽️',
      title: '注意补充能量',
      desc: '摄入热量过低，可能影响代谢',
    });
  }

  // 如果都很好
  if (result.length === 0) {
    result.push({
      icon: '✨',
      title: '继续保持',
      desc: '今日营养摄入均衡，继续保持好习惯',
    });
  }

  return result;
});

const nutrientCompare = computed(() => {
  const data = nutrientData.value;
  const target = targetData.value;

  const items = [
    { key: 'calories', name: '热量', actual: data.calories, target: target.calories, unit: 'kcal' },
    { key: 'protein', name: '蛋白质', actual: data.protein, target: target.protein, unit: 'g' },
    { key: 'carbs', name: '碳水', actual: data.carbs, target: target.carbs, unit: 'g' },
    { key: 'fat', name: '脂肪', actual: data.fat, target: target.fat, unit: 'g' },
  ];

  return items.map((item) => {
    const percent = item.target > 0 ? Math.round((item.actual / item.target) * 100) : 0;
    let percentClass = 'normal';
    if (percent > 110) percentClass = 'high';
    else if (percent < 80) percentClass = 'low';

    return { ...item, percent, percentClass };
  });
});

onLoad(() => {
  uni.setNavigationBarTitle({ title: '营养评分' });
  today.value = new Date().toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
});

onMounted(() => {
  loadData();
});

async function loadData() {
  try {
    const date = new Date().toISOString().split('T')[0];

    // 获取今日饮食数据
    const mealRes = await request({
      url: '/meal-log/daily',
      data: { date },
    });

    if (mealRes.data) {
      nutrientData.value = {
        calories: mealRes.data.totalCalories || 0,
        protein: mealRes.data.totalProtein || 0,
        carbs: mealRes.data.totalCarbs || 0,
        fat: mealRes.data.totalFat || 0,
        fiber: mealRes.data.totalFiber || 0,
        sodium: mealRes.data.totalSodium || 0,
      };
    }

    // 获取目标数据
    const profileRes = await request({ url: '/profile' });
    if (profileRes.data?.targetCalories) {
      targetData.value.calories = profileRes.data.targetCalories;
      // 根据热量计算其他目标
      targetData.value.protein = Math.round((targetData.value.calories * 0.15) / 4); // 15% 热量来自蛋白质
      targetData.value.carbs = Math.round((targetData.value.calories * 0.5) / 4); // 50% 热量来自碳水
      targetData.value.fat = Math.round((targetData.value.calories * 0.3) / 9); // 30% 热量来自脂肪
    }

    // 计算总分
    calculateScore();
  } catch (e) {
    console.error('加载数据失败', e);
  }
}

function calculateScore() {
  const details = scoreDetails.value;
  if (details.length === 0) {
    score.value = 0;
    return;
  }

  // 加权平均
  const weights = [0.3, 0.25, 0.2, 0.15, 0.1]; // 热量、蛋白质、碳水、脂肪、纤维
  let total = 0;
  details.forEach((d, i) => {
    total += d.score * weights[i];
  });

  score.value = Math.round(total);
}
</script>

<style lang="scss" scoped>
.score-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 24rpx;
}

.score-card {
  background: linear-gradient(135deg, #00b171 0%, #00d68f 100%);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 24rpx;

  .score-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;

    .score-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #fff;
    }

    .score-date {
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.8);
    }
  }

  .score-main {
    display: flex;
    align-items: center;
    gap: 32rpx;
  }

  .score-ring {
    width: 160rpx;
    height: 160rpx;
    position: relative;

    .ring-bg,
    .ring-progress {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }

    .ring-bg {
      background: rgba(255, 255, 255, 0.2);
    }

    .ring-progress {
      background: conic-gradient(
        #fff 0deg calc(var(--progress) * 3.6deg),
        transparent calc(var(--progress) * 3.6deg) 360deg
      );
    }

    .ring-center {
      position: absolute;
      inset: 16rpx;
      background: linear-gradient(135deg, #00b171 0%, #00d68f 100%);
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .score-value {
        font-size: 48rpx;
        font-weight: 700;
        color: #fff;
        line-height: 1;
      }

      .score-label {
        font-size: 20rpx;
        color: rgba(255, 255, 255, 0.8);
      }
    }
  }

  .score-level {
    flex: 1;

    .level-badge {
      display: inline-block;
      padding: 8rpx 20rpx;
      border-radius: 20rpx;
      font-size: 28rpx;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.2);
      color: #fff;
      margin-bottom: 8rpx;

      &.excellent {
        background: #ffd700;
        color: #1e293b;
      }
    }

    .level-desc {
      display: block;
      font-size: 24rpx;
      color: rgba(255, 255, 255, 0.9);
    }
  }
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 16rpx;
  display: block;
}

.detail-section,
.suggest-section,
.compare-section {
  background: #fff;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.detail-list {
  .detail-item {
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f1f5f9;

    &:last-child {
      border-bottom: none;
    }

    .detail-header {
      display: flex;
      align-items: center;
      margin-bottom: 8rpx;

      .detail-icon {
        font-size: 28rpx;
        margin-right: 8rpx;
      }

      .detail-name {
        flex: 1;
        font-size: 26rpx;
        color: #1e293b;
      }

      .detail-score {
        font-size: 26rpx;
        font-weight: 600;

        &.good {
          color: #00b171;
        }
        &.medium {
          color: #f59e0b;
        }
        &.bad {
          color: #ef4444;
        }
      }
    }

    .detail-bar {
      height: 8rpx;
      background: #f1f5f9;
      border-radius: 4rpx;
      overflow: hidden;
      margin-bottom: 8rpx;

      .bar-fill {
        height: 100%;
        border-radius: 4rpx;
      }
    }

    .detail-tip {
      font-size: 22rpx;
      color: #64748b;
    }
  }
}

.suggest-list {
  .suggest-item {
    display: flex;
    gap: 16rpx;
    padding: 16rpx 0;
    border-bottom: 1rpx solid #f1f5f9;

    &:last-child {
      border-bottom: none;
    }

    .suggest-icon {
      font-size: 36rpx;
    }

    .suggest-content {
      flex: 1;

      .suggest-title {
        display: block;
        font-size: 26rpx;
        font-weight: 500;
        color: #1e293b;
        margin-bottom: 4rpx;
      }

      .suggest-desc {
        font-size: 24rpx;
        color: #64748b;
      }
    }
  }
}

.compare-list {
  .compare-item {
    display: flex;
    align-items: center;
    padding: 12rpx 0;

    .compare-info {
      width: 200rpx;

      .compare-name {
        display: block;
        font-size: 24rpx;
        color: #64748b;
      }

      .compare-values {
        font-size: 22rpx;
        color: #94a3b8;
      }
    }

    .compare-bar {
      flex: 1;
      height: 12rpx;
      background: #f1f5f9;
      border-radius: 6rpx;
      overflow: hidden;
      margin: 0 16rpx;

      .bar-fill {
        height: 100%;
        border-radius: 6rpx;
      }
    }

    .compare-percent {
      width: 80rpx;
      text-align: right;
      font-size: 24rpx;
      font-weight: 600;

      &.high {
        color: #ef4444;
      }
      &.low {
        color: #f59e0b;
      }
      &.normal {
        color: #00b171;
      }
    }
  }
}
</style>
