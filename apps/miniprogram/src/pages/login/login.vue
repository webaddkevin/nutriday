<template>
  <view class="login-page">
    <!-- 背景装饰 -->
    <view class="bg-decoration">
      <view class="bg-circle bg-circle-1"></view>
      <view class="bg-circle bg-circle-2"></view>
    </view>

    <!-- Logo 区域 -->
    <view class="logo-section">
      <view class="logo-icon">🥗</view>
      <text class="logo-title">每日营养</text>
      <text class="logo-subtitle">记录每一餐，健康每一天</text>
    </view>

    <!-- 登录方式 -->
    <view class="login-section">
      <button
        class="login-btn wechat"
        open-type="getPhoneNumber"
        @getphonenumber="onGetPhoneNumber"
      >
        <view class="btn-content">
          <text class="btn-icon">📱</text>
          <text class="btn-text">微信一键登录</text>
        </view>
      </button>

      <view class="divider">
        <view class="divider-line"></view>
        <text class="divider-text">或</text>
        <view class="divider-line"></view>
      </view>

      <!-- 手机号登录 -->
      <view class="phone-login">
        <input
          v-model="phoneNumber"
          type="number"
          placeholder="请输入手机号"
          class="phone-input"
          maxlength="11"
        />
        <view class="code-row">
          <input
            v-model="verifyCode"
            type="number"
            placeholder="验证码"
            class="code-input"
            maxlength="6"
          />
          <button class="code-btn" :disabled="countdown > 0" @tap="sendVerifyCode">
            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
          </button>
        </view>
        <button class="login-btn phone" :disabled="!canLogin" @tap="loginWithPhone">
          登录 / 注册
        </button>
      </view>
    </view>

    <!-- 用户协议 -->
    <view class="agreement">
      <view class="checkbox-wrap" @tap="agreed = !agreed">
        <view class="checkbox" :class="{ checked: agreed }">
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

    <!-- 游客模式 -->
    <view class="guest-entry">
      <text class="guest-text" @tap="loginAsGuest">暂不登录，先看看</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { request, setToken, setUserId } from '@/utils/request';

const phoneNumber = ref('');
const verifyCode = ref('');
const countdown = ref(0);
const agreed = ref(false);

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

  uni.showLoading({ title: '登录中...' });

  try {
    // 先登录获取 code
    const loginRes = await new Promise<UniApp.LoginRes>((resolve, reject) => {
      uni.login({
        success: resolve,
        fail: reject,
      });
    });

    // 发送到后端换取 token
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

      uni.hideLoading();
      uni.showToast({ title: '登录成功', icon: 'success' });

      // 返回上一页或跳转首页
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
    uni.hideLoading();
    uni.showToast({ title: '登录失败，请重试', icon: 'none' });
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

  uni.showLoading({ title: '登录中...' });

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

      uni.hideLoading();
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
    uni.hideLoading();
    uni.showToast({ title: '登录失败，请重试', icon: 'none' });
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
  background: linear-gradient(180deg, #f0fdf4 0%, #fff 50%);
  padding: 0 48rpx;
  position: relative;
  overflow: hidden;
}

// 背景装饰
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 600rpx;
  overflow: hidden;
  pointer-events: none;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.3;
}

.bg-circle-1 {
  width: 400rpx;
  height: 400rpx;
  background: linear-gradient(135deg, #00b171 0%, #00d68f 100%);
  top: -100rpx;
  right: -100rpx;
}

.bg-circle-2 {
  width: 300rpx;
  height: 300rpx;
  background: linear-gradient(135deg, #00d68f 0%, #00b171 100%);
  top: 200rpx;
  left: -100rpx;
}

// Logo 区域
.logo-section {
  padding-top: 160rpx;
  text-align: center;
  position: relative;
  z-index: 1;
}

.logo-icon {
  font-size: 120rpx;
  margin-bottom: 24rpx;
}

.logo-title {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12rpx;
}

.logo-subtitle {
  display: block;
  font-size: 28rpx;
  color: #64748b;
}

// 登录区域
.login-section {
  margin-top: 80rpx;
  position: relative;
  z-index: 1;
}

.login-btn {
  width: 100%;
  height: 100rpx;
  border-radius: 50rpx;
  border: none;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;

  &.wechat {
    background: linear-gradient(135deg, #07c160 0%, #09bb07 100%);
    color: #fff;
  }

  &.phone {
    background: linear-gradient(135deg, #00b171 0%, #00d68f 100%);
    color: #fff;

    &:disabled {
      opacity: 0.5;
    }
  }

  .btn-content {
    display: flex;
    align-items: center;
    gap: 16rpx;
  }

  .btn-icon {
    font-size: 40rpx;
  }

  .btn-text {
    font-size: 32rpx;
  }
}

// 分割线
.divider {
  display: flex;
  align-items: center;
  margin: 48rpx 0;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background: #e2e8f0;
}

.divider-text {
  padding: 0 32rpx;
  font-size: 26rpx;
  color: #94a3b8;
}

// 手机号登录
.phone-login {
  .phone-input,
  .code-input {
    width: 100%;
    height: 96rpx;
    background: #fff;
    border-radius: 16rpx;
    padding: 0 32rpx;
    font-size: 30rpx;
    border: 2rpx solid #e2e8f0;
    box-sizing: border-box;
  }

  .code-row {
    display: flex;
    gap: 16rpx;
    margin-top: 24rpx;
  }

  .code-input {
    flex: 1;
  }

  .code-btn {
    width: 240rpx;
    height: 96rpx;
    background: #fff;
    border: 2rpx solid #00b171;
    border-radius: 16rpx;
    font-size: 28rpx;
    color: #00b171;
    font-weight: 500;

    &:disabled {
      color: #94a3b8;
      border-color: #e2e8f0;
    }
  }
}

// 用户协议
.agreement {
  margin-top: 48rpx;
  display: flex;
  justify-content: center;
}

.checkbox-wrap {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
}

.checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #cbd5e1;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 4rpx;

  &.checked {
    background: #00b171;
    border-color: #00b171;
  }

  .check-icon {
    font-size: 24rpx;
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
  }
}

// 游客模式
.guest-entry {
  position: fixed;
  bottom: 80rpx;
  left: 0;
  right: 0;
  text-align: center;
}

.guest-text {
  font-size: 28rpx;
  color: #94a3b8;
  text-decoration: underline;
}
</style>
