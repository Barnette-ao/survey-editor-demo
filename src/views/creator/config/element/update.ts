import { getSelectedElementPosition } from '@/views/creator/config/element'
import { deleteLogicRulesById } from '@/views/creator/config/logicRule'
import { getSwitchTargetElement } from '@/views/creator/config/element'
import type { QuestionElement } from '@/views/creator/types/questionnaire'

/**
 * 切换选择题类型
 * @param questionSettings - 问卷设置对象
 * @param questionId - 要切换的题目ID
 * @param currentElement - 当前元素对象
 * @param newType - 新的题目类型
 * @returns 包含新元素ID和克隆后的问卷设置
 */
export const switchChoiceQuestion = (
    questionSettings: any,
    questionId: string,
    currentElement: any,
    newType: string
) => {
    const cloned = structuredClone(questionSettings)   
    const newElement = getSwitchTargetElement(
        newType,
        cloned,
        currentElement
    ) as QuestionElement

    replaceElement(cloned, questionId, newElement)

    return { id: newElement.id, cloned }
}

/**
 * 替换指定位置的元素
 * @param questionSettings - 问卷设置对象
 * @param questionId - 要替换的题目ID
 * @param newElement - 新的元素对象
 */
export const replaceElement = (
    questionSettings: any,
    questionId: string,
    newElement: QuestionElement
) => {
    const { 
        pageIndex, 
        elementIndex 
    } = getSelectedElementPosition( questionSettings, questionId)

    if (pageIndex !== undefined && elementIndex !== undefined){
        deleteLogicRulesById(questionSettings, questionId)
        questionSettings.pages[pageIndex].elements.splice(
            elementIndex,
            1,
            newElement
        )
    }
}