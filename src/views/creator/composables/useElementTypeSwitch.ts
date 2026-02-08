import type { Ref } from "vue"
import {
  removeLogicRulesOfDeletedRule
} from "@/views/creator/config/handleElementAndPage"
import {
  getSelectedElementPosition,
} from "@/views/creator/config/element/research"
import {
  getSwitchTargetElement,
} from "@/views/creator/config/element/getSwitchTargetElement"
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

    const { pageIndex, elementIndex } =
      getSelectedElementPosition(
        questionSettings,
        currentQuestionId.value
      )

    if (pageIndex === undefined || elementIndex === undefined) return
    
    removeLogicRulesOfDeletedRule(questionSettings, currentQuestionId.value)
    
    questionSettings.value.pages[pageIndex].elements.splice(
      elementIndex,
      1,
      newElement
    )
    // 更新当前选中的题目ID
    currentQuestionId.value = newElement.id
  }

  return {
    switchQuestionType
  }
}
