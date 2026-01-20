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

/**
 * 处理逻辑规则的更新
 * @param {Object} saveLogicObj - 包含新的逻辑规则信息的对象
 * @param {Object} questionSettings - 问题设置对象
 * questionSettings.logicRules表示已经在questionSettings中设置过的逻辑规则
 * 通过最新的逻辑规则saveLogicObj.logicRules和questionSettings.logicRules的比对，这样才能确认
 * 如何根据saveLogicObj.logicRules,来设置questionSettings
 * 一般会有三种操作：插入新元素，删除旧元素，修改旧元素
 */

export function handleLogicRulesUpdate(saveLogicObj, questionSettings) {
	console.log("执行handleLogicRulesUpdate")
	if (!questionSettings.value.logicRules) {
		questionSettings.value.logicRules = [];
	}

	// 定义一个通用的筛选函数
	const filterFun = (rules, property) =>
		rules.filter((rule) => saveLogicObj[property].includes(rule.id));

	if (questionSettings.value.logicRules.length === 0) {
		for (const logicRule of saveLogicObj.logicRules) {
			// 在questionSettings对每一个逻辑规则，完成设置
			setLogicRule(logicRule, questionSettings);
		}
	} else {
		// 1.从最新的逻辑规则saveLogicObj.logicRules中筛选出新插入的逻辑规则,分别插入新逻辑规则
		if (saveLogicObj.newLogicRulesId.length > 0) {
			const newRules = filterFun(saveLogicObj.logicRules, "newLogicRulesId");

			newRules.forEach((newRule) => {
				setLogicRule(newRule, questionSettings);
			});
		}

		// 2.从已设置的逻辑规则questionSettings.logicRules中筛选出删除的逻辑规则
		if (saveLogicObj.deletedLogicRulesId.length > 0) {
			const deletedRules = filterFun(questionSettings.value.logicRules, "deletedLogicRulesId");
		
			deletedRules.forEach((deletedRule) => {
				removeLogicRule(deletedRule, questionSettings);
			});
		}


		// 3.修改旧规则
		if (saveLogicObj.updatedLogicRulesId.length > 0) {
			// 3.1 从已设置的逻辑规则中筛选出修改前的规则（旧规则）
			const oldLogicRulesByUpdated = filterFun(
				questionSettings.value.logicRules,
				"updatedLogicRulesId"
			);

			// 从questionSetiing中删除（修改前的旧规则）的设置项
			oldLogicRulesByUpdated.forEach((oldRule) => {
				removeLogicRule(oldRule, questionSettings);
			});

			// 3.2 从最新的逻辑规则中筛选出修改后的逻辑规则
			const newLogicRulesByUpdated = filterFun(
				saveLogicObj.logicRules,
				"updatedLogicRulesId"
			);

			// 在questionSettings中插入（修改后的新规则）
			newLogicRulesByUpdated.forEach((newRule) => {
				setLogicRule(newRule, questionSettings);
			});
		}
	}
}


// 将单条逻辑规则，转换成相应的规则，写入questionSettings
export const setLogicRule = (logicRule, questionSettings) => {
	// 1.将logicRule添加到questionSettings.logicRules中
	if (questionSettings.value.logicRules && Array.isArray(questionSettings.value.logicRules)) {
		questionSettings.value.logicRules.push(logicRule)
	}
	// 2.根据logicRule设置questionSettings中的设置项

	// 每一条逻辑规则的则条件,如果条件有多个，则条件只有一个
	const { ifConditions, thenCondition } = logicRule;
	console.log("setLogicRule ifConditions", ifConditions)

	const expression = getLogicExpression(ifConditions, questionSettings)
	// 测试只有一个条件从句情况，或者多个条件从句情况	
	console.log("setLogicRule expression", expression)

	// 在questionSettings中设置单个逻辑规则的则条件
	setThenCondition(thenCondition, expression, questionSettings)
}

