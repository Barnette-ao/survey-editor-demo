import type { 
  LogicRule 
} from '@/views/creator/types/questionnaire'


export const findLogicRulesByElementId = (rules:LogicRule[], elementId:string) => {
  return rules.filter(rule => {
    if (rule.thenCondition.action === "jump") {
      return rule.ifConditions.some(
                ifCondition => ifCondition.elementId === elementId) 
          || rule.thenCondition.targetElementId === elementId;
    }
    else if (['show', 'hide'].includes(rule.thenCondition.action)) {
      return rule.ifConditions.some(
                ifCondition => ifCondition.elementId === elementId) 
          || rule.thenCondition.targetElementId === elementId;
    }
    return false;
  });
}