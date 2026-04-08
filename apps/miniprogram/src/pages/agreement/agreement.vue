<template>
  <view class="agreement-page">
    <!-- 顶部导航 -->
    <view class="header">
      <view class="back-btn" @tap="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="header-title">{{ title }}</text>
      <view class="header-right"></view>
    </view>

    <!-- 内容区域 -->
    <scroll-view class="content" scroll-y>
      <view class="content-inner">
        <!-- 用户协议 -->
        <view v-if="type === 'user'" class="agreement-content">
          <view class="section">
            <text class="section-title">一、服务条款</text>
            <text class="section-text"
              >欢迎使用每日营养小程序（以下简称"本服务"）。在使用本服务前，请您仔细阅读以下服务条款。使用本服务即表示您同意遵守这些条款。</text
            >
          </view>

          <view class="section">
            <text class="section-title">二、用户注册</text>
            <text class="section-text"
              >1. 用户需要通过微信授权或手机号注册账户才能使用本服务的完整功能。</text
            >
            <text class="section-text"
              >2. 用户应提供真实、准确、完整的个人资料，并在资料变更时及时更新。</text
            >
            <text class="section-text">3. 用户对账户和密码的安全性负责。</text>
          </view>

          <view class="section">
            <text class="section-title">三、服务内容</text>
            <text class="section-text">本服务提供以下功能：</text>
            <text class="section-text">• 饮食记录与管理</text>
            <text class="section-text">• AI 食物识别</text>
            <text class="section-text">• 营养数据分析</text>
            <text class="section-text">• 健康建议与推荐</text>
            <text class="section-text">• 体重管理</text>
          </view>

          <view class="section">
            <text class="section-title">四、用户行为规范</text>
            <text class="section-text">用户不得利用本服务进行以下行为：</text>
            <text class="section-text">• 发布违法、有害信息</text>
            <text class="section-text">• 侵犯他人合法权益</text>
            <text class="section-text">• 干扰或破坏服务的正常运行</text>
            <text class="section-text">• 其他违反法律法规的行为</text>
          </view>

          <view class="section">
            <text class="section-title">五、知识产权</text>
            <text class="section-text"
              >本服务的所有内容，包括但不限于文字、图片、软件、界面设计等，均受知识产权法律保护。未经授权，用户不得复制、修改、传播这些内容。</text
            >
          </view>

          <view class="section">
            <text class="section-title">六、免责声明</text>
            <text class="section-text"
              >1. 本服务提供的健康建议仅供参考，不构成医疗诊断或治疗建议。</text
            >
            <text class="section-text">2. 用户应根据自身情况合理使用本服务。</text>
            <text class="section-text"
              >3. 对于因使用本服务而产生的任何损失，我们不承担赔偿责任。</text
            >
          </view>

          <view class="section">
            <text class="section-title">七、服务变更与终止</text>
            <text class="section-text">我们保留随时修改、暂停或终止服务的权利，恕不另行通知。</text>
          </view>

          <view class="section">
            <text class="section-title">八、联系我们</text>
            <text class="section-text">如有任何问题，请通过以下方式联系我们：</text>
            <text class="section-text">邮箱：support@nutriday.com</text>
          </view>

          <view class="update-info">
            <text class="update-text">更新日期：2026年4月1日</text>
            <text class="update-text">生效日期：2026年4月1日</text>
          </view>
        </view>

        <!-- 隐私政策 -->
        <view v-else class="agreement-content">
          <view class="section">
            <text class="section-title">一、引言</text>
            <text class="section-text"
              >每日营养小程序（以下简称"我们"）非常重视用户的隐私保护。本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息。</text
            >
          </view>

          <view class="section">
            <text class="section-title">二、信息收集</text>
            <text class="section-text">我们可能收集以下类型的信息：</text>
            <text class="section-text">• 账户信息：微信昵称、头像、手机号</text>
            <text class="section-text">• 健康数据：身高、体重、年龄、性别</text>
            <text class="section-text">• 饮食记录：您记录的饮食数据</text>
            <text class="section-text">• 设备信息：设备型号、操作系统版本</text>
            <text class="section-text">• 使用数据：访问记录、操作日志</text>
          </view>

          <view class="section">
            <text class="section-title">三、信息使用</text>
            <text class="section-text">我们使用收集的信息用于：</text>
            <text class="section-text">• 提供、维护和改进服务</text>
            <text class="section-text">• 个性化推荐和建议</text>
            <text class="section-text">• 数据分析和研究</text>
            <text class="section-text">• 保护服务安全</text>
          </view>

          <view class="section">
            <text class="section-title">四、信息存储</text>
            <text class="section-text">1. 您的信息存储在安全的服务器上，采用加密技术保护。</text>
            <text class="section-text">2. 我们会在法律要求的期限内保留您的信息。</text>
            <text class="section-text">3. 您可以要求删除您的账户和相关数据。</text>
          </view>

          <view class="section">
            <text class="section-title">五、信息共享</text>
            <text class="section-text"
              >我们不会向第三方出售您的个人信息。我们仅在以下情况下共享信息：</text
            >
            <text class="section-text">• 获得您的明确同意</text>
            <text class="section-text">• 法律法规要求</text>
            <text class="section-text">• 保护我们或用户的权益</text>
          </view>

          <view class="section">
            <text class="section-title">六、您的权利</text>
            <text class="section-text">您对您的个人信息享有以下权利：</text>
            <text class="section-text">• 访问权：查看我们持有的您的个人信息</text>
            <text class="section-text">• 更正权：更正不准确的信息</text>
            <text class="section-text">• 删除权：要求删除您的个人信息</text>
            <text class="section-text">• 撤回同意权：撤回之前给予的同意</text>
          </view>

          <view class="section">
            <text class="section-title">七、未成年人保护</text>
            <text class="section-text"
              >我们不向14周岁以下的未成年人提供服务。如果您发现我们无意中收集了未成年人的信息，请联系我们删除。</text
            >
          </view>

          <view class="section">
            <text class="section-title">八、政策更新</text>
            <text class="section-text"
              >我们可能会不时更新本隐私政策。更新后的政策将在本页面发布，建议您定期查看。</text
            >
          </view>

          <view class="section">
            <text class="section-title">九、联系我们</text>
            <text class="section-text">如有任何隐私相关问题，请联系我们：</text>
            <text class="section-text">邮箱：privacy@nutriday.com</text>
          </view>

          <view class="update-info">
            <text class="update-text">更新日期：2026年4月1日</text>
            <text class="update-text">生效日期：2026年4月1日</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';

