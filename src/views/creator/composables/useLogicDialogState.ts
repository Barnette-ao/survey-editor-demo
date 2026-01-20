import { ref } from 'vue'
import type { QuestionElement } from '@/views/creator/types/questionnaire'

export function useLogicDialogState() {
  const logicDialogVisible = ref(false)
  const settedLogicElement = ref<QuestionElement | null >(null)

  const openLogicDialog = (element: QuestionElement) => {
    settedLogicElement.value = element
    logicDialogVisible.value = true
  }

  const closeLogicDialog = () => {
    logicDialogVisible.value = false
  }

  return {
    logicDialogVisible,
    settedLogicElement,
    openLogicDialog,
    closeLogicDialog
  }
}
