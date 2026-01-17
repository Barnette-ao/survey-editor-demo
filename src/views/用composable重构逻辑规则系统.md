# 用 Composable 重构逻辑规则系统

## 当前问题分析

### 现有代码的复杂性
- LogicSettingDialog.vue 文件过大（500+ 行）
- 业务逻辑与 UI 逻辑混合
- 状态管理分散，难以维护
- 计算逻辑复杂，可复用性差

### 主要功能模块识别
1. **逻辑规则状态管理**：logicRules, displayedLogicRules, logicClass
2. **元素数据处理**：allElements, allIfElement, allTargetElements
3. **规则操作**：添加、删除、修改逻辑规则
4. **条件管理**：如果条件的增删改
5. **验证与保存**：规则完整性检查、分类保存
6. **UI 交互状态**：禁用索引计算、下拉框显示控制

## 重构方案设计

### 1. 核心 Composables 架构

```
useLogicRules (主 composable)
├── useLogicRuleState (状态管理)
├── useElementData (元素数据处理)
├── useRuleOperations (规则操作)
├── useConditionManager (条件管理)
├── useRuleValidation (验证逻辑)
└── useUIInteraction (UI 交互)
```

### 2. 具体 Composable 设计

#### 2.1 useLogicRuleState - 状态管理
**职责**：管理逻辑规则的核心状态
```js
// composables/useLogicRuleState.js
export function useLogicRuleState(props) {
  const logicRules = ref([])
  const logicClass = ref('skipLogic')
  const displayedLogicRules = ref([])
  const history = reactive([])
  const deletedLogicRulesId = reactive([])
  
  // 初始化状态
  const initializeState = () => { /* ... */ }
  
  // 重置状态
  const resetState = () => { /* ... */ }
  
  return {
    logicRules,
    logicClass,
    displayedLogicRules,
    history,
    deletedLogicRulesId,
    initializeState,
    resetState
  }
}
```

#### 2.2 useElementData - 元素数据处理
**职责**：处理问卷元素数据，提供过滤和查找功能
```js
// composables/useElementData.js
export function useElementData(questionSettings, element) {
  const filterType = ['panel', 'html', 'multipletext', 'file', 'ranking', 'matrix', 'text', 'comment', 'signaturepad']
  
  const allElements = computed(() => {
    return (questionSettings.pages ?? []).flatMap(page => page.elements)
  })
  
  const allIfElement = computed(() => {
    return allElements.value
      .map((element, index) => ({ element, index }))
      .filter(item => !filterType.includes(item.element.type))
  })
  
  const allTargetElements = computed(() => {
    const elements = [...allElements.value]
    elements.shift() // 移除简介页面
    return [...elements, { id: "complete", title: "提前结束" }]
  })
  
  const isFistElement = computed(() => {
    let elementIndex = allElements.value.findIndex(el => element.id === el.id)
    return elementIndex === 1
  })
  
  return {
    allElements,
    allIfElement,
    allTargetElements,
    isFistElement
  }
}
```

#### 2.3 useRuleOperations - 规则操作
**职责**：处理逻辑规则的增删改操作
```js
// composables/useRuleOperations.js
export function useRuleOperations(state, elementData) {
  const { logicRules, displayedLogicRules, logicClass, deletedLogicRulesId, history } = state
  
  const getDefaultRule = () => {
    return {
      id: uuidv4(),
      ifConditions: [{
        elementId: logicClass.value === 'skipLogic' ? element.id : "",
        state: '',
        choiceIndex: "",
        score: "",
      }],
      thenCondition: {
        action: logicClass.value === 'skipLogic' ? 'jump' : 'show',
        targetElementId: logicClass.value === 'skipLogic' ? '' : element.id
      }
    }
  }
  
  const addLogicRule = () => {
    const defaultRule = getDefaultRule()
    logicRules.value.push(defaultRule)
    displayedLogicRules.value.push(defaultRule)
  }
  
  const removeLogicRule = async (index) => {
    try {
      await ElMessageBox.confirm("确定要删除该题目吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
      
      const deletedRule = displayedLogicRules.value.splice(index, 1)[0]
      const settedlogicRulesId = (questionSettings.logicRules ?? []).map(rule => rule.id)
      
      if (settedlogicRulesId.includes(deletedRule.id)) {
        deletedLogicRulesId.push(deletedRule.id)
      } else {
        const defaultRuleIdIndex = history.indexOf(deletedRule.id)
        if (defaultRuleIdIndex !== -1) {
          history.splice(defaultRuleIdIndex, 1)
        }
      }
      
      ElMessage({ type: "success", message: "删除成功" })
    } catch {
      // 用户取消删除
    }
  }
  
  const clickLogicRule = (ruleIndex) => {
    const clickedLogicRule = displayedLogicRules.value[ruleIndex].id
    if (history.length === 0) {
      history.push(clickedLogicRule)
    } else {
      const index = history.findIndex((logicRuleId) => logicRuleId && logicRuleId === clickedLogicRule)
      const isClicked = index === -1
      if (isClicked) {
        history.push(clickedLogicRule)
      }
    }
  }
  
  return {
    getDefaultRule,
    addLogicRule,
    removeLogicRule,
    clickLogicRule
  }
}
```

