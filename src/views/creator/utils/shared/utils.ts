import { v4 as uuidv4 } from 'uuid'
import { toRaw, isProxy } from 'vue'
import type { 
  QuestionElement 
} from '@/views/creator/types/questionnaire.ts'
import { htmlToPlainText } from "@/views/creator/utils/adapter"

export const generateUUID = () => {
	return uuidv4()
}

/**
 * 递归地将 Proxy 对象转换为原始对象
 */
const deepToRaw = <T>(obj: T): T => {
  const raw = isProxy(obj) ? toRaw(obj) : obj
  
  if (Array.isArray(raw)) {
    return raw.map(item => deepToRaw(item)) as T
  }
  
  if (raw !== null && typeof raw === 'object') {
    const result: any = {}
    for (const key in raw) {
      if (Object.prototype.hasOwnProperty.call(raw, key)) {
        result[key] = deepToRaw((raw as any)[key])
      }
    }
    return result as T
  }
  
  return raw
}

export function snapshot<T>(value: T): T {
  return structuredClone(deepToRaw(value))
}

export function detachReactive<T>(data: T): T {
  return structuredClone(toRaw(data))
}

// 先不删除，作为兜底所用好了
export const adapteElement = (element: QuestionElement): QuestionElement => {
  const result: any = { ...element }
  
  // 只有存在 title 属性时才适配
  if ('title' in element && typeof element.title === 'string') {
    result.title = htmlToPlainText(element.title)
  }
  
  // 只有存在 description 属性时才适配  
  if ('description' in element && typeof element.description === 'string') {
    result.description = htmlToPlainText(element.description)
  }
  
  // 只有存在 choices 属性时才适配
  if ('choices' in element && Array.isArray(element.choices)) {
    if (element.choices.length > 0) {
      if (typeof element.choices[0] === 'object' && element.choices[0] !== null) {
        // 对象数组（radiogroup/checkbox）
        result.choices = element.choices.map(choice => ({
          ...choice,
          value: htmlToPlainText(choice.value || '')
        }))
      } else {
        // 字符串数组（dropdown/ranking）
        result.choices = element.choices.map(choice => 
          htmlToPlainText(choice || '')
        )
      }
    }
  }
  
  // 只有存在 columns 属性时才适配（matrix）
  if ('columns' in element && Array.isArray(element.columns)) {
    result.columns = element.columns.map(col => htmlToPlainText(col || ''))
  }
  
  // 只有存在 rows 属性时才适配（matrix）
  if ('rows' in element && Array.isArray(element.rows)) {
    result.rows = element.rows.map(row => htmlToPlainText(row || ''))
  }
  
  // 只有存在 items 属性时才适配（multipletext）
  if ('items' in element && Array.isArray(element.items)) {
    result.items = element.items.map(item => ({
      ...item,
      name: htmlToPlainText(item.name || '')
    }))
  }
  
  return result
}


export const handleUIEffect = (uiContext:any,editorStore:any) => {
  switch (uiContext.effect) {
    case 'switch-active-element':
      editorStore.setCurrentQuestionId(uiContext.payload.activeElementId)
      editorStore.setSettingType('questionSetting')
      break
    
    case 'create-active-element':
      editorStore.setCurrentQuestionId(uiContext.payload.activeElementId)
      break  
  }
}
