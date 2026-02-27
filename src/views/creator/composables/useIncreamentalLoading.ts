import { ref, computed, watch, nextTick, type Ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import type { QuestionPage } from '@/views/creator/types/questionnaire'
import type { RenderedItem } from '@/views/creator/types/design'

interface UseIncrementalLoadingOptions {
  initialCount?: number
  batchSize?: number  
  threshold?: number
}

interface IncrementalLoadingReturn {
  renderedItems: Ref<RenderedItem[]>
  isLoading: Ref<boolean>
  hasMore: Ref<boolean>
  loadMore: () => void
  init: () => void
  initObserverManually: () => void
  cleanup: () => void
}

export function useIncrementalLoading(
  questionSettings: Ref<{ pages?: QuestionPage[] }>,
  sentinelRef: Ref<HTMLElement | null>,
  options: UseIncrementalLoadingOptions = {}
): IncrementalLoadingReturn {
  const {
    initialCount = 10,
    batchSize = 5,
    threshold = 200
  } = options

  // 状态管理
  const isLoading = ref(false)
  const observer = ref<IntersectionObserver | null>(null)

  // 已渲染的项目（只增加，不重新计算）
  const renderedItems = ref<RenderedItem[]>([])

  // 扁平化所有项目（页面 + 元素）
  const allItems = computed<RenderedItem[]>(() => {
    const settings = questionSettings.value
    if (!settings?.pages) return []

    const items: RenderedItem[] = []
    settings.pages.forEach((page, pageIndex) => {
      // 添加页面项
      if (settings.pages && settings.pages.length > 1) {
        items.push({
          type: 'page',
          pageIndex,
          page,
          id: page.id
        })
      }
      
      // 添加元素项
      page.elements?.forEach((element, elementIndex) => {
        items.push({
          type: 'element',
          pageIndex,
          elementIndex,
          element,
          id: element.id
        })
      })
    })
    
    return items
  })

  // 是否还有更多内容
  const hasMore = computed<boolean>(() => {
    return renderedItems.value.length < allItems.value.length
  })

  // 加载更多
  const loadMore = (): void => {
    if (isLoading.value || !hasMore.value) return
    
    isLoading.value = true
    
    // 模拟异步加载（可以根据需要调整）
    setTimeout(() => {
      const currentLength = renderedItems.value.length
      const nextBatch = allItems.value.slice(
        currentLength, 
        currentLength + batchSize
      )
      
      // 只添加新项目，不重新渲染已有项目
      renderedItems.value.push(...nextBatch)
      isLoading.value = false
      
      // 清空观察器
      cleanupObserver()
    }, 50)
  }

  // 更新哨兵元素位置
  const cleanupObserver = (): void => {
    if (!hasMore.value && observer.value && sentinelRef.value) {
      observer.value.unobserve(sentinelRef.value)
    }
  }

  // 初始化 IntersectionObserver
  const initObserver = (): void => {
    const element = sentinelRef.value
    if (!element) {
      console.warn('sentinelRef is null, observer not initialized')
      return
    }

    observer.value = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && hasMore.value) {
          loadMore()
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0.1
      }
    )

    observer.value.observe(element)
  }

  // 初始化
  const init = (): void => {
    const initialItems = allItems.value.slice(0, initialCount)
    renderedItems.value = [...initialItems]
  }

  // 手动初始化 Observer（在组件中调用）
  const initObserverManually = (): void => {
    nextTick(() => {
      initObserver()
    })
  }

  // 清理
  const cleanup = (): void => {
    if (observer.value) {
      observer.value.disconnect()
    }
  }

  const debounceUpdate = useDebounceFn((newAllItems: RenderedItem[]) => {
    // 获取当前已渲染的数量
    const currentRenderedCount = renderedItems.value.length
    // 重新计算 renderedItems，保持相同的渲染数量
    const newRenderedCount = newAllItems.length <= initialCount 
      ? newAllItems.length
      : Math.min(currentRenderedCount, newAllItems.length)
    renderedItems.value = newAllItems.slice(0, newRenderedCount)
  }, 50)

  // 监听 allItems 变化，同步更新 renderedItems
  watch(
    allItems,
    debounceUpdate,
    { 
      deep: true
    }
  )

  return {
    renderedItems,
    isLoading,
    hasMore,
    loadMore,
    init,
    initObserverManually,
    cleanup
  }
}