import type { 
  LogicRule 
} from '@/views/creator/types/questionnaire'

// 
export const findLogicRulesByElementId = (rules: LogicRule[], elementId: string) => {
  return rules.filter(rule => {
    // 检查该元素是否在条件中
    const isInConditions = rule.ifConditions.some(
      ifCondition => ifCondition.elementId === elementId
    );
    
    // 检查该元素是否是目标
    const isTarget = rule.thenCondition.targetElementId === elementId;
    
    // 只要元素在条件中或作为目标，就应该删除这条规则
    return isInConditions || isTarget;
  });
}
