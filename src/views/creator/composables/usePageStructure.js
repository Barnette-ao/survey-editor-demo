import { computed } from 'vue'

export function usePageStructure(questionSettings) {
  // 一页一题模式计算
  const oneQuestionPerPage = computed(() => {
    return questionSettings.value.questionsOnPageMode === "questionPerPage"
  })

  // 获取页面题目名称
  const getQuestionNameOf = computed(() => {
    return (page) => {
      if (page.elements.length === 0) return ""
      
      if (page.elements.length === 1) {
        return page.elements[0].type === "html" 
          ? "" 
          : `Q${page.elements[0].number}`
      }
      
      // 多个元素的情况
      const firstQuestionIndex = page.elements[0].type === "html"
        ? page.elements.findIndex((item) => item.type !== "html")
        : 0
      
      const lastQuestionIndex = page.elements[page.elements.length - 1].type === "html"
        ? page.elements.findLastIndex((item) => item.type !== "html")
        : page.elements.length - 1

      return firstQuestionIndex === lastQuestionIndex
        ? `(Q${page.elements[firstQuestionIndex].number})`
        : `(Q${page.elements[firstQuestionIndex].number} - Q${page.elements[lastQuestionIndex].number})`
    }
  })

  return {
    oneQuestionPerPage,
    getQuestionNameOf
  }
}