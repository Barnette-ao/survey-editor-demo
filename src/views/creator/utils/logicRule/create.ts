import type { QuestionElement, LogicRule } from '@/views/creator/types/questionnaire'

// 提取初始化逻辑为函数
export const initializeDisplayedLogicRules = (
  element: QuestionElement, 
  logicRules: LogicRule[], 
  logicClass: 'skipLogic' | 'visibleLogic',
  allElements: QuestionElement[]
): LogicRule[] => {    
    if (!element) return []
    
    if (!logicRules?.length) return []

    const validRules = logicRules
      // 深拷贝logicRules,避免修改validRules污染logicRules
      .map(rule => JSON.parse(JSON.stringify(rule)) as LogicRule)
      // 过滤目标题目不存在（被删除）的逻辑规则
      .filter(rule => {
        const targetId = rule.thenCondition.targetElementId
        if (!targetId || targetId === 'complete') return true
        return allElements.some(el => el.id === targetId)
      })
      // 过滤掉不属于当前类型的逻辑规则
      .filter(rule => {
        if (logicClass === 'skipLogic') {
          return rule.thenCondition.action === 'jump' &&
                 rule.ifConditions.some(ifrule => ifrule.elementId === element.id)
        } else {
          return ['show', 'hide'].includes(rule.thenCondition.action) &&
                 rule.thenCondition.targetElementId === element.id
        }
      }) 
    return validRules
  }