#### 2.4 useConditionManager - 条件管理
**职责**：管理如果条件的增删改
```js
// composables/useConditionManager.js
export function useConditionManager(state, elementData) {
  const { displayedLogicRules } = state
  const { allIfElement } = elementData
  
  const addIfCondition = (rule) => {
    rule.ifConditions.push({
      connector: (rule.ifConditions[1] && rule.ifConditions[1].connector) || 'or',
      state: '',
      choiceIndex: "",
      score: "",
    })
  }
  
  const removeIfCondition = (rule, index) => {
    rule.ifConditions.splice(index, 1)
  }
  
  const changeIfCoditionElement = (elementId, ruleIndex, index) => {
    displayedLogicRules.value[ruleIndex].ifConditions[index].state = ''
    const element = allIfElement.value.find(item => item.element.id === elementId)?.element
    
    if (element) {
      displayedLogicRules.value[ruleIndex].ifConditions[index].elementId = elementId
    }
  }
  
  const changeIfCoditionState = (state, ruleIndex, index) => {
    displayedLogicRules.value[ruleIndex].ifConditions[index].state = state
    displayedLogicRules.value[ruleIndex].ifConditions[index].choiceIndex = ""
  }
  
  return {
    addIfCondition,
    removeIfCondition,
    changeIfCoditionElement,
    changeIfCoditionState
  }
}
```

#### 2.5 useRuleValidation - 验证逻辑
**职责**：规则验证和分类保存逻辑
```js
// composables/useRuleValidation.js
export function useRuleValidation(state, props) {
  const { logicRules, history, deletedLogicRulesId, logicClass } = state
  
  const classifyHistory = () => {
    const removeDefaultRules = (rules) => rules.filter(rule => rule && !isDefaultRule(rule))
    const removeDeletedRule = (rules) => rules.filter(rule => rule && !deletedLogicRulesId.includes(rule.id))
    
    const removedDeletedHistory = (history ?? []).filter(item => !deletedLogicRulesId.includes(item))
    
    logicRules.value = removeDeletedRule(logicRules.value)
    
    if (removedDeletedHistory.length === 0) {
      logicRules.value = removeDefaultRules(logicRules.value)
      return { newLogicRulesId: [], updatedLogicRulesId: [] }
    }
    
    logicRules.value = removeDefaultRules(logicRules.value)
    
    const removedDefaultHistory = removedDeletedHistory
      .map((ruleId) => logicRules.value.find(rule => rule && rule.id === ruleId))
      .filter(Boolean)
      .filter(rule => !isDefaultRule(rule))
      .map(rule => rule.id)
    
    const settedlogicRulesId = (props.questionSettings.logicRules ?? [])
      .filter(rule => {
        const isShowAction = rule.thenCondition.action === "show"
        return logicClass.value === 'skipLogic' ? !isShowAction : isShowAction
      })
      .map(rule => rule.id)
    
    const newLogicRulesId = removedDefaultHistory.filter(ruleId => !settedlogicRulesId.includes(ruleId))
    
    const updatedLogicRulesId = removedDefaultHistory
      .filter(ruleId => !newLogicRulesId.includes(ruleId))
      .map(ruleId => logicRules.value.find(rule => rule && rule.id === ruleId))
      .filter(rule => !(settedlogicRulesId).some((logicRuleId) => {
        const existingRule = props.questionSettings.logicRules.find(r => r.id === logicRuleId)
        return isEqual(existingRule, rule)
      }))
      .map(rule => rule.id)
    
    return { newLogicRulesId, updatedLogicRulesId }
  }
  
  const validateRules = () => {
    const incompleteRules = logicRules.value.filter(rule => !isCompleteRule(rule))
    
    if (incompleteRules.length > 0) {
      ElMessage({
        type: 'warning',
        message: `有规则不完整，请完善后再保存`,
        duration: 3000
      })
      return false
    }
    return true
  }
  
  return {
    classifyHistory,
    validateRules
  }
}
```

#### 2.6 useUIInteraction - UI 交互
**职责**：处理 UI 交互相关的逻辑
```js
// composables/useUIInteraction.js
export function useUIInteraction(state, elementData, props) {
  const { displayedLogicRules, logicClass } = state
  const { allElements, allIfElement } = elementData
  
  const shouldCalculateDisabled = ref(false)
  const currentRuleIndex = ref(-1)
  const currentType = ref('')
  
  const disabledIndex = computed(() => {
    if (!shouldCalculateDisabled.value) return -1
    
    if (canSetLogic(currentType.value)) {
      return getDisabledIndexForSkipLogicType(currentRuleIndex.value)
    } else {
      return allElements.value.findIndex(element => props.element.id === element.id)
    }
  })
  
  const getDiabledIndex = (visible, ruleIndex, type) => {
    shouldCalculateDisabled.value = visible
    currentRuleIndex.value = ruleIndex
    currentType.value = type
  }
  
  const getLogicRuleElement = computed(() => {
    return (ruleIndex, index) => {
      if (displayedLogicRules.value.length === 0) return {}
      
      return allIfElement.value.find((item) => {
        return item.element.id === displayedLogicRules.value[ruleIndex].ifConditions[index].elementId
      })?.element
    }
  })
  
  // 其他 UI 相关的计算属性和方法...
  
  return {
    disabledIndex,
    getDiabledIndex,
    getLogicRuleElement,
    // 其他返回值...
  }
}
```

