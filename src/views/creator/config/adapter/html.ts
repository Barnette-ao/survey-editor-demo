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