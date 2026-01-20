import { computed, ComputedRef } from 'vue'
import { componentMap, ratingTypeMap } from '@/views/creator/config/componentAndSettingMap'

import type {
  QuestionElement,
  RatingElement
} from '@/views/creator/types/questionnaire' // 路径按你项目调整

type ComponentMapKey = keyof typeof componentMap

export function useComponentMapping() {
  const componentIs: ComputedRef<
    (element: QuestionElement) => any
  > = computed(() => {
    return (element: QuestionElement) => {
      let type: ComponentMapKey

      if (
        element.type === 'ratinglabel' ||
        element.type === 'ratingstars' ||
        element.type === 'ratingsmileys'
      ) {
        const ratingElement = element as RatingElement
        type = ratingTypeMap[ratingElement.rateType] as ComponentMapKey
      } else {
        type = element.type as ComponentMapKey
      }

      return componentMap[type]
    }
  })

  return {
    componentIs
  }
}
