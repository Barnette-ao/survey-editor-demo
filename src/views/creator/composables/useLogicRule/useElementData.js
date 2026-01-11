export function useElementData(questionSettings, element) {
  const filterType = ['panel', 'html', 'multipletext', 'file', 'ranking', 'matrix', 'text', 'comment', 'signaturepad']
  
  const allElements = computed(() => {
    return (questionSettings.pages ?? []).flatMap(page => page.elements)
  })
  
  const allIfElement = computed(() => {
    return allElements.value
      .map((element, index) => ({ element, index }))
      .filter(item => !filterType.includes(item.element.type))
  })
  
  const allTargetElements = computed(() => {
    const elements = [...allElements.value]
    elements.shift() // 移除简介页面
    return [...elements, { id: "complete", title: "提前结束" }]
  })
  
  const isFistElement = computed(() => {
    let elementIndex = allElements.value.findIndex(el => element.id === el.id)
    return elementIndex === 1
  })
  
  return {
    allElements,
    allIfElement,
    allTargetElements,
    isFistElement
  }
}