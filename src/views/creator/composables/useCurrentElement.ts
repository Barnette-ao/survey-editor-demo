import { computed, ComputedRef, Ref } from 'vue'
import { questionTypeList } from '@/views/creator/utils/questionTypeList'
import { useEditorStore } from '@/stores/editorContextStore'

import type {
  QuestionElement,
} from '@/views/creator/types/questionnaire' // 路径按你实际项目调整
import { snapshot } from '@/views/creator/config/shared'
import { findElementById } from '@/views/creator/config/element'

export function useCurrentElement(
  draftState: Ref<any>,
) {
  const editorStore = useEditorStore() 
  
  /** 当前选中的元素 */
  const currentElement: ComputedRef<QuestionElement | null> = computed(() => {
    const rawSettings = snapshot(draftState.value) 
    if (!editorStore.currentQuestionId) { return null}  
    const element = findElementById(editorStore.currentQuestionId,rawSettings) 
    return element
  })

  /** 当前元素的类型（内部 type，用于匹配配置） */
  const getCurrentElementType: ComputedRef<string> = computed(() => {
    if (!currentElement.value) return ''
    return currentElement.value?.type
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
