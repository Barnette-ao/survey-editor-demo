import { htmlToPlainText } from "@/views/creator/config/helpers.js";

const adapteElement = element => {
  // 1. 适配 title
  const adaptedTitle = htmlToPlainText(element.title || '')
  
  // 2. 适配 description（如果存在）
  const adaptedDescription = element.description 
    ? htmlToPlainText(element.description) 
    : ''
  
  // 3. 适配 choices 数组中的每个 value
  const adaptedChoices = element.choices 
    ? element.choices.map(choice => ({
        ...choice,
        value: htmlToPlainText(choice.value || '') // 只适配 value 属性
      }))
    : []
  
  // 返回新对象，保留原属性，只替换需要适配的字段
  return {
    ...element,
    title: adaptedTitle,
    description: adaptedDescription,
    choices: adaptedChoices
  }
}

export function useElementData(props, filterType) {
  const allElements = computed(() => {
    return (props.questionSettings.pages ?? []).flatMap(page => page.elements)
      .map(element => adapteElement(element))
  })

  // console.log("allElements.value",allElements.value)
  

  const allIfElement = computed(() => {
    return allElements.value
      .filter(element => !filterType.includes(element.type))
  })
  
  const allTargetElements = computed(() => {
    const elements = [...allElements.value]
    elements.shift() // 移除简介页面
    return [...elements, { id: "complete", title: "提前结束" }]
  })
  
  // 是否是第一个能够设置逻辑规则题目中，第二个题目元素
  const isFistElement = computed(() => {
    let elementIndex = allElements.value.findIndex(el => props.element.id === el.id)
    return elementIndex === 1
  })

  const getCurrentElementIndex = computed(() => {
    return allIfElement.value.findIndex(item =>
       	props.element.id === item.id
    )
  })
  
  return {
    allElements,
    allIfElement,
    allTargetElements,
    isFistElement,
    getCurrentElementIndex,
  }
}