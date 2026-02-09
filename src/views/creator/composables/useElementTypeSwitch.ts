import type { Ref } from "vue"
import { switchChoiceQuestion } from "@/views/creator/config/element"
import type { 
    QuestionElement, 
    QuestionSettings 
} from "@/views/creator/types/questionnaire"

export function useElementTypeSwitch(
  questionSettings: Ref<QuestionSettings>,
  currentQuestionId: Ref<string>,
  currentElement: Ref<QuestionElement | null>
) {
  // 切换题目类型  
  const switchQuestionType = (newType: QuestionElement["type"]) => {
    if (!currentElement.value) return
    
    const { id, cloned } = switchChoiceQuestion(
      questionSettings.value,
      currentQuestionId.value,
      currentElement.value,
      newType
    )
    
    questionSettings.value = cloned
    // 更新当前选中的题目ID
    currentQuestionId.value = id
  }

  return {
    switchQuestionType
  }
}
