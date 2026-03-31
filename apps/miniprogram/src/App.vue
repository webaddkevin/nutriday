<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import { useUserStore } from '@/stores/user';

onLaunch(async () => {
  console.log('App Launch');
  // 自动登录
  const userStore = useUserStore();
  await userStore.checkLogin();
});

onShow(() => {
  console.log('App Show');
});

onHide(() => {
  console.log('App Hide');
});
</script>
<style lang="scss">
@import '@/styles/uniicons-font.scss';
</style>
