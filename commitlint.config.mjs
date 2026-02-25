export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // type 类型枚举
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复 Bug
        'docs', // 文档变更
        'style', // 代码格式（不影响功能）
        'refactor', // 重构
        'perf', // 性能优化
        'test', // 测试
        'build', // 构建/依赖变更
        'ci', // CI 配置
        'chore', // 杂项
        'revert', // 回滚
      ],
    ],
    // subject 不能为空
    'subject-empty': [2, 'never'],
    // type 不能为空
    'type-empty': [2, 'never'],
    // subject 大小写不限制
    'subject-case': [0],
  },
};
