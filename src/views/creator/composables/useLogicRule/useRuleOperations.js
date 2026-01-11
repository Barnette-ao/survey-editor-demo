export function useRuleOperations(state, elementData) {
  const { logicRules, displayedLogicRules, logicClass, deletedLogicRulesId, history } = state
  
  const getDefaultRule = () => {
    return {
      id: uuidv4(),
      ifConditions: [{
        elementId: logicClass.value === 'skipLogic' ? element.id : "",
        state: '',
        choiceIndex: "",
        score: "",
      }],
      thenCondition: {
        action: logicClass.value === 'skipLogic' ? 'jump' : 'show',
        targetElementId: logicClass.value === 'skipLogic' ? '' : element.id
      }
    }
  }
  
  const addLogicRule = () => {
    const defaultRule = getDefaultRule()
    logicRules.value.push(defaultRule)
    displayedLogicRules.value.push(defaultRule)
  }
  
  const removeLogicRule = async (index) => {
    try {
      await ElMessageBox.confirm("确定要删除该题目吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
      
      const deletedRule = displayedLogicRules.value.splice(index, 1)[0]
      const settedlogicRulesId = (questionSettings.logicRules ?? []).map(rule => rule.id)
      
      if (settedlogicRulesId.includes(deletedRule.id)) {
        deletedLogicRulesId.push(deletedRule.id)
      } else {
        const defaultRuleIdIndex = history.indexOf(deletedRule.id)
        if (defaultRuleIdIndex !== -1) {
          history.splice(defaultRuleIdIndex, 1)
        }
      }
      
      ElMessage({ type: "success", message: "删除成功" })
    } catch {
      // 用户取消删除
    }
  }
  
  const clickLogicRule = (ruleIndex) => {
    const clickedLogicRule = displayedLogicRules.value[ruleIndex].id
    if (history.length === 0) {
      history.push(clickedLogicRule)
    } else {
      const index = history.findIndex((logicRuleId) => logicRuleId && logicRuleId === clickedLogicRule)
      const isClicked = index === -1
      if (isClicked) {
        history.push(clickedLogicRule)
      }
    }
  }
  
  return {
    getDefaultRule,
    addLogicRule,
    removeLogicRule,
    clickLogicRule
  }
}