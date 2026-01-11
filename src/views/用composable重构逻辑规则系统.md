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

```vue
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