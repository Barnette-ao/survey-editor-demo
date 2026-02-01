import { computed } from 'vue'
import { CHOICE_TYPES } from "@/views/creator/utils/logicRuleUI.js"
import type { 
    QuestionElement,CanSetLogicElement, IfCondition
} from '@/views/creator/types/questionnaire.ts'

// 评分选项类型
interface ScoreOption {
  label: number
  value: number
}

// 选择项类型（兼容对象和字符串）
type ChoiceValue = string | { value: string, [key: string]: any }

export function useLogicRuleElements(
  allIfElement: { value: CanSetLogicElement[] },
  getDisplayRuleIfElementProp: (ruleIndex: number, conditionIndex: number, prop: keyof IfCondition) => any,
  isDisplayRuleEmpty: () => boolean
) { 
  // 核心 computed：获取逻辑规则元素
  const getLogicRuleElement = computed<((ruleIndex: number, index: number) => QuestionElement | null)>(() => {
    return (ruleIndex: number, index: number) => {
      if (isDisplayRuleEmpty()) {
        return null
      }
    
      const filterElement = allIfElement.value.find((element) => 
        element.id === getDisplayRuleIfElementProp(ruleIndex, index, 'elementId')
      )
      
      return filterElement || null
    }
  })

  // 判断是否需要显示选项类题型的第三个下拉框
  const shouldShowChoiceSelect = computed<((ruleIndex: number, index: number, state: string) => boolean)>(() => {
    return (ruleIndex: number, index: number, state: string) => {
      const element = getLogicRuleElement.value(ruleIndex, index)
      
      if (!element) return false
      
      return CHOICE_TYPES.includes(element.type) && 
        ['selected', 'notBeSelected'].includes(state)
    }    
  }) 

  // 判断是否需要显示分数下拉框
  const shouldShowScoreSelect = computed<((ruleIndex: number, index: number, state: string) => boolean)>(() => {
    return (ruleIndex: number, index: number, state: string) => {
      const element = getLogicRuleElement.value(ruleIndex, index)

      if (!element || !('type' in element) || element.type !== 'rating' || element.rateType !== 'label' ) return false
      
      return ['equal', 'lessThan', 'greaterThan', 'greaterOrEqual', 'lesserOrEqual'].includes(state)
    }
  }) 

  // 获取选择类题型的下拉列表选项文字
  const getLabelOfChoiceSelected = (choice: ChoiceValue): string => {
    return typeof choice === 'object' && choice !== null ? choice.value : choice
  }

  // 获取量表类题型的分数下拉框的表项
  const getScoreOptions = computed<((ruleIndex: number, index: number) => ScoreOption[])>(() => {
    return (ruleIndex: number, index: number) => {
      const element = getLogicRuleElement.value(ruleIndex, index)

      if (!element || !('type' in element) || !element.type.startsWith('rating')) return []

      const values: ScoreOption[] = []
      const rateMin = ('rateMin' in element ? element.rateMin : 1) as number
      const rateMax = ('rateMax' in element ? element.rateMax : 5) as number  
      const rateStep = ('rateStep' in element ? element.rateStep : 1) as number

      let count = 1
      for (let i = rateMin; i <= rateMax; i += rateStep) {
        values.push({
          label: i, 
          value: count++
        })
      }
      return values
    }
  })

  // 辅助函数：判断是否为 checkbox
  const isCheckbox = computed<((ruleIndex: number, index: number) => boolean)>(() => {
    return (ruleIndex: number, index: number) => { 
      const element = getLogicRuleElement.value(ruleIndex, index)
      return element !== null && 'type' in element && element.type === 'checkbox'
    }
  })

  return {
    getLogicRuleElement,
    shouldShowChoiceSelect,
    shouldShowScoreSelect, 
    getLabelOfChoiceSelected,
    getScoreOptions,
    isCheckbox
  }
}