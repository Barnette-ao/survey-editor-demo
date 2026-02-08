# Design 组件 TypeScript 化方案

## 概述
本文档提供了将 `design.vue` 组件从 JavaScript 迁移到 TypeScript 的详细方案。该组件是问卷编辑器的核心组件，包含复杂的数据结构和业务逻辑。

## 1. 文件重命名和基础结构

### 当前状态
```vue
<script setup>
// JavaScript 代码
</script>
```

### 目标状态
```vue
<script setup lang="ts">
// TypeScript 代码
</script>
```

- 保持文件名 `design.vue` 不变
- 将 `<script setup>` 改为 `<script setup lang="ts">`

## 2. 类型定义文件创建

### 2.1 创建核心类型定义文件

**文件路径：`src/types/questionnaire.ts`**

```typescript
// 核心数据结构类型
export interface QuestionElement {
  id: string
  type: string
  title?: string
  isRequired?: boolean
  hideNumber?: boolean
  number?: number
  choices?: Choice[]
  rateType?: string
  rateMin?: number
  rateMax?: number
  rateStep?: number
  choicesOrder?: 'random' | 'none'
  questionsOrder?: 'random' | 'initial'
  // 根据实际使用情况添加更多属性
}

export interface Choice {
  value: string
  showText?: boolean
  textType?: string
  required?: boolean
}

export interface Page {
  elements: QuestionElement[]
}

export interface QuestionSettings {
  title: string
  description: string
  completedHtml: string
  pages: Page[]
  logicRules?: LogicRule[]
  showQuestionNumbers: boolean
  questionsOnPageMode?: 'questionPerPage' | 'standard'
}

export interface LogicRule {
  id: string
  ifConditions: IfCondition[]
  thenCondition: ThenCondition
}

export interface IfCondition {
  elementId: string
  state: string
  choiceIndex: string | number
  score: string | number
  connector?: 'or' | 'and'
}

export interface ThenCondition {
  action: 'jump' | 'show' | 'hide'
  targetElementId: string
}

// 渲染项类型
export interface RenderedItem {
  id: string
  type: 'page' | 'element'
  pageIndex?: number
  page?: Page
  element?: QuestionElement
}

// 增量加载相关类型
export interface IncrementalLoadingOptions {
  initialCount: number
  batchSize: number
  threshold: number
}
```

### 2.2 创建工具类型定义文件

**文件路径：`src/types/utils.ts`**

```typescript
export interface QuestionTypeItem {
  type: string
  text: string
  defaultPath: string
  hoveredPath: string
}

export interface QuestionTypeCategory {
  categoryName: string
  list: QuestionTypeItem[]
}

export type ComponentMap = Record<string, any>
export type SettingComponentMap = Record<string, any>
export type RatingTypeMap = Record<string, string>

// 设置更新参数类型
export interface SettingUpdateParams {
  key: string
  value: any
}

// 选项设置参数类型
export interface OptionSettingParams {
  id: string
  isOpen: boolean
  index: number
}

// 逻辑保存对象类型
export interface SaveLogicObject {
  logicRules: LogicRule[]
  newLogicRulesId: string[]
  updatedLogicRulesId: string[]
  deletedLogicRulesId: string[]
}
```

## 3. 响应式数据类型化

### 3.1 主要数据类型定义

```typescript
import type { 
  QuestionSettings, 
  QuestionElement, 
  RenderedItem 
} from '@/types/questionnaire'

// 主要数据
const questionSettings = reactive<QuestionSettings>({
  title: '',
  description: '',
  completedHtml: '',
  pages: [],
  logicRules: [],
  showQuestionNumbers: true,
  questionsOnPageMode: 'standard'
})

const instructionElement = ref<QuestionElement>({
  id: '',
  type: 'html'
})

const instructionElementId = ref<string>("")
```

### 3.2 UI 状态类型定义

```typescript
// UI 状态
const hoveredQuestionType = ref<string>('')
const currentQuestionId = ref<string>("")
const isCurrentQuestionAPage = ref<boolean>(false)
const pageIndex = ref<number>(-1)

// 设置类型
type SettingType = 'quickSetting' | 'questionSetting'
const settingType = ref<SettingType>('quickSetting')

// 设置选项类型
interface SettingOption {
  label: string
  value: SettingType
}

const settingTypeOptions: SettingOption[] = [
  { label: "快捷设置", value: "quickSetting" },
  { label: "题目设置", value: "questionSetting" }
]
```