export const getLogicExpression = (ifConditions, questionSettings) => {
	let expressionList = []
	// 解析如果分句，构造expression
	// 1.如果条件分句只有一个的情况
	// 2.如果条件分句有多个的情况,每一个逻辑分句决定一个expression，用逻辑连接符号串联
	for (let i = 0; i < ifConditions.length; i++) {
		// 获取第一个逻辑分句的题目
		let ifElement = getElement(ifConditions[i].elementId, questionSettings)
		if (!ifElement) return

		// 根据如果从句的选择状态，设置表达式的值
		setExpression(ifElement, ifConditions[i], expressionList)
	}

	// 获取写到then条件里的表达式
	let expression = (expressionList.length > 1) ?
		expressionList.join(' ' + ifConditions[1].connector + ' ')
		: expressionList[0];

	return expression
}

// 设置逻辑规则的表达式
// expressionList是一个数组，用来存放表达式
export const setExpression = (ifElement, ifCondition, expressionList) => {
	const operatorMap = {
		'equal': '=',
		'lessThan': '<',
		'greaterThan': '>',
		'greaterOrEqual': '>=',
		'lesserOrEqual': '<='
	};
	let expression;
	// 如果是选中或者未选中的单选，多选，下拉，选图片
	// 多选题的条件表达式和单选，多选，下拉，选图片的条件表达式不同，
	// 多选的choiceIndex是数组，单选，多选，下拉，选图片的choiceIndex是数字
	// 多选题的条件表达式是{element1.name} = 或者 != ['choice1.value', 'choice2.value']
	// 单选，多选，下拉，选图片的条件表达式是{element1.name} = 或者 != 'choice1.value'
	if (['selected', 'notBeSelected'].includes(ifCondition.state)) {
		const operator = ifCondition.state === 'selected' ? '=' : '!='
		let choiceValue = getChoiceValue(ifElement, ifCondition.choiceIndex)
		if (Array.isArray(ifCondition.choiceIndex)) {
			expression = `{${ifElement.name}} ${operator} ['${choiceValue.join("', '")}']`
		} else {
			expression = `{${ifElement.name}} ${operator} '${choiceValue}'`
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
		}
	}

	expressionList.push(expression)
}

// 处理跳转逻辑则条件
const handleJumpCondition = (targetElementId, expression, questionSettings, thenElement) => {
	if (!questionSettings.value.triggers) {
		questionSettings.value.triggers = [];
	}

	const triggerItem = targetElementId === 'complete'
		? {
			type: "complete",
			expression
		}
		: {
			type: "skip",
			expression,
			gotoName: thenElement.name
		};

	questionSettings.value.triggers.push(triggerItem);
};

// 处理显示逻辑则条件
const handleShowCondition = (thenElement, expression) => {
	thenElement.visibleIf = expression;
};

export const setThenCondition = (thenCondition, expression, questionSettings) => {
	const { targetElementId, action } = thenCondition;

	// 获取目标元素（除了提前结束的情况）
	const thenElement = targetElementId !== 'complete'
		? getElement(targetElementId, questionSettings)
		: null;

	// 如果需要目标元素但未找到，则返回
	if (targetElementId !== 'complete' && !thenElement) {
		console.warn(`目标元素 ${targetElementId} 不存在`);
		return;
	}

	// 处理不同的操作类型
	switch (action) {
		case 'jump':
			handleJumpCondition(targetElementId, expression, questionSettings, thenElement);
			break;
		case 'show':
			handleShowCondition(thenElement, expression);
			break;
		default:
			console.warn(`不支持的操作类型: ${action}`);
	}
}

const getElement = (elementId, questionSettings) => {
	let element;
	for (const page of questionSettings.value.pages) {
		const index = page.elements.findIndex(el => el.id === elementId);
		if (index !== -1) {
			element = page.elements[index];
			break; // 找到后立即跳出循环
		}
	}
	return element
}

export const getChoiceValue = (element, choiceIndex) => {
	if (!element) return
	// 如果是多选，checkIndex为数组
	if (element.type === 'checkbox') {
		let choices = element.choices
			.filter((choice, index) => choiceIndex.includes(index))
			.map(choice => choice.value);
		return choices;
	}
	// 如果是单选或者多选题或者选图片，读取element.choices[choiceIndex].value
	// 这里有个问题需要确定如果题型是选图片， "{element1.name} =/!= choice.value"这样是否合法
	else if (['radiogroup', 'imagepicker'].includes(element.type)) {
		return element.choices[choiceIndex].value;
	}
	// 如果是下拉题型
	else return element.choices[choiceIndex]
}

