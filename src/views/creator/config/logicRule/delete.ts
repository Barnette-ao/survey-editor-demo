import { 
    findLogicRulesByElementId 
} from '@/views/creator/config/logicRule/research'
import { LogicRule } from '../../types/questionnaire';
import { isEqual, } from "@/views/creator/config/helpers";
import { findElementById } from '@/views/creator/config/element/research'
import { getLogicExpression } from '@/views/creator/config/logicRule/expression'

export const deleteLogicRulesById = (questionSettings:any, elementId:string) => {
	// 查找删除该题目关联的逻辑规则
	const deletedRules = findLogicRulesByElementId(questionSettings.logicRules, elementId)
	deletedRules.forEach(deletedRule => {
		removeLogicRule(deletedRule, questionSettings);
	})
}

// 删除已经设置过的逻辑规则questionSettings中的逻辑规则
// 1.从questionSettings.logicRules中删除
// 2.从questionSettings中删除对应的设置项
export const removeLogicRule = (removedRule:any, questionSettings:any) => {
    if (!removedRule || !questionSettings.logicRules.length ) return;
    deleteRuleFromRules(questionSettings.logicRules, removedRule)
    deleteExpression(removedRule,questionSettings)
}

const deleteRuleFromRules = (logicRules:LogicRule[],removedRule:LogicRule) => {
    const removedRuleIndex = logicRules.findIndex(rule =>
        isEqual(rule, removedRule)
    );
    if (removedRuleIndex !== -1) { logicRules.splice(removedRuleIndex, 1)}
}

const deleteExpression = (removedRule:LogicRule,questionSettings:any) => {
    const expression = getLogicExpression(removedRule.ifConditions, questionSettings)
    switch (removedRule.thenCondition.action) {
        case 'jump':
            const deletedTrigger = createDeletedTrigger(removedRule, expression, questionSettings)
            deleteTriggerItem(deletedTrigger, questionSettings)
            break;
        case 'show':
            deleteVisibleIf(removedRule, questionSettings)
            break;
    }
}

const createDeletedTrigger = (removedRule: LogicRule, expression: string | undefined, questionSettings: any) => {
    if (removedRule.thenCondition.targetElementId === 'complete') {
        return {
            "type": "complete",
            "expression": expression,
        }
    } else {
        const thenElement = findElementById(removedRule.thenCondition.targetElementId, questionSettings)
        return {
            "type": "skip",
            "expression": expression,
            "gotoName": `${thenElement.name}`
        }
    }
}

const deleteTriggerItem = (deletedTrigger: any, questionSettings: any) => {
    const deletedTriggerIndex = questionSettings.value.triggers.findIndex((trigger: any) =>
        isEqual(trigger, deletedTrigger)
    );
    if (deletedTriggerIndex !== -1) {
        questionSettings.value.triggers.splice(deletedTriggerIndex, 1)
    }
}

const deleteVisibleIf = (removedRule: LogicRule, questionSettings: any) => {
    const element = findElementById(removedRule.thenCondition.targetElementId, questionSettings)
    if (element) {
        // 不能用解构赋值，只能用delete删除visibleIf属性
        delete element.visibleIf
    }    
} 