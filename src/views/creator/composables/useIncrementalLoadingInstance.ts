import { shallowRef } from 'vue'
import type { Ref } from 'vue'
import type { QuestionSettings } from '@/views/creator/types/questionnaire.ts'
import { useIncrementalLoading } from './useIncreamentalLoading'

export type IncrementalLoadingInstance = ReturnType<typeof useIncrementalLoading>

export function useIncrementalLoadingInstance() {
  // 语义：尚未创建的实例
  const instance = shallowRef<IncrementalLoadingInstance | undefined>(undefined)

  function create(
    questionSettings: Ref<QuestionSettings>,
    sentinelRef: Ref<HTMLElement | null>,
    options: {
      initialCount: number
      batchSize: number
      threshold: number
    }
  ) {
    if (instance.value) return instance.value

    instance.value = useIncrementalLoading(
      questionSettings,
      sentinelRef,
      options
    )

    return instance.value
  }

  function init() {
    instance.value?.init()
  }

  function initObserver() {
    instance.value?.initObserverManually()
  }

  return {
    instance,
    create,
    init,
    initObserver,
  }
}
