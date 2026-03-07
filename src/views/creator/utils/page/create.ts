import { findElementPosition } from '@/views/creator/utils/element'
import { generateUUID } from '@/views/creator/utils/shared'

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
    let newPageId

    // 未选中任何题目和页面，在页数组最后添加一个空页
    if (isNotSelectAnyQuestion(selectedQuestionId, isPageSelected)) {
        newPageId = addEmptyPageAtLast(cloned)
    }
    // 如果选中的题目
    else if (isSelectElement(selectedQuestionId)) {
        newPageId = addEmptyPageAfterPage(
            cloned, 
            selectedQuestionId,
            isPageSelected = false, 
            pageIndex = -1
        )
    }
    // 如果点击的是页面块，点击添加页面，是在该页之后添加一个空页
    else if (isPageSelected) {
        newPageId = addEmptyPageAfterPage(
            cloned,
            selectedQuestionId="", 
            isPageSelected, 
            pageIndex
        )
    }
    
    return {cloned,newPageId}
}

/**
 * 判断是否未选中任何题目
 */
const isNotSelectAnyQuestion = (selectedQuestionId: string, isPageSelected: boolean): boolean => {
    return selectedQuestionId === "" && !isPageSelected
}

const isSelectElement =(selectedQuestionId: string) => {
    return selectedQuestionId !== ""
}

/**
 * 在页数组最后添加一个空页
 */
const addEmptyPageAtLast = (questionSettings: QuestionSettings): string => {
    const newPageId = generateUUID()
    questionSettings.pages.push({
        id:newPageId,
        name: `page${questionSettings.pages.length + 1}`,
        elements: [],
    } as any)
    
    return newPageId
}


/**
 * 在指定页面后添加一个空页
 */
const addEmptyPageAfterPage = (
    questionSettings: QuestionSettings,   
    selectedQuestionId: string,
    isSelectAPage:boolean,
    pageIndex: number
): string => {
    const newPageId = generateUUID()
    const emptyPage = {
        id:newPageId,
        name: `page${pageIndex + 1}`,
        elements: [],
    } as any

    if (isSelectAPage){
        questionSettings.pages.splice(pageIndex, 0, emptyPage)
    }else{
        const { pageIndex } = findElementPosition(questionSettings, selectedQuestionId)
        if (pageIndex !== undefined) {
            questionSettings.pages.splice(pageIndex + 1, 0, emptyPage)
        }
    }

    return newPageId
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
