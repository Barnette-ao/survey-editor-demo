import { getSelectedElementPosition } from '@/views/creator/config/element/research'
import { deleteLogicRulesById } from '@/views/creator/config/logicRule/delete'

export const deleteQuestion = (questionSettings: any, elementId: string) => {
	const { elementIndex, pageIndex } = getSelectedElementPosition(questionSettings, elementId);
	
	if (elementIndex !== undefined && pageIndex !== undefined) {
		deleteLogicRulesById(questionSettings, elementId)
		questionSettings.value.pages[pageIndex].elements.splice(elementIndex, 1);
	}

	return elementIndex
}


