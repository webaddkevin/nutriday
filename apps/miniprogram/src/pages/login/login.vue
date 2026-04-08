<template>
  <view class="login-page">
    <!-- 动态背景 -->
    <view class="bg-wrapper">
      <view class="bg-gradient"></view>
      <view class="bg-pattern"></view>
      <!-- 浮动装饰元素 -->
      <view class="floating-elements">
        <view class="float-item float-1">🥗</view>
        <view class="float-item float-2">🍎</view>
        <view class="float-item float-3">🥑</view>
        <view class="float-item float-4">🥦</view>
        <view class="float-item float-5">🍊</view>
      </view>
    </view>

    <!-- 主内容区 -->
    <view class="main-content">
      <!-- Logo 区域 -->
      <view class="logo-section">
        <view class="logo-container">
          <view class="logo-glow"></view>
          <view class="logo-inner">
            <text class="logo-emoji">🥗</text>
          </view>
        </view>
        <text class="logo-title">每日营养</text>
        <text class="logo-subtitle">智能饮食管理，健康生活每一天</text>
      </view>

      <!-- 登录卡片 -->
      <view class="login-card">
        <!-- 登录方式切换 -->
        <view class="login-tabs">
          <view
            class="tab-item"
            :class="{ active: loginMode === 'wechat' }"
            @tap="loginMode = 'wechat'"
          >
            <text class="tab-icon">💬</text>
            <text class="tab-text">微信登录</text>
          </view>
          <view
            class="tab-item"
            :class="{ active: loginMode === 'phone' }"
            @tap="loginMode = 'phone'"
          >
            <text class="tab-icon">📱</text>
            <text class="tab-text">手机登录</text>
          </view>
          <view
            class="tab-indicator"
            :style="{ left: loginMode === 'wechat' ? '0' : '50%' }"
          ></view>
        </view>

        <!-- 微信登录 -->
        <view v-if="loginMode === 'wechat'" class="wechat-section">
          <view class="wechat-info">
            <text class="info-title">欢迎使用微信登录</text>
            <text class="info-desc">快速安全，一键登录</text>
          </view>

          <button class="wechat-btn" open-type="getPhoneNumber" @getphonenumber="onGetPhoneNumber">
            <view class="btn-glow"></view>
            <view class="btn-content">
              <view class="wechat-icon">
                <text class="icon-text">💬</text>
              </view>
              <text class="btn-text">微信一键登录</text>
            </view>
          </button>

          <view class="wechat-features">
            <view class="feature-item">
              <text class="feature-icon">🔒</text>
              <text class="feature-text">安全加密</text>
            </view>
            <view class="feature-item">
              <text class="feature-icon">⚡</text>
              <text class="feature-text">极速登录</text>
            </view>
            <view class="feature-item">
              <text class="feature-icon">🎯</text>
              <text class="feature-text">数据同步</text>
            </view>
          </view>
        </view>

        <!-- 手机号登录 -->
        <view v-else class="phone-section">
          <view class="input-group">
            <view class="input-icon">📱</view>
            <input
              v-model="phoneNumber"
              type="number"
              placeholder="请输入手机号"
              class="input-field"
              maxlength="11"
            />
            <text v-if="phoneNumber.length === 11" class="input-check">✓</text>
          </view>

          <view class="input-group">
            <view class="input-icon">🔐</view>
            <input
              v-model="verifyCode"
              type="number"
              placeholder="请输入验证码"
              class="input-field"
              maxlength="6"
            />
            <button
              class="code-btn"
              :class="{ active: countdown > 0 }"
              :disabled="countdown > 0"
              @tap="sendVerifyCode"
            >
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </button>
          </view>

          <button
            class="phone-btn"
            :class="{ disabled: !canLogin }"
            :disabled="!canLogin"
            @tap="loginWithPhone"
          >
            <view class="btn-glow"></view>
            <text class="btn-text">登录 / 注册</text>
          </button>
        </view>

        <!-- 用户协议 -->
        <view class="agreement-section">
          <view class="agreement-wrap" @tap="agreed = !agreed">
            <view class="custom-checkbox" :class="{ checked: agreed }">
              <text v-if="agreed" class="check-icon">✓</text>
            </view>
            <text class="agreement-text">
              登录即表示同意
              <text class="link" @tap.stop="openAgreement('user')">《用户协议》</text>
              和
              <text class="link" @tap.stop="openAgreement('privacy')">《隐私政策》</text>
            </text>
          </view>
        </view>
      </view>

      <!-- 底部信息 -->
      <view class="footer-section">
        <view class="divider">
          <view class="divider-line"></view>
          <text class="divider-text">其他方式</text>
          <view class="divider-line"></view>
        </view>

        <view class="guest-btn" @tap="loginAsGuest">
          <text class="guest-text">暂不登录，先逛逛</text>
          <text class="guest-arrow">→</text>
        </view>

        <view class="footer-info">
          <text class="copyright">© 2026 每日营养 · 您的健康饮食管家</text>
        </view>
      </view>
    </view>

    <!-- 加载状态 -->
    <view v-if="loading" class="loading-overlay">
      <view class="loading-content">
        <view class="loading-spinner"></view>
        <text class="loading-text">登录中...</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { request, setToken, setUserId } from '@/utils/request';

