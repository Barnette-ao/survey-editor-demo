import { cloneDeep } from 'lodash-es'

/**
 * 重置页面名称
 */
const resetPageName = (page: any, index: number) => {
	page.name = `page${index + 1}`
	return page
}

/**
 * 检查元素类型属性
 */
const checkTypeProp = (page: any) => {
	if (page.elements) {
		page.elements = page.elements.map((element: any) => {
			if (element.type) {
				return element
			}
		})
	}
	
	return page
}

/**
 * 设置页面结构
 */
const setPage = (copy: any) => {
	const { elements, ...rest } = copy
	copy = rest
	copy.pages = []
	copy.pages.push({ name: "page1", elements: elements })
	return copy
}

/**
 * 保存到数据库前的数据处理
 */
export const beforeSaveToDatabase = (settings: any) => {
	let copy = cloneDeep(settings)

	if (!copy.hasOwnProperty("pages")) {
		copy = setPage(copy)
	}

	copy.pages = copy.pages
		.map(resetPageName)
		.map(checkTypeProp)

	return copy
}
