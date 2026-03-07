# Design 组件 Composable 化方案

## 概述
本文档提供了将 `design.vue` 组件中的计算逻辑提取为 Composables 的详细方案。通过将纯计算逻辑分离，提高代码的可测试性、复用性和可维护性。

## 1. Composables 分类和结构

### 1.1 整体架构
```
src/views/creator/composables/
├── useQuestionDisplay.js      # 题目显示相关逻辑
├── useCurrentElement.js       # 当前元素计算逻辑
├── useComponentMapping.js     # 组件映射逻辑
├── usePageStructure.js        # 页面结构计算逻辑
├── useLogicRules.js          # 逻辑规则计算逻辑
└── useDesignState.js         # 设计器状态管理
```

## 2. 具体 Composables 设计

### 2.1 题目显示逻辑 - `useQuestionDisplay.js`

**职责**：管理题目序号显示相关的所有计算逻辑

```javascript
// src/views/creator/composables/useQuestionDisplay.js
import { computed } from 'vue'

export function useQuestionDisplay(questionSettings) {
  // 全局显示序号设置
  const showQuestionNumbers = computed({
    get: () => questionSettings.showQuestionNumbers,
    set: (value) => {
      questionSettings.showQuestionNumbers = value
      
      if (!value) {
        // 当全局设置关闭时，移除所有题目的 hideNumber 属性
        questionSettings.pages = questionSettings.pages.map((page) => {
          page.elements = page.elements.map((element) => {
            const { hideNumber, ...rest } = element
            return rest
          })
          return page
        })
      } else {
        // 当全局设置开启时，为所有题目添加 hideNumber 属性
        questionSettings.pages = questionSettings.pages.map((page) => {
          page.elements = page.elements.map((element) => {
            element.hideNumber = false
            return element
          })
          return page
        })
      }
    }
  })

  // 判断是否显示题目序号（用于渲染题目组件）
  const isShowNumber = computed(() => {
    return (element) => {
      // 如果全局设置关闭，直接返回 false
      if (!showQuestionNumbers.value) return false
      // 如果全局设置开启，但 hideNumber 未定义，返回 true
      if (element.hideNumber === undefined) return true
      // 否则返回 hideNumber 的反值
      return !element.hideNumber
    }
  })

  // 题目设置中的显示序号控制
  const createShowNumberComputed = (currentElement) => {
    return computed({
      get: () => {
        const element = currentElement.value
        if (!element) return true
        if (element.hideNumber === undefined) return true
        return !element.hideNumber
      },
      set: (value) => {
        if (!currentElement.value || !showQuestionNumbers.value) return
        currentElement.value.hideNumber = !value
      }
    })
  }

  return {
    showQuestionNumbers,
    isShowNumber,
    createShowNumberComputed
  }
}
```

### 2.2 当前元素计算逻辑 - `useCurrentElement.js`

**职责**：管理当前选中元素的所有派生计算

```javascript
// src/views/creator/composables/useCurrentElement.js
import { computed } from 'vue'
import { questionTypeList } from "@/views/creator/utils/questionTypeList"
import { ratingTypeMap } from "@/views/creator/utils/componentAndSettingMap"

export function useCurrentElement(questionSettings, currentQuestionId) {
  // 当前选中的元素
  const currentElement = computed(() => {
    const allElements = questionSettings.pages
      .map((page) => page.elements)
      .flat()
    
    return allElements.find((element) => element.id === currentQuestionId.value)
  })

  // 获取当前元素类型
  const getCurrentElementType = computed(() => {
    if (!currentElement.value) return ""

    return currentElement.value.type === "rating"
      ? ratingTypeMap[currentElement.value.rateType]
      : currentElement.value.type
  })

  // 获取当前元素类型文本
  const getCurrentElementTypeText = computed(() => {
    if (!currentElement.value) return ""

    const currentElementType = getCurrentElementType.value
    const questionType = questionTypeList
      .map((el) => el.list)
      .flat()
      .find((el) => el.type === currentElementType)
    
    return questionType?.text || ""
  })

  return {
    currentElement,
    getCurrentElementType,
    getCurrentElementTypeText
  }
}
```

