# Survey Editor Demo

一个基于 **Vue3 + Vite + SurveyJS** 实现的低代码问卷编辑器 Demo，支持可视化编辑、JSON 编辑、Undo/Redo 和实时预览。

---

## 在线体验

Demo 地址：

https://survey-editor-demo.vercel.app

GitHub：

https://github.com/Barnette-ao/survey-editor-demo

---

## 项目截图
* 可视化编辑器
<img width="3166" height="1656" alt="image" src="https://github.com/user-attachments/assets/ba4d8adb-6e4a-4429-a8b7-f16dfed06119" />
* JSON 编辑器
<img width="3018" height="1636" alt="image" src="https://github.com/user-attachments/assets/199d3417-1f8c-4086-9bc8-353e19b7dd62" />
* 预览页
<img width="3178" height="1476" alt="image" src="https://github.com/user-attachments/assets/3aa615e3-5e58-4ff0-a52b-84a4f26aa941" />
---

## 核心功能

* 可视化问卷编辑（SurveyJS Creator）
* JSON Schema 编辑
* Draft 草稿层设计
* Undo / Redo 撤销重做
* 自动保存
* 本地持久化（localStorage）
* JSON 编辑器 + 实时校验
* 问卷实时预览

---

## 技术栈

* Vue 3
* Vite
* TypeScript
* SurveyJS
* Element Plus
* Monaco Editor
* TipTap

---

## 核心架构设计

本项目实现了一套简单但清晰的编辑器架构：
```js
UI Layer
↓
Context Layer (Composables)
↓
Draft Layer（草稿状态管理）
↓
Domain Layer（Survey 数据模型）

Undo / Redo 只作用于 Draft 层。
```
---

## Undo / Redo 设计

* Design 页面：操作级 Undo
* JSON Editor：状态快照 Undo
* Draft 层维护

undoStack
redoStack
draftState

自动保存只替换 draftState，不进入 undoStack。

---

## 数据存储

当前 Demo 使用：

localStorage

用于模拟持久化。

生产环境可以替换为：

API + 数据库

---

## 本地运行

```
npm install
npm run dev
```

构建：

```
npm run build
```

---

## 部署

项目使用 **Vercel** 进行静态部署。
