import type { Ref } from "vue"
import type { QuestionSettings } from "@/views/creator/types/questionnaire"
import { useDraftActions } from "@/views/creator/composables/useDraftAction"

export function useQuestionCreation(
  questionSettings: Ref<QuestionSettings>,
  currentQuestionId: Ref<string>,
  pageIndex: Ref<number>,
  isCurrentQuestionAPage: Ref<boolean>
) {
  const { applyAddPage, applyAddElement } = useDraftActions()
  
  const handleQuestionTypeClick = (elementType: string) => {
    // 题目创建逻辑
    if (elementType === "page") {
      applyAddPage({
        selectedQuestionId: currentQuestionId.value,
        pageIndex: pageIndex.value,
        isPageSelected: isCurrentQuestionAPage.value
      })
    } else {
      // 当前选中的题目改为新添加的题目
      const uiContext = applyAddElement({
        elementType: elementType,
        selectedQuestionId: currentQuestionId.value,
      })
      if (uiContext?.elementId) {
        currentQuestionId.value = uiContext.elementId
      }
    }
  }

  const handleStructrueChange = (isStructrueChanged: boolean) => {
    questionSettings.value.questionsOnPageMode = isStructrueChanged
      ? "questionPerPage"
      : "standard"
  }

  return {
    handleQuestionTypeClick,
    handleStructrueChange
  }
}
