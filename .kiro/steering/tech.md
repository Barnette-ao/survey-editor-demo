# 技术栈与构建系统

## 核心技术

- **前端框架**: Vue 3 with Composition API
- **构建工具**: Vite 7.2.4
- **开发语言**: TypeScript 5.9.3 + JavaScript（混合代码库）
- **状态管理**: Pinia 3.0.4 with 持久化插件
- **UI框架**: Element Plus 2.11.8
- **路由**: Vue Router 4.6.3

## 关键依赖库

- **问卷引擎**: SurveyJS Creator Vue 2.5.0
- **富文本编辑器**: TipTap Vue 3 (3.15.3)
- **代码编辑器**: Monaco Editor 0.55.1
- **拖拽功能**: SortableJS 1.15.6
- **工具库**: Lodash 4.17.21, VueUse 14.1.0
- **Mock数据**: MSW 2.12.4, MockJS 1.1.0

## 开发工具

- **自动导入**: Unplugin Auto Import for Vue/Pinia/Router
- **组件自动导入**: Unplugin Vue Components with Element Plus resolver
- **CSS预处理器**: Sass (modern-compiler API)
- **包管理器**: npm

## 常用命令

```bash
# 开发
npm run dev          # 启动开发服务器，支持热更新

# 构建与部署
npm run build        # 生产环境构建，包含优化
npm run preview      # 本地预览生产构建结果

# 依赖管理
npm install          # 安装所有依赖
```

## 构建配置

### Vite优化配置
- Monaco Editor插件，支持Web Workers
- Vue生态系统和Element Plus自动导入
- SCSS预处理，全局导入配置
- 代码分割，针对第三方库（Vue生态系统、Lodash）
- 开发环境Mock服务集成

### TypeScript配置
- 启用严格模式
- 路径别名配置（@/ → src/）
- 自动生成类型定义文件

## 环境要求

- **Node.js**: >= 16
- **npm**: >= 8
- **浏览器支持**: 仅支持现代浏览器（使用ES6+特性）

## 性能优化考虑

- 组件懒加载实现
- 大型问卷增量加载
- 用户输入防抖处理
- 优化的依赖预构建