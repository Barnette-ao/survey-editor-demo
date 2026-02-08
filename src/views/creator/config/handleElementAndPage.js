import { questionTemplates } from "@/views/creator/config/componentAndSettingMap";
import { cloneElement, isEqual, formattedNumber } from "@/views/creator/config/helpers";
import { v4 as uuidv4 } from 'uuid'
import { 
	removeLogicRule, 
	findLogicRulesByElementId,
	getLogicRulesOfElement 
} from "@/views/creator/config/updateLogic";

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
	const { pageIndex } = getSelectedElementPosition(questionSettings, selectedQuestionId);
	questionSettings.value.pages.splice(pageIndex + 1, 0, {
		name: `page${pageIndex + 1}`,
		elements: [],
	});
};

const addPageBySpliteOffOnePage = (questionSettings, selectedQuestionId) => {
	const { elementIndex, pageIndex } = getSelectedElementPosition(questionSettings, selectedQuestionId);
	if (pageIndex !== undefined) {
		spliteOffOnePageIntoPages(questionSettings, elementIndex, pageIndex);
	}
};

import { addQuestionElement } from "@/views/creator/config/element/addQuestionElement"

// 未验证，复制，未测试
export const handleCopyElement = (elementId, questionSettings, elementType) => {
	addQuestionElement(questionSettings, elementType, elementId)
}









 