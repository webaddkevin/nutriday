import { defineConfig } from 'vite';
import uni from '@dcloudio/vite-plugin-uni';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [uni()],
  resolve: {
    alias: {
      '@nutriday/shared-types': resolve(__dirname, '../../packages/shared-types/src'),
      '@nutriday/shared-utils': resolve(__dirname, '../../packages/shared-utils/src'),
      '@nutriday/shared-constants': resolve(__dirname, '../../packages/shared-constants/src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
        silenceDeprecations: ['import', 'legacy-js-api'], // 静默相关告警
        additionalData: `@import "@/uni.scss";`,
      },
    },
  },
  build: {
    // 强制将字体等静态资源转换为 base64 格式，避免小程序中无法加载本地静态资源导致方块（uniicons.ttf 约 36KB）
    assetsInlineLimit: 100000,
  },
});
