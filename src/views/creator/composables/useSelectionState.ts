import { ref } from 'vue'

export function useSelectionState(options: {
  onSelectPage?: () => void
  onSelectQuestion?: () => void
}) {
  const isCurrentQuestionAPage = ref(false)
  const pageIndex = ref(-1)

  const selectPage = (index: number) => {
    isCurrentQuestionAPage.value = true
    pageIndex.value = index
    options.onSelectPage?.()
  }

  const selectQuestion = (id: string) => {
    isCurrentQuestionAPage.value = false
    pageIndex.value = -1
    options.onSelectQuestion?.()
    return id
  }

  return {
    isCurrentQuestionAPage,
    pageIndex,
    selectPage,
    selectQuestion
  }
}
