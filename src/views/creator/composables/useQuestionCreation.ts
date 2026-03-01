import type { Ref } from "vue"
import { useDraftActions } from "@/views/creator/composables/useDraftAction"
import { useEditorStore } from "@/stores/editorContextStore"

export function useQuestionCreation() {
  const editorStore = useEditorStore() 
  const { applyAddPage, applyAddElement } = useDraftActions()
  
  const handleQuestionTypeClick = (elementType: string) => {
    // 题目创建逻辑
    if (elementType === "page") {
      applyAddPage({
        selectedQuestionId: editorStore.currentQuestionId,
        pageIndex: editorStore.pageIndex,
        isPageSelected: editorStore.isCurrentQuestionAPage
      })
    } else {
      // 当前选中的题目改为新添加的题目
      const uiContext = applyAddElement({
        selectedQuestionId: editorStore.currentQuestionId,
        elementType: elementType,
        isCurrentQuestionAPage:editorStore.isCurrentQuestionAPage,
        selectedPageIndex:editorStore.pageIndex
      })
      if (uiContext?.elementId) {
        editorStore.setCurrentQuestionId(uiContext.elementId) 
      }
    }
  }

  return {
    handleQuestionTypeClick,
  }
}