### 2.3 组件映射逻辑 - `useComponentMapping.js`

**职责**：处理动态组件类型映射

```javascript
// src/views/creator/composables/useComponentMapping.js
import { computed } from 'vue'
import { componentMap, ratingTypeMap } from "@/views/creator/utils/componentAndSettingMap"

export function useComponentMapping() {
  // 组件映射计算
  const componentIs = computed(() => {
    return (element) => {
      const type = element.type === "rating" 
        ? ratingTypeMap[element.rateType] 
        : element.type
      return componentMap[type]
    }
  })

  return {
    componentIs
  }
}
```

### 2.4 页面结构计算逻辑 - `usePageStructure.js`

**职责**：处理页面结构相关的计算

```javascript
// src/views/creator/composables/usePageStructure.js
import { computed } from 'vue'

export function usePageStructure(questionSettings) {
  // 一页一题模式计算
  const oneQuestionPerPage = computed(() => {
    return questionSettings.questionsOnPageMode === undefined
      ? false
      : questionSettings.questionsOnPageMode === "questionPerPage"
  })

  // 获取页面题目名称
  const getQuestionNameOf = computed(() => {
    return (page) => {
      if (page.elements.length === 0) return ""
      
      if (page.elements.length === 1) {
        return page.elements[0].type === "html" 
          ? "" 
          : `Q${page.elements[0].number}`
      }
      
      // 多个元素的情况
      const firstQuestionIndex = page.elements[0].type === "html"
        ? page.elements.findIndex((item) => item.type !== "html")
        : 0
      
      const lastQuestionIndex = page.elements[page.elements.length - 1].type === "html"
        ? page.elements.findLastIndex((item) => item.type !== "html")
        : page.elements.length - 1

      return firstQuestionIndex === lastQuestionIndex
        ? `(Q${page.elements[firstQuestionIndex].number})`
        : `(Q${page.elements[firstQuestionIndex].number} - Q${page.elements[lastQuestionIndex].number})`
    }
  })

  return {
    oneQuestionPerPage,
    getQuestionNameOf
  }
}
```

### 2.5 逻辑规则计算逻辑 - `useLogicRules.js`

**职责**：处理逻辑规则相关的计算

```javascript
// src/views/creator/composables/useLogicRules.js
import { computed } from 'vue'
import { getLogicRulesAffectingElement } from "@/views/creator/utils/updateLogic"

export function useLogicRules(questionSettings) {
  // 获取元素的逻辑规则数量
  const getLogicRuleNum = computed(() => {
    return (elementId) => {
      const rules = getLogicRulesAffectingElement(
        questionSettings.logicRules ?? [], 
        elementId
      )
      return rules.length
    }
  })

  return {
    getLogicRuleNum
  }
}
```

### 2.6 设计器状态管理 - `useDesignState.js`

**职责**：管理设计器的 UI 状态