const loginMode = ref<'wechat' | 'phone'>('wechat');
const phoneNumber = ref('');
const verifyCode = ref('');
const countdown = ref(0);
const agreed = ref(false);
const loading = ref(false);

const canLogin = computed(() => {
  return agreed.value && phoneNumber.value.length === 11 && verifyCode.value.length >= 4;
});

// 微信一键登录
const onGetPhoneNumber = async (e: any) => {
  if (!agreed.value) {
    uni.showToast({ title: '请先同意用户协议', icon: 'none' });
    return;
  }

  if (e.detail.errMsg !== 'getPhoneNumber:ok') {
    uni.showToast({ title: '授权失败', icon: 'none' });
    return;
  }

  loading.value = true;

  try {
    const loginRes = await new Promise<UniApp.LoginRes>((resolve, reject) => {
      uni.login({ success: resolve, fail: reject });
    });

    const res = await request({
      url: '/auth/wechat-login',
      method: 'POST',
      data: {
        code: loginRes.code,
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv,
      },
    });

    if (res.success !== false) {
      setToken(res.data.token);
      setUserId(res.data.userId);

      uni.showToast({ title: '登录成功', icon: 'success' });

      setTimeout(() => {
        const pages = getCurrentPages();
        if (pages.length > 1) {
          uni.navigateBack();
        } else {
          uni.switchTab({ url: '/pages/index/index' });
        }
      }, 1000);
    }
  } catch (error) {
    uni.showToast({ title: '登录失败，请重试', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

// 发送验证码
const sendVerifyCode = async () => {
  if (phoneNumber.value.length !== 11) {
    uni.showToast({ title: '请输入正确的手机号', icon: 'none' });
    return;
  }

  try {
    const res = await request({
      url: '/auth/send-code',
      method: 'POST',
      data: { phone: phoneNumber.value },
    });

    if (res.success !== false) {
      uni.showToast({ title: '验证码已发送', icon: 'success' });
      countdown.value = 60;

      const timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    }
  } catch (error) {
    uni.showToast({ title: '发送失败，请重试', icon: 'none' });
  }
};

// 手机号登录
const loginWithPhone = async () => {
  if (!canLogin.value) return;

  loading.value = true;

  try {
    const res = await request({
      url: '/auth/phone-login',
      method: 'POST',
      data: {
        phone: phoneNumber.value,
        code: verifyCode.value,
      },
    });

    if (res.success !== false) {
      setToken(res.data.token);
      setUserId(res.data.userId);

      uni.showToast({ title: '登录成功', icon: 'success' });

      setTimeout(() => {
        const pages = getCurrentPages();
        if (pages.length > 1) {
          uni.navigateBack();
        } else {
          uni.switchTab({ url: '/pages/index/index' });
        }
      }, 1000);
    }
  } catch (error) {
    uni.showToast({ title: '登录失败，请重试', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

// 游客模式
const loginAsGuest = () => {
  uni.switchTab({ url: '/pages/index/index' });
};

// 打开协议
const openAgreement = (type: 'user' | 'privacy') => {
  uni.navigateTo({
    url: `/pages/webview/webview?type=${type}`,
  });
};
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

// 背景设计
.bg-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}

.bg-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 70%;
  background: linear-gradient(180deg, #00b171 0%, #00d68f 50%, #f0fdf4 100%);
}

.bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.08) 0%, transparent 50%);
}

// 浮动元素
.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 50%;
  pointer-events: none;
}

.float-item {
  position: absolute;
  font-size: 48rpx;
  opacity: 0.15;
  animation: float 6s ease-in-out infinite;
}

.float-1 {
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.float-2 {
  top: 20%;
  right: 15%;
  animation-delay: 1s;
}

.float-3 {
  top: 35%;
  left: 20%;
  animation-delay: 2s;
}

.float-4 {
  top: 15%;
  right: 30%;
  animation-delay: 3s;
}

.float-5 {
  top: 40%;
  right: 10%;
  animation-delay: 4s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20rpx) rotate(10deg);
  }
}

// 主内容
.main-content {
  position: relative;
  z-index: 1;
  padding: 0 40rpx;
  padding-top: 120rpx;
}

// Logo 区域
.logo-section {
  text-align: center;
  margin-bottom: 48rpx;
}

.logo-container {
  position: relative;
  display: inline-block;
  margin-bottom: 24rpx;
}

.logo-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200rpx;
  height: 200rpx;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.4;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.2;
  }
}

