
// 以及它们的属性的类型是否合格
export function validateStorageSchema(data: any): void {
  // 1️⃣ 顶层必须是对象
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error('问卷数据必须是一个对象')
  }

  // 2️⃣ pages 必须存在
  if (!Array.isArray(data.pages)) {
    throw new Error('问卷必须包含 pages 数组')
  }

  data.pages.forEach((page: any, pageIndex: number) => {
    // 3️⃣ page 必须是对象
    if (typeof page !== 'object' || page === null) {
      throw new Error(`pages[${pageIndex}] 必须是对象`)
    }

    // 4️⃣ page.name
    if (typeof page.name !== 'string' || !page.name.trim()) {
      throw new Error(`pages[${pageIndex}].name 必须是非空字符串`)
    }

    // 5️⃣ page.elements
    if (!Array.isArray(page.elements)) {
      throw new Error(`pages[${pageIndex}].elements 必须是数组`)
    }

    page.elements.forEach((el: any, elIndex: number) => {
      // 6️⃣ element 必须是对象
      if (typeof el !== 'object' || el === null) {
        throw new Error(
          `pages[${pageIndex}].elements[${elIndex}] 必须是对象`
        )
      }

      // 7️⃣ element.type
      if (typeof el.type !== 'string' || !el.type.trim()) {
        throw new Error(
          `pages[${pageIndex}].elements[${elIndex}].type 必须是非空字符串`
        )
      }

      // 8️⃣ 可选字段的类型约束
      if (el.name !== undefined && typeof el.name !== 'string') {
        throw new Error(
          `pages[${pageIndex}].elements[${elIndex}].name 必须是字符串`
        )
      }

      if (el.title !== undefined && typeof el.title !== 'string') {
        throw new Error(
          `pages[${pageIndex}].elements[${elIndex}].title 必须是字符串`
        )
      }

      if (el.choices !== undefined && !Array.isArray(el.choices)) {
        throw new Error(
          `pages[${pageIndex}].elements[${elIndex}].choices 必须是数组`
        )
      }
    })
  })
}