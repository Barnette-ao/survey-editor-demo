const getLogicRules = () => {
	let logicRules = []
	let skipExpressions = [] // 辅助变量，用来保存跳转逻辑的expression

	// 遍历跳转逻辑
	parsingSkipLogic(logicRules, skipExpressions, props.questionSettings, allElements.value)
	// 遍历显示，隐藏逻辑规则
	parsingHideAndShowLogic(logicRules, skipExpressions, allElements.value)

	// console.log("logicRules222", logicRules)
	return logicRules  // 确保返回值
}



// 问卷是否设置了触发器
export const parsingSkipLogic = (logicRules, skipExpressions, questionSettings, allElements) => {
	if (questionSettings.value.hasOwnProperty('triggers')) {
		// 遍历每一个触发器
		for (const trigger of questionSettings.value.triggers) {
			// 找出跳转触发器 
			if (trigger.type === 'skip') {
				// 根据gotoName查找跳转目标题目元素
				const targetElement = allElements.find(element => element.name === trigger.gotoName)

				if (targetElement) {
					skipExpressions.push(trigger.expression)
					// 根据跳转触发器的表达式，解析如果条件和则条件
					logicRules.push({
						ifConditions: setIfCondition(trigger.expression, allElements),
						thenConditions: [{
							action: 'jump',
							targetElementId: targetElement.id
						}]
					})
				}
			}
		}
	}
	return logicRules
}

// 遍历所有可能的题目元素，查找元素中有没有visibleIf属性,有就说明这是targetElement
export const parsingHideAndShowLogic = (logicRules, skipExpressions, allElements) => {
	const targetElementList = allElements.filter(element => element.hasOwnProperty('visibleIf'))

	//遍历targetElementList的每一个元素，如果visibleIf值的第一个字符是!, 则状态为隐藏，没有！为显示，不能对同一道题目既设置隐藏又设置显示
	for (const targetElement of targetElementList) {
		let action = targetElement.visibleIf[0] === '!' ? 'hide' : 'show'
		// thenElement.visibleIf = expression 或者 thenElement.visibleIf = !expression
		// 获取expression
		let expression = targetElement.visibleIf[0] === '!'
			? targetElement.visibleIf.substring(1)
			: targetElement.visibleIf;

		// 检索跳转逻辑中解析过的expression
		let index = skipExpressions.findIndex(exp => exp && expression === exp)
		// index不为-1,表明跳转逻辑中已经解析过expression，expression作为如果条件，存在多个则状态
		// 其中包含跳转状态。expression解析出来的ifCondition为logicRules[index].ifConditions
		if (index !== -1) {
			logicRules[index].thenConditions.push({
				action: action,
				targetElementId: targetElement.id
			})
		}
		// index为-1，表示expression是一条新的条件从句，需要计算
		else {
			const ifCondition = setIfCondition(expression, allElements)
			if (ifCondition.every(element => element === undefined)) {
				return
			}
			logicRules.push({
				ifConditions: setIfCondition(expression, allElements),
				thenConditions: [{
					action: action,
					targetElementId: targetElement.id
				}]
			})
		}
	}
	return logicRules
}


const setIfCondition = (expression, allElements) => {

	// 是否是多个条件组合，条件连接符是或还是且
	const includesOr = expression.includes('or')
	const includesAnd = expression.includes('and')

	let ifConditionList;
	// 只有单独一个如果条件，没有多个如果条件组合
	if (!includesOr && !includesAnd) {
		const ifCondition = classifyCondition(expression, allElements)
		ifConditionList = [];
		ifConditionList.push(ifCondition)
	}
	// 有多个如果条件，连接词是或
	// 有多个如果条件，连接词是且
	// 设计上不会出现既有或连接词又有且连接词组成的如果条件
	else {
		let expressionList = (includesOr && !includesAnd)
			? expression.split('or')
			: expression.split('and')

		ifConditionList = expressionList.map(expression => {
			// 去掉可能存在的空格，否则无法匹配正则表达式
			let formatedExpression = expression.replace(/\s+/g, " ").trim()
			return classifyCondition(formatedExpression, allElements)
		})

		// 设置条件连接符
		ifConditionList = ifConditionList.map((ifCondition, index) => {
			// 第一个条件从句不设置connector属性
			if (index < 1) return ifCondition
			// 之后所有的条件从句，都要设置connector属性
			else {
				return {
					connector: (includesOr && !includesAnd) ? 'or' : 'and',
					...ifCondition
				}
			}
		})

	}

	// console.log("ifConditionList", ifConditionList)
	return ifConditionList

}

