import { IfCondition, LogicRule } from "@/views/creator/types/questionnaire";
import { isEqual as lodashIsEqual } from "lodash-es";

// 判断逻辑规则是否是默认的逻辑规则,是默认规则，返回true，否则返回false
export const isDefaultRule = (rule:LogicRule) => {
	const { thenCondition, ifConditions } = rule;

	// 条件为空的判定逻辑
	const isEmptyCondition = (condition:IfCondition) =>
		condition.state === '' &&
		condition.choiceIndex === '' &&
		condition.score === '' &&
		condition.elementId !== ''

	// 检查跳转逻辑：目标 ID 为空 + 条件为空 → 默认规则
	if (
		thenCondition.action === 'jump' &&
		thenCondition.targetElementId === '' &&
		ifConditions.length === 1
	) {
		return isEmptyCondition(ifConditions[0]);
	}

	// 检查显示逻辑：目标 ID 存在 + 条件为空 → 默认规则
	if (
		thenCondition.action === 'show' &&
		thenCondition.targetElementId &&
		ifConditions.length === 1
	) {
		return isEmptyCondition(ifConditions[0]);
	}

	return false;
}

// 默认规则不是不完全规则，也就是说默认规则是一种完整的规则
// 如果是跳转逻辑，那么如果targetElementId为空，则为不完全；否则
// 遍历所有的ifConditions中的如果条件，查看如果条件是否为不完全
// ['equal', 'lessThan', 'greaterThan', 'greaterOrEqual', 'lesserOrEqual'].includes(state)
// 上述函数返回true，那么score属性若为空字符串，该规则及为不完全规则
// 上述函数返回false,那么如果['selected', 'notBeSelected'].includes(state)，
// 上述函数返回true,则若choiceIndex则为空字符串，该规则为不完全规则。
// 如果是显示规则，遍历整个ifConditions
// 如果elementId为空，则为不完全规则
// 否则，如上
// 如果是完整规则，返回true，如果是不完整规则，返回fasle
export const isCompleteRule = (rule:LogicRule) => {
	if (isDefaultRule(rule)) return true

	const { ifConditions, thenCondition } = rule

	const isCompleteItem = (condition:IfCondition) => {
		if (condition.state === '') return false
		if (['equal', 'lessThan', 'greaterThan', 'greaterOrEqual', 'lesserOrEqual']
			.includes(condition.state)) {
			return condition.score !== ''
		}
		else if (['selected', 'notBeSelected'].includes(condition.state)) {
			return condition.choiceIndex !== ''
		}
		return true
	}

	const areConditionsCompelete = (conditions:IfCondition[]) => conditions.every(isCompleteItem)

	// 跳转逻辑
	if (thenCondition.action === 'jump') {
		return thenCondition.targetElementId !== '' && areConditionsCompelete(ifConditions)
	}
	// 显示逻辑
	return ifConditions.every(condition =>
		condition.elementId !== '' && isCompleteItem(condition)
	)
}

export const isEqual = (obj1:any, obj2:any) => {
	return lodashIsEqual(obj1, obj2)
}