#### 2.7 useLogicRules - 主 Composable
**职责**：整合所有子 composables，提供统一接口
```js
// composables/useLogicRules.js
export function useLogicRules(props, emits) {
  // 初始化所有子 composables
  const state = useLogicRuleState(props)
  const elementData = useElementData(props.questionSettings, props.element)
  const ruleOperations = useRuleOperations(state, elementData)
  const conditionManager = useConditionManager(state, elementData)
  const ruleValidation = useRuleValidation(state, props)
  const uiInteraction = useUIInteraction(state, elementData, props)
  
  // 对话框控制
  const dialogVisible = computed(() => props.visible)
  
  // 初始化对话框
  const openDialog = () => {
    state.logicClass.value = !canSetLogic(props.element.type) ? 'visibleLogic' : 'skipLogic'
    state.logicRules.value.length = 0
    
    if (props.questionSettings.logicRules) {
      const copiedRules = JSON.parse(JSON.stringify(props.questionSettings.logicRules))
      state.logicRules.value.push(...copiedRules)
    }
    
    const filteredRules = computed(() => {
      return state.logicRules.value.filter(rule => {
        if (state.logicClass.value === 'skipLogic') {
          return rule.thenCondition.action === 'jump' && 
                 rule.ifConditions.some(ifrule => ifrule.elementId === props.element.id)
        } else {
          return ['show', 'hide'].includes(rule.thenCondition.action) && 
                 rule.thenCondition.targetElementId === props.element.id
        }
      })
    })
    
    if (filteredRules.value.length > 0) {
      state.displayedLogicRules.value = filteredRules.value
    } else {
      displayDefaultRule()
    }
  }
  
  // 保存逻辑设置
  const saveLogicSettings = () => {
    // 过滤规则类型
    state.logicRules.value = state.logicRules.value.filter(rule => {
      const isShowAction = rule.thenCondition.action === "show"
      return state.logicClass.value === 'skipLogic' ? !isShowAction : isShowAction
    })
    
    // 验证规则完整性
    if (!ruleValidation.validateRules()) {
      return
    }
    
    // 分类历史记录
    const { newLogicRulesId, updatedLogicRulesId } = ruleValidation.classifyHistory()
    
    // 发送保存事件
    emits('saveLogicRules', {
      logicRules: state.logicRules.value,
      newLogicRulesId,
      updatedLogicRulesId,
      deletedLogicRulesId: state.deletedLogicRulesId
    })
    emits('closeLogicDialog')
  }
  
  const cancelSave = () => {
    state.logicClass.value = "skipLogic"
    emits('closeLogicDialog')
  }
  
  const closeDialog = () => {
    state.logicClass.value = "skipLogic"
    emits('closeLogicDialog')
  }
  
  return {
    // 状态
    ...state,
    ...elementData,
    dialogVisible,
    
    // 操作方法
    ...ruleOperations,
    ...conditionManager,
    ...uiInteraction,
    
    // 对话框控制
    openDialog,
    saveLogicSettings,
    cancelSave,
    closeDialog
  }
}
```

### 3. 重构后的组件使用

```js
<!-- LogicSettingDialog.vue 重构后 -->
<template>
  <!-- 模板保持不变 -->
</template>

<script setup>
import { useLogicRules } from '@/composables/useLogicRules'

const props = defineProps({
  visible: { type: Boolean, default: false },
  questionSettings: { type: Object, default: () => ({}) },
  element: { type: Object, default: () => ({}) }
})

const emits = defineEmits(['closeLogicDialog', 'saveLogicRules'])

// 使用主 composable
const {
  // 状态
  logicRules,
  logicClass,
  displayedLogicRules,
  allElements,
  allIfElement,
  allTargetElements,
  isFistElement,
  dialogVisible,
  
  // 计算属性
  getLogicRuleElement,
  disabledIndex,
  
  // 方法
  openDialog,
  addLogicRule,
  removeLogicRule,
  clickLogicRule,
  addIfCondition,
  removeIfCondition,
  changeIfCoditionElement,
  changeIfCoditionState,
  getDiabledIndex,
  saveLogicSettings,
  cancelSave,
  closeDialog
} = useLogicRules(props, emits)

// 其他辅助方法保持不变...
</script>
```

## 重构优势

### 1. 代码组织更清晰
- 按功能模块拆分，职责单一
- 每个 composable 专注特定领域
- 便于理解和维护

### 2. 可复用性更强
- 各个 composable 可以独立使用
- 便于在其他组件中复用逻辑
- 支持组合使用

### 3. 测试更容易
- 每个 composable 可以独立测试
- 逻辑与 UI 分离，便于单元测试
- 模拟依赖更简单

### 4. 维护成本更低
- 修改某个功能只需要关注对应的 composable
- 减少代码耦合，降低修改风险
- 便于新人理解和接手

## 实施步骤

### 第一阶段：基础重构
1. 创建 `useLogicRuleState` - 状态管理
2. 创建 `useElementData` - 数据处理
3. 验证基础功能正常

### 第二阶段：功能拆分
1. 创建 `useRuleOperations` - 规则操作
2. 创建 `useConditionManager` - 条件管理
3. 测试增删改功能

### 第三阶段：完善功能
1. 创建 `useRuleValidation` - 验证逻辑
2. 创建 `useUIInteraction` - UI 交互
3. 完整功能测试

### 第四阶段：整合优化
1. 创建主 `useLogicRules` composable
2. 重构组件使用新的 composable
3. 性能优化和代码清理

## 注意事项

1. **保持向后兼容**：重构过程中确保现有功能不受影响
2. **渐进式重构**：分阶段进行，每个阶段都要充分测试
3. **类型安全**：如果使用 TypeScript，要确保类型定义完整
4. **性能考虑**：注意 computed 和 watch 的使用，避免不必要的重复计算
5. **错误处理**：每个 composable 都要有适当的错误处理机制

---

