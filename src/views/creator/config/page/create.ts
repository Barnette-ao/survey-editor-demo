import { getSelectedElementPosition } from '@/views/creator/config/element'
import { generateUUID } from '@/views/creator/config/shared'

import type { QuestionSettings } from '@/views/creator/types/questionnaire'

/**
 * 添加页面
 * @param questionSettings - 问卷设置对象
 * @param selectedQuestionId - 选中的题目ID
 * @param pageIndex - 页面索引
 * @param isPageSelected - 是否选中页面
 * @returns 克隆后的问卷设置
 */
export const addPage = (
    questionSettings: QuestionSettings,
    selectedQuestionId: string,
    pageIndex: number,
    isPageSelected: boolean
) => {
    const cloned = structuredClone(questionSettings)
    
    // 未选中任何题目和页面，在页数组最后添加一个空页
    if (isNotSelectAnyQuestion(selectedQuestionId, isPageSelected)) {
        addEmptyPageAtLast(cloned)
    }
    // 如果选中的题目是某一页面最后一道题目，那么在该页面后添加新的空页面
    else if (isLastElementOfAnyPageSelected(cloned, selectedQuestionId)) {
        addEmptyPageAfterPage(
            cloned, 
            selectedQuestionId,
            isPageSelected = false, 
            pageIndex = -1
        )
    }
    // 如果点击的是页面块，点击添加页面，是在该页之后添加一个空页
    else if (isPageSelected) {
        addEmptyPageAfterPage(
            cloned,
            selectedQuestionId="", 
            isPageSelected, 
            pageIndex
        )
    }
    // 如果选中的题目不是某一页的最后一道题目，那么在该页面后添加一个新页面，并且
    // 将该页面该题目之后的所有的题目都加入新的页面。
    else {
        addPageBySpliteOffOnePage(cloned, selectedQuestionId)
    }
    
    return cloned
}

/**
 * 判断是否未选中任何题目
 */
const isNotSelectAnyQuestion = (selectedQuestionId: string, isPageSelected: boolean): boolean => {
    return selectedQuestionId === "" && !isPageSelected
}

/**
 * 在页数组最后添加一个空页
 */
const addEmptyPageAtLast = (questionSettings: QuestionSettings): void => {
    questionSettings.pages.push({
        id:generateUUID(),
        name: `page${questionSettings.pages.length + 1}`,
        elements: [],
    } as any)
}

/**
 * 判断选中的题目是否是某一页面的最后一道题目
 */
const isLastElementOfAnyPageSelected = (questionSettings: QuestionSettings, selectedQuestionId: string): boolean => {
    const getLastElementOfPage = (page: any) => {
        if (page.elements.length > 0) {
            return page.elements[page.elements.length - 1]
        }
        return null
    }

    const index = questionSettings.pages
        .map(getLastElementOfPage)
        .findIndex((el: any) => el && el.id == selectedQuestionId)

    return index !== -1
}

/**
 * 在指定页面后添加一个空页
 */
const addEmptyPageAfterPage = (
    questionSettings: QuestionSettings,   
    selectedQuestionId: string,
    isSelectAPage:boolean,
    pageIndex: number
): void => {
    if (isSelectAPage){
        questionSettings.pages.splice(pageIndex, 0, {
            id:generateUUID(),
            name: `page${pageIndex}`,
            elements: [],
        } as any)
    }else{
        const { pageIndex } = getSelectedElementPosition(questionSettings, selectedQuestionId)
        if (pageIndex !== undefined) {
            questionSettings.pages.splice(pageIndex + 1, 0, {
                id:generateUUID(),
                name: `page${pageIndex + 1}`,
                elements: [],
            } as any)
        }
    } 
}



/**
 * 通过分割一页来添加页面
 */
const addPageBySpliteOffOnePage = (questionSettings: QuestionSettings, selectedQuestionId: string): void => {
    const { elementIndex, pageIndex } = getSelectedElementPosition(questionSettings, selectedQuestionId)
    if (pageIndex !== undefined && elementIndex !== undefined) {
        spliteOffOnePageIntoPages(questionSettings, elementIndex, pageIndex)
    }
}

/**
 * 将一页分成两页
 * 选中题目，然后插入页码，原来页面中被选中题目之后的元素成为新页的题目元素
 * @param questionSettings - 问卷设置对象
 * @param elementIndex - 选中元素的索引
 * @param pageIndex - 选中元素所属的页面索引
 */
export const spliteOffOnePageIntoPages = (questionSettings: QuestionSettings, elementIndex: number, pageIndex: number): void => {
    const newPgaeElements = questionSettings.pages[pageIndex].elements.splice(elementIndex + 1)
    questionSettings.pages.splice(pageIndex + 1, 0, {
        id:generateUUID(),
        name: `page${pageIndex + 1}`,
        elements: newPgaeElements,
    } as any)
}
