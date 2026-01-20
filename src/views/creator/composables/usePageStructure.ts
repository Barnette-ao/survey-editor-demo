import { computed, ComputedRef, Ref } from 'vue'

import type {
  QuestionSettings,
  QuestionPage,
} from '@/views/creator/types/questionnaire' // 路径按你项目实际调整

export function usePageStructure(
  questionSettings: Ref<QuestionSettings>
) {
  /** 一页一题模式 */
  const oneQuestionPerPage: ComputedRef<boolean> = computed(() => {
    return questionSettings.value.questionsOnPageMode === 'questionPerPage'
  })

  /**
   * 获取页面题目名称（如：Q1 / (Q1 - Q3)）
   */
  const getQuestionNameOf: ComputedRef<
    (page: QuestionPage) => string
  > = computed(() => {
    return (page: QuestionPage): string => {
      const elements = page.elements
      if (elements.length === 0) return ''

      // 只有一个元素
      if (elements.length === 1) {
        const el = elements[0]
        return el.type === 'html' || el.number == null
          ? ''
          : `Q${el.number}`
      }

      // 多个元素
      const firstQuestionIndex =
        elements[0].type === 'html'
          ? elements.findIndex((item) => item.type !== 'html')
          : 0

      const lastQuestionIndex =(() => {
        for (let i = elements.length - 1; i >= 0; i--) {
          if (elements[i].type !== 'html') {
            return i
          }
        }
        return -1
      })()

      // 防御：全是 html 的情况
      if (firstQuestionIndex === -1 || lastQuestionIndex === -1) {
        return ''
      }

      const first = elements[firstQuestionIndex]
      const last = elements[lastQuestionIndex]

      if (first.number == null || last.number == null) {
        return ''
      }

      return firstQuestionIndex === lastQuestionIndex
        ? `(Q${first.number})`
        : `(Q${first.number} - Q${last.number})`
    }
  })

  return {
    oneQuestionPerPage,
    getQuestionNameOf
  }
}