const setIfConditionOfChoice = (expression, expressionConnector, allElements, state) => {
	let choiceIndex;
	const questionName = expression.split(expressionConnector)[0].replace(/[{}]/g, '').trim()
	const choiceValue = expression.split(expressionConnector)[1].replace(/['']/g, '').trim()
	// 根据name属性查找element,可能name属性的值会重复，可能出bug
	const element = allElements.find(element => element && element.name === questionName)
	// 如果是单选，多选
	if (['radiogroup', 'checkbox'].includes(element.type)) {
		choiceIndex = element.choices.findIndex(element => element && element.value === choiceValue)
	} else {
		choiceIndex = element.choices.findIndex(element => element && element === choiceValue)
	}

	return {
		elementId: element.id,
		state: state,
		choiceIndex: choiceIndex,
		element: element,
		score: "",
	}
}

const setIfConditionOfRating = (expression, expressionConnector, allElements, state) => {
	const questionName = expression.split(expressionConnector)[0].replace(/[{}]/g, '').trim()
	const element = allElements.find(element => element && element.name === questionName)
	const score = expression.split(expressionConnector)[1].trim()

	return {
		elementId: element.id,
		state: state,
		choiceIndex: '',
		element: element,
		score: score,
	}
}

const setIfConditionOfAnswered = (expression, expressionConnector, allElements, state) => {
	const questionName = expression.split(expressionConnector)[0].replace(/[{}]/g, '').trim()
	const element = allElements.find(element => element && element.name === questionName)

	return {
		elementId: element.id,
		state: state,
		choiceIndex: '',
		element: element,
		score: '',
	}
}

const classifyCondition = (expression, allElements) => {
	// 选中 {Q1} = '选项1'
	if (/^\{\s*\w+\s*\} = '[\s\S]+'$/.test(expression)) {
		let state = "selected";
		return setIfConditionOfChoice(expression, '=', allElements, state)
	}
	// 未选中 {Q1} != '选项1'
	else if (/^\{\s*\w+\s*\} != '[\s\S]+'$/.test(expression)) {
		let state = "notBeSelected";
		return setIfConditionOfChoice(expression, '!=', allElements, state);
	}
	// 量表，打分，评价 {Q1} = 1
	else if (/^\{\s*\w+\s*\} = \d+$/.test(expression)) {
		let state = "equal";
		return setIfConditionOfRating(expression, '=', allElements, state)
	}
	// 量表，打分，评价 {Q1} > 1
	else if (/^\{\s*\w+\s*\} > \d+$/.test(expression)) {
		let state = "greaterThan";
		return setIfConditionOfRating(expression, '>', allElements, state)
	}
	// 量表，打分，评价 {Q1} < 1
	else if (/^\{\s*\w+\s*\} < \d+$/.test(expression)) {
		let state = "lessThan";
		return setIfConditionOfRating(expression, '<', allElements, state);
	}
	// 量表，打分，评价 {Q1} >= 1 
	else if (/^\{\s*\w+\s*\} >= \d+$/.test(expression)) {
		let state = "greaterOrEqual";
		return setIfConditionOfRating(expression, '>=', allElements, state);
	}
	// 量表，打分，评价 {Q1} <= 3
	else if (/^\{\s*\w+\s*\} <= \d+$/.test(expression)) {
		let state = "lesserOrEqual";
		return setIfConditionOfRating(expression, '<=', allElements, state);
	}
	// 已答 {Q1} notempty
	else if (/^\{\s*\w+\s*\} notempty$/.test(expression)) {
		let state = "answered";
		return setIfConditionOfAnswered(expression, ' ', allElements, state)
	}
}