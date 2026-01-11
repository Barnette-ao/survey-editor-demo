export function useConditionManager(state, elementData) {
  const { displayedLogicRules } = state
  const { allIfElement } = elementData
  
  const addIfCondition = (rule) => {
    rule.ifConditions.push({
      connector: (rule.ifConditions[1] && rule.ifConditions[1].connector) || 'or',
      state: '',
      choiceIndex: "",
      score: "",
    })
  }
  
  const removeIfCondition = (rule, index) => {
    rule.ifConditions.splice(index, 1)
  }
  
  const changeIfCoditionElement = (elementId, ruleIndex, index) => {
    displayedLogicRules.value[ruleIndex].ifConditions[index].state = ''
    const element = allIfElement.value.find(item => item.element.id === elementId)?.element
    
    if (element) {
      displayedLogicRules.value[ruleIndex].ifConditions[index].elementId = elementId
    }
  }
  
  const changeIfCoditionState = (state, ruleIndex, index) => {
    displayedLogicRules.value[ruleIndex].ifConditions[index].state = state
    displayedLogicRules.value[ruleIndex].ifConditions[index].choiceIndex = ""
  }
  
  return {
    addIfCondition,
    removeIfCondition,
    changeIfCoditionElement,
    changeIfCoditionState
  }
}