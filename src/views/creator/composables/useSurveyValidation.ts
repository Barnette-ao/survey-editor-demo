import { reactive } from 'vue'
import { Model } from 'survey-core'
import * as monaco from 'monaco-editor'

export interface SurveySchemaError {
  message: string
  type?: string
  className?: string,
  propertyName?: string
}

export function useSurveyValidation() {
  const validationState = reactive({
    hasJsonSyntaxError: false,
    hasSurveySchemaError: false,
    jsonMarkers: [] as monaco.editor.IMarker[],
    surveyErrors: [] as SurveySchemaError[],
    stage: 'valid' as 'syntax-error' | 'schema-error' | 'valid'
  })

  function validateSurveySchema(data: unknown): SurveySchemaError[] {
    const errors: SurveySchemaError[] = []
    let survey

    try {
        // 尝试创建 SurveyJS Model
        survey = new Model(data)
        
        // 收集 jsonErrors
        if (survey.jsonErrors && survey.jsonErrors.length > 0) {
            errors.push(...survey.jsonErrors.map((error: any) => ({
                type: error.type,
                className: error.className,
                propertyName: error.propertyName,
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
            message: error instanceof Error ? error.message : '创建 SurveyJS Model 时发生未知错误'
        })
    }

    return errors
  }

  function validate(jsonText: string) {
    // reset

    validationState.hasJsonSyntaxError = false
    validationState.hasSurveySchemaError = false
    validationState.surveyErrors = []
    validationState.stage = 'valid'

    let parsed: unknown
    
    // 1️⃣ JSON.parse：只是门禁
    try {
        parsed = JSON.parse(jsonText)
    } catch {
        validationState.stage = 'syntax-error'
        return { ok: false, errors: [] }
    }
    
    // 2️⃣ Schema 校验
    try {
        const surveyErrors = validateSurveySchema(parsed)

        // 过滤掉surveyError
        const filteredSurveyErrors = surveyErrors.filter((error: any) => {
            // 如果是这三种类型，必定保留，不过滤
            if (['structureError', 'warning', 'fatalError'].includes(error.type)) {
                return true
            }
            
            // 对于其他类型，进行过滤逻辑
            
            // 如果 propertyName 非空，并且为 id 或 number，并且 type 为 "unknownproperty"，则过滤掉
            if (error.propertyName && 
                ['id', 'number'].includes(error.propertyName) && 
                error.type === 'unknownproperty'
            ) {
                return false
            }
            
            // 如果 className 是 'survey'，并且 type 为 "unknownproperty"，并且 propertyName 为 meta、logicRules 或 id，则过滤掉
            if (error.className === 'survey' && 
                error.type === 'unknownproperty' && 
                ['meta', 'logicRules', 'id'].includes(error.propertyName)
            ) {
                return false
            }
            
            // 其他情况保留
            return true
        })

        if (filteredSurveyErrors.length > 0) {
            validationState.hasSurveySchemaError = true
            validationState.surveyErrors = filteredSurveyErrors
            validationState.stage = 'schema-error'
            return { ok: false, errors: filteredSurveyErrors }
        }
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'SurveyJS 校验异常'

        const fatalError: SurveySchemaError = {
            message: msg,
            type: 'fatal'
        }

        validationState.hasSurveySchemaError = true
        validationState.surveyErrors = [fatalError]
        validationState.stage = 'schema-error'
        return { ok: false, errors: [fatalError] }
    }
    
    // 3️⃣ 全部通过
    validationState.stage = 'valid'
    return { ok: true, data: parsed }
  }

  return {
    validationState,
    validate
  }
}
