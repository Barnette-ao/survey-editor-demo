import { getSelectedElementPosition } from '@/views/creator/config/element'
import { deleteLogicRulesById } from '@/views/creator/config/logicRule'
import { formattedNumber } from '@/views/creator/config/adapter'

export const deleteQuestion = (questionSettings: any, elementId: string) => {
	const cloned = structuredClone(questionSettings)
    const { elementIndex, pageIndex } = getSelectedElementPosition(cloned, elementId);
    deleteLogicRulesById(cloned, elementId)
    cloned.pages[pageIndex].elements.splice(elementIndex, 1);
    formattedNumber(cloned)
    return cloned
}


