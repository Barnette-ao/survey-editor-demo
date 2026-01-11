export function useRuleValidation(state, props) {
  const { logicRules, history, deletedLogicRulesId, logicClass } = state
  
  const classifyHistory = () => {
    const removeDefaultRules = (rules) => rules.filter(rule => rule && !isDefaultRule(rule))
    const removeDeletedRule = (rules) => rules.filter(rule => rule && !deletedLogicRulesId.includes(rule.id))
    
    const removedDeletedHistory = (history ?? []).filter(item => !deletedLogicRulesId.includes(item))
    
    logicRules.value = removeDeletedRule(logicRules.value)
    
    if (removedDeletedHistory.length === 0) {
      logicRules.value = removeDefaultRules(logicRules.value)
      return { newLogicRulesId: [], updatedLogicRulesId: [] }
    }
    
    logicRules.value = removeDefaultRules(logicRules.value)
    
    const removedDefaultHistory = removedDeletedHistory
      .map((ruleId) => logicRules.value.find(rule => rule && rule.id === ruleId))
      .filter(Boolean)
      .filter(rule => !isDefaultRule(rule))
      .map(rule => rule.id)
    
    const settedlogicRulesId = (props.questionSettings.logicRules ?? [])
      .filter(rule => {
        const isShowAction = rule.thenCondition.action === "show"
        return logicClass.value === 'skipLogic' ? !isShowAction : isShowAction
      })
      .map(rule => rule.id)
    
    const newLogicRulesId = removedDefaultHistory.filter(ruleId => !settedlogicRulesId.includes(ruleId))
    
    const updatedLogicRulesId = removedDefaultHistory
      .filter(ruleId => !newLogicRulesId.includes(ruleId))
      .map(ruleId => logicRules.value.find(rule => rule && rule.id === ruleId))
      .filter(rule => !(settedlogicRulesId).some((logicRuleId) => {
        const existingRule = props.questionSettings.logicRules.find(r => r.id === logicRuleId)
        return isEqual(existingRule, rule)
      }))
      .map(rule => rule.id)
    
    return { newLogicRulesId, updatedLogicRulesId }
  }
  
  const validateRules = () => {
    const incompleteRules = logicRules.value.filter(rule => !isCompleteRule(rule))
    
    if (incompleteRules.length > 0) {
      ElMessage({
        type: 'warning',
        message: `有规则不完整，请完善后再保存`,
        duration: 3000
      })
      return false
    }
    return true
  }
  
  return {
    classifyHistory,
    validateRules
  }
}