## 优化后的重构方案（推荐）

基于前面的讨论，我们采用更实用的三个 com

## 优化后的重构方案（推荐）

基于前面的讨论，我们采用更实用的三个 composable 方案，避免过度拆分，保持代码的可读性和维护性。

### 1. 重新设计的架构

```
LogicSettingDialog.vue
├── useRuleManager (规则管理)
├── useUIState (UI状态管理)  
└── useValidation (验证保存)
```

### 2. 三个核心 Composable 设计

#### 2.1 useRuleManager - 规则管理
**职责**：管理逻辑规则的核心业务逻辑，包括规则和条件的增删改
```js
// composables/useRuleManager.js
export function useRuleManager(props) {
  // ===== 核心状态 =====
  const logicRules = ref([])
  const logicClass = ref('skipLogic')
  const displayedLogicRules = ref([])
  const history = reactive([])
  const deletedLogicRulesId = reactive([])
  
  // ===== 元素数据处理 =====
  const filterType = ['panel', 'html', 'multipletext', 'file', 'ranking', 'matrix', 'text', 'comment', 'signaturepad']
  
  const allElements = computed(() => {
    return (props.questionSettings.pages ?? []).flatMap(page => page.elements)
  })
  
  const allIfElement = computed(() => {
    return allElements.value
      .map((element, index) => ({ element, index }))
      .filter(item => !filterType.includes(item.element.type))
  })
  
  const allTargetElements = computed(() => {
    const elements = [...allElements.value]
    elements.shift() // 移除简介页面
    return [...elements, { id: "complete", title: "提前结束" }]
  })
  
  const isFistElement = computed(() => {
    let elementIndex = allElements.value.findIndex(el => props.element.id === el.id)
    return elementIndex === 1
  })
  
  // ===== 规则操作 =====
  const getDefaultRule = () => {
    return {
      id: uuidv4(),
      ifConditions: [{
        elementId: logicClass.value === 'skipLogic' ? props.element.id : "",
        state: '',
        choiceIndex: "",
        score: "",
      }],
      thenCondition: {
        action: logicClass.value === 'skipLogic' ? 'jump' : 'show',
        targetElementId: logicClass.value === 'skipLogic' ? '' : props.element.id
      }
    }
  }
  
  const displayDefaultRule = () => {
    const defaultRule = getDefaultRule()
    logicRules.value.push(defaultRule)
    displayedLogicRules.value = [defaultRule]
  }
  
  const addLogicRule = () => {
    const defaultRule = getDefaultRule()
    logicRules.value.push(defaultRule)
    displayedLogicRules.value.push(defaultRule)
  }
  
  const removeLogicRule = async (index) => {
    try {
      await ElMessageBox.confirm("确定要删除该题目吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
      
      const deletedRule = displayedLogicRules.value.splice(index, 1)[0]
      const settedlogicRulesId = (props.questionSettings.logicRules ?? []).map(rule => rule.id)
      
      if (settedlogicRulesId.includes(deletedRule.id)) {
        deletedLogicRulesId.push(deletedRule.id)
      } else {
        const defaultRuleIdIndex = history.indexOf(deletedRule.id)
        if (defaultRuleIdIndex !== -1) {
          history.splice(defaultRuleIdIndex, 1)
        }
      }
      
      ElMessage({ type: "success", message: "删除成功" })
    } catch {
      // 用户取消删除
    }
  }
  
  const clickLogicRule = (ruleIndex) => {
    const clickedLogicRule = displayedLogicRules.value[ruleIndex].id
    if (history.length === 0) {
      history.push(clickedLogicRule)
    } else {
      const index = history.findIndex((logicRuleId) => logicRuleId && logicRuleId === clickedLogicRule)
      const isClicked = index === -1
      if (isClicked) {
        history.push(clickedLogicRule)
      }
    }
  }
  
  // ===== 条件管理 =====
  const addIfCondition = (rule) => {
    rule.ifConditions.push({
      connector: (rule.ifConditions[1] && rule.ifConditions[1].connector) || 'or',
      state: '',
      choiceIndex: "",
      score: "",
    })
  }
  
  const removeIfCondition = (rule, index) => {
    rule.ifConditions.splice(index, 1)
  }
  
  const changeIfCoditionElement = (elementId, ruleIndex, index) => {
    displayedLogicRules.value[ruleIndex].ifConditions[index].state = ''
    const element = allIfElement.value.find(item => item.element.id === elementId)?.element
    
    if (element) {
      displayedLogicRules.value[ruleIndex].ifConditions[index].elementId = elementId
    }
  }
  
  const changeIfCoditionState = (state, ruleIndex, index) => {
    displayedLogicRules.value[ruleIndex].ifConditions[index].state = state
    displayedLogicRules.value[ruleIndex].ifConditions[index].choiceIndex = ""
  }
  
  // ===== 对话框初始化 =====
  const openDialog = () => {
    logicClass.value = !canSetLogic(props.element.type) ? 'visibleLogic' : 'skipLogic'
    logicRules.value.length = 0
    
    if (props.questionSettings.logicRules) {
      const copiedRules = JSON.parse(JSON.stringify(props.questionSettings.logicRules))
      logicRules.value.push(...copiedRules)
    }
    
    // 过滤规则逻辑
    const filteredRules = computed(() => {
      return logicRules.value.filter(rule => {
        if (logicClass.value === 'skipLogic') {
          return rule.thenCondition.action === 'jump' && 
                 rule.ifConditions.some(ifrule => ifrule.elementId === props.element.id)
        } else {
          return ['show', 'hide'].includes(rule.thenCondition.action) && 
                 rule.thenCondition.targetElementId === props.element.id
        }
      })
    })
    
    if (filteredRules.value.length > 0) {
      displayedLogicRules.value = filteredRules.value
    } else {
      displayDefaultRule()
    }
  }
  
  const changeLogicClass = (value) => {
    // 如果当前类型没有规则，显示默认规则
    const filteredRules = logicRules.value.filter(rule => {
      if (logicClass.value === 'skipLogic') {
        return rule.thenCondition.action === 'jump' && 
               rule.ifConditions.some(ifrule => ifrule.elementId === props.element.id)
      } else {
        return ['show', 'hide'].includes(rule.thenCondition.action) && 
               rule.thenCondition.targetElementId === props.element.id
      }
    })
    
    if (filteredRules.length === 0) {
      displayDefaultRule()
    }
  }
  
  return {
    // 状态
    logicRules,
    logicClass,
    displayedLogicRules,
    history,
    deletedLogicRulesId,
    
    // 元素数据
    allElements,
    allIfElement,
    allTargetElements,
    isFistElement,
    
    // 规则操作
    getDefaultRule,
    addLogicRule,
    removeLogicRule,
    clickLogicRule,
    
    // 条件操作
    addIfCondition,
    removeIfCondition,
    changeIfCoditionElement,
    changeIfCoditionState,
    
    // 对话框控制
    openDialog,
    changeLogicClass
  }
}
```

