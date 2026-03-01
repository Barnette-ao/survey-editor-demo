import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'

import type { QuestionElement, LogicRule } from '@/views/creator/types/questionnaire.ts'

export function useLogicClass(
  props: any, 
  TEXT_TYPES: readonly string[]
) {
  // 私有版本
  const logicClass = ref<'skipLogic' | 'visibleLogic'>('skipLogic')
  
  const thenActionText = computed<string>(() => 
    logicClass.value === 'skipLogic' ? "跳转" : "显示"
  )
  
  const thenText = computed<string>(() => 
    logicClass.value === 'skipLogic' ? "，否则正常进入下一题" : "。"
  )

  const getDefaultRule = (): LogicRule | null => {
    if(!props.element) return null
    return {
      id: uuidv4(),
      ifConditions: [{
        elementId: logicClass.value === 'skipLogic' ? props.element.id : "",
        state: '',
        choiceIndex: "",
        score: "",
        connector: 'or' // 注意：你的 LogicRule 类型中应该包含 connector
      }],
      thenCondition: {
        action: logicClass.value === 'skipLogic' ? 'jump' : 'show',
        targetElementId: logicClass.value === 'skipLogic' ? '' : props.element.id
      }
    }
  }

  const initLogicClass = (): void => {
    if(!props.element) return resetLogicClass()
      
    logicClass.value = TEXT_TYPES.includes(props.element.type) 
      ? 'visibleLogic' 
      : 'skipLogic'
  }

  const resetLogicClass = (): void => {
    logicClass.value = 'skipLogic'
  }

  return {
    logicClass,
    thenActionText,
    thenText,
    getDefaultRule,
    initLogicClass,
    resetLogicClass
  }
}