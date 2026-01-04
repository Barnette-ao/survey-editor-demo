import { computed } from 'vue'
import { componentMap, ratingTypeMap } from "@/views/creator/config/componentAndSettingMap"

export function useComponentMapping() {
  // 组件映射计算
  const componentIs = computed(() => {
    return (element) => {
      const type = element.type === "rating" 
        ? ratingTypeMap[element.rateType] 
        : element.type
      return componentMap[type]
    }
  })

  return {
    componentIs
  }
}