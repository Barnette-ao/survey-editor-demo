import { Ref } from 'vue'
import type { 
  QuestionElement, LogicRule, IfCondition
} from '@/views/creator/types/questionnaire.ts'


export function useDisplayLogicRules(
  allElements: QuestionElement[],
  displayedLogicRules:Ref<LogicRule[]> 
) { 
   
  // displayedLogicRules是依赖于filteredRules的
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
    setDisplayRuleIfElementProp(ruleIndex, index, 'state', state)
    // 重置选项选择下拉框
    setDisplayRuleIfElementProp(ruleIndex, index, 'choiceIndex', '')
  }

  // 获取设置跳转逻辑时的禁用索引
  const getMaxConditionIndex = (ruleIndex: number): number => {
    let maxIndex = -1
    ;(displayedLogicRules.value[ruleIndex]?.ifConditions ?? []).forEach(
      ifCondition => {
        const index = allElements.findIndex(element => 
          ifCondition.elementId === element.id
        )
        maxIndex = Math.max(maxIndex, index)
    })
    return maxIndex
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

  return {
    getDisplayRuleProp,
    getDeletedDisplayRule,
    getDisplayRuleIfElementProp,
    isDisplayRuleEmpty,
    changeIfCoditionElement,
    changeIfCoditionState,
    getMaxConditionIndex
  }
}