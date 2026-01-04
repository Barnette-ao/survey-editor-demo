import { computed } from 'vue'
import { questionTypeList } from "@/views/creator/utils/questionTypeList"
import { ratingTypeMap } from "@/views/creator/config/componentAndSettingMap"

export function useCurrentElement(questionSettings, currentQuestionId) {
  // 当前选中的元素
  const currentElement = computed(() => {
    const allElements = questionSettings.pages
      .map((page) => page.elements)
      .flat()
    
    return allElements.find((element) => element.id === currentQuestionId.value)
  })

  // 获取当前元素类型
  const getCurrentElementType = computed(() => {
    if (!currentElement.value) return ""

    return currentElement.value.type === "rating"
      ? ratingTypeMap[currentElement.value.rateType]
      : currentElement.value.type
  })

  // 获取当前元素类型文本
  const getCurrentElementTypeText = computed(() => {
    if (!currentElement.value) return ""

    const currentElementType = getCurrentElementType.value
    const questionType = questionTypeList
      .map((el) => el.list)
      .flat()
      .find((el) => el.type === currentElementType)
    
    return questionType?.text || ""
  })

  return {
    currentElement,
    getCurrentElementType,
    getCurrentElementTypeText
  }
}