// 管理题目序号显示相关的所有计算逻辑
import { computed } from 'vue'

export function useQuestionDisplay(questionSettings) {
  // 全局显示序号设置
  const showQuestionNumbers = computed({
    get: () => questionSettings.value.showQuestionNumbers,
    set: (value) => {
      questionSettings.value.showQuestionNumbers = value
      
      if (!value) {
        // 当全局设置关闭时，移除所有题目的 hideNumber 属性
        questionSettings.value.pages = questionSettings.value.pages.map((page) => {
          page.elements = page.elements.map((element) => {
            const { hideNumber, ...rest } = element
            return rest
          })
          return page
        })
      } else {
        // 当全局设置开启时，为所有题目添加 hideNumber 属性
        questionSettings.value.pages = questionSettings.value.pages.map((page) => {
          page.elements = page.elements.map((element) => {
            element.hideNumber = false
            return element
          })
          return page
        })
      }
    }
  })

  // 判断是否显示题目序号（用于渲染题目组件）
  const isShowNumber = computed(() => {
    return (element) => {
      // 如果全局设置关闭，直接返回 false
      if (!showQuestionNumbers.value) return false
      // 如果全局设置开启，但 hideNumber 未定义，返回 true
      if (element.hideNumber === undefined) return true
      // 否则返回 hideNumber 的反值
      return !element.hideNumber
    }
  })

  // 题目设置中的显示序号控制
  const createShowNumberComputed = (currentElement) => {
    return computed({
      get: () => {
        const element = currentElement.value
        if (!element) return true
        if (element.hideNumber === undefined) return true
        return !element.hideNumber
      },
      set: (value) => {
        if (!currentElement.value || !showQuestionNumbers.value) return
        currentElement.value.hideNumber = !value
      }
    })
  }

  return {
    showQuestionNumbers,
    isShowNumber,
    createShowNumberComputed
  }
}