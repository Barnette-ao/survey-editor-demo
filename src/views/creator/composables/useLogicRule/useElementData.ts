import type { 
  QuestionSettings, QuestionElement, CanSetLogicElement 
} from '@/views/creator/types/questionnaire.ts'
import { htmlToPlainText } from "@/views/creator/config/adapter"

// 提前结束选项类型
interface CompleteOption {
  id: 'complete'
  title: '提前结束'
}

export function useElementData(
  props: { element: QuestionElement | null }, 
  questionSettings: QuestionSettings,
  filterType: string[]
) {
  // 创建类型守卫函数
  const isCanSetLogicElement = (element: QuestionElement): element is CanSetLogicElement => {
    return !filterType.includes(element.type)
  }

  // allElements 应该是 computed
  // 因为：1) 被其他 computed 依赖  2) adapteElement 有性能成本
  const allElements = computed(() => {
    return (questionSettings.pages ?? [])
      .flatMap(page => page.elements)
      .map(element => adapteElement(element))
  })

  const allIfElement = computed(() => {
    return allElements.value.filter(isCanSetLogicElement)
  })
  
  // 因为：依赖 allElements
  const allTargetElements = computed(() => {
    const elements = [...allElements.value]
    elements.shift()
    return [...elements, { id: "complete", title: "提前结束" }]
  })
  
  // 是否是第一个能够设置逻辑规则题目中，第二个题目元素
  const isFistElement = computed(() => {
    if (!props.element) return false
    let elementIndex = allElements.value.findIndex(el => props.element!.id === el.id)
    return elementIndex === 1
  })

  const getCurrentElementIndex = computed(() => {
    if (!props.element) return -1
    return allIfElement.value.findIndex(item => props.element!.id === item.id)
  })
  
  return {
    allElements,
    allIfElement,
    allTargetElements,
    isFistElement,
    getCurrentElementIndex,
  }
}

// 先不删除，作为兜底所用好了
const adapteElement = (element: QuestionElement): QuestionElement => {
  const result: any = { ...element }
  
  // 只有存在 title 属性时才适配
  if ('title' in element && typeof element.title === 'string') {
    result.title = htmlToPlainText(element.title)
  }
  
  // 只有存在 description 属性时才适配  
  if ('description' in element && typeof element.description === 'string') {
    result.description = htmlToPlainText(element.description)
  }
  
  // 只有存在 choices 属性时才适配
  if ('choices' in element && Array.isArray(element.choices)) {
    if (element.choices.length > 0) {
      if (typeof element.choices[0] === 'object' && element.choices[0] !== null) {
        // 对象数组（radiogroup/checkbox）
        result.choices = element.choices.map(choice => ({
          ...choice,
          value: htmlToPlainText(choice.value || '')
        }))
      } else {
        // 字符串数组（dropdown/ranking）
        result.choices = element.choices.map(choice => 
          htmlToPlainText(choice || '')
        )
      }
    }
  }
  
  // 只有存在 columns 属性时才适配（matrix）
  if ('columns' in element && Array.isArray(element.columns)) {
    result.columns = element.columns.map(col => htmlToPlainText(col || ''))
  }
  
  // 只有存在 rows 属性时才适配（matrix）
  if ('rows' in element && Array.isArray(element.rows)) {
    result.rows = element.rows.map(row => htmlToPlainText(row || ''))
  }
  
  // 只有存在 items 属性时才适配（multipletext）
  if ('items' in element && Array.isArray(element.items)) {
    result.items = element.items.map(item => ({
      ...item,
      name: htmlToPlainText(item.name || '')
    }))
  }
  
  return result
}

