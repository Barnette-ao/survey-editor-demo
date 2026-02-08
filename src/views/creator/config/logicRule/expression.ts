import { getElement } from '@/views/creator/config/element/research'

/**
 * 获取逻辑表达式
 * @param ifConditions - 如果条件数组
 * @param questionSettings - 问题设置对象
 * @returns 逻辑表达式字符串
 */
export const getLogicExpression = (ifConditions: any[], questionSettings: any): string | undefined => {
	let expressionList: string[] = []
	// 解析如果分句，构造expression
	// 1.如果条件分句只有一个的情况
	// 2.如果条件分句有多个的情况,每一个逻辑分句决定一个expression，用逻辑连接符号串联
	for (let i = 0; i < ifConditions.length; i++) {
		let ifElement = getElement(ifConditions[i].elementId, questionSettings)
		if (!ifElement) return
		setExpression(ifElement, ifConditions[i], expressionList)
	}

	let expression = (expressionList.length > 1) ?
		expressionList.join(' ' + ifConditions[1].connector + ' ')
		: expressionList[0];

	return expression
}

/**
 * 设置逻辑规则的表达式
 * @param ifElement - 如果条件元素
 * @param ifCondition - 如果条件对象
 * @param expressionList - 表达式列表数组
 */
export const setExpression = (ifElement: any, ifCondition: any, expressionList: string[]): void => {
	const operatorMap: Record<string, string> = {
		'equal': '=',
		'lessThan': '<',
		'greaterThan': '>',
		'greaterOrEqual': '>=',
		'lesserOrEqual': '<='
	};
	let expression: string;
	// 如果是选中或者未选中的单选，多选，下拉，选图片
	// 多选题的条件表达式和单选，多选，下拉，选图片的条件表达式不同，
	// 多选的choiceIndex是数组，单选，多选，下拉，选图片的choiceIndex是数字
	// 多选题的条件表达式是{element1.name} = 或者 != ['choice1.value', 'choice2.value']
	// 单选，多选，下拉，选图片的条件表达式是{element1.name} = 或者 != 'choice1.value'
	if (['selected', 'notBeSelected'].includes(ifCondition.state)) {
		const operator = ifCondition.state === 'selected' ? '=' : '!='
		let choiceValue = getChoiceValue(ifElement, ifCondition.choiceIndex)
		if (Array.isArray(ifCondition.choiceIndex)) {
			expression = `{${ifElement.name}} ${operator} ['${(choiceValue as string[]).join("', '")}']`
		} else {
			expression = `{${ifElement.name}} ${operator} '${choiceValue as string}'`
		}
	}
	// 如果是已答的情况
	else if (ifCondition.state === 'answered') {
		expression = `{${ifElement.name}} notempty`
	}
	// 如果是等于，小于，大于，大于等于，小于等于的情况	
	else {
		if (operatorMap.hasOwnProperty(ifCondition.state)) {
			expression = `{${ifElement.name} } ${operatorMap[ifCondition.state]} ${ifCondition.score}`
		} else {
			expression = ''
		}
	}

	expressionList.push(expression)
}

/**
 * 获取选项值
 * @param element - 元素对象
 * @param choiceIndex - 选项索引（可能是数字或数组）
 * @returns 选项值（字符串或字符串数组）
 */
export const getChoiceValue = (element: any, choiceIndex: number | number[]): string | string[] | undefined => {
	if (!element) return
	// 如果是多选，checkIndex为数组
	if (element.type === 'checkbox') {
		let choices = element.choices
			.filter((choice: any, index: number) => (choiceIndex as number[]).includes(index))
			.map((choice: any) => choice.value);
		return choices;
	}
	// 如果是单选或者多选题或者选图片，读取element.choices[choiceIndex].value
	// 这里有个问题需要确定如果题型是选图片， "{element1.name} =/!= choice.value"这样是否合法
	else if (['radiogroup', 'imagepicker'].includes(element.type)) {
		return element.choices[choiceIndex as number].value;
	}
	// 如果是下拉题型
	else return element.choices[choiceIndex as number]
}
