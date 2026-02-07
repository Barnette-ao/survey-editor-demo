import type { Ref } from "vue"
import {
  getSelectedElementPosition,
  switchElementByType,
  removeLogicRulesOfDeletedRule
} from "@/views/creator/config/handleElementAndPage"
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
    const newElement = switchElementByType(
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
    // 删除与被切换的题目元素关联的所有逻辑规则
    removeLogicRulesOfDeletedRule(questionSettings, currentQuestionId.value)
    // 替换元素并触发响应式更新
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
