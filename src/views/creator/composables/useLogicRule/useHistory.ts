import { ref } from 'vue'

export function useHistory() {
   const history = ref<string[]>([])

  const addUniqueHistoryItems = (ruleId: string): void => {
    if (!history.value.includes(ruleId)) {
      history.value.push(ruleId)
    }
  }

  const filterHistoryBy = (fn: (id: string) => boolean): string[] => {
    return history.value.filter(fn)
  }

  const removeHistoryItem = (ruleId: string): void => {
    const index = history.value.indexOf(ruleId)
    if (index !== -1) {
      history.value.splice(index, 1)
    }
  }

  const resetHistory = (): void => {
    history.value = []
  }
  
  
  return {
    addUniqueHistoryItems,
    filterHistoryBy,
    removeHistoryItem,
    resetHistory,
  }
}