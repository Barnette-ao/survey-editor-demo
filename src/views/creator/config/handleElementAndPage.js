import { questionTemplates } from "@/views/creator/config/componentAndSettingMap";
import { cloneElement, isEqual, formattedNumber } from "@/views/creator/config/helpers";
import { v4 as uuidv4 } from 'uuid'
import { removeLogicRule, getLogicRulesOfElement } from "@/views/creator/config/updateLogic";

export const addEmptyPageBeforePage = (questionSettings, pageIndex) => {
	const pageSettings = questionSettings.value 
	if(!pageSettings?.pages){
		return 
	}

	pageSettings.pages.splice(pageIndex, 0, {
		name: `page${pageIndex.value}`,
		elements: [],
	});
};

// 能删除的page的索引大于等于1，第一页禁止删除，删除一页即将待删除页的所有题目
// 元素加入前一页中
export const handleDeletePage = (questionSettings, page, index) => {
	// 该页不为空页
	if (page.elements.length > 0) {
		questionSettings.value.pages[index - 1].elements.push(...page.elements);
	}
	// 空页或者非空页都删除掉
	questionSettings.value.pages.splice(index, 1);
};

// 将一页分成两页，选中题目，然后插入页码，原来页面中被选中题目之后的元素成为新页的题目元素
// elementIndex表示选中元素的索引，或者说插入新页码的位置之前的题目元素的索引
// pageIndex表示选中元素所属的页面索引
export const spliteOffOnePageIntoPages = (questionSettings, elementIndex, pageIndex) => {
	const newPgaeElements = questionSettings.value.pages[pageIndex].elements.splice(
		elementIndex + 1
	);

	questionSettings.value.pages.splice(pageIndex + 1, 0, {
		name: `page${pageIndex + 1}`,
		elements: newPgaeElements,
	});
}

