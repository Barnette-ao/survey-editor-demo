// 逻辑规则类型
export interface LogicRule {
  id: string
  ifConditions: IfCondition[]
  thenCondition: ThenCondition
}

export interface IfCondition {
  elementId: string
  state: string
  choiceIndex: number | number[] | ''
  score: string
  connector:string
}

export interface ThenCondition {
  action: 'jump' | 'show' | 'hide'
  targetElementId: string
}

// 选择项类型
export interface Choice {
  value: string
  showText: boolean
  textType: 'text'
  required: boolean
}

export interface BaseQuestionElement {
  /** 唯一标识 */
  id: string

  /** 题目名称（用于逻辑 / 表达式） */
  name?: string

  /** 题型 */
  type: string

  /** 是否隐藏题号 */
  hideNumber?: boolean

  /** 题目序号 */
  number?: number

  /** 
   * 是否可见
   * - undefined：默认可见
   * - true：强制显示
   * - false：强制隐藏（逻辑规则作用结果）
   */
  visible?: boolean
}

export interface ChoiceQuestionElement extends BaseQuestionElement {
  choices: any[]
  choicesOrder?: 'random' | 'none'
}

// HTML 元素类型
export interface HtmlElement extends BaseQuestionElement {
  type: 'html'
  html: string
}

// 单选题类型
export interface RadioGroupElement extends ChoiceQuestionElement {
  type: 'radiogroup'
  title: string
  description: string
  isRequired: boolean
  choices: Choice[]
}

// 多选题类型  
export interface CheckboxElement extends ChoiceQuestionElement {
  type: 'checkbox'
  title: string
  description: string
  isRequired: boolean
  choices: Choice[]
  showSelectAllItem: boolean
  selectAllText: string
  itemComponent: string
}

// 下拉题类型
export interface DropdownElement extends ChoiceQuestionElement {
  type: 'dropdown'
  title: string
  description: string
  isRequired: boolean
  choices: string[]
}

// 文本题类型
export interface TextElement extends BaseQuestionElement {
  type: 'text'
  title: string
  description: string
  isRequired: boolean
}

// 多行文本类型
export interface CommentElement extends BaseQuestionElement {
  type: 'comment'
  title: string
  description: string
  isRequired: boolean
  placeholder: string
}

// 量表题类型（label/stars/smileys）
export interface RatingElement extends BaseQuestionElement {
  type: 'ratinglabel' | 'ratingstars' | 'ratingsmileys'
  title: string
  description: string
  isRequired: boolean
  rateType: 'label' | 'stars' | 'smileys'
  displayMode: 'buttons'
}

// 排序题类型
export interface RankingElement extends ChoiceQuestionElement {
  type: 'ranking'
  title: string
  description: string
  isRequired: boolean
  choices: string[]
}

// 上传文件题型
export interface FileElement extends BaseQuestionElement {
  type: 'file'
  title: string
  description: string
  isRequired: boolean
  storeDataAsText: boolean
  waitForUpload: string
  fileOrPhotoPlaceholder: string
  photoPlaceholder: string
  filePlaceholder: string
}

// 图片选择题类型
export interface ImagePickerElement extends ChoiceQuestionElement {
  type: 'imagepicker'
  title: string
  isRequired: boolean
  choices: any[] // 根据实际数据调整
  imageFit: 'cover'
}

// 多项填空题类型
export interface MultipleTextElement extends BaseQuestionElement {
  type: 'multipletext'
  title: string
  description: string
  isRequired: boolean
  items: Array<{ name: string }>
}

export interface ContainerQuestionElement extends BaseQuestionElement {
  questionsOrder?: 'random' | 'initial'
}

// 矩阵题类型
export interface MatrixElement extends ContainerQuestionElement {
  type: 'matrix'
  title: string
  description: string
  isRequired: boolean
  columns: string[]
  rows: string[]
}

// 面板类型
export interface PanelElement extends ContainerQuestionElement {
  type: 'panel'
}

// 签名题类型
export interface SignaturePadElement extends BaseQuestionElement{
  type: 'signaturepad'
  title: string
  description: string
  isRequired: boolean
  placeholder: string
  placeholderReadOnly: string
}

// 通用题目元素类型（联合类型）
export type QuestionElement =
  | HtmlElement
  | RadioGroupElement
  | CheckboxElement
  | DropdownElement
  | RatingElement
  | RankingElement
  | FileElement
  | ImagePickerElement
  | TextElement
  | CommentElement
  | MultipleTextElement
  | MatrixElement
  | SignaturePadElement

export type CanSetLogicElement =
  | RadioGroupElement
  | CheckboxElement
  | DropdownElement
  | RatingElement
  | ImagePickerElement

// 页面类型
export interface QuestionPage {
  name: string
  elements: QuestionElement[]
}

// 触发器类型
export interface Trigger {
  type: string
  expression: string
  gotoName: string
}

// 问卷设置主类型
export interface QuestionSettings {
  title: string
  description: string
  pages: QuestionPage[]
  logicRules: LogicRule[]
  questionsOnPageMode: 'questionPerPage' | string
  triggers: Trigger[]

  showQuestionNumbers: boolean
}

