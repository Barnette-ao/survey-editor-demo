import type { Ref } from 'vue'
import type {
  QuestionSettings,
  QuestionElement,
} from '@/views/creator/types/questionnaire'
import { 
  updateElementProp
} from '@/views/creator/config/element'

export function useElementMutation(
  questionSettings: Ref<QuestionSettings>,
  currentQuestionId: Ref<string>
) {
  // 统一更新题目元素字段
  const updateElementField = <
    K extends keyof QuestionElement
  >(
    key: K,
    value: QuestionElement[K]
  ) => {
    const result = updateElementProp(
      questionSettings.value,
      currentQuestionId.value,
      key,
      value
    )
    
    if (!result) return
    
    // 更新问卷设置
    questionSettings.value = result.cloned
    
    // 如果返回了新的ID（数组情况），更新当前问题ID
    if (result.id) {
      currentQuestionId.value = result.id
    }
  }

  return {
    updateElementField
  }
}
