// @ts-check
import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // 全局忽略
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/unpackage/**',
      '**/coverage/**',
      '**/*.min.*',
      '**/*.d.ts',
    ],
  },

  // 全局 TS 解析器配置（monorepo 需要显式指定根目录）
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // 基础规则
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // Vue 规则（仅对 .vue 文件生效）
  ...eslintPluginVue.configs['flat/recommended'],

  // 关闭与 Prettier 冲突的规则（必须放在最后）
  eslintConfigPrettier,

  // 全局 TS 规则
  {
    files: ['**/*.{ts,mts,tsx,vue}'],
    rules: {
      // 允许使用 any（项目初期放宽）
      '@typescript-eslint/no-explicit-any': 'warn',
      // 未使用变量警告（允许下划线前缀忽略）
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },

  // Vue 文件特殊配置
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      // uni-app 组件不一定遵循多单词命名
      'vue/multi-word-component-names': 'off',
    },
  },

  // apps/server — NestJS 后端
  {
    files: ['apps/server/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },

  // apps/miniprogram — uni-app 小程序
  {
    files: ['apps/miniprogram/**/*.{ts,vue}'],
    rules: {
      // uni-app 全局 API
      'no-undef': 'off',
    },
  },
);
