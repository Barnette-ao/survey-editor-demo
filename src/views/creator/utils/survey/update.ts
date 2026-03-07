import { QuestionSettings } from "@/views/creator/types/questionnaire"



export const updateSurveyProp = <K extends keyof QuestionSettings>(
    questionSettings: any,
    key: K,
    value: QuestionSettings[K]
) => {
    const cloned = structuredClone(questionSettings)
    if (!cloned) return { cloned }
    
    ;(cloned as any)[key] = value
    return { cloned }
}

