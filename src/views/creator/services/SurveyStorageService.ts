import {
    generateUUID
} from "@/views/creator/config/helpers";
import {
    validateStorageSchema,
} from "@/views/creator/config";
import { beforeSaveToDatabase } from "@/views/creator/config/adapter/adapteForRunningSettings";
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
			createdAt: Date.now(),
			type: 'performance-test',
			questionCount: count
		},
		title: `测试问卷${getTestQuestionnaireNumber()}`,
		description: '用于测试长列表渲染性能',
		pages: [{
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
			id: `test-question-${i}`,
			name: `Q${i}`,
			type: 'radiogroup',
			title: `测试题目 ${i}：这是第 ${i} 个测试题目，用于性能测试`,
			description: `这是题目 ${i} 的描述信息`,
			isRequired: true,
			hideNumber: false,
			choices: [
				{ value: `选项A-${i}`, showText: false, textType: 'text', required: true },
				{ value: `选项B-${i}`, showText: false, textType: 'text', required: true },
				{ value: `选项C-${i}`, showText: false, textType: 'text', required: true },
				{ value: `选项D-${i}`, showText: false, textType: 'text', required: true }
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
    const all = JSON.parse(
      localStorage.getItem('questionnaires') || '{}'
    )

    const surveyId = generateUUID() // 你自己的规则

    if (all[surveyId]) {
      throw new Error('SurveyId collision')
    }

    const DEFAULT_COUNT = 1 
    const base = createQuestionnaireTemplate(
      DEFAULT_COUNT,
      surveyId
    )

    // 存储层和编辑层应该最好分为两层，编辑层是允许脏数据的，而存储层是不允许的，
    // 做任何拦截或者修改都可以在编辑层做，但是存储的时候是最终值
    // 更新本地保存的值
    all[surveyId] = base

    // 更新本地存储
    localStorage.setItem(
      'questionnaires',
      JSON.stringify(all)
    )

    return surveyId
  }

  // 生命周期：打开
  open(surveyId: string) {
    const rawSettings = this.load(surveyId)
    if (!rawSettings) {
      throw new Error("storageService.load() failed")
    }
    return rawSettings
  }
  
  /**领域事件
   * 生命周期：保存JSON编辑页
   * @param {object} storageSettings
   * @memberof SurveyStorageService
   * 
   * 存储态的JSON核心数据的结构和属性必须是合法的
   * 而在保存之前必须对其进行校验
   * 这里说一下JSON编辑器使用的JSON核心数据和其他两个页面使用的结构和属性是不一致的
   * JSON编辑器是loadQuestion之后直接使用
   * 预览页和编辑器页是loadQuestion之后还要after直接使用
   */
  saveFromJsonEditor(surveyId:string, storageSettings: unknown) {
    validateStorageSchema(storageSettings)
    this.persist(storageSettings, surveyId)
  }

  
  /**
   * 领域事件
   * 生命周期：保存运行态的问卷数据（编辑器页）
   * @param {RefValue} runtimeSettings
   * 
   * @memberof SurveyStorageService
   * 保存编辑器页和预览页的JSON核心对象。
   * 将这两个页面的核心状态称之为运行态，最终保存的数据称之为存储态
   * 该函数的职责是：将运行态的核心数据转换成存储态的核心数据数据
   * 
   * 
   * 所以要先用toRaw()将其从ref还原成普通对象
   * 预览页和编辑器页是loadQuestion之后还要after才能使用
   * 所以要对该对象去掉一些存储态不需要的属性或者不合法的属性
   * 
   */
  saveRuntimeSettings(surveyId:string, runtimeSettings: unknown) {
    const rawObject = toRaw(runtimeSettings)
    const dataToSave = beforeSaveToDatabase(rawObject)
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



