import type { Ref } from "vue"
import { useDraftActions } from "@/views/creator/composables/useDraftAction"

export function useQuestionCreation(
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
        selectedQuestionId: currentQuestionId.value,
        elementType: elementType,
        isCurrentQuestionAPage:isCurrentQuestionAPage,
        selectedPageIndex:pageIndex.value
      })
      if (uiContext?.elementId) {
        currentQuestionId.value = uiContext.elementId
      }
    }
  }

  return {
    handleQuestionTypeClick,
  }
}
