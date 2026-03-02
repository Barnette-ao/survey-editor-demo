import { getLogicExpression } from '@/views/creator/config/logicRule'
import { removeLogicRule } from '@/views/creator/config/logicRule'
import { findElementById } from '@/views/creator/config/element'
import type { QuestionSettings } from '@/views/creator/types/questionnaire'

/**
 * 处理逻辑规则的更新
 * @param saveLogicObj - 包含新的逻辑规则信息的对象
 * @param questionSettings - 问题设置对象
 * @returns 克隆后的问卷设置
 */
export function handleLogicRulesUpdate(saveLogicObj: any, questionSettings: any) {
    const cloned = structuredClone(questionSettings)
    
    if (!cloned.logicRules) {
        cloned.logicRules = []
    }

    const filterFun = (rules: any[], property: string) =>
        rules.filter((rule) => saveLogicObj[property].includes(rule.id))

    if (cloned.logicRules.length === 0) {
        for (const logicRule of saveLogicObj.logicRules) {
            setLogicRule(logicRule, cloned)
        }
    } else {
        // 1.从最新的逻辑规则saveLogicObj.logicRules中筛选出新插入的逻辑规则,分别插入新逻辑规则
        if (saveLogicObj.newLogicRulesId.length > 0) {
            const newRules = filterFun(saveLogicObj.logicRules, "newLogicRulesId")
            newRules.forEach((newRule: any) => {
                setLogicRule(newRule, cloned)
            })
        }

        // 2.从已设置的逻辑规则questionSettings.logicRules中筛选出删除的逻辑规则
        if (saveLogicObj.deletedLogicRulesId.length > 0) {
            const deletedRules = filterFun(
                cloned.logicRules, 
                "deletedLogicRulesId"
            )
            deletedRules.forEach((deletedRule: any) => {
                removeLogicRule(deletedRule, cloned)
            })
        }

        // 3.修改旧规则
        if (saveLogicObj.updatedLogicRulesId.length > 0) {
            // 3.1 从已设置的逻辑规则中筛选出修改前的规则（旧规则）
            const oldLogicRulesByUpdated = filterFun(
                cloned.logicRules,
                "updatedLogicRulesId"
            )
            // 从questionSetiing中删除（修改前的旧规则）的设置项
            oldLogicRulesByUpdated.forEach((oldRule: any) => {
                removeLogicRule(oldRule, cloned)
            })

            // 3.2 从最新的逻辑规则中筛选出修改后的逻辑规则
            const newLogicRulesByUpdated = filterFun(
                saveLogicObj.logicRules,
                "updatedLogicRulesId"
            )

            newLogicRulesByUpdated.forEach((newRule: any) => {
                setLogicRule(newRule, cloned)
            })
        }
    }

    return cloned
}

/**
 * 将单条逻辑规则，转换成相应的规则，写入questionSettings
 * @param logicRule - 逻辑规则对象
 * @param questionSettings - 问题设置对象
 */
const setLogicRule = (logicRule: any, questionSettings: QuestionSettings) => {
    // 1.将logicRule添加到questionSettings.logicRules中
    if (questionSettings.logicRules && Array.isArray(questionSettings.logicRules)) {
        questionSettings.logicRules.push(logicRule)
    }
    // 2.根据logicRule设置questionSettings中的设置项
    const { ifConditions, thenCondition } = logicRule
    const expression = getLogicExpression(ifConditions, questionSettings as any)
    setThenCondition(thenCondition, expression, questionSettings)
}

/**
 * 设置则条件
 * @param thenCondition - 则条件对象
 * @param expression - 表达式字符串
 * @param questionSettings - 问题设置对象
 */
const setThenCondition = (thenCondition: any, expression: string | undefined, questionSettings: QuestionSettings) => {
    const { targetElementId, action } = thenCondition
    const thenElement = targetElementId !== 'complete'
        ? findElementById(targetElementId, questionSettings)
        : null
    if (targetElementId !== 'complete' && !thenElement) {
        console.warn(`目标元素 ${targetElementId} 不存在`)
        return
    }
    switch (action) {
        case 'jump':
            handleJumpCondition(targetElementId, expression, questionSettings, thenElement)
            break
        case 'show':
            handleShowCondition(thenElement, expression)
            break
        default:
            console.warn(`不支持的操作类型: ${action}`)
    }
}

/**
 * 处理跳转逻辑则条件
 * @param targetElementId - 目标元素ID
 * @param expression - 表达式字符串
 * @param questionSettings - 问题设置对象
 * @param thenElement - 目标元素对象
 */
const handleJumpCondition = (targetElementId: string, expression: string | undefined, questionSettings: QuestionSettings, thenElement: any) => {
    if (!questionSettings.triggers) {
        questionSettings.triggers = []
    }
    const triggerItem = targetElementId === 'complete'
        ? { type: "complete", expression }
        : { type: "skip", expression, gotoName: thenElement.name }

    questionSettings.triggers.push(triggerItem as any)
}

/**
 * 处理显示逻辑则条件
 * @param thenElement - 目标元素对象
 * @param expression - 表达式字符串
 */
const handleShowCondition = (thenElement: any, expression: string | undefined) => {
    thenElement.visibleIf = expression
}
