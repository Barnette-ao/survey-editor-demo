// 保存逻辑设置，重要的是获取则条件分句后的题目targetElement，知道这个题目，就要在对应这道题的对象中，添加一些属性
// 则条件分句的选择状态将决定添加那个属性。如果是显示或者隐藏，则添加visible，如果是跳转则不添加任何属性，
// 而是在questionSettings中添加一个triggers的属性，基础模版是
// "triggers": [{
//   "type": "skip",
//	 "expression": "{element1.name} != choice.value",
//	 "gotoName": "element2.name"
//  }]
// "gotoName"表示跳转到的题目，targetElement
// "expression"表示跳转条件，也就是根据如果条件分句解析出来
//
// logicRules不能再是包含所有逻辑规则的数组，只是单个题目相关的跳转逻辑和显示隐藏逻辑
// logicRules是一个逻辑对象，id属性，ifConditions属性和thenCondition属性
import {
	isEqual,
} from "@/views/creator/config/helpers";
import { getLogicExpression, setExpression, getChoiceValue } from "@/views/creator/config/logicRule/expression";
import { findElementById } from "@/views/creator/config/element/research";
import { handleLogicRulesUpdate } from "@/views/creator/config/logicRule/update";

/**
 * 处理逻辑规则的更新
 * @param {Object} saveLogicObj - 包含新的逻辑规则信息的对象
 * @param {Object} questionSettings - 问题设置对象
 * questionSettings.logicRules表示已经在questionSettings中设置过的逻辑规则
 * 通过最新的逻辑规则saveLogicObj.logicRules和questionSettings.logicRules的比对，这样才能确认
 * 如何根据saveLogicObj.logicRules,来设置questionSettings
 * 一般会有三种操作：插入新元素，删除旧元素，修改旧元素
 */

/**
 * 处理逻辑规则的更新 (wrapper function)
 * @param {Object} saveLogicObj - 包含新的逻辑规则信息的对象
 * @param {Object} questionSettings - 问题设置对象
 */
export function handleLogicRulesUpdateWrapper(saveLogicObj, questionSettings) {
	const cloned = handleLogicRulesUpdate(saveLogicObj, questionSettings.value)
	questionSettings.value = cloned
}

// 从已设置的逻辑规则中找出和某一道题目相关的所有逻辑规则
// 前提条件：questionSettings.logicRules没有默认的规则和不完整的规则
// 获取和某一个题目相关的逻辑规则
// 如果是跳转规则，且如果条件分支中有当前元素即是
// 如果是显示规则，且显示的逻辑规则的目标元素是当前元素，即是
// 提前结束的逻辑规则，也要统计
export const getLogicRulesByElementId = (rules, elementId) => {
	return rules.filter(rule =>
		(rule.thenCondition.targetElementId === elementId
			&& rule.thenCondition.action === "show")
		|| (rule.thenCondition.action === "jump"
			&& rule.ifConditions.some(ifCondition => 
				ifCondition.elementId === elementId))
	)
}

