<template>
  <view class="nutri-icon" :class="[`icon-${name}`, `size-${size}`]" :style="iconStyle">
    <view v-if="name === 'home'" class="icon-svg">
      <view class="house">
        <view class="roof"></view>
        <view class="body"></view>
        <view class="door"></view>
      </view>
    </view>
    <view v-else-if="name === 'plan'" class="icon-svg">
      <view class="calendar">
        <view class="cal-header"></view>
        <view class="cal-body">
          <view v-for="i in 3" :key="i" class="cal-row">
            <view v-for="j in 4" :key="j" class="cal-dot"></view>
          </view>
        </view>
      </view>
    </view>
    <view v-else-if="name === 'user'" class="icon-svg">
      <view class="user-icon">
        <view class="head"></view>
        <view class="shoulders"></view>
      </view>
    </view>
    <view v-else-if="name === 'stats'" class="icon-svg">
      <view class="chart">
        <view class="bar bar-1"></view>
        <view class="bar bar-2"></view>
        <view class="bar bar-3"></view>
      </view>
    </view>
    <view v-else-if="name === 'weight'" class="icon-svg">
      <view class="scale">
        <view class="scale-base"></view>
        <view class="scale-dial"></view>
      </view>
    </view>
    <view v-else-if="name === 'target'" class="icon-svg">
      <view class="target">
        <view class="ring ring-1"></view>
        <view class="ring ring-2"></view>
        <view class="bullseye"></view>
      </view>
    </view>
    <view v-else-if="name === 'health'" class="icon-svg">
      <view class="heart">
        <view class="heart-left"></view>
        <view class="heart-right"></view>
      </view>
    </view>
    <view v-else-if="name === 'water'" class="icon-svg">
      <view class="drop">
        <view class="drop-body"></view>
      </view>
    </view>
    <view v-else-if="name === 'star'" class="icon-svg">
      <view class="star">
        <view
          v-for="i in 5"
          :key="i"
          class="star-point"
          :style="{ transform: `rotate(${i * 72}deg)` }"
        ></view>
      </view>
    </view>
    <view v-else-if="name === 'trend'" class="icon-svg">
      <view class="trend-line">
        <view class="line-segment seg-1"></view>
        <view class="line-segment seg-2"></view>
        <view class="arrow-head"></view>
      </view>
    </view>
    <view v-else-if="name === 'scan'" class="icon-svg">
      <view class="scanner">
        <view class="scan-frame">
          <view class="corner tl"></view>
          <view class="corner tr"></view>
          <view class="corner bl"></view>
          <view class="corner br"></view>
        </view>
        <view class="scan-line"></view>
      </view>
    </view>
    <view v-else-if="name === 'ai'" class="icon-svg">
      <view class="ai-brain">
        <view class="brain-core"></view>
        <view class="brain-ring"></view>
        <view class="pulse p1"></view>
        <view class="pulse p2"></view>
      </view>
    </view>
    <text v-else class="icon-emoji">{{ fallbackEmoji }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    name: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: string;
  }>(),
  {
    size: 'md',
    color: '',
  },
);

const iconStyle = computed(() => {
  if (props.color) {
    return { '--icon-color': props.color };
  }
  return {};
});

const fallbackEmoji = computed(() => {
  const emojiMap: Record<string, string> = {
    home: '🏠',
    plan: '📅',
    user: '👤',
    stats: '📊',
    weight: '⚖️',
    target: '🎯',
    health: '❤️',
    water: '💧',
    star: '⭐',
    trend: '📈',
    scan: '📷',
    ai: '🤖',
  };
  return emojiMap[props.name] || '📌';
});
</script>

<style lang="scss" scoped>
.nutri-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  --icon-color: currentColor;

  &.size-sm {
    width: 36rpx;
    height: 36rpx;
    .icon-svg,
    .icon-emoji {
      font-size: 28rpx;
    }
  }
  &.size-md {
    width: 48rpx;
    height: 48rpx;
    .icon-svg,
    .icon-emoji {
      font-size: 40rpx;
    }
  }
  &.size-lg {
    width: 64rpx;
    height: 64rpx;
    .icon-svg,
    .icon-emoji {
      font-size: 52rpx;
    }
  }
  &.size-xl {
    width: 96rpx;
    height: 96rpx;
    .icon-svg,
    .icon-emoji {
      font-size: 80rpx;
    }
  }

  .icon-emoji {
    line-height: 1;
  }
}

.icon-svg {
  width: 100%;
  height: 100%;
  position: relative;
}

// Home icon
.house {
  width: 70%;
  height: 70%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  .roof {
    width: 0;
    height: 0;
    border-left: 50% solid transparent;
    border-right: 50% solid transparent;
    border-bottom: 40% solid var(--icon-color);
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }

  .body {
    width: 80%;
    height: 50%;
    background: var(--icon-color);
    position: absolute;
    bottom: 0;
    left: 10%;
    border-radius: 4%;
  }

  .door {
    width: 25%;
    height: 35%;
    background: rgba(255, 255, 255, 0.3);
    position: absolute;
    bottom: 0;
    left: 37.5%;
    border-radius: 10% 10% 0 0;
  }
}

