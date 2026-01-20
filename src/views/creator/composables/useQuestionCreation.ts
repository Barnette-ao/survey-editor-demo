import type { Ref } from "vue"
import type { QuestionSettings } from "@/views/creator/types/questionnaire"

import {
  addQuestionElement,
  addPage,
} from "@/views/creator/config/handleElementAndPage"

export function useQuestionCreation(
  questionSettings: Ref<QuestionSettings>,
  currentQuestionId: Ref<string>,
  pageIndex: Ref<number>,
  isCurrentQuestionAPage: Ref<boolean>
) {
  const handleQuestionTypeClick = (elementType: string) => {
    // 题目创建逻辑
    if (elementType === "page") {
      addPage(
        questionSettings,
        currentQuestionId.value,
        pageIndex.value,
        isCurrentQuestionAPage.value
      )
    } else {
      // 当前选中的题目改为新添加的题目
      currentQuestionId.value = addQuestionElement(
        questionSettings,
        elementType,
        currentQuestionId.value
      )
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
