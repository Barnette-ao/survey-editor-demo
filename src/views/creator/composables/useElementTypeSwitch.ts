import type { Ref } from "vue"
import {
  getSwitchTargetElement,
} from "@/views/creator/config/element/create"
import { replaceElement } from "@/views/creator/config/element/update"
import type { 
    QuestionElement, 
    QuestionSettings 
} from "@/views/creator/types/questionnaire"

export function useElementTypeSwitch(
  questionSettings: Ref<QuestionSettings>,
  currentQuestionId: Ref<string>,
  currentElement: Ref<QuestionElement | null>
) {
  // 切换题目类型  
  const switchQuestionType = (newType: QuestionElement["type"]) => {
    if (!currentElement.value) return
    // 题目类型切换逻辑
    const newElement = getSwitchTargetElement(
      newType,
      questionSettings,
      currentElement.value
    ) as QuestionElement

    replaceElement(questionSettings.value, currentQuestionId.value, newElement)
    // 更新当前选中的题目ID
    currentQuestionId.value = newElement.id
  }

  return {
    switchQuestionType
  }
}