// 删除已经设置过的逻辑规则questionSettings中的逻辑规则
// 1.从questionSettings.logicRules中删除
// 2.从questionSettings中删除对应的设置项
export const removeLogicRule = (removedRule, questionSettings) => {
	// 如果removedRule为undefined或者null,则中止执行函数
	if (!removedRule) return;

	// 将删除的逻辑规则从questionSettings.logicRules中删除
	if (questionSettings.value.logicRules.length !== 0) {
		const removedRuleIndex = questionSettings.value.logicRules.findIndex(rule =>
			isEqual(rule, removedRule)
		);

		if (removedRuleIndex !== -1) {
			questionSettings.value.logicRules.splice(removedRuleIndex, 1)
		}
	}

	// 从questionSettings中删除对应的设置项
	const expression = getLogicExpression(removedRule.ifConditions, questionSettings)
	console.log("removed expression", expression)

	// 如果是提前结束，对应的设置项和一般的跳转逻辑不同
	let deletedTrigger;
	switch (removedRule.thenCondition.action) {
		// 跳转
		case 'jump':
			if (removedRule.thenCondition.targetElementId === 'complete') {
				deletedTrigger = {
					"type": "complete",
					"expression": expression,
				}
			} else {
				const thenElement = getElement(removedRule.thenCondition.targetElementId, questionSettings)
				deletedTrigger = {
					"type": "skip",
					"expression": expression,
					"gotoName": `${thenElement.name}`
				}
			}
			const deletedTriggerIndex = questionSettings.value.triggers.findIndex(trigger =>
				isEqual(trigger, deletedTrigger)
			);

			if (deletedTriggerIndex !== -1) {
				questionSettings.value.triggers.splice(deletedTriggerIndex, 1)
			}

			break;
		// 显示
		case 'show':
			for (const page of questionSettings.value.pages) {
				const element = page.elements.find(
					el => el.id === removedRule.thenCondition.targetElementId);
				if (element) {
					// 需要直接从questionSettings.pages[i].elements[j]中删除visibleIf，
					// 不能用解构赋值，只能用delete删除visibleIf属性
					delete element.visibleIf
					break; // 找到后立即跳出循环
				}
			}
			break;
	}
}

// 从已设置的逻辑规则中找出和某一道题目相关的所有逻辑规则
// 前提条件：questionSettings.logicRules没有默认的规则和不完整的规则
// 获取和某一个题目相关的逻辑规则
// 如果是跳转规则，且如果条件分支中有当前元素即是
// 如果是显示规则，且显示的逻辑规则的目标元素是当前元素，即是
// 提前结束的逻辑规则，也要统计
export const getLogicRulesOfElement = (rules, elementId) => {
	return rules.filter(rule =>
		(rule.thenCondition.targetElementId === elementId
			&& rule.thenCondition.action === "show")
		|| (rule.thenCondition.action === "jump"
			&& rule.ifConditions.some(ifCondition => 
				ifCondition.elementId === elementId))
	)
}

export const getLogicRulesOfDeletedElement = (rules, elementId) => {
  return rules.filter(rule => {
    // 跳转逻辑规则
    if (rule.thenCondition.action === "jump") {
      // 触发条件包含被删除题目 OR 目标题目是被删除题目
      return rule.ifConditions.some(ifCondition => ifCondition.elementId === elementId) ||
             rule.thenCondition.targetElementId === elementId;
    }
    // 显示逻辑规则  
    else if (['show', 'hide'].includes(rule.thenCondition.action)) {
      // 触发条件包含被删除题目 OR 目标题目是被删除题目
      return rule.ifConditions.some(ifCondition => ifCondition.elementId === elementId) ||
             rule.thenCondition.targetElementId === elementId;
    }
    return false;
  });
}