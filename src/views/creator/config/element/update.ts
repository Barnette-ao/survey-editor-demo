import { getSelectedElementPosition } from '@/views/creator/config/element/research'
import { deleteLogicRulesById } from '@/views/creator/config/logicRule/delete'
import type { QuestionElement } from '@/views/creator/types/questionnaire'

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
