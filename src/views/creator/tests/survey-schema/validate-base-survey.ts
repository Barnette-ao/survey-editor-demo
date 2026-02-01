import { Model } from 'survey-core'

/**
 * 创建最小合法的 SurveyJS JSON 结构
 * @returns 包含 title、pages、elements 的最小合法结构
 */
export function createBaseSurveyShell() {
  return {
    title: "测试问卷",
    pages: [
      {
        name: "page1",
        elements: []
      }
    ],
  }
}

const adapteRatingQuestion = (question:any) => {
  if(['ratinglabel', 'ratingsmileys', 'ratingstars'].includes(question.type)){
    question.type = 'rating'
  }
}

/**
 * 将单个问题注入到 survey.pages[0].elements 中
 * @param question 问题对象
 * @returns 包含该问题的完整 survey JSON
 */
export function buildSurveyWithSingleQuestion(question: any) {
  const survey = createBaseSurveyShell()
  // 适配rating类型的题目对象
  adapteRatingQuestion(question)

  // 确保问题有唯一的 name 属性

  const questionWithName = {
    name: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...question
  }
  
  ;(survey.pages[0].elements as any[]).push(questionWithName)
  return survey
}

/**
 * 使用 SurveyJS 运行时验证 JSON 结构
 * @param json 待验证的 survey JSON
 * @returns 验证结果 { ok: boolean, errors: any[] }
 */
export function validateSurveyByRuntime(json: any) {
  const errors: any[] = []
  let survey: Model | null = null
  
  try {
    // 尝试创建 SurveyJS Model
    survey = new Model(json)
    
    // 收集 jsonErrors
    if (survey.jsonErrors && survey.jsonErrors.length > 0) {
      errors.push(...survey.jsonErrors.map((error: any) => ({
        type: error.type,
        class: error.className,
        message: error.message || '未知的 JSON 错误'
      })))
    }
    
    // 检查基本结构完整性
    if (!survey.pages || survey.pages.length === 0) {
      errors.push({
        type: 'structureError',
        message: '问卷必须包含至少一个页面'
      })
    }
    
    // 检查每个页面是否有效
    survey.pages.forEach((page: any, pageIndex: number) => {
      if (!page.elements || page.elements.length === 0) {
        // 空页面不一定是错误，但可以记录为警告
        errors.push({
          type: 'warning',
          message: `页面 ${pageIndex + 1} 没有包含任何元素`
        })
      }
    })
    
  } catch (error) {
    // 捕获创建 Model 时的异常
    errors.push({
      type: 'fatalError',
      error: error,
      message: error instanceof Error ? error.message : '创建 SurveyJS Model 时发生未知错误'
    })
  }
  
  return {
    ok: errors.length === 0,
    errors: errors,
    survey: survey // 返回创建的 survey 实例，便于进一步检查
  }
}

/**
 * 验证单个问题模板
 * @param questionTemplate 问题模板对象
 * @param questionType 问题类型（用于日志）
 * @returns 验证结果
 */
export function validateSingleQuestionTemplate(questionTemplate: any, questionType?: string) {
  const surveyJson = buildSurveyWithSingleQuestion(questionTemplate)
  const result = validateSurveyByRuntime(surveyJson)
  
  return {
    ...result,
    questionType: questionType || questionTemplate.type,
    questionTemplate: questionTemplate,
    surveyJson: surveyJson
  }
}