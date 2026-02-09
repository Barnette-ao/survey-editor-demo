import { computed, ComputedRef, Ref } from 'vue'
import { 
    findLogicRulesByElementId 
} from '@/views/creator/config/logicRule/research'
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
      const rules = findLogicRulesByElementId(
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
