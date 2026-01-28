import { reactive } from 'vue'
import { Model } from 'survey-core'
import * as monaco from 'monaco-editor'

export interface SurveySchemaError {
  message: string
  path?: string
  type?: string
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
    console.log("validateSurveySchema是否正确传递了参数", data)
    
    const errors: SurveySchemaError[] = []

    try {
        const survey = new Model(data as any)
        console.log("model化的surveyJS", survey)
        console.log("model化的getAllErrors输出", survey.getAllErrors())
        if (!survey.pages || survey.pages.length === 0) {
            errors.push({ message: '问卷中未定义任何页面', path: 'pages' })
        }

        survey.pages.forEach((page, pageIndex) => {
            page.elements.forEach((q, qIndex) => {
                if (!q.getType || typeof q.getType !== 'function') {
                    errors.push({
                        message: '无法识别的问题类型',
                        path: `pages[${pageIndex}].elements[${qIndex}]`
                    })
                }
            })
        })
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'SurveyJS 校验异常'
        errors.push({ message: msg, type: 'fatal' })
    }

    return errors
  }

  function validate(jsonText: string) {
    // reset
    console.log("validate执行了==============================")

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
        console.log("parsed object", parsed)
        const surveyErrors = validateSurveySchema(parsed)
        console.log("surveyErrors----", surveyErrors)
        if (surveyErrors.length > 0) {
            validationState.hasSurveySchemaError = true
            validationState.surveyErrors = surveyErrors
            validationState.stage = 'schema-error'
            return { ok: false, errors: surveyErrors }
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