// 如果没有选中任何元素，新元素插入问卷末尾，反之，则插入选中元素的页面末尾
export const addQuestionElement = (questionSettings, elemntType, selectedQuestionId) => {
	const newElement = createNewElement(elemntType, questionSettings);

	const { elementIndex, pageIndex } =
		getPageAndElementIndexOfSelectElement(questionSettings, selectedQuestionId);

	if (elementIndex === undefined) {
		questionSettings.value.pages[questionSettings.value.pages.length - 1].elements.push(newElement);
	} else {
		questionSettings.value.pages[pageIndex].elements.splice(elementIndex + 1, 0, newElement);
	}

	// 修改添加新题目之后，题目的序号序列不对的问题
	// 更新题目的序号序列
	formattedNumber(questionSettings.value)

	// 滚动到新添加的题目
	// 注意，这里的滚动是在页面中滚动，而不是在整个页面中滚动
	// 上述代码执行之后，DOM不会立即更新，所以这是一个异步任务，在下一次事件循环之后再执行
	nextTick(() => {
		const newElementDom = document.getElementById(newElement.id);
		if (newElementDom) {
			newElementDom.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	});

	return newElement.id
};

export const getPageAndElementIndexOfSelectElement = (questionSettings, selectedQuestionId) => {
	let elementIndex, pageIndex;
	const page = questionSettings.value.pages.find((page) =>
		page.elements.some((el) => el && el.id === selectedQuestionId)
	);

	if (page) {
		pageIndex = questionSettings.value.pages.indexOf(page);
		elementIndex = page.elements.findIndex(
			(el) => el && el.id === selectedQuestionId
		);
	}

	return { elementIndex, pageIndex };
};

export const addPage = (questionSettings, selectedQuestionId, pageIndex, isPageSelected) => {
	// 未选中任何题目和页面，在页数组最后添加一个空页
	if (isNotSelectAnyQuestion(selectedQuestionId, isPageSelected)) {
		addEmptyPageAtLast(questionSettings);
	}
	// 如果选中的题目是某一页面最后一道题目，那么在该页面后添加新的空页面
	else if (isLastElementOfAnyPageSelected(questionSettings, selectedQuestionId)) {
		addEmptyPageAfterPage(questionSettings, selectedQuestionId);
	}
	// 如果点击的是页面块，点击添加页面，是在该页之前添加一个空页
	else if (isPageSelected) {
		addEmptyPageBeforePage(questionSettings, pageIndex);
	}
	// 如果选中的题目不是某一页的最后一道题目，那么在该页面后添加一个新页面，并且
	// 将该页面该题目之后的所有的题目都加入新的页面。
	else {
		addPageBySpliteOffOnePage(questionSettings, selectedQuestionId);
	}
};

const isNotSelectAnyQuestion = (selectedQuestionId, isPageSelected) => {
	return selectedQuestionId === "" && !isPageSelected;
};

const addEmptyPageAtLast = (questionSettings) => {
	questionSettings.value.pages.push({
		name: `page${questionSettings.value.pages.length + 1}`,
		elements: [],
	});
};

const isLastElementOfAnyPageSelected = (questionSettings, selectedQuestionId) => {
	const getLastElementOfPage = (page) => {
		if (page.elements.length > 0) {
			return page.elements[page.elements.length - 1];
		}
		return null;
	};

	const index = questionSettings.value.pages
		.map(getLastElementOfPage)
		.findIndex((el) => el && el.id == selectedQuestionId);

	return index !== -1
};

const addEmptyPageAfterPage = (questionSettings, selectedQuestionId) => {
	const { pageIndex } = getPageAndElementIndexOfSelectElement(questionSettings, selectedQuestionId);
	questionSettings.value.pages.splice(pageIndex + 1, 0, {
		name: `page${pageIndex + 1}`,
		elements: [],
	});
};

const addPageBySpliteOffOnePage = (questionSettings, selectedQuestionId) => {
	const { elementIndex, pageIndex } = getPageAndElementIndexOfSelectElement(questionSettings, selectedQuestionId);

	if (pageIndex !== undefined) {
		spliteOffOnePageIntoPages(questionSettings, elementIndex, pageIndex);
	}
};

// 未验证，复制，未测试
export const handleCopyElement = (elementId, questionSettings, elementType) => {
	addQuestionElement(questionSettings, elementType, elementId)
}

// 删除某个题目元素，注意在删除某个特定的题目元素之前，
// 一定要提前删除该元素所涉及的逻辑规则
export const deleteQuestion = (questionSettings, elementId) => {
	let index;
	for (let page of questionSettings.value.pages) {
		index = page.elements.findIndex((el) => el.id === elementId);

		if (index !== -1) {
			// 从questionSettings中删除该题目元素关联的所有逻辑规则
			removeLogicRulesOfDeletedRule(questionSettings, elementId)
			// 从questionSettings中删除该题目元素
			page.elements.splice(index, 1);
			break; // 找到之后立即中断循环
		}
	}

	return index
}

export const removeLogicRulesOfDeletedRule = (questionSettings, elementId) => {
	// 查找删除该题目关联的逻辑规则
	const deletedRules = getLogicRulesOfElement(questionSettings.value.logicRules, elementId)

	// 从questionSettings中删除这些规则
	// 然后再从questionSettings.logicRules中删除这些规则
	deletedRules.forEach(deletedRule => {
		removeLogicRule(deletedRule, questionSettings);
	})
}

// 为新元素的name属性赋值
// name会一直递增，是对所有的非html和panel的元素进行计数而已
// 会执行插入，删除，复制等操作，会改变整个题目元素的长度，
// 只需要统计所有的非html和panel的元素的name属性，然后取最大值加1即可
export const getMaxNumOfName = (questionSettings, element) => {
	// 不为html和panel计数，这两种题型都没有name属性
	if (element.type === "html" || element.type === "panel") return;

	const numOfNames = (questionSettings.value.pages ?? [])
		.flatMap(page => page.elements)
		.filter(element => element.type !== "html" && element.type !== "panel")
		.map(element => parseInt(element.name.substring(1)));

	// 用Math.max(...numOfName)当数组有几万个元素时会报错。用reduce适应任何长度的元素
	return numOfNames.reduce((max, cur) => Math.max(max, cur), 0);
}



export const createNewElement = (type, questionSettings) => {
	let elementTemplate = questionTemplates.find(element => element.type === type);

	const number = getMaxNumOfName(questionSettings, elementTemplate)

	return {
		id: uuidv4(),
		name: `Q${number + 1}`,
		...elementTemplate
	}
}


export const switchElementByType = (newType, questionSettings, switchedElement) => {
	if (!switchedElement) return;

	// 根据切换的题型，创建对应的新的题目元素
	let newElement = createNewElement(newType, questionSettings);

	// 获取被切换的题目元素的类型oldType
	const { type: oldType } = switchedElement;

	// 被切换的题目元素中需要，不同的题型的元素中需要被删除的属性
	const excludeProps = {
		radiogroup: ['id', 'type'],
		checkbox: ['id', 'type', 'showSelectAllItem', 'selectAllText'],
		dropdown: ['id', 'type']
	};

	// 'radiogroup'和'checkbox'题型需要保留itmeComponent属性,
	// 其他被切换的类型需要删除itemComponent属性
	const needsItemComponent = ['radiogroup', 'checkbox'];
	if (!needsItemComponent.includes(newType)) {
		excludeProps[oldType].push('itemComponent');
	}

	// 从被切换的题目元素中获取需要保留的属性，并生成一个新对象
	const restProps = Object.keys(switchedElement)
		.filter(key => !excludeProps[oldType].includes(key))
		.reduce((obj, key) => {
			obj[key] = switchedElement[key];
			return obj;
		}, {});

	// 将需要保留的属性添加到新类型的题目元素模版中，或者覆盖旧的属性
	// 这种直接用解构合并的方式适合radiogroup和checkbox题型的相互切换
	newElement = { ...newElement, ...restProps };

	// 直接用解构合并的方式不适合dropdown和radiogroup/checkbox的相互切换
	// 关键在于dropdown的choices属性是一个字符串数组，而radiogroup/checkbox的choices属性是一个对象数组
	// 当从radiogroup/checkbox切换到dropdown时，需要将radiogroup/checkbox的choices对象数组转换成
	// dropdown的choices字符串数组
	if (newType === 'dropdown' &&
		['radiogroup', 'checkbox'].includes(oldType)) {
		newElement.choices = newElement.choices
			.map(choice => choice.value);
	}
	// 当从dropdown切换到radiogroup/checkbox时，需要将dropdown的choices
	// 属性转换为radiogroup/checkbox的choices属性
	else if (
		['radiogroup', 'checkbox'].includes(newType) &&
		oldType === 'dropdown') {
		newElement.choices = newElement.choices.map(choice => ({
			value: choice,
			showText: false,
			textType: 'text',
			required: true
		}));
	}

	return newElement;
} 