### 3.3 增量加载相关类型

```typescript
// 增量加载相关
const renderedItems = ref<RenderedItem[]>([])
const hasMore = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const sentinelRef = ref<HTMLElement | null>(null)

// 增量加载实例类型（需要根据实际实现定义）
let incrementalLoadingInstance: any = null
```

### 3.4 逻辑设置相关类型

```typescript
// 逻辑设置相关
const logicDialogVisible = ref<boolean>(false)
const settedLogicElement = ref<QuestionElement>({
  id: '',
  type: ''
})
const isOptionSetting = ref<boolean>(false)
const selectedOptionIndex = ref<number>(-1)

// 拖拽状态
const istarg = ref<boolean>(false)
```

## 4. 计算属性类型化

### 4.1 组件映射计算属性

```typescript
const componentIs = computed(() => {
  return (element: QuestionElement): string => {
    const type = element.type === "rating" 
      ? ratingTypeMap[element.rateType || 'default'] 
      : element.type
    return componentMap[type] || 'div'
  }
})
```

### 4.2 当前元素计算属性

```typescript
const currentElement = computed((): QuestionElement | undefined => {
  const allElements = questionSettings.pages
    .map((page: Page) => page.elements)
    .flat()
  
  return allElements.find((element: QuestionElement) => 
    element.id === currentQuestionId.value
  )
})
```

### 4.3 显示序号相关计算属性

```typescript
// 全局显示序号设置
const showQuestionNumbers = computed<boolean>({
  get: () => questionSettings.showQuestionNumbers,
  set: (value: boolean) => {
    questionSettings.showQuestionNumbers = value
    // 处理逻辑...
  }
})

// 判断是否显示题目序号
const isShowNumber = computed(() => {
  return (element: QuestionElement): boolean => {
    if (!showQuestionNumbers.value) return false
    if (element.hideNumber === undefined) return true
    return !element.hideNumber
  }
})

// 题目设置中的显示序号控制
const showNumberComputed = computed<boolean>({
  get: (): boolean => {
    const element = currentElement.value
    if (!element) return true
    if (element.hideNumber === undefined) return true
    return !element.hideNumber
  },
  set: (value: boolean): void => {
    if (!currentElement.value || !showQuestionNumbers.value) return
    currentElement.value.hideNumber = !value
  }
})
```

### 4.4 其他计算属性

```typescript
const getCurrentElementType = computed((): string => {
  if (!currentElement.value) return ""
  
  return currentElement.value.type === "rating"
    ? ratingTypeMap[currentElement.value.rateType || 'default']
    : currentElement.value.type
})

const getCurrentElementTypeText = computed((): string => {
  if (!currentElement.value) return ""
  
  const currentElementType = getCurrentElementType.value
  const questionType = questionTypeList
    .map((el: QuestionTypeCategory) => el.list)
    .flat()
    .find((el: QuestionTypeItem) => el.type === currentElementType)
  
  return questionType?.text || ""
})

const oneQuestionPerPage = computed<boolean>(() => {
  return questionSettings.questionsOnPageMode === "questionPerPage"
})

const getQuestionNameOf = computed(() => {
  return (page: Page): string => {
    if (page.elements.length === 0) return ""
    // 处理逻辑...
    return ""
  }
})

const getLogicRuleNum = computed(() => {
  return (elementId: string): number => {
    const rules = getLogicRulesOfElement(
      questionSettings.logicRules ?? [], 
      elementId
    )
    return rules.length
  }
})
```

## 5. 方法参数和返回值类型化

### 5.1 事件处理方法

```typescript
// 页面点击处理
const handlePageClick = (index: number): void => {
  settingType.value = "quickSetting"
  isCurrentQuestionAPage.value = true
  pageIndex.value = index
  currentQuestionId.value = ""
}

// 题目点击处理
const handleQuestionClick = (id: string): void => {
  settingType.value = "questionSetting"
  isCurrentQuestionAPage.value = false
  currentQuestionId.value = id
  pageIndex.value = -1
}

// 结构变化处理
const handleStructrueChange = (isStructrueChanged: boolean): void => {
  questionSettings.questionsOnPageMode = isStructrueChanged
    ? "questionPerPage"
    : "standard"
}
```