#### 2.2 useUIState - UI状态管理
**职责**：管理UI交互状态，包括禁用索引计算、下拉框显示控制等
```js
// composables/useUIState.js
export function useUIState(ruleManager, props) {
  const { displayedLogicRules, logicClass, allElements, allIfElement } = ruleManager
  
  // ===== UI 交互状态 =====
  const shouldCalculateDisabled = ref(false)
  const currentRuleIndex = ref(-1)
  const currentType = ref('')
  
  // ===== 对话框控制 =====
  const dialogVisible = computed(() => props.visible)
  
  // ===== 计算属性 =====
  const thenAction = computed(() => {
    return logicClass.value === 'skipLogic' ? "跳转" : "显示"
  })
  
  const thenText = computed(() => {
    return logicClass.value === 'skipLogic' ? "，否则正常进入下一题" : "。"
  })
  
  const getLogicRuleElement = computed(() => {
    return (ruleIndex, index) => {
      if (displayedLogicRules.value.length === 0) return {}
      
      return allIfElement.value.find((item) => {
        return item.element.id === displayedLogicRules.value[ruleIndex].ifConditions[index].elementId
      })?.element
    }
  })
  
  const disabledIndex = computed(() => {
    if (!shouldCalculateDisabled.value) return -1
    
    if (canSetLogic(currentType.value)) {
      return getDisabledIndexForSkipLogicType(currentRuleIndex.value)
    } else {
      return allElements.value.findIndex(element => props.element.id === element.id)
    }
  })
  
  // ===== UI 交互方法 =====
  const getDiabledIndex = (visible, ruleIndex, type) => {
    shouldCalculateDisabled.value = visible
    currentRuleIndex.value = ruleIndex
    currentType.value = type
  }
  
  const getDisabledIndexForSkipLogicType = (ruleIndex) => {
    if (logicClass.value === 'skipLogic') {
      return getMaxConditionIndex(ruleIndex)
    }
    return allIfElement.value.findIndex(item => props.element.id === item.element.id)
  }
  
  const getMaxConditionIndex = (ruleIndex) => {
    let maxIndex = -1
    displayedLogicRules.value[ruleIndex].ifConditions.forEach(ifCondition => {
      const index = allElements.value.findIndex(element => ifCondition.elementId === element.id)
      maxIndex = Math.max(maxIndex, index)
    })
    return maxIndex
  }
  
  // ===== 条件状态相关 =====
  const CHOICE_TYPES = ['radiogroup', 'checkbox', 'dropdown', 'imagepicker']
  
  const getConditionStatesByType = (element) => {
    if (!element) return []
    
    if (CHOICE_TYPES.includes(element.type)) {
      if (element.type === 'checkbox') { 
        return [
          { label: "包含", value: "selected" },
          { label: "不包含", value: "notBeSelected" },
          { label: "已答", value: "answered" },
        ]
      }
      return [
        { label: "选中", value: "selected" },
        { label: "未选中", value: "notBeSelected" },
        { label: "已答", value: "answered" },
      ]
    }
    
    if (element.type === 'rating' || isRating(element.type)) {
      return [
        { label: "等于", value: "equal" },
        { label: "小于", value: "lessThan" },
        { label: "大于", value: "greaterThan" },
        { label: "大于等于", value: "greaterOrEqual" },
        { label: "小于等于", value: "lesserOrEqual" },
      ]
    }
    
    return []
  }
  
  const shouldShowChoiceSelect = (ruleIndex, index, state) => {
    const element = getLogicRuleElement.value(ruleIndex, index)
    if (!element) return false
    
    if (CHOICE_TYPES.includes(element.type)) {
      return ['selected', 'notBeSelected'].includes(state)
    }
    return false
  }
  
  const shouldShowScoreSelect = (ruleIndex, index, state) => {
    const element = getLogicRuleElement.value(ruleIndex, index)
    if (!element || element.type !== 'rating') return false
    
    return ['equal', 'lessThan', 'greaterThan', 'greaterOrEqual', 'lesserOrEqual'].includes(state)
  }
  
  const isCheckbox = computed(() => { 
    return (ruleIndex, index) => { 
      const element = getLogicRuleElement.value(ruleIndex, index)
      return element && element.type === 'checkbox'
    }
  })
  
  const getLabelOfChoiceSelected = computed(() => {
    return (choice) => {
      return typeof choice === 'object' && choice !== null ? choice.value : choice
    }
  })
  
  const getScoreOptions = computed(() => {
    return (ruleIndex, index) => {
      const element = getLogicRuleElement.value(ruleIndex, index)
      if (!element || element.type !== 'rating') return []
      
      const values = []
      const rateMin = element.rateMin || 1
      const rateMax = element.rateMax || 5
      const rateStep = element.rateStep || 1
      
      let count = 1
      for (let i = rateMin; i <= rateMax; i += rateStep) {
        values.push({ label: i, value: count++ })
      }
      return values
    }
  })
  
  return {
    // 状态
    dialogVisible,
    
    // 计算属性
    thenAction,
    thenText,
    getLogicRuleElement,
    disabledIndex,
    isCheckbox,
    getLabelOfChoiceSelected,
    getScoreOptions,
    
    // 方法
    getDiabledIndex,
    getConditionStatesByType,
    shouldShowChoiceSelect,
    shouldShowScoreSelect
  }
}
```

