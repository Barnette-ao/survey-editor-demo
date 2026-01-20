import { ref } from 'vue'
import type { 
  QuestionElement, LogicRule, IfCondition
} from '@/views/creator/types/questionnaire.ts'


export function useDisplayLogicRules(
  allElements: { value: QuestionElement[] },
  getDefaultRule: () => LogicRule
) {  
  // displayedLogicRules是依赖于filteredRules的
  const displayedLogicRules = ref<LogicRule[]>([])
  
  // 提取初始化逻辑为函数
  const initializeDisplayedLogicRules = (element:QuestionElement, logicRules: LogicRule[] | undefined, logicClass: 'skipLogic' | 'visibleLogic'): void => {
    if (!element || !logicRules) {
      return
    }

    const validRules = logicRules
      // 深拷贝logicRules,避免修改validRules污染logicRules
      .map(rule => JSON.parse(JSON.stringify(rule)) as LogicRule)
      // 过滤目标题目不存在（被删除）的逻辑规则
      .filter(rule => {
        const targetId = rule.thenCondition.targetElementId
        if (!targetId || targetId === 'complete') return true
        return allElements.value.some(element => element.id === targetId)
      })
      // 过滤掉不属于当前类型的逻辑规则
      .filter(rule => {
        if (logicClass === 'skipLogic') {
          return rule.thenCondition.action === 'jump' &&
                 rule.ifConditions.some(ifrule => ifrule.elementId === element.id)
        } else {
          return ['show', 'hide'].includes(rule.thenCondition.action) &&
                 rule.thenCondition.targetElementId === element.id
        }
      }) 

    // 已有逻辑规则中没有符合要求的，则显示一条默认逻辑规则单元
    if (validRules.length === 0) {
      const defaultRule = getDefaultRule()
      displayedLogicRules.value = [defaultRule]
    }
    // 反之，则显示这些逻辑规则 
    else {
      displayedLogicRules.value = validRules
    }
  }

  const getDisplayRuleProp = (ruleIndex: number, prop: keyof LogicRule): any => {
    return displayedLogicRules.value[ruleIndex]?.[prop]
  }

  const getDisplayRuleIfElementProp = (
    ruleIndex: number, 
    conditionIndex: number, 
    prop: keyof IfCondition
  ): any => {
    return displayedLogicRules.value[ruleIndex]?.ifConditions?.[conditionIndex]?.[prop]
  }

  const setDisplayRuleIfElementProp = (
    ruleIndex: number, 
    conditionIndex: number, 
    prop: keyof IfCondition, 
    value: any
  ): void => {
    if (displayedLogicRules.value[ruleIndex]?.ifConditions?.[conditionIndex]) {
      displayedLogicRules.value[ruleIndex].ifConditions[conditionIndex][prop] = value
    }
  }

  const getDeletedDisplayRule = (index: number): LogicRule => {
    return displayedLogicRules.value.splice(index, 1)[0]
  }

  const isDisplayRuleEmpty = (): boolean => {
    return displayedLogicRules.value.length === 0
  }

  // 改变如果条件从句的题目元素
  const changeIfCoditionElement = (elementId: string, ruleIndex: number, index: number): void => {
    // 改变如果条件的题目，则重置选择状态
    setDisplayRuleIfElementProp(ruleIndex, index, 'state', '')
    // 重置题目的id
    setDisplayRuleIfElementProp(ruleIndex, index, 'elementId', elementId)
  }

  // 改变如果条件从句的条件选择状态
  const changeIfCoditionState = (state: string, ruleIndex: number, index: number): void => {
    // 设置条件选择状态
    console.log("changeIfCoditionState执行这里")
    setDisplayRuleIfElementProp(ruleIndex, index, 'state', state)
    // 重置选项选择下拉框
    setDisplayRuleIfElementProp(ruleIndex, index, 'choiceIndex', '')
  }

  // 获取设置跳转逻辑时的禁用索引
  const getMaxConditionIndex = (ruleIndex: number): number => {
    let maxIndex = -1
    ;(displayedLogicRules.value[ruleIndex]?.ifConditions ?? []).forEach(
      ifCondition => {
        const index = allElements.value.findIndex(
          element => ifCondition.elementId === element.id
        )
        maxIndex = Math.max(maxIndex, index)
    })
    console.log("maxIndex", maxIndex)
    return maxIndex
  }

  return {
    displayedLogicRules,
    initializeDisplayedLogicRules,
    getDisplayRuleProp,
    getDeletedDisplayRule,
    setDisplayRuleIfElementProp,
    getDisplayRuleIfElementProp,
    isDisplayRuleEmpty,
    changeIfCoditionElement,
    changeIfCoditionState,
    getMaxConditionIndex
  }
}