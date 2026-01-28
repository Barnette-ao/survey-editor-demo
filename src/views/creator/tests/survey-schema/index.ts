// 导出所有验证相关的函数和类型
export {
  createBaseSurveyShell,
  buildSurveyWithSingleQuestion,
  validateSurveyByRuntime,
  validateSingleQuestionTemplate
} from './validate-base-survey'

export {
  validateAllQuestionTemplates,
  validateQuestionTemplateByType,
  generateValidationReport,
  runValidationTests,
  getSupportedQuestionTypes,
  isQuestionTypeSupported,
  type QuestionValidationResult
} from './validate-question-templates'

// 便捷的全局测试函数
export function runQuickTest() {
  console.log('🚀 快速运行 SurveyJS 问题模板验证测试')
  
  import('./validate-question-templates').then(module => {
    return module.runValidationTests()
  })
}

// 在浏览器控制台中可用的全局函数
if (typeof window !== 'undefined') {
  (window as any).surveySchemaTest = {
    runQuickTest,
    runValidationTests: async () => {
      const module = await import('./validate-question-templates')
      return module.runValidationTests()
    },
    validateByType: async (type: string) => {
      const module = await import('./validate-question-templates')
      return module.validateQuestionTemplateByType(type)
    },
    getSupportedTypes: async () => {
      const module = await import('./validate-question-templates')
      return module.getSupportedQuestionTypes()
    }
  }
}