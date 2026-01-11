export function useUIInteraction(state, elementData, props) {
  const { displayedLogicRules, logicClass } = state
  const { allElements, allIfElement } = elementData
  
  const shouldCalculateDisabled = ref(false)
  const currentRuleIndex = ref(-1)
  const currentType = ref('')
  
  const disabledIndex = computed(() => {
    if (!shouldCalculateDisabled.value) return -1
    
    if (canSetLogic(currentType.value)) {
      return getDisabledIndexForSkipLogicType(currentRuleIndex.value)
    } else {
      return allElements.value.findIndex(element => props.element.id === element.id)
    }
  })
  
  const getDiabledIndex = (visible, ruleIndex, type) => {
    shouldCalculateDisabled.value = visible
    currentRuleIndex.value = ruleIndex
    currentType.value = type
  }
  
  const getLogicRuleElement = computed(() => {
    return (ruleIndex, index) => {
      if (displayedLogicRules.value.length === 0) return {}
      
      return allIfElement.value.find((item) => {
        return item.element.id === displayedLogicRules.value[ruleIndex].ifConditions[index].elementId
      })?.element
    }
  })
  
  // 其他 UI 相关的计算属性和方法...
  
  return {
    disabledIndex,
    getDiabledIndex,
    getLogicRuleElement,
    // 其他返回值...
  }
}