#### 2.3 useValidation - 验证保存
**职责**：处理规则验证、分类保存和对话框关闭逻辑
```js
// composables/useValidation.js
export function useValidation(ruleManager, props, emits) {
  const { logicRules, history, deletedLogicRulesId, logicClass } = ruleManager
  
  // ===== 验证逻辑 =====
  const classifyHistory = () => {
    const removeDefaultRules = (rules) => rules.filter(rule => rule && !isDefaultRule(rule))
    const removeDeletedRule = (rules) => rules.filter(rule => rule && !deletedLogicRulesId.includes(rule.id))
    
    const removedDeletedHistory = (history ?? []).filter(item => !deletedLogicRulesId.includes(item))
    
    logicRules.value = removeDeletedRule(logicRules.value)
    
    if (removedDeletedHistory.length === 0) {
      logicRules.value = removeDefaultRules(logicRules.value)
      return { newLogicRulesId: [], updatedLogicRulesId: [] }
    }
    
    logicRules.value = removeDefaultRules(logicRules.value)
    
    const removedDefaultHistory = removedDeletedHistory
      .map((ruleId) => logicRules.value.find(rule => rule && rule.id === ruleId))
      .filter(Boolean)
      .filter(rule => !isDefaultRule(rule))
      .map(rule => rule.id)
    
    const settedlogicRulesId = (props.questionSettings.logicRules ?? [])
      .filter(rule => {
        const isShowAction = rule.thenCondition.action === "show"
        return logicClass.value === 'skipLogic' ? !isShowAction : isShowAction
      })
      .map(rule => rule.id)
    
    const newLogicRulesId = removedDefaultHistory.filter(ruleId => !settedlogicRulesId.includes(ruleId))
    
    const updatedLogicRulesId = removedDefaultHistory
      .filter(ruleId => !newLogicRulesId.includes(ruleId))
      .map(ruleId => logicRules.value.find(rule => rule && rule.id === ruleId))
      .filter(rule => !(settedlogicRulesId).some((logicRuleId) => {
        const existingRule = props.questionSettings.logicRules.find(r => r.id === logicRuleId)
        return isEqual(existingRule, rule)
      }))
      .map(rule => rule.id)
    
    return { newLogicRulesId, updatedLogicRulesId }
  }
  
  const validateRules = () => {
    const incompleteRules = logicRules.value.filter(rule => !isCompleteRule(rule))
    
    if (incompleteRules.length > 0) {
      ElMessage({
        type: 'warning',
        message: `有规则不完整，请完善后再保存`,
        duration: 3000
      })
      return false
    }
    return true
  }
  
  // ===== 保存逻辑 =====
  const saveLogicSettings = () => {
    // 过滤规则类型
    logicRules.value = logicRules.value.filter(rule => {
      const isShowAction = rule.thenCondition.action === "show"
      return logicClass.value === 'skipLogic' ? !isShowAction : isShowAction
    })
    
    // 同步历史记录
    history.splice(0, history.length, ...history.filter(id => 
      logicRules.value.some(rule => rule.id === id)
    ))
    
    // 验证规则完整性
    if (!validateRules()) {
      return
    }
    
    // 处理不需要删除的规则
    const removedDeletedId = history
      .filter(id => deletedLogicRulesId.includes(id))
      .filter(id => { 
        const rule = (props.questionSettings.logicRules ?? []).find(rule => rule.id === id)
        const isShowAction = rule.thenCondition.action === "show"
        return logicClass.value === 'skipLogic' ? isShowAction : !isShowAction
      })
    
    history.splice(0, history.length, ...history.filter(id => !removedDeletedId.includes(id)))
    deletedLogicRulesId.splice(0, deletedLogicRulesId.length,
      ...deletedLogicRulesId.filter(id => !removedDeletedId.includes(id)))
    
    // 分类历史记录
    const { newLogicRulesId, updatedLogicRulesId } = classifyHistory()
    
    // 发送保存事件
    emits('saveLogicRules', {
      logicRules: logicRules.value,
      newLogicRulesId,
      updatedLogicRulesId,
      deletedLogicRulesId
    })
    emits('closeLogicDialog')
  }
  
  const cancelSave = () => {
    logicClass.value = "skipLogic"
    emits('closeLogicDialog')
  }
  
  const closeDialog = () => {
    logicClass.value = "skipLogic"
    emits('closeLogicDialog')
  }
  
  return {
    saveLogicSettings,
    cancelSave,
    closeDialog
  }
}
```

