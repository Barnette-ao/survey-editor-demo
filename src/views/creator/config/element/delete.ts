import { getSelectedElementPosition } from '@/views/creator/config/element/research'
import { deleteLogicRulesById } from '@/views/creator/config/logicRule/delete'
import { formattedNumber } from '@/views/creator/config/helpers'

export const deleteQuestion = (questionSettings: any, elementId: string) => {
	const cloned = structuredClone(questionSettings)
    const { elementIndex, pageIndex } = getSelectedElementPosition(cloned, elementId);
	
    if (elementIndex !== undefined && pageIndex !== undefined) {
		deleteLogicRulesById(cloned, elementId)
		cloned.pages[pageIndex].elements.splice(elementIndex, 1);
        formattedNumber(cloned)
        return { elementIndex, cloned}
    }
    return { elementIndex: -1,cloned}
}