// Calendar icon
.calendar {
  width: 70%;
  height: 70%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 6% solid var(--icon-color);
  border-radius: 10%;

  .cal-header {
    height: 25%;
    background: var(--icon-color);
    border-radius: 5% 5% 0 0;
    margin: -6% -6% 0;
    padding: 6%;
  }

  .cal-body {
    padding: 8%;

    .cal-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8%;

      .cal-dot {
        width: 12%;
        height: 0;
        padding-bottom: 12%;
        background: var(--icon-color);
        border-radius: 50%;
        opacity: 0.4;
      }
    }
  }
}

// User icon
.user-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  height: 70%;

  .head {
    width: 40%;
    height: 40%;
    background: var(--icon-color);
    border-radius: 50%;
    margin: 0 auto;
  }

  .shoulders {
    width: 80%;
    height: 35%;
    background: var(--icon-color);
    border-radius: 50% 50% 0 0;
    margin: 10% auto 0;
  }
}

// Chart icon
.chart {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  height: 60%;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding-bottom: 10%;

  .bar {
    width: 22%;
    background: var(--icon-color);
    border-radius: 10% 10% 0 0;

    &.bar-1 {
      height: 40%;
      opacity: 0.6;
    }
    &.bar-2 {
      height: 80%;
    }
    &.bar-3 {
      height: 55%;
      opacity: 0.8;
    }
  }
}

// Target icon
.target {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  height: 70%;

  .ring {
    position: absolute;
    border: 8% solid var(--icon-color);
    border-radius: 50%;

    &.ring-1 {
      width: 100%;
      height: 100%;
      opacity: 0.4;
    }
    &.ring-2 {
      width: 60%;
      height: 60%;
      top: 20%;
      left: 20%;
      opacity: 0.7;
    }
  }

  .bullseye {
    position: absolute;
    width: 20%;
    height: 20%;
    background: var(--icon-color);
    border-radius: 50%;
    top: 40%;
    left: 40%;
  }
}

// Heart icon
.heart {
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 60%;
  height: 55%;

  .heart-left,
  .heart-right {
    position: absolute;
    width: 50%;
    height: 80%;
    background: var(--icon-color);
    border-radius: 50% 50% 0 50%;
  }

  .heart-left {
    left: 0;
    transform: rotate(-45deg);
    transform-origin: bottom right;
  }

  .heart-right {
    right: 0;
    transform: rotate(45deg);
    transform-origin: bottom left;
  }
}

// Water drop
.drop {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  height: 65%;

  .drop-body {
    width: 100%;
    height: 100%;
    background: var(--icon-color);
    border-radius: 50% 50% 50% 50% / 30% 30% 70% 70%;
  }
}

// AI brain
.ai-brain {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  height: 70%;

  .brain-core {
    position: absolute;
    width: 40%;
    height: 40%;
    background: var(--icon-color);
    border-radius: 50%;
    top: 30%;
    left: 30%;
  }

  .brain-ring {
    position: absolute;
    width: 80%;
    height: 80%;
    border: 8% solid var(--icon-color);
    border-radius: 50%;
    top: 10%;
    left: 10%;
    opacity: 0.5;
  }

  .pulse {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 4% solid var(--icon-color);
    border-radius: 50%;
    opacity: 0;
    animation: pulse 2s infinite;

    &.p1 {
      animation-delay: 0s;
    }
    &.p2 {
      animation-delay: 1s;
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(0.5);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.2);
    opacity: 0;
  }
}

// Scanner
.scanner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70%;
  height: 70%;

  .scan-frame {
    width: 100%;
    height: 100%;
    position: relative;

    .corner {
      position: absolute;
      width: 25%;
      height: 25%;
      border-color: var(--icon-color);
      border-style: solid;
      border-width: 0;

      &.tl {
        top: 0;
        left: 0;
        border-top-width: 6rpx;
        border-left-width: 6rpx;
        border-radius: 10% 0 0 0;
      }
      &.tr {
        top: 0;
        right: 0;
        border-top-width: 6rpx;
        border-right-width: 6rpx;
        border-radius: 0 10% 0 0;
      }
      &.bl {
        bottom: 0;
        left: 0;
        border-bottom-width: 6rpx;
        border-left-width: 6rpx;
        border-radius: 0 0 0 10%;
      }
      &.br {
        bottom: 0;
        right: 0;
        border-bottom-width: 6rpx;
        border-right-width: 6rpx;
        border-radius: 0 0 10% 0;
      }
    }
  }

  .scan-line {
    position: absolute;
    width: 80%;
    height: 4rpx;
    background: var(--icon-color);
    top: 50%;
    left: 10%;
    opacity: 0.8;
    animation: scanMove 2s infinite;
  }
}

@keyframes scanMove {
  0%,
  100% {
    top: 20%;
    opacity: 0.4;
  }
  50% {
    top: 80%;
    opacity: 1;
  }
}
</style>
