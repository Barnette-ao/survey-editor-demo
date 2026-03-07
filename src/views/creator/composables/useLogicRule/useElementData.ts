import type { 
   QuestionElement, CanSetLogicElement 
} from '@/views/creator/types/questionnaire.ts'
import { adapteElement } from "@/views/creator/utils/shared"

// 提前结束选项类型
interface CompleteOption {
  id: 'complete'
  title: '提前结束'
}


export function useElementData(
  props: { element: QuestionElement | null }, 
  questionSettings: Ref<any>,
  filterType: string[]
) {
  // 创建类型守卫函数
  const isCanSetLogicElement = (element: QuestionElement): element is CanSetLogicElement => {
    return !filterType.includes(element.type)
  }

  // allElements 应该是 computed
  // 因为：1) 被其他 computed 依赖  2) adapteElement 有性能成本
  const allElements = computed(() => {
    return (questionSettings.value.pages ?? [])
      .flatMap((page:any) => page.elements)
      .map((element:any) => adapteElement(element))
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
    let elementIndex = allElements.value.findIndex((el:any) => props.element!.id === el.id)
    return elementIndex === 1
  })

  const getCurrentElementIndex = computed(() => {
    if (!props.element) return -1
    return allIfElement.value.findIndex((item:any) => props.element!.id === item.id)
  })
  
  return {
    allElements,
    allIfElement,
    allTargetElements,
    isFistElement,
    getCurrentElementIndex,
  }
}

