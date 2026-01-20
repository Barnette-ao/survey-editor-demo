import type { Ref } from 'vue'
import type { Choice, RadioGroupElement, CheckboxElement } from '@/views/creator/types/questionnaire'

export function useChoiceSetting(
  currentElement: Ref<RadioGroupElement | CheckboxElement | null>,
  selectedOptionIndex: Ref<number>
) {
  const updateChoice = (payload: Choice) => {
    if (!currentElement.value) return
    if (selectedOptionIndex.value < 0) return

    const choice =
      currentElement.value.choices?.[selectedOptionIndex.value]

    if (!choice) return

    Object.assign(choice, payload)
  }

  return {
    updateChoice
  }
}
