import { questionTemplates } from './questionTemplates.js'
import { validateSingleQuestionTemplate } from './validate-base-survey.js'

/**
 * 验证结果接口
 */
export interface QuestionValidationResult {
  questionType: string
  ok: boolean
  errors: any[]
  questionTemplate: any
  surveyJson: any
  survey?: any
}

/**
 * 验证所有问题模板
 * @returns 所有问题类型的验证结果
 */
export function validateAllQuestionTemplates(): QuestionValidationResult[] {
  const results: QuestionValidationResult[] = []
  
  console.log('🔍 开始验证所有问题模板...')
  console.log(`📊 共发现 ${questionTemplates.length} 个问题模板`)
  
  questionTemplates.forEach((template, index) => {
    console.log(`\n📝 [${index + 1}/${questionTemplates.length}] 验证问题类型: ${template.type}`)
    
    const result = validateSingleQuestionTemplate(template, template.type)
    results.push(result)
    
    if (result.ok) {
      console.log(`✅ ${template.type} - 验证通过`)
    } else {
      console.log(`❌ ${template.type} - 验证失败`)
      result.errors.forEach((error, errorIndex) => {
        console.log(`   ${errorIndex + 1}. [${error.type}] ${error.message}`)
      })
    }
  })
  
  return results
}

/**
 * 验证特定类型的问题模板
 * @param questionType 问题类型
 * @returns 验证结果，如果找不到该类型则返回 null
 */
export function validateQuestionTemplateByType(questionType: string): QuestionValidationResult | null {
  const template = questionTemplates.find(t => t.type === questionType)
  
  if (!template) {
    console.warn(`⚠️ 未找到问题类型: ${questionType}`)
    return null
  }
  
  console.log(`🔍 验证问题类型: ${questionType}`)
  const result = validateSingleQuestionTemplate(template, questionType)
  
  if (result.ok) {
    console.log(`✅ ${questionType} - 验证通过`)
  } else {
    console.log(`❌ ${questionType} - 验证失败`)
    result.errors.forEach((error, index) => {
      console.log(`   ${index + 1}. [${error.type}] ${error.message}`)
    })
  }
  
  return result
}

/**
 * 生成验证报告
 * @param results 验证结果数组
 * @returns 格式化的报告字符串
 */
export function generateValidationReport(results: QuestionValidationResult[]): string {
  const passedCount = results.filter(r => r.ok).length
  const failedCount = results.length - passedCount
  
  let report = `\n📋 SurveyJS 问题模板验证报告\n`
  report += `${'='.repeat(50)}\n`
  report += `📊 总计: ${results.length} 个问题类型\n`
  report += `✅ 通过: ${passedCount} 个\n`
  report += `❌ 失败: ${failedCount} 个\n`
  report += `📈 通过率: ${((passedCount / results.length) * 100).toFixed(1)}%\n\n`
  
  if (failedCount > 0) {
    report += `❌ 失败的问题类型:\n`
    results.filter(r => !r.ok).forEach((result, index) => {
      report += `\n${index + 1}. ${result.questionType}\n`
      result.errors.forEach((error, errorIndex) => {
        report += `   ${errorIndex + 1}. [${error.type}] ${error.message}\n`
      })
    })
  }
  
  if (passedCount > 0) {
    report += `\n✅ 通过的问题类型:\n`
    results.filter(r => r.ok).forEach((result, index) => {
      report += `${index + 1}. ${result.questionType}\n`
    })
  }
  
  return report
}

/**
 * 运行完整的验证测试并输出报告
 */
export function runValidationTests() {
  console.log('🚀 启动 SurveyJS 问题模板验证测试')
  
  const results = validateAllQuestionTemplates()
  const report = generateValidationReport(results)
  
  console.log(report)
  
  return {
    results,
    report,
    summary: {
      total: results.length,
      passed: results.filter(r => r.ok).length,
      failed: results.filter(r => !r.ok).length,
      passRate: (results.filter(r => r.ok).length / results.length) * 100
    }
  }
}

/**
 * 获取所有支持的问题类型列表
 */
export function getSupportedQuestionTypes(): string[] {
  return questionTemplates.map(template => template.type)
}

/**
 * 检查特定问题类型是否受支持
 */
export function isQuestionTypeSupported(questionType: string): boolean {
  return questionTemplates.some(template => template.type === questionType)
}