### 3. 重构后的组件使用

```vue
<!-- LogicSettingDialog.vue 重构后 -->
<template>
  <!-- 模板保持不变 -->
</template>

<script setup>
import { useRuleManager } from '@/composables/useRuleManager'
import { useUIState } from '@/composables/useUIState'
import { useValidation } from '@/composables/useValidation'

const props = defineProps({
  visible: { type: Boolean, default: false },
  questionSettings: { type: Object, default: () => ({}) },
  element: { type: Object, default: () => ({}) }
})

const emits = defineEmits(['closeLogicDialog', 'saveLogicRules'])

// 使用三个独立的 composables
const ruleManager = useRuleManager(props)
const uiState = useUIState(ruleManager, props)
const validation = useValidation(ruleManager, props, emits)

// 从 ruleManager 解构需要的状态和方法
const {
  logicRules,
  logicClass,
  displayedLogicRules,
  allElements,
  allIfElement,
  allTargetElements,
  isFistElement,
  addLogicRule,
  removeLogicRule,
  clickLogicRule,
  addIfCondition,
  removeIfCondition,
  changeIfCoditionElement,
  changeIfCoditionState,
  openDialog,
  changeLogicClass
} = ruleManager

// 从 uiState 解构需要的计算属性和方法
const {
  dialogVisible,
  thenAction,
  thenText,
  getLogicRuleElement,
  disabledIndex,
  isCheckbox,
  getLabelOfChoiceSelected,
  getScoreOptions,
  getDiabledIndex,
  getConditionStatesByType,
  shouldShowChoiceSelect,
  shouldShowScoreSelect
} = uiState

// 从 validation 解构需要的方法
const {
  saveLogicSettings,
  cancelSave,
  closeDialog
} = validation

// 其他辅助方法保持不变
const TEXT_TYPES = ['html', 'panel', 'signaturepad', 'multipletext', 'file', 'ranking', 'matrix', 'text', 'comment']
const canSetLogic = (type) => {
  return !TEXT_TYPES.includes(type)
}
</script>
```

### 4. 重构优势

#### 4.1 合理的抽象层级
- **3个 composable** 而不是 6个，避免过度拆分
- 每个 composable 都有明确的业务价值
- 减少了不必要的抽象层

#### 4.2 清晰的职责划分
- **useRuleManager**：核心业务逻辑，包含规则和条件的所有操作
- **useUIState**：UI 交互状态，专注于界面显示逻辑
- **useValidation**：验证和保存，处理数据持久化

#### 4.3 更好的可维护性
- 直接使用三个 composable，没有额外的包装层
- 每个 composable 可以独立测试和维护
- 新人更容易理解代码结构

#### 4.4 灵活的使用方式
- 可以按需引入特定的 composable
- 便于在其他组件中复用部分逻辑
- 支持渐进式重构

### 5. 实施建议

#### 第一阶段：创建 useRuleManager
1. 提取规则管理相关的状态和方法
2. 包含元素数据处理逻辑
3. 测试规则的增删改功能

#### 第二阶段：创建 useUIState  
1. 提取 UI 交互相关的计算属性
2. 包含禁用索引、下拉框显示等逻辑
3. 测试 UI 交互功能

#### 第三阶段：创建 useValidation
1. 提取验证和保存相关逻辑
2. 包含复杂的分类保存算法
3. 测试保存功能的完整性

#### 第四阶段：整合测试
1. 在组件中使用三个 composable
2. 进行完整的功能测试
3. 性能优化和代码清理

这个方案在保持功能完整性的同时，避免了过度设计，更适合实际项目的需求。

---

## useLogicRuleState 中的初始化和重置函数实现

### initializeState 函数设计

```js
// 初始化状态
const initializeState = (questionSettings, element) => {
  // 1. 重置所有状态到初始值
  logicRules.value.length = 0
  displayedLogicRules.value.length = 0
  history.length = 0
  deletedLogicRulesId.length = 0
  
  // 2. 根据元素类型设置逻辑类别
  logicClass.value = !canSetLogic(element.type) ? 'visibleLogic' : 'skipLogic'
  
  // 3. 从数据库加载已保存的逻辑规则
  if (questionSettings.logicRules && questionSettings.logicRules.length > 0) {
    // 深拷贝避免直接修改原始数据
    const copiedRules = JSON.parse(JSON.stringify(questionSettings.logicRules))
    logicRules.value.push(...copiedRules)
  }
  
  // 4. 根据当前逻辑类别过滤规则
  const filteredRules = logicRules.value.filter(rule => {
    if (logicClass.value === 'skipLogic') {
      // 跳转逻辑：动作为jump且如果条件中包含当前元素
      return rule.thenCondition.action === 'jump' && 
             rule.ifConditions.some(ifCondition => ifCondition.elementId === element.id)
    } else {
      // 显示逻辑：动作为show/hide且目标元素是当前元素
      return ['show', 'hide'].includes(rule.thenCondition.action) && 
             rule.thenCondition.targetElementId === element.id
    }
  })
  
  // 5. 设置显示的规则
  if (filteredRules.length > 0) {
    displayedLogicRules.value = [...filteredRules]
  } else {
    // 如果没有现有规则，创建默认规则
    const defaultRule = createDefaultRule(element, logicClass.value)
    logicRules.value.push(defaultRule)
    displayedLogicRules.value = [defaultRule]
  }
  
  console.log('状态初始化完成:', {
    logicClass: logicClass.value,
    totalRules: logicRules.value.length,
    displayedRules: displayedLogicRules.value.length
  })
}

// 创建默认规则的辅助函数
const createDefaultRule = (element, logicClassValue) => {
  return {
    id: uuidv4(),
    ifConditions: [{
      elementId: logicClassValue === 'skipLogic' ? element.id : "",
      state: '',
      choiceIndex: "",
      score: "",
      connector: 'or' // 默认连接词
    }],
    thenCondition: {
      action: logicClassValue === 'skipLogic' ? 'jump' : 'show',
      targetElementId: logicClassValue === 'skipLogic' ? '' : element.id
    }
  }
}
```

