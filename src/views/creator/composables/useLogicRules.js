import { computed } from 'vue'
import { getLogicRulesOfElement } from "@/views/creator/config/updateLogic"

export function useLogicRules(questionSettings) {
  // 获取元素的逻辑规则数量
  const getLogicRuleNum = computed(() => {
    return (elementId) => {
      const rules = getLogicRulesOfElement(
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