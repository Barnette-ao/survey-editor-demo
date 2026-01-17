export function useHistory() {
  const history = ref([]);

  const addUniqueHistoryItems = (ruleId) => {
    if (!history.value.includes(ruleId)) {
      history.value.push(ruleId);
    }
  }

  const filterHistoryBy = (fn) => {
    return history.value.filter(fn)
  }

  const removeHistoryItem = (ruleId) => {
    const index = history.value.indexOf(ruleId)
    if (index !== -1) {
      history.value.splice(index, 1)
    }
  }

  const resetHistory = () => {
    history.value = []
  }
  
  return {
    addUniqueHistoryItems,
    filterHistoryBy,
    removeHistoryItem,
    resetHistory,
  }
}