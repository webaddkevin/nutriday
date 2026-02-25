# Changesets

本项目使用 [Changesets](https://github.com/changesets/changesets) 管理版本和变更日志。

## 常用命令

### 添加变更记录

```bash
pnpm changeset
```

运行后会引导你选择：

1. 哪些包受到了影响
2. 版本升级类型（patch / minor / major）
3. 变更描述

### 消费变更记录并更新版本

```bash
pnpm changeset:version
```

此命令会：

- 读取 `.changeset` 目录中的变更文件
- 自动更新各包的 `package.json` 版本号
- 生成/追加 `CHANGELOG.md`

### 查看当前待发布的变更

```bash
pnpm changeset status
```
