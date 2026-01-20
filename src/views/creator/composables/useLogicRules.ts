import { computed, ComputedRef, Ref } from 'vue'
import { getLogicRulesOfElement } from '@/views/creator/config/updateLogic'

import type { QuestionSettings } from '@/views/creator/types/questionnaire' // 路径按你项目调整

export function useLogicRules(
  questionSettings: Ref<QuestionSettings | null>
) {
  /**
   * 获取某个元素关联的逻辑规则数量
   */
  const getLogicRuleNum: ComputedRef<
    (elementId: string) => number
  > = computed(() => {
    return (elementId: string): number => {
      const rules = getLogicRulesOfElement(
        questionSettings.value?.logicRules ?? [],
        elementId
      )
      return rules.length
    }
  })

  return {
    getLogicRuleNum
  }
}