.logo-inner {
  width: 140rpx;
  height: 140rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20rpx 60rpx rgba(0, 177, 113, 0.3);
  position: relative;
  z-index: 1;
}

.logo-emoji {
  font-size: 72rpx;
}

.logo-title {
  display: block;
  font-size: 52rpx;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12rpx;
  text-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.logo-subtitle {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 2rpx;
}

// 登录卡片
.login-card {
  background: #fff;
  border-radius: 32rpx;
  padding: 40rpx;
  box-shadow: 0 20rpx 80rpx rgba(0, 0, 0, 0.08);
  margin-bottom: 40rpx;
}

// 登录方式切换
.login-tabs {
  display: flex;
  background: #f8fafc;
  border-radius: 20rpx;
  padding: 8rpx;
  margin-bottom: 40rpx;
  position: relative;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 20rpx 0;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;

  .tab-icon {
    font-size: 32rpx;
    opacity: 0.5;
    transition: all 0.3s ease;
  }

  .tab-text {
    font-size: 28rpx;
    font-weight: 500;
    color: #94a3b8;
    transition: all 0.3s ease;
  }

  &.active {
    .tab-icon {
      opacity: 1;
    }

    .tab-text {
      color: #00b171;
    }
  }
}

.tab-indicator {
  position: absolute;
  top: 8rpx;
  bottom: 8rpx;
  width: calc(50% - 8rpx);
  background: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  transition: left 0.3s ease;
}

// 微信登录区域
.wechat-section {
  .wechat-info {
    text-align: center;
    margin-bottom: 32rpx;

    .info-title {
      display: block;
      font-size: 32rpx;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 8rpx;
    }

    .info-desc {
      font-size: 26rpx;
      color: #94a3b8;
    }
  }
}

.wechat-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #07c160 0%, #09bb07 100%);
  border-radius: 50rpx;
  border: none;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &::after {
    border: none;
  }

  .btn-glow {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    100% {
      left: 100%;
    }
  }

  .btn-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16rpx;
    position: relative;
    z-index: 1;
  }

  .wechat-icon {
    width: 48rpx;
    height: 48rpx;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;

    .icon-text {
      font-size: 28rpx;
    }
  }

  .btn-text {
    font-size: 32rpx;
    font-weight: 600;
    color: #fff;
  }
}

