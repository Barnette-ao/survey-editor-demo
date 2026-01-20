import type { Ref } from 'vue'
import type { QuestionElement, RadioGroupElement, CheckboxElement, Choice } from '@/views/creator/types/questionnaire'
import { useQuestionOrderSetting } from './useQuestionOrderSetting'
import { useChoiceSetting } from './useChoiceSetting'


function isChoiceElement(
  el: QuestionElement | null
): el is RadioGroupElement | CheckboxElement {
  return !!el && (el.type === 'radiogroup' || el.type === 'checkbox')
}

export function useSettingUpdateDispatcher(
  currentElement: Ref<QuestionElement | null>,
  selectedOptionIndex: Ref<number>
) {
  const {
    setChoicesOrderRandom,
    setQuestionsOrderRandom
  } = useQuestionOrderSetting(currentElement)

  // 类型守卫 + 作用域使用
  let updateChoice: ((value: Choice) => void) 
  // 类型守卫 + 断言一起使用
  if (isChoiceElement(currentElement.value)){
    const result = useChoiceSetting(
        currentElement as Ref<RadioGroupElement | CheckboxElement>, 
        selectedOptionIndex
    )
    updateChoice = result.updateChoice
  }
  

  const handleSettingUpdate = (key: string, value: any) => {
    if (!currentElement.value) return

    switch (key) {
      case 'choicesOrder':
        setChoicesOrderRandom(Boolean(value))
        break

      case 'questionsOrder':
        setQuestionsOrderRandom(Boolean(value))
        break

      case 'choices':
        updateChoice(value)
        break

      default:
        // 兜底：直接字段赋值（迁移期必需）
        (currentElement.value as Record<string, any>)[key] = value
    }
  }

  return {
    handleSettingUpdate
  }
}
