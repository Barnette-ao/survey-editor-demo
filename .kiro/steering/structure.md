# 项目结构与架构

## 文件夹组织

```
src/
├── api/                    # API层 - REST客户端函数
├── components/             # 共享/可复用组件
│   ├── DevTools/          # 开发工具
│   ├── Editor/            # 富文本编辑器组件
│   └── Question/          # 基础问题组件
├── views/creator/         # 主要问卷编辑器模块
│   ├── components/        # 编辑器专用组件
│   ├── composables/       # Vue 3 Composition API逻辑
│   ├── config/           # 配置和映射文件
│   ├── services/         # 业务逻辑服务
│   ├── types/            # TypeScript类型定义
│   └── utils/            # 工具函数
├── stores/               # Pinia状态管理
├── assets/styles/        # 全局SCSS样式
├── hooks/                # 可复用组合函数
└── utils/                # 全局工具函数
```

## 架构模式

### Composition API结构
- **Composables**: 业务逻辑提取为可复用的组合函数（use*模式）
- **单一职责**: 每个组合函数处理一个特定关注点
- **类型安全**: 完整的TypeScript集成，包含适当的类型定义

### 组件架构
- **基础组件**: `/components`中的共享组件
- **功能组件**: `/views/creator/components`中的领域特定组件
- **属性组件**: `/views/creator/components/Property`中的设置面板
- **作用域样式**: 所有组件使用`<style scoped>`或CSS模块

### 状态管理
- **Pinia Stores**: 带持久化的集中状态管理
- **Composable状态**: 通过组合函数进行本地状态管理
- **响应式数据流**: 单向数据流模式

## 关键目录

### `/views/creator/composables/`
核心业务逻辑组合函数，遵循命名约定：
- `useCurrentElement.ts` - 选中元素管理
- `useLogicRules.ts` - 逻辑规则系统
- `useElementOperations.ts` - CRUD操作
- `useQuestionCreation.ts` - 问题创建工作流

### `/views/creator/components/`
问题类型组件（kebab-case文件名）：
- `radiogroup.vue`, `checkbox.vue`, `dropdown.vue`
- `scale.vue`, `score.vue`, `ranking.vue`
- `matrixRadio.vue`, `multipleText.vue`
- `fileupload.vue`, `sign.vue`

### `/views/creator/components/Property/`
每种问题类型的设置面板：
- `[questionType]Setting.vue` 模式
- `QuestionTypeSwitcher.vue` 用于类型转换

### `/views/creator/config/`
配置和映射文件：
- `componentAndSettingMap.js` - 组件到设置的映射
- `dragElementOrPage.js` - 拖拽配置
- `handleElementAndPage.js` - 元素操作逻辑

## 命名约定

### 文件和文件夹
- **组件**: PascalCase（如 `BaseQuestion.vue`）
- **Composables**: camelCase with `use` 前缀（如 `useCurrentElement.ts`）
- **配置文件**: camelCase（如 `componentAndSettingMap.js`）
- **文件夹**: kebab-case（如 `question-types/`）

### 代码约定
- **TypeScript接口**: PascalCase（如 `QuestionElement`）
- **变量/函数**: camelCase
- **常量**: SCREAMING_SNAKE_CASE
- **CSS类**: kebab-case with BEM方法论

## 导入模式

### 路径别名
- `@/` → `src/`（在Vite和TypeScript中配置）
- 本地文件使用相对导入
- 跨模块引用使用别名的绝对导入

### 自动导入
- Vue 3 APIs（ref, computed, watch等）
- Vue Router（useRouter, useRoute）
- Pinia（defineStore, storeToRefs）
- Element Plus组件和组合函数

## 文件组织规则

1. **单一职责**: 每个文件一个主要导出
2. **就近原则**: 相关文件分组在同一目录
3. **桶导出**: 使用index文件进行清晰导入
4. **类型定义**: 复杂类型使用单独的`.ts`文件
5. **配置**: 集中配置文件而非分散常量