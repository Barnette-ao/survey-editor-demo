import { questionTemplates } from "@/views/creator/config/componentAndSettingMap";
import { cloneElement, isEqual, formattedNumber } from "@/views/creator/config/helpers";
import { v4 as uuidv4 } from 'uuid'
import { 
	removeLogicRule, 
	findLogicRulesByElementId,
	getLogicRulesByElementId 
} from "@/views/creator/config/updateLogic";
import { handleDeletePage as handleDeletePageCore } from "@/views/creator/config/page/delete";
import { addPage as addPageCore } from "@/views/creator/config/page/create";

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
	const cloned = addPageCore(questionSettings.value, selectedQuestionId, pageIndex, isPageSelected)
	questionSettings.value = cloned
};

// 能删除的page的索引大于等于1，第一页禁止删除，删除一页即将待删除页的所有题目
// 元素加入前一页中 (wrapper function)
export const handleDeletePage = (questionSettings, page, index) => {
	const cloned = handleDeletePageCore(questionSettings.value, page, index)
	questionSettings.value = cloned
};










 