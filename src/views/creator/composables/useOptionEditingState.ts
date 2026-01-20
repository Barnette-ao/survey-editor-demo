import { ref } from 'vue'

export interface OptionSettingParams {
  id: string
  isOpen: boolean
  index: number
}

export function useOptionEditingState(options: {
  onQuestionChange: (id: string) => void
  onOpenSettingPanel?: () => void
}) {
  const isOptionSetting = ref(false)
  const selectedOptionIndex = ref(-1)

  const handleOptionSettingUpdate = (params: OptionSettingParams) => {
    options.onQuestionChange(params.id)

    if (params.isOpen) {
      options.onOpenSettingPanel?.()
    }

    isOptionSetting.value = params.isOpen
    selectedOptionIndex.value = params.index
  }

  return {
    isOptionSetting,
    selectedOptionIndex,
    handleOptionSettingUpdate
  }
}
