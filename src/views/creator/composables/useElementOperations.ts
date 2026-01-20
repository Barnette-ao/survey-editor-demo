import type { Ref } from 'vue'
import type { QuestionSettings, QuestionElement } from '@/views/creator/types/questionnaire'

import { useElementMutation } from './useElementMutation'
import { useElementTypeSwitch } from './useElementTypeSwitch'
import { useElementCommands } from './useElementCommands'
import { useSettingUpdateDispatcher } from './useSettingUpdateDispatcher'

type SettingType = 'quickSetting' | 'questionSetting'

export function useElementOperations(
  questionSettings: Ref<QuestionSettings>,
  currentQuestionId: Ref<string>,
  currentElement: Ref<QuestionElement | null>,
  settingType: Ref<SettingType>,
  selectedOptionIndex: Ref<number>
) {
  return {
    ...useElementMutation(
      questionSettings,
      currentQuestionId,
    ),

    ...useElementTypeSwitch(
      questionSettings,
      currentQuestionId,
      currentElement
    ),

    ...useElementCommands(
      questionSettings,
      currentQuestionId,
      settingType
    ),

    ...useSettingUpdateDispatcher(
      currentElement,
      selectedOptionIndex
    )
  }
}