const type = ref<'user' | 'privacy'>('user');

const title = computed(() => {
  return type.value === 'user' ? '用户协议' : '隐私政策';
});

onLoad((options: any) => {
  if (options?.type) {
    type.value = options.type;
  }
});

const goBack = () => {
  uni.navigateBack();
};
</script>

<style lang="scss" scoped>
.agreement-page {
  min-height: 100vh;
  background: #f8fafc;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 88rpx;
  padding: 0 32rpx;
  background: #fff;
  border-bottom: 1rpx solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 36rpx;
  color: #1e293b;
}

.header-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1e293b;
}

.header-right {
  width: 64rpx;
}

.content {
  height: calc(100vh - 88rpx);
}

.content-inner {
  padding: 32rpx;
}

.agreement-content {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
}

.section {
  margin-bottom: 40rpx;
}

.section-title {
  display: block;
  font-size: 30rpx;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 20rpx;
}

.section-text {
  display: block;
  font-size: 26rpx;
  color: #64748b;
  line-height: 1.8;
  margin-bottom: 12rpx;
}

.update-info {
  margin-top: 60rpx;
  padding-top: 32rpx;
  border-top: 1rpx solid #e2e8f0;
  text-align: center;
}

.update-text {
  display: block;
  font-size: 24rpx;
  color: #94a3b8;
  margin-bottom: 8rpx;
}
</style>