.wechat-features {
  display: flex;
  justify-content: center;
  gap: 48rpx;
  margin-top: 32rpx;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;

  .feature-icon {
    font-size: 32rpx;
  }

  .feature-text {
    font-size: 22rpx;
    color: #94a3b8;
  }
}

// 手机号登录区域
.phone-section {
  .input-group {
    display: flex;
    align-items: center;
    background: #f8fafc;
    border-radius: 20rpx;
    padding: 0 24rpx;
    margin-bottom: 24rpx;
    border: 2rpx solid transparent;
    transition: all 0.3s ease;

    &:focus-within {
      background: #fff;
      border-color: #00b171;
      box-shadow: 0 0 0 6rpx rgba(0, 177, 113, 0.1);
    }

    .input-icon {
      font-size: 36rpx;
      margin-right: 16rpx;
    }

    .input-field {
      flex: 1;
      height: 100rpx;
      font-size: 30rpx;
      color: #1e293b;
    }

    .input-check {
      color: #00b171;
      font-size: 32rpx;
      font-weight: 600;
    }
  }

  .code-btn {
    width: 200rpx;
    height: 72rpx;
    background: #fff;
    border: 2rpx solid #00b171;
    border-radius: 36rpx;
    font-size: 26rpx;
    color: #00b171;
    font-weight: 500;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    &::after {
      border: none;
    }

    &.active {
      color: #94a3b8;
      border-color: #e2e8f0;
    }
  }
}

.phone-btn {
  width: 100%;
  height: 100rpx;
  background: linear-gradient(135deg, #00b171 0%, #00d68f 100%);
  border-radius: 50rpx;
  border: none;
  position: relative;
  overflow: hidden;
  margin-top: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &::after {
    border: none;
  }

  .btn-glow {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    animation: shimmer 2s infinite;
  }

  .btn-text {
    font-size: 32rpx;
    font-weight: 600;
    color: #fff;
    position: relative;
    z-index: 1;
  }

  &.disabled {
    opacity: 0.5;

    .btn-glow {
      animation: none;
    }
  }
}

// 用户协议
.agreement-section {
  margin-top: 32rpx;
}

.agreement-wrap {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 12rpx;
}

.custom-checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #cbd5e1;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2rpx;
  transition: all 0.2s ease;

  &.checked {
    background: linear-gradient(135deg, #00b171 0%, #00d68f 100%);
    border-color: #00b171;
  }

  .check-icon {
    font-size: 22rpx;
    color: #fff;
    font-weight: 600;
  }
}

.agreement-text {
  font-size: 24rpx;
  color: #64748b;
  line-height: 1.6;

  .link {
    color: #00b171;
    font-weight: 500;
  }
}

// 底部区域
.footer-section {
  text-align: center;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 32rpx;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
}

.divider-text {
  padding: 0 24rpx;
  font-size: 24rpx;
  color: #94a3b8;
}

.guest-btn {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 20rpx 40rpx;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 40rpx;
  margin-bottom: 40rpx;

  .guest-text {
    font-size: 28rpx;
    color: #64748b;
  }

  .guest-arrow {
    font-size: 28rpx;
    color: #00b171;
    transition: transform 0.3s ease;
  }

  &:active {
    .guest-arrow {
      transform: translateX(8rpx);
    }
  }
}

.footer-info {
  padding-bottom: 40rpx;

  .copyright {
    font-size: 22rpx;
    color: #94a3b8;
  }
}

// 加载状态
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
  z-index: 1000;
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
