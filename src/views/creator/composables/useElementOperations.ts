import type { Ref } from 'vue'
import type { QuestionSettings, QuestionElement } from '@/views/creator/types/questionnaire'

import { useElementTypeSwitch } from './useElementTypeSwitch'
import { useSettingUpdateDispatcher } from './useSettingUpdateDispatcher'

type SettingType = 'quickSetting' | 'questionSetting'

export function useElementOperations(
  questionSettings: Ref<QuestionSettings>,
  currentQuestionId: Ref<string>,
  currentElement: Ref<QuestionElement | null>,
  selectedOptionIndex: Ref<number>
) {
  return {
    ...useElementTypeSwitch(
      questionSettings,
      currentQuestionId,
      currentElement
    ),

    ...useSettingUpdateDispatcher(
      currentElement,
      selectedOptionIndex
    )
  }
}
