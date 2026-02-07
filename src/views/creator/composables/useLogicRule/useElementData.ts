import { computed } from 'vue'
import type { 
  QuestionSettings, QuestionElement, CanSetLogicElement 
} from '@/views/creator/types/questionnaire.ts'
// import { htmlToPlainText } from "@/views/creator/config/helpers"

// 提前结束选项类型
interface CompleteOption {
  id: 'complete'
  title: '提前结束'
}

export function useElementData(
  props: { 
    questionSettings: QuestionSettings; 
    element: QuestionElement 
  }, 
  filterType: string[]
) {
  const allElements = computed<QuestionElement[]>(() => {
    return (props.questionSettings.pages ?? []).flatMap(page => page.elements)
      .map(element => adapteElement(element))
  })

  const allIfElement = computed<CanSetLogicElement[]>(() => {
    return allElements.value.filter(isCanSetLogicElement)
  })

  // 创建类型守卫函数
  const isCanSetLogicElement = (element: QuestionElement): element is CanSetLogicElement => {
    return !filterType.includes(element.type)
  }
  
  const allTargetElements = computed<(QuestionElement | CompleteOption)[]>(() => {
    const elements = [...allElements.value]
    elements.shift() // 移除简介页面
    return [...elements, { id: "complete", title: "提前结束" }]
  })
  
  // 是否是第一个能够设置逻辑规则题目中，第二个题目元素
  const isFistElement = computed<boolean>(() => {
    if (!props.element) return false
    let elementIndex = allElements.value.findIndex(el => props.element.id === el.id)
    return elementIndex === 1
  })

  const getCurrentElementIndex = computed<number>(() => {
    return allIfElement.value.findIndex(item =>
        props.element.id === item.id
    )
  })
  
  return {
    allElements,
    allIfElement,
    allTargetElements,
    isFistElement,
    getCurrentElementIndex,
  }
}

const adapteElement = (element: QuestionElement): QuestionElement => {
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

/**
 * 将 Tiptap 生成的 HTML 转换为纯文本
 * 专门针对你的 Toolbar 配置：Bold、H1、红色字体、14px 字号
 */
export const htmlToPlainText = (html:string) => {
  // 边界情况处理
  if (!html || typeof html !== 'string') {
    return ''
  }
  
  // 处理 Tiptap 常见的空内容
  const trimmedHtml = html.trim()
  if (
    trimmedHtml === '' ||
    trimmedHtml === '<p></p>' ||
    trimmedHtml === '<p><br></p>' ||
    trimmedHtml === '<p>&nbsp;</p>'
  ) {
    return ''
  }
  
  try {
    // 创建 DOMParser 实例
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    
    // 提取纯文本内容（自动忽略所有 HTML 标签和样式）
    let text = doc.body.textContent || doc.body.innerText || ''
    
    // 清理空白字符
    text = text
      .replace(/\s+/g, ' ') // 将多个连续空白字符替换为单个空格
      .trim()
    
    return text
  } catch (error) {
    console.warn('HTML to plain text conversion failed:', error)
    // 兜底方案：直接移除所有 HTML 标签
    return html
      .replace(/<[^>]*>/g, '') // 移除所有 HTML 标签
      .replace(/\s+/g, ' ')     // 清理空白字符
      .trim()
  }
}