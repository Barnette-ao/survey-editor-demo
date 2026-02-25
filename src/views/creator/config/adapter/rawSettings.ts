import { v4 as uuidv4 } from 'uuid'
import { cloneDeep } from 'lodash-es'

/**
 * 定义一个函数，用于将多个函数组合成一个函数
 */
const pipe = (...fns: Function[]) => (x: any) => fns.reduce((result, f) => f(result), x)

/**
 * 为元素添加 ID
 */
const addId = (element: any) => {
	// 定义了element.id
	if (element.id !== undefined) {
		return element
	} else {
		return {
			id: uuidv4(),
			...element
		}
	}
}

/**
 * 为每个非html和panel的元素添加number属性
 * 注意：number属性是从1开始的
 */
const createNumberGenerator = (startnumber = 1) => {
	let number = startnumber
	return (element: any) => {
		return element.type !== "html" && element.type !== "panel"
			? { ...element, number: number++ }
			: element
	}
}

/**
 * 检查元素类型
 */
const checkElementType = (element: any) => {
	if (element && element.type) {
		return element
	}
	return null
}

/**
 * 从数据库获取初始设置后的处理
 */
export const afterGetInitialSettings = (settings: any) => {
	const copy = cloneDeep(settings)
	let addNumber = createNumberGenerator()

	if (!copy.hasOwnProperty("pages")) {
		copy.pages = []
		copy.pages.push({ id:uuidv4(), name: "page1", elements: copy.elements })
	}

	// 用pipe实现函数式组合
	const processElements = pipe(
		(arr: any[]) => arr.map(checkElementType),
		(arr: any[]) => arr.filter((element: any) => element !== null), // 过滤掉无效元素
		(arr: any[]) => arr.map((element: any) => pipe(addId, addNumber)(element)),
	)

	copy.pages = copy.pages.map((page: any) => {
		if (Array.isArray(page.elements) && page.elements.length > 0) {
			page.elements = processElements(page.elements)
		}
		return page
	})
	
	return copy
}

/**
 * 格式化问卷中所有元素的序号
 * 为每个非html和panel的元素重新分配连续的number属性
 */
export const formattedNumber = (settings: any) => {
	// 不能提取出来addNumber,不然会导致number不能从1开始
	let addNumber = createNumberGenerator()

	settings.pages = settings.pages.map((page: any) => {
		if (Array.isArray(page.elements) && page.elements.length > 0) {
			page.elements = page.elements.map(addNumber)
		}
		return page
	})
}