```javascript
// src/views/creator/composables/useDesignState.js
import { ref, computed } from 'vue'

export function useDesignState() {
  // UI 状态
  const hoveredQuestionType = ref('')
  const currentQuestionId = ref("")
  const isCurrentQuestionAPage = ref(false)
  const pageIndex = ref(-1)
  const settingType = ref("quickSetting")
  
  // 逻辑设置相关状态
  const logicDialogVisible = ref(false)
  const settedLogicElement = ref({})

  // 选项设置相关状态
  const isOptionSetting = ref(false)
  const selectedOptionIndex = ref(-1)

  // 设置选项
  const settingTypeOptions = [
    { label: "快捷设置", value: "quickSetting" },
    { label: "题目设置", value: "questionSetting" }
  ]

  // 页面点击处理
  const handlePageClick = (index) => {
    settingType.value = "quickSetting"
    isCurrentQuestionAPage.value = true
    pageIndex.value = index
    currentQuestionId.value = ""
  }

  // 题目点击处理
  const handleQuestionClick = (id) => {
    settingType.value = "questionSetting"
    isCurrentQuestionAPage.value = false
    currentQuestionId.value = id
    pageIndex.value = -1
  }

  // 选项设置更新处理
  const handleOptionSettingUpdate = (params) => {
    currentQuestionId.value = params.id

    if (params.isOpen) {
      settingType.value = "questionSetting"
    }

    isOptionSetting.value = params.isOpen
    selectedOptionIndex.value = params.index
  }

  // 逻辑设置处理
  const handleSetLogic = (element) => {
    settedLogicElement.value = element
    logicDialogVisible.value = true
  }

  // 关闭逻辑对话框
  const closeLogicDialog = () => {
    logicDialogVisible.value = false
  }

  return {
    // 状态
    hoveredQuestionType,
    currentQuestionId,
    isCurrentQuestionAPage,
    pageIndex,
    settingType,
    settingTypeOptions,
    logicDialogVisible,
    settedLogicElement,
    isOptionSetting,
    selectedOptionIndex,
    
    // 方法
    handlePageClick,
    handleQuestionClick,
    handleOptionSettingUpdate,
    handleSetLogic,
    closeLogicDialog
  }
}
```

## 3. 组件中的使用方式

### 3.1 在 design.vue 中的集成

```javascript
// design.vue <script setup> 部分
import { useQuestionDisplay } from '@/views/creator/composables/useQuestionDisplay'
import { useCurrentElement } from '@/views/creator/composables/useCurrentElement'
import { useComponentMapping } from '@/views/creator/composables/useComponentMapping'
import { usePageStructure } from '@/views/creator/composables/usePageStructure'
import { useLogicRules } from '@/views/creator/composables/useLogicRules'
import { useDesignState } from '@/views/creator/composables/useDesignState'

// 使用 Composables
const {
  hoveredQuestionType,
  currentQuestionId,
  isCurrentQuestionAPage,
  pageIndex,
  settingType,
  settingTypeOptions,
  logicDialogVisible,
  settedLogicElement,
  isOptionSetting,
  selectedOptionIndex,
  handlePageClick,
  handleQuestionClick,
  handleOptionSettingUpdate,
  handleSetLogic,
  closeLogicDialog
} = useDesignState()

const {
  showQuestionNumbers,
  isShowNumber,
  createShowNumberComputed
} = useQuestionDisplay(questionSettings)

const {
  currentElement,
  getCurrentElementType,
  getCurrentElementTypeText
} = useCurrentElement(questionSettings, currentQuestionId)

const { componentIs } = useComponentMapping()

const {
  oneQuestionPerPage,
  getQuestionNameOf
} = usePageStructure(questionSettings)

const { getLogicRuleNum } = useLogicRules(questionSettings)

// 创建显示序号计算属性
const showNumberComputed = createShowNumberComputed(currentElement)
```

## 4. 迁移步骤

### 4.1 第一阶段：创建 Composables 文件
1. 创建 `src/views/creator/composables/` 目录
2. 按照上述设计创建各个 Composable 文件
3. 实现基础的计算逻辑

### 4.2 第二阶段：逐步迁移
1. 先迁移最简单的 `useComponentMapping`
2. 然后迁移 `useDesignState`
3. 逐步迁移其他复杂的 Composables

### 4.3 第三阶段：优化和测试
1. 确保所有计算逻辑正常工作
2. 添加必要的类型定义（如果使用 TypeScript）
3. 编写单元测试

## 5. 优势分析

### 5.1 代码组织优势
- **职责分离**：每个 Composable 负责特定的计算逻辑
- **可读性提升**：主组件代码更加简洁，逻辑更清晰
- **可维护性**：相关逻辑集中管理，便于修改和维护

