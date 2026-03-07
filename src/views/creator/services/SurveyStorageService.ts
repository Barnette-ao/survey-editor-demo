import {
    generateUUID
} from "@/views/creator/utils/shared";
import {
    validateStorageSchema,
    beforeSaveToDatabase
} from "@/views/creator/utils/adapter";
import { toRaw } from 'vue';


const getTestQuestionnaireNumber = () => {
  const questionnaires = JSON.parse(localStorage.getItem("questionnaires") || '{}')
  const keys_length = Object.keys(questionnaires).length
  return keys_length + 1
}

export const createQuestionnaireTemplate = (count: number, surveyId: string) => {
  // console.log("createQuestionnaireTemplate count,surveyId",count,surveyId)

  const baseQuestion = {
	  id: surveyId,
		meta: {
			lastModified: Date.now(),
			type: 'performance-test',
		},
		title: `测试问卷${getTestQuestionnaireNumber()}`,
		description: '用于测试长列表渲染性能',
		pages: [{
      id: generateUUID(),
			name: 'page1',
			elements: [{
				html: "<h3>欢迎参与问卷调查</h3><p>请认真填写以下问题。</p>",
				id: "intro-2",
        name:"html",
				type: "html"
			}]
		}],
		logicRules: []
	}

  for (let i = 1; i <= count; i++) {
		baseQuestion.pages[0].elements.push({
			id: generateUUID(),
			name: `Q${i}`,
			type: 'radiogroup',
			title: `测试题目 ${i}：这是第 ${i} 个测试题目，用于性能测试`,
			description: `这是题目 ${i} 的描述信息`,
			isRequired: true,
			hideNumber: false,
			choices: [
				{ id: generateUUID(), value: `选项A-${i}`, showText: false, textType: 'text', required: true },
				{ id: generateUUID(), value: `选项B-${i}`, showText: false, textType: 'text', required: true },
				{ id: generateUUID(), value: `选项C-${i}`, showText: false, textType: 'text', required: true },
				{ id: generateUUID(), value: `选项D-${i}`, showText: false, textType: 'text', required: true }
			]
		} as any)
	}
 
  // console.log("createQuestionnaireTemplate baseQuestion.id",baseQuestion.id)
  return baseQuestion
}


/**
* @export
* @class SurveyStorageService
* 该类的职责：
* 1.管理（设置和获取）activeSurvey上下文（activeSurveyId），全局唯一变量
* 2.负责问卷数据的加载 / 初始化
* 3.负责问卷数据的最终持久化
* 
* 应用级问卷存储服务
* - 负责 activeSurveyId 的管理
* - 负责问卷数据的加载与持久化
* - 不参与 UI 状态管理
*
* 注意：
* - surveyId 是全局唯一上下文
* - 编辑层允许脏数据，存储层必须是最终值
* - 并且编辑页和预览页的数据需要
*/
export class SurveyStorageService {
  // 查询
  // surveyId是否是已经创建的问卷
  exists(surveyId: string): boolean {
    if (!surveyId) return false

    const all = JSON.parse(
      localStorage.getItem('questionnaires') || '{}'
    )

    return Boolean(all[surveyId])
  }

  // 查询
  getLastSurveyId(): string | null {
    return localStorage.getItem('lastSurveyId')
  }

  // 设置系统状态
  setLastSurveyId(id: string) {
    if(typeof id !== 'string'){
      throw new Error("survey id must be a string")
    }
    localStorage.setItem('lastSurveyId', id)
  }
  
  // 生命周期：创建
  create(): string {
    const all = JSON.parse(localStorage.getItem('questionnaires') || '{}')
    const surveyId = generateUUID() // 你自己的规则
    if (all[surveyId]) {
      throw new Error('SurveyId collision')
    }

    const DEFAULT_COUNT = 1 
    const base = createQuestionnaireTemplate(
      DEFAULT_COUNT,
      surveyId
    )
    all[surveyId] = base
    localStorage.setItem('questionnaires',JSON.stringify(all))
    return surveyId
  }

  // 生命周期：打开
  open(surveyId: string) {
    const rawSettings = this.load(surveyId)
    if (!rawSettings) {
      throw new Error("storageService.load() failed")
    }
    rawSettings.meta.lastModified = Date.now()
    return rawSettings
  }
  
  /**
   * 领域事件
   * 生命周期：保存运行态的问卷数据（编辑器页）
   * @param {RefValue} runtimeSettings
   * 
   * @memberof SurveyStorageService
   */
  save(surveyId:string, settings: unknown) {
    const rawObject = toRaw(settings)
    const dataToSave = beforeSaveToDatabase(rawObject)
    validateStorageSchema(dataToSave)
    this.persist(dataToSave, surveyId)
  }

  // 生命周期，删除一个已有的问卷
  delete(surveyId: string) {
    const all = this.getAll()
    if (!all[surveyId]) return
    delete all[surveyId]
    this.saveAll(all)
  }

    // 技术实现，加载
  private load(surveyId: string) {
    const all = JSON.parse(
      localStorage.getItem('questionnaires') || '{}'
    )
    const data = all[surveyId]
    if (!data) {
      throw new Error(`Survey ${surveyId} does not exist`)
    }
    return data
  }

  // 技术实现保存单用户的多个问卷
  private persist(settings:unknown, surveyId:string){
    const all = this.getAll() 
    all[surveyId] = settings
    // 保存到 localStorage
    this.saveAll(all)  
  }

  // 获取所有的问卷
  private getAll(){
    return JSON.parse(localStorage.getItem('questionnaires') || '{}')
  }

  // 保存所有的问卷
  private saveAll(all:object){
    localStorage.setItem(`questionnaires`, JSON.stringify(all));
  }
}



