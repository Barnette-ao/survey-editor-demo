import { v4 as uuidv4 } from 'uuid'
import { cloneDeep } from 'lodash-es'
import _ from "lodash-es";


export const generateUUID = () => {
	return uuidv4()
}

// 判断逻辑规则是否是默认的逻辑规则,是默认规则，返回true，否则返回false
export const isDefaultRule = (rule) => {
	const { thenCondition, ifConditions } = rule;

	// 条件为空的判定逻辑
	const isEmptyCondition = (condition) =>
		condition.state === '' &&
		condition.choiceIndex === '' &&
		condition.score === '' &&
		condition.elementId !== ''

	// 检查跳转逻辑：目标 ID 为空 + 条件为空 → 默认规则
	if (
		thenCondition.action === 'jump' &&
		thenCondition.targetElementId === '' &&
		ifConditions.length === 1
	) {
		return isEmptyCondition(ifConditions[0]);
	}

	// 检查显示逻辑：目标 ID 存在 + 条件为空 → 默认规则
	if (
		thenCondition.action === 'show' &&
		thenCondition.targetElementId &&
		ifConditions.length === 1
	) {
		return isEmptyCondition(ifConditions[0]);
	}

	return false;
}

// 默认规则不是不完全规则，也就是说默认规则是一种完整的规则
// 如果是跳转逻辑，那么如果targetElementId为空，则为不完全；否则
// 遍历所有的ifConditions中的如果条件，查看如果条件是否为不完全
// ['equal', 'lessThan', 'greaterThan', 'greaterOrEqual', 'lesserOrEqual'].includes(state)
// 上述函数返回true，那么score属性若为空字符串，该规则及为不完全规则
// 上述函数返回false,那么如果['selected', 'notBeSelected'].includes(state)，
// 上述函数返回true,则若choiceIndex则为空字符串，该规则为不完全规则。
// 如果是显示规则，遍历整个ifConditions
// 如果elementId为空，则为不完全规则
// 否则，如上
// 如果是完整规则，返回true，如果是不完整规则，返回fasle
export const isCompleteRule = (rule) => {
	if (isDefaultRule(rule)) return true

	const { ifConditions, thenCondition } = rule

	const isCompleteItem = (condition) => {
		if (condition.state === '') return false
		if (['equal', 'lessThan', 'greaterThan', 'greaterOrEqual', 'lesserOrEqual']
			.includes(condition.state)) {
			return condition.score !== ''
		}
		else if (['selected', 'notBeSelected'].includes(condition.state)) {
			return condition.choiceIndex !== ''
		}
		return true
	}

	const areConditionsCompelete = (conditions) => conditions.every(isCompleteItem)

	// 跳转逻辑
	if (thenCondition.action === 'jump') {
		return thenCondition.targetElementId !== '' && areConditionsCompelete(ifConditions)
	}
	// 显示逻辑
	return ifConditions.every(condition =>
		condition.elementId !== '' && isCompleteItem(condition)
	)
}

export const isEqual = (obj1, obj2) => {
	return _.isEqual(obj1, obj2)
}

// 实现A-B的差集
export const difference = (A, B) => {
	return _.difference(A, B);
}



// 深拷贝元素并生成新的 id
export const cloneElement = (element) => {
	// 使用 lodash 的 cloneDeep 进行深拷贝
	const clonedElement = cloneDeep(element)

	// 生成新的 uuid
	clonedElement.id = uuidv4()

	return clonedElement
}

export const getValueOf = (key) => {
	return key['zh-cn'].match(/<\/?p>/g) ? key['zh-cn'].replace(/<\/?p>/g, '') : key['zh-cn']
}

export const isOnlyBr = (str) => {
	const removePStr = str.replace(/<\/?p>/g, '')
	const removeBrStr = removePStr.replace(/<br\s*\/?>/g, '')
	return removeBrStr.trim() === ''
}

export const formatContent = (key, value) => {
  if (isOnlyBr(value)) {
    return "";
  } else if (key == "zh-cn") {
    return value;
  }
  return value.match(/<\/?p>/g) ? value.replace(/<\/?p>/g, "") : value;
};

export const wrapTextWithPTag = (text) => {
	// 如果文本已经有 p 标签则直接返回
	if (!text) {
		return `<p><br></p>`
	}

	if (text.match(/<\/?p>/g)) {
		return text
	}
	return `<p>${text}</p>`
}


