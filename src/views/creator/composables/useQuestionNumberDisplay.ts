// 管理题目序号显示相关的所有计算逻辑
import { computed, ComputedRef, Ref } from 'vue'
import type { QuestionElement,QuestionSettings } from '@/views/creator/types/questionnaire'

/**
 * 题目序号显示逻辑
 */
export function useQuestionDisplay(
  questionSettings: Ref<QuestionSettings>
) {
  /** 全局显示序号设置 */
  const showQuestionNumbers = computed<boolean>({
    get: () => questionSettings.value.showQuestionNumbers,
    set: (value: boolean) => {
      questionSettings.value.showQuestionNumbers = value

      if (!value) {
        // 全局关闭：移除 hideNumber
        questionSettings.value.pages = questionSettings.value.pages.map(
          (page) => {
            page.elements = page.elements.map((element) => {
              const { hideNumber, ...rest } = element
              return rest as QuestionElement
            })
            return page
          }
        )
      } else {
        // 全局开启：确保每个题目都有 hideNumber
        questionSettings.value.pages = questionSettings.value.pages.map(
          (page) => {
            page.elements = page.elements.map((element) => {
              element.hideNumber = false
              return element
            })
            return page
          }
        )
      }
    }
  })

  /**
   * 判断某个题目是否显示序号（用于渲染）
   */
  const isShowNumber: ComputedRef<(element: QuestionElement) => boolean> =
    computed(() => {
      return (element: QuestionElement): boolean => {
        if (!showQuestionNumbers.value) return false
        if (element.hideNumber === undefined) return true
        return !element.hideNumber
      }
    })

  /**
   * 为「题目设置面板」创建 computed
   */
  const createShowNumberComputed = (
    currentElement: Ref<QuestionElement | null>
  ): ComputedRef<boolean> => {
    return computed<boolean>({
      get: () => {
        const element = currentElement.value
        if (!element) return true
        if (element.hideNumber === undefined) return true
        return !element.hideNumber
      },
      set: (value: boolean) => {
        if (!currentElement.value) return
        if (!showQuestionNumbers.value) return

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
