import { computed, ComputedRef, Ref } from 'vue'
import { questionTypeList } from '@/views/creator/utils/questionTypeList'
import { ratingTypeMap } from '@/views/creator/config/registry'
import type {
  QuestionSettings,
  QuestionElement,
  RatingElement
} from '@/views/creator/types/questionnaire' // 路径按你实际项目调整

export function useCurrentElement(
  questionSettings: Ref<QuestionSettings | null>,
  currentQuestionId: Ref<string | null>
) {
  /** 当前选中的元素 */
  const currentElement: ComputedRef<QuestionElement | null> = computed(() => {
    const pages = questionSettings.value?.pages
    if (!pages || !currentQuestionId.value) {
      return null
    }

    const allElements = pages.flatMap((page) => page.elements)

    return (
      allElements.find(
        (element) => element.id === currentQuestionId.value
      ) ?? null
    )
  })

  /** 当前元素的类型（内部 type，用于匹配配置） */
  const getCurrentElementType: ComputedRef<string> = computed(() => {
    const element = currentElement.value
    if (!element) return ''
    return element.type
  })

  /** 当前元素类型对应的文本（用于 UI 展示） */
  const getCurrentElementTypeText: ComputedRef<string> = computed(() => {
    const type = getCurrentElementType.value
    if (!type) return ''

    const questionType = questionTypeList
      .flatMap((group) => group.list)
      .find((item) => item.type === type)

    return questionType?.text ?? ''
  })

  return {
    currentElement,
    getCurrentElementType,
    getCurrentElementTypeText
  }
}