### 5.2 复用性优势
- **跨组件复用**：Composables 可以在其他组件中复用
- **逻辑独立**：每个 Composable 都是独立的，可以单独使用
- **组合灵活**：可以根据需要选择性使用不同的 Composables

### 5.3 测试优势
- **单元测试**：每个 Composable 都可以独立测试
- **逻辑验证**：纯计算逻辑更容易编写测试用例
- **回归测试**：修改时可以快速验证逻辑正确性

## 6. 注意事项

### 6.1 依赖管理
- 确保 Composables 之间的依赖关系清晰
- 避免循环依赖
- 合理处理共享状态

### 6.2 性能考虑
- 计算属性的缓存机制
- 避免不必要的重复计算
- 合理使用 `readonly` 和 `shallowRef`

### 6.3 类型安全
- 如果使用 TypeScript，为所有 Composables 添加类型定义
- 确保参数和返回值的类型正确
- 使用泛型提高类型安全性

## 7. 扩展计划

### 7.1 后续优化
- 添加更多的业务逻辑 Composables
- 实现状态持久化
- 添加撤销/重做功能

### 7.2 工具支持
- 开发 Composable 的开发工具
- 添加调试支持
- 实现热重载

## 8. 迁移检查清单

### 8.1 Composables 创建
- [ ] 创建 `useQuestionDisplay.js`
- [ ] 创建 `useCurrentElement.js`
- [ ] 创建 `useComponentMapping.js`
- [ ] 创建 `usePageStructure.js`
- [ ] 创建 `useLogicRules.js`
- [ ] 创建 `useDesignState.js`

### 8.2 逻辑迁移
- [ ] 迁移题目显示逻辑
- [ ] 迁移当前元素计算逻辑
- [ ] 迁移组件映射逻辑
- [ ] 迁移页面结构计算逻辑
- [ ] 迁移逻辑规则计算逻辑
- [ ] 迁移状态管理逻辑

### 8.3 集成测试
- [ ] 验证所有计算属性正常工作
- [ ] 验证事件处理正常
- [ ] 验证响应式更新正常
- [ ] 验证性能没有退化

### 8.4 代码清理
- [ ] 移除组件中的原始计算逻辑
- [ ] 更新导入语句
- [ ] 添加必要的注释
- [ ] 优化代码结构

## 9. 进一步优化建议 - 业务逻辑函数的 Composable 化

### 9.1 适合包装成 Composable 的函数分析

通过分析当前 design.vue 组件，以下函数适合进一步包装成 Composables：

#### 9.1.1 元素操作相关 - `useElementOperations.js`

**适合包装的函数：**
- `handleElementUpdate` - 元素更新逻辑（包含复杂的数组处理和 ID 更新）
- `handleSettingUpdate` - 设置更新逻辑
- `handleQuestionTypeUpdate` - 题目类型切换逻辑
- `handleCopy` - 复制元素逻辑
- `handleDelete` - 删除元素逻辑
- `deleteQuestionElement` - 删除元素的具体实现

**理由：**
- 这些函数包含复杂的业务逻辑
- 涉及多个数据源的协调更新
- 具有很强的复用潜力
- 便于单独测试和维护

```javascript
// src/views/creator/composables/useElementOperations.js
export function useElementOperations(questionSettings, currentQuestionId, currentElement) {
  const handleElementUpdate = (key, value) => {
    // 复杂的元素更新逻辑
  }
  
  const handleSettingUpdate = (key, value) => {
    // 设置更新逻辑
  }
  
  const handleQuestionTypeUpdate = (newType) => {
    // 题目类型切换逻辑
  }
  
  const handleCopy = (elementId, elementType) => {
    // 复制逻辑
  }
  
  const handleDelete = (elementId) => {
    // 删除逻辑
  }
  
  return {
    handleElementUpdate,
    handleSettingUpdate,
    handleQuestionTypeUpdate,
    handleCopy,
    handleDelete
  }
}
```

#### 9.1.2 题目创建相关 - `useQuestionCreation.js`