// 获取设置组件的特定属性
export const getSettingProps = (element) => {
	const props = {}
	// 只有当 element.hideNumber 存在时才显示序号设置项
	props.showNumberItem = element.hideNumber !== undefined

	return props
}

// add(1)(2)(3)
export const add = function (...args) {

	// 如果写成const inner = () => { args.push(...arguments); return inner}
	// 这样函数行为与预期不符，因为箭头函数本身没有 arguments 对象，它会继承外部函数的 arguments 对象。
	// 所以add(1)(2)(3)执行起来，inner执行一次，加入的argument始终是[1],
	// 所以args在add(1)(2)(3)...执行的时候，其实是[1,1,1]，所以会输出3
	// 同理，add(1)(2)(3)()会输出4
	// 所以不能用箭头函数，哪怕使用匿名函数也可以
	const inner = function () {
		args.push(...arguments)
		return inner
	}
	// 累加计算，最后无论加了多少个括号，都会返回一个inner函数
	// 返回的时候函数，而不是累加的结果。
	// 为了获得累加的结果，需要重写toString方法
	// 这样调用函数的方式就有差别，“ + add(1)(2)(3)
	inner.toString = function () {
		return args.reduce((pre, cur) => pre + cur, 0)
	}

	// 递归完成
	return inner
}

export const testReturnAdd = () => {
	const result = add(1)(2)(3)
	return "" + result
}

export const isRating = (type) => {
	return ["ratinglabel", "ratingstars", "ratingsmileys"].includes(type)
}

// 定义一个函数，用于将多个函数组合成一个函数
const pipe = (...fns) => (x) => fns.reduce((result, f) => f(result), x);

export const beforeSaveToDatabase = (settings) => {
	let copy = cloneDeep(settings)

	const setPage = (copy) => {
		const { elements, ...rest } = copy
		copy = rest;
		copy.pages = []
		copy.pages.push({ name: "page1", elements: elements })
		return copy
	}

	if (!copy.hasOwnProperty("pages")) {
		copy = setPage(copy)
	}

	const resetPageName = (page, index) => {
		page.name = `page${index + 1}`
		return page
	}

	const checkTypeProp = (page) => {
		if(page.elements){
			page.elements = page.elements.map(element => {
				if (element.type) {
					return element
				}
			})
		}
		
		return page
	}

	copy.pages = copy.pages
		.map(resetPageName)
		.map(checkTypeProp)
		

	return copy
}

export const addId = element => {
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

// 为每个非html和panel的元素添加number属性
// 注意：number属性是从1开始的
export const createNumberGenerator = (startnumber = 1) => {
	let number = startnumber;
	return element => {
		return element.type !== "html" && element.type !== "panel"
			? { ...element, number: number++ }
			: element
	}
}

// 现在name属性是题目元素的唯一标识，所以不能每次都重复赋值了

const checkElementType = (element) => {
	if (element && element.type) {
		return element
	}
	return null;
}



export const formattedNumber = (settings) => {
	// 不能提取出来addNumber,不然会导致number不能从1开始
	let addNumber = createNumberGenerator()

	settings.pages = settings.pages.map((page) => {
		if (Array.isArray(page.elements) && page.elements.length > 0) {
			page.elements = page.elements.map(addNumber)
		}
		return page
	})
	addNumber = null;
}

/**
 * 将 Tiptap 生成的 HTML 转换为纯文本
 * 专门针对你的 Toolbar 配置：Bold、H1、红色字体、14px 字号
 */
export const htmlToPlainText = (html) => {
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


export const afterGetInitialSettings = (settings) => {
	const copy = cloneDeep(settings)
	let addNumber = createNumberGenerator()

	if (!copy.hasOwnProperty("pages")) {
		copy.pages = []
		copy.pages.push({ name: "page1", elements: copy.elements })
	}

	// 用pipe实现函数式组合
	const processElements = pipe(
		arr => arr.map(checkElementType),
		arr => arr.filter((element) => element !== null), // 过滤掉无效元素
		arr => arr.map((element) => pipe(addId, addNumber)(element)),
	)

	copy.pages = copy.pages.map((page) => {
		if (Array.isArray(page.elements) && page.elements.length > 0) {
			page.elements = processElements(page.elements)
		}
		return page
	})
	addNumber = null;

	return copy
}

export function resolvePlugin(mod) {
  if (typeof mod === 'function') return mod
  if (mod && typeof mod.default === 'function') return mod.default
  throw new Error('Invalid plugin export')
}