### 5.2 元素更新方法

```typescript
// 统一处理元素更新
const handleElementUpdate = (key: string, value: any): void => {
  const { pageIndex, elementIndex } = getSelectedElementPosition(
    questionSettings,
    currentQuestionId.value
  )

  if (pageIndex !== undefined && elementIndex !== undefined) {
    // 处理逻辑...
  }
}

// 更新题目设置
const handleSettingUpdate = (key: string, value: any): void => {
  if (!currentElement.value) return

  switch (key) {
    case "choicesOrder":
      currentElement.value.choicesOrder = value ? "random" : "none"
      break
    case "questionsOrder":
      currentElement.value.questionsOrder = value ? "random" : "initial"
      break
    case "choices":
      // 处理选项相关更新
      break
    default:
      (currentElement.value as any)[key] = value
  }
}
```

### 5.3 题目操作方法

```typescript
// 题目类型点击
const handleQuestionTypeClick = (elementType: string): void => {
  if (elementType === "page") {
    addPage(
      questionSettings,
      currentQuestionId.value,
      pageIndex.value,
      isCurrentQuestionAPage.value
    )
  } else {
    currentQuestionId.value = addQuestionElement(
      questionSettings, 
      elementType, 
      currentQuestionId.value
    )
  }
}

// 题目类型更新
const handleQuestionTypeUpdate = (newType: string): void => {
  const newElement = getSwitchTargetElement(
    newType, 
    questionSettings, 
    currentElement.value!
  )

  const { elementIndex, pageIndex } = getSelectedElementPosition(
    questionSettings,
    currentQuestionId.value
  )

  if (elementIndex !== undefined && pageIndex !== undefined) {
    // 处理逻辑...
  }
}

// 复制处理
const handleCopy = (elementId: string, elementType: string): void => {
  handleCopyElement(elementId, questionSettings, elementType)
  formattedNumber(questionSettings)
  ElMessage.success("复制成功")
}

// 删除处理
const handleDelete = (elementId: string): void => {
  ElMessageBox.confirm("确定要删除该题目吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    deleteQuestionElement(elementId, questionSettings)
    formattedNumber(questionSettings)
    ElMessage({
      type: "success",
      message: "删除成功",
    })
  })
}

// 删除题目元素
const deleteQuestionElement = (elementId: string, questionSettings: QuestionSettings): void => {
  const index = deleteQuestion(questionSettings, elementId)

  if (index && index !== -1 && elementId === currentQuestionId.value) {
    currentQuestionId.value = ""
    settingType.value = "quickSetting"
  }
}
```

### 5.4 选项设置和逻辑处理

```typescript
// 选项设置更新
const handleOptionSettingUpdate = (params: OptionSettingParams): void => {
  currentQuestionId.value = params.id

  if (params.isOpen) {
    settingType.value = "questionSetting"
  }

  isOptionSetting.value = params.isOpen
  selectedOptionIndex.value = params.index
}

// 逻辑设置
const handleSetLogic = (element: QuestionElement): void => {
  settedLogicElement.value = element
  logicDialogVisible.value = true
}

// 逻辑更新
const handleLogicUpdate = (saveLogicObj: SaveLogicObject): void => {
  handleLogicRulesUpdate(saveLogicObj, questionSettings)
}

// 关闭逻辑对话框
const closeLogicDialog = (): void => {
  logicDialogVisible.value = false
}
```

## 6. 导入的工具函数类型化

### 6.1 创建工具函数类型声明

**文件路径：`src/types/helpers.ts`**