### resetState 函数设计

```js
// 重置状态
const resetState = () => {
  // 1. 清空所有响应式状态
  logicRules.value.length = 0
  displayedLogicRules.value.length = 0
  history.length = 0
  deletedLogicRulesId.length = 0
  
  // 2. 重置逻辑类别到默认值
  logicClass.value = 'skipLogic'
  
  // 3. 清理可能的定时器或监听器
  // 如果有的话，在这里清理
  
  // 4. 重置任何缓存的计算结果
  // 强制重新计算相关的 computed 属性
  
  console.log('状态已重置到初始状态')
}

// 部分重置 - 只重置特定类型的规则
const resetRulesByType = (ruleType) => {
  if (ruleType === 'skipLogic') {
    // 只清除跳转逻辑相关的状态
    const skipRules = logicRules.value.filter(rule => rule.thenCondition.action === 'jump')
    const skipRuleIds = skipRules.map(rule => rule.id)
    
    // 从各个数组中移除跳转逻辑相关的项
    logicRules.value = logicRules.value.filter(rule => rule.thenCondition.action !== 'jump')
    displayedLogicRules.value = displayedLogicRules.value.filter(rule => rule.thenCondition.action !== 'jump')
    
    // 清理历史记录中的相关ID
    const historyIndex = history.findIndex(id => skipRuleIds.includes(id))
    if (historyIndex !== -1) {
      history.splice(historyIndex, 1)
    }
    
  } else if (ruleType === 'visibleLogic') {
    // 只清除显示逻辑相关的状态
    const visibleRules = logicRules.value.filter(rule => ['show', 'hide'].includes(rule.thenCondition.action))
    const visibleRuleIds = visibleRules.map(rule => rule.id)
    
    logicRules.value = logicRules.value.filter(rule => !['show', 'hide'].includes(rule.thenCondition.action))
    displayedLogicRules.value = displayedLogicRules.value.filter(rule => !['show', 'hide'].includes(rule.thenCondition.action))
    
    // 清理历史记录
    const historyIndex = history.findIndex(id => visibleRuleIds.includes(id))
    if (historyIndex !== -1) {
      history.splice(historyIndex, 1)
    }
  }
  
  console.log(`${ruleType} 规则已重置`)
}

// 智能重置 - 根据当前状态决定重置策略
const smartReset = (element, questionSettings) => {
  // 1. 保存当前重要状态
  const currentLogicClass = logicClass.value
  const hasUnsavedChanges = history.length > 0 || deletedLogicRulesId.length > 0
  
  // 2. 如果有未保存的更改，询问用户
  if (hasUnsavedChanges) {
    console.warn('检测到未保存的更改，建议先保存或确认丢弃')
    // 这里可以触发一个确认对话框
    return false
  }
  
  // 3. 执行完全重置
  resetState()
  
  // 4. 重新初始化
  initializeState(questionSettings, element)
  
  // 5. 恢复用户的逻辑类别选择（如果合理的话）
  if (canSetLogic(element.type) || currentLogicClass === 'visibleLogic') {
    logicClass.value = currentLogicClass
  }
  
  return true
}
```

### 使用示例

```js
// 在 useLogicRuleState 中的完整实现
export function useLogicRuleState(props) {
  const logicRules = ref([])
  const logicClass = ref('skipLogic')
  const displayedLogicRules = ref([])
  const history = reactive([])
  const deletedLogicRulesId = reactive([])
  
  // ... 上面的函数实现 ...
  
  return {
    // 状态
    logicRules,
    logicClass,
    displayedLogicRules,
    history,
    deletedLogicRulesId,
    
    // 方法
    initializeState,
    resetState,
    resetRulesByType,
    smartReset,
    createDefaultRule
  }
}
```

### 在组件中的使用

```js
// 在 LogicSettingDialog 中使用
const openDialog = () => {
  // 使用初始化函数
  ruleState.initializeState(props.questionSettings, props.element)
}

const closeDialog = () => {
  // 使用重置函数清理状态
  ruleState.resetState()
  emits('closeLogicDialog')
}

const switchLogicType = (newType) => {
  // 切换逻辑类型时的部分重置
  ruleState.resetRulesByType(logicClass.value === 'skipLogic' ? 'visibleLogic' : 'skipLogic')
  logicClass.value = newType
}
```

### 设计优势

1. **职责明确**：初始化和重置逻辑集中管理
2. **灵活性强**：提供完全重置、部分重置、智能重置多种选择
3. **状态安全**：确保状态的一致性和完整性
4. **易于调试**：清晰的日志输出，便于问题排查
5. **可扩展性**：可以根据需要添加更多的重置策略