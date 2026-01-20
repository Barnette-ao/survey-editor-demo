import type { Ref } from 'vue'
import type { 
    ContainerQuestionElement, 
    ChoiceQuestionElement
} from '@/views/creator/types/questionnaire'

export function useQuestionOrderSetting(
  currentElement: Ref<ContainerQuestionElement | ChoiceQuestionElement | null>
) {
  const setChoicesOrderRandom = (enabled: boolean) => {
    if (!currentElement.value) return
    if ('choicesOrder' in currentElement.value) {
        currentElement.value.choicesOrder = enabled ? 'random' : 'none'
    }
    
  }

  const setQuestionsOrderRandom = (enabled: boolean) => {
    if (!currentElement.value) return
    if ('questionsOrder' in currentElement.value){
        currentElement.value.questionsOrder = enabled ? 'random' : 'initial'
    }
  }

  return {
    setChoicesOrderRandom,
    setQuestionsOrderRandom
  }
}
