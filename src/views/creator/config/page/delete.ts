import type { QuestionSettings } from '@/views/creator/types/questionnaire'

/**
 * 删除页面
 * 能删除的page的索引大于等于1，第一页禁止删除，删除一页即将待删除页的所有题目元素加入前一页中
 * @param questionSettings - 问卷设置对象
 * @param page - 要删除的页面对象
 * @param index - 页面索引
 * @returns 克隆后的问卷设置
 */
export const deletePage = (questionSettings: QuestionSettings, index: number) => {
    const cloned = structuredClone(questionSettings)
    const deletedPage = cloned.pages[index] 
    // 该页不为空页
    if (deletedPage.elements.length > 0) {
        cloned.pages[index - 1].elements.push(...deletedPage.elements)
    }
    // 空页或者非空页都删除掉
    cloned.pages.splice(index, 1)
    
    return cloned
}
