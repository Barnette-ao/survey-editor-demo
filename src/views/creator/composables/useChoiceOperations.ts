import { snapshot } from '@/views/creator/utils/shared'

/**
 * 选项操作相关的纯函数
 * 用于处理选择题（checkbox、radiogroup等）的选项增删改操作
 */

interface ChoiceItem {
  value: string
  showText: boolean
  textType: string
  required: boolean
}

/**
 * 创建新的选项项
 */
const createChoiceItem = (value: string, showText = false): ChoiceItem => {
  return {
    value,
    showText,
    textType: "text",
    required: true,
  }
}

/**
 * 查找"其他"选项的索引
 */
const findOtherOptionIndex = (choices: ChoiceItem[]): number => {
  return choices.findIndex(choice => choice.value === '其他')
}

/**
 * 添加单个选项
 */


export const addSingleOption = (choices: ChoiceItem[]): ChoiceItem[] => {
  const newChoices = snapshot(choices) //深拷贝原始数据
  const otherOptionIndex = findOtherOptionIndex(newChoices)
  const index = otherOptionIndex === -1 ? newChoices.length + 1 : newChoices.length
  const newChoiceItem = createChoiceItem(`选项${index}`)

  if (otherOptionIndex !== -1) {
    newChoices.splice(otherOptionIndex, 0, newChoiceItem)
  } else {
    newChoices.push(newChoiceItem)
  }

  return newChoices
}

/**
 * 添加"其他"选项
 */
export const addOtherOption = (choices: ChoiceItem[]): ChoiceItem[] => {
  const newChoices = snapshot(choices) //深拷贝原始数据
  const otherChoiceItem = createChoiceItem('其他', true)
  newChoices.push(otherChoiceItem)
  return newChoices
}

/**
 * 删除指定索引的选项
 */
export const deleteOptionAtIndex = (choices: ChoiceItem[], index: number): ChoiceItem[] => {
  const newChoices = snapshot(choices) //深拷贝原始数据
  newChoices.splice(index, 1)
  return newChoices
}

/**
 * 格式化新选项数组
 */
const formatNewOptions = (options: string[]): ChoiceItem[] => {
  return options.map(value => createChoiceItem(value))
}

/**
 * 批量添加选项
 */
export const addBatchOptions = (choices: ChoiceItem[], newOptions: string[]): ChoiceItem[] => {
  const newChoices = snapshot(choices) //深拷贝原始数据
  const otherOptionIndex = findOtherOptionIndex(newChoices)
  const formattedOptions = formatNewOptions(newOptions)

  if (otherOptionIndex !== -1) {
    newChoices.splice(otherOptionIndex, 0, ...formattedOptions)
  } else {
    newChoices.push(...formattedOptions)
  }

  return newChoices
}

/**
 * 解析批量输入的文本
 */
export const parseBatchInput = (input: string): string[] => {
  return input
    .split('\n')
    .filter(option => option.trim())
    .map(option => option.trim())
}

// ===== 简单字符串数组格式的选项操作 (用于dropdown等组件) =====

/**
 * 添加单个选项 (字符串格式)
 */
export const addSimpleOption = (choices: string[]): string[] => {
  const newChoices = snapshot(choices) //深拷贝原始数据
  newChoices.push(`选项${newChoices.length + 1}`)
  return newChoices
}

/**
 * 删除指定索引的选项 (字符串格式)
 */
export const deleteSimpleOptionAtIndex = (choices: string[], index: number): string[] => {
  const newChoices = snapshot(choices) //深拷贝原始数据
  newChoices.splice(index, 1)
  return newChoices
}

/**
 * 批量添加选项 (字符串格式)
 */
export const addSimpleBatchOptions = (choices: string[], newOptions: string[]): string[] => {
  const rawChoices = snapshot([...choices, ...newOptions])
  return rawChoices 
}