```typescript
import type { QuestionSettings, QuestionElement } from './questionnaire'

// 工具函数类型声明
export declare function updateDefaultSettings(settings: QuestionSettings): void
export declare function loadSettingsFromDatabase(): Promise<QuestionSettings>
export declare function getSettingProps(element: QuestionElement): Record<string, any>
export declare function generateUUID(): string
export declare function formattedNumber(settings: QuestionSettings): void
export declare function generateLargeQuestionnaire(count: number): QuestionSettings
export declare function afterGetInitialSettings(settings: QuestionSettings): QuestionSettings
export declare function beforeSaveToDatabase(settings: QuestionSettings): QuestionSettings

// 页面和元素操作函数
export declare function addQuestionElement(
  settings: QuestionSettings, 
  elementType: string, 
  currentId: string
): string

export declare function addPage(
  settings: QuestionSettings,
  currentId: string,
  pageIndex: number,
  isCurrentPage: boolean
): void

export declare function getSelectedElementPosition(
  settings: QuestionSettings,
  elementId: string
): { pageIndex?: number; elementIndex?: number }

export declare function handleCopyElement(
  elementId: string,
  settings: QuestionSettings,
  elementType: string
): void

export declare function deleteQuestion(
  settings: QuestionSettings,
  elementId: string
): number

export declare function getSwitchTargetElement(
  newType: string,
  settings: QuestionSettings,
  element: QuestionElement
): QuestionElement

export declare function handleDeletePage(
  settings: QuestionSettings,
  page: any,
  pageIndex: number
): void

export declare function removeLogicRulesOfDeletedRule(
  settings: QuestionSettings,
  elementId: string
): void
```

## 7. 第三方库类型支持

### 7.1 安装必要的类型包

```bash
npm install --save-dev @types/lodash-es
npm install --save-dev @types/uuid
```

### 7.2 Element Plus 类型支持

```typescript
// 确保正确导入 Element Plus 类型
import type { ElMessage, ElMessageBox } from 'element-plus'
```

## 8. 渐进式迁移策略

### 8.1 第一阶段：基础类型定义
- 添加基础接口定义
- 为主要响应式变量添加类型
- 保持复杂对象使用 `any` 类型

### 8.2 第二阶段：方法类型化
- 为所有方法添加参数和返回值类型
- 逐步细化接口定义
- 处理计算属性的类型

### 8.3 第三阶段：严格类型检查
- 消除所有 `any` 类型
- 添加严格的类型检查
- 优化类型定义

## 9. 需要特别注意的地方

### 9.1 动态组件类型处理
```typescript
// 处理动态组件的类型问题
const componentIs = computed(() => {
  return (element: QuestionElement): any => {
    // 返回组件类型可能需要使用 any 或者更具体的组件类型
  }
})
```

### 9.2 复杂对象的类型断言
```typescript
// 在必要时使用类型断言
Object.assign(questionSettings, defaultQuestionSettings as QuestionSettings)
```

### 9.3 事件处理的类型安全
```typescript
// 确保事件处理函数的类型安全
const saveToDefault = debounce((newValue: QuestionSettings) => {
  updateDefaultSettings(newValue)
}, 1000)
```

## 10. 配置文件调整

### 10.1 TypeScript 配置

**`tsconfig.json`**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vite/client", "@types/node"]
  },
  "include": [
    "src/**/*.ts", 
    "src/**/*.vue",
    "src/**/*.d.ts"
  ],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 10.2 Vite 配置调整

确保 `vite.config.js` 支持 TypeScript：

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})
```

## 11. 迁移检查清单

### 11.1 类型定义
- [ ] 创建核心类型定义文件
- [ ] 创建工具函数类型声明
- [ ] 定义组件相关类型

### 11.2 响应式数据
- [ ] 为所有 ref 添加类型
- [ ] 为所有 reactive 添加类型
- [ ] 处理复杂对象的类型定义

### 11.3 计算属性
- [ ] 为所有计算属性添加返回类型
- [ ] 处理计算属性中的复杂逻辑

### 11.4 方法
- [ ] 为所有方法添加参数类型
- [ ] 为所有方法添加返回值类型
- [ ] 处理异步方法的类型

### 11.5 导入和配置
- [ ] 更新所有导入语句
- [ ] 配置 TypeScript 编译选项
- [ ] 安装必要的类型包

## 12. 预期收益

### 12.1 开发体验提升
- 更好的 IDE 支持和自动补全
- 编译时错误检查
- 重构时的类型安全保障

### 12.2 代码质量提升
- 减少运行时错误
- 更清晰的代码结构
- 更好的文档化效果

### 12.3 维护性提升
- 更容易理解的代码逻辑
- 更安全的代码修改
- 更好的团队协作

## 总结

这个 TypeScript 化方案提供了一个渐进式的迁移路径，可以分阶段实施，避免一次性改动过大。重点是先建立完善的类型定义体系，然后逐步应用到具体的代码中。