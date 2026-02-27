// 管理题目序号显示相关的所有计算逻辑
import { computed, ComputedRef, Ref } from 'vue'
import type { QuestionElement,QuestionSettings } from '@/views/creator/types/questionnaire'
import { useDraftActions } from "@/views/creator/composables/useDraftAction";

/**
 * 题目序号显示逻辑
 */
export function useQuestionDisplay(
  draftState: Ref<QuestionSettings>
) {
  const {applyUpdateShowNumbers} = useDraftActions()

  /** 全局显示序号设置 */
  const showQuestionNumbers = computed<boolean>({
    get: () => draftState.value.showQuestionNumbers,
    set: (value: boolean) => {
      const hidNumberValue = !value ? true : false
      applyUpdateShowNumbers({
        key:"showQuestionNumbers",
        value
      },{
        key:"hideNumber",
        value:hidNumberValue
      })
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

  return {
    showQuestionNumbers,
    isShowNumber,
  }
}
