// 临时测试运行器，用于在开发环境中快速验证
import { runValidationTests } from './validate-question-templates.js'

console.log('🚀 开始运行 SurveyJS 问题模板验证测试...')

try {
  const result = runValidationTests()
  console.log('\n📋 测试完成！')
  console.log('📊 测试摘要:', result.summary)
  
  if (result.summary.failed > 0) {
    console.log('\n❌ 发现问题的题型:')
    result.results.filter(r => !r.ok).forEach(result => {
      console.log(`\n🔍 ${result.questionType}:`)
      result.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. [${error.type}] ${error.message}`)
      })
    })
  }
  
} catch (error) {
  console.error('❌ 测试运行失败:', error)
}