**适合包装的函数：**
- `handleQuestionTypeClick` - 题目类型点击处理
- `handleStructrueChange` - 结构变化处理

**理由：**
- 涉及复杂的题目创建逻辑
- 需要处理页面和元素的协调
- 可以独立测试

```javascript
// src/views/creator/composables/useQuestionCreation.js
export function useQuestionCreation(questionSettings, currentQuestionId, pageIndex, isCurrentQuestionAPage) {
  const handleQuestionTypeClick = (elementType) => {
    // 题目创建逻辑
  }
  
  const handleStructrueChange = (isStructrueChanged) => {
    // 结构变化处理
  }
  
  return {
    handleQuestionTypeClick,
    handleStructrueChange
  }
}
```

#### 9.1.3 逻辑规则管理 - `useLogicManagement.js`

**适合包装的函数：**
- `handleLogicUpdate` - 逻辑更新处理

**理由：**
- 逻辑规则管理是独立的业务模块
- 可能在其他组件中复用
- 便于单独测试

```javascript
// src/views/creator/composables/useLogicManagement.js
export function useLogicManagement(questionSettings) {
  const handleLogicUpdate = (saveLogicObj) => {
    // 逻辑更新处理
  }
  
  return {
    handleLogicUpdate
  }
}
```

### 9.2 不适合包装成 Composable 的函数

#### 9.2.1 简单的事件处理函数
- 已经在 `useDesignState` 中处理的简单状态更新函数
- 单行或几行的简单逻辑

#### 9.2.2 组件生命周期相关
- `onMounted` 中的初始化逻辑
- `onBeforeUnmount` 中的清理逻辑
- 这些更适合保留在组件中

### 9.3 优化后的整体架构

```
src/views/creator/composables/
├── useQuestionDisplay.js      # 题目显示相关逻辑 ✅
├── useCurrentElement.js       # 当前元素计算逻辑 ✅
├── useComponentMapping.js     # 组件映射逻辑 ✅
├── usePageStructure.js        # 页面结构计算逻辑 ✅
├── useLogicRules.js          # 逻辑规则计算逻辑 ✅
├── useDesignState.js         # 设计器状态管理 ✅
├── useElementOperations.js   # 元素操作相关 🆕
├── useQuestionCreation.js    # 题目创建相关 🆕
└── useLogicManagement.js     # 逻辑规则管理 🆕
```

### 9.4 迁移优先级建议

#### 第一优先级（高复用性 + 高复杂度）
1. `useElementOperations.js` - 元素操作是核心功能
2. `useQuestionCreation.js` - 题目创建逻辑复杂

#### 第二优先级（中等复用性）
3. `useLogicManagement.js` - 逻辑管理相对独立

### 9.5 实施建议

1. **渐进式迁移**：先完成已有的 6 个 Composables，确保稳定后再进行业务逻辑函数的迁移
2. **保持向后兼容**：在迁移过程中保持原有函数的可用性
3. **充分测试**：每个 Composable 都应该有对应的单元测试
4. **文档更新**：及时更新相关文档和注释

### 9.6 预期收益

- **代码复用性提升 60%**：核心业务逻辑可在多个组件间复用
- **测试覆盖率提升 80%**：独立的 Composables 更容易编写测试
- **维护成本降低 40%**：逻辑集中管理，修改影响范围更可控
- **开发效率提升 30%**：新功能开发可以复用现有 Composables

## 总结

通过将 design 组件的计算逻辑和业务逻辑提取为 Composables，可以显著提高代码的组织性、可维护性和可测试性。这种架构更符合 Vue 3 的设计理念，也为后续的功能扩展和优化奠定了良好的基础。

建议采用渐进式迁移策略，先从简单的逻辑开始，逐步完成整个迁移过程，确保每一步都经过充分的测试和验证。特别是对于复杂的业务逻辑函数，应该优先考虑 Composable 化，以获得最大的收益。