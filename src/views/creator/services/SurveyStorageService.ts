import {
	generateUUID,
    createQuestionnaireTemplate,
    beforeSaveToDatabase
} from "@/views/creator/config/helpers";
import {
    validateStorageSchema,
    persist
} from "@/views/creator/config";


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
export default class SurveyStorageService {
  /** 明确这是全局 surveyId 的唯一来源 */
  private getActiveSurveyId(): string {
    let id = localStorage.getItem('activeSurveyId')

    if (!id) {
      id = `survey-${generateUUID()}`
      localStorage.setItem('activeSurveyId', id)
    }

    return id
  }

  /** 受控修改入口，而不是随便 set localStorage */
  setActiveSurveyId(surveyId: string) {
    if (!surveyId || typeof surveyId !== 'string') {
      throw new Error('surveyId 必须是非空字符串')
    }
    localStorage.setItem('activeSurveyId', surveyId)
  }

  // ========================
  // load 相关
  // ========================

  /**
   * 运行态使用：返回 storage 层的原始数据
   * 由调用方决定如何转换为 runtime 数据
   */
  loadForRuntime(count: number) {
    return this.loadFromStorage(count)
  }

  /**
   * JSON 编辑页使用：直接操作 storage 结构
   */
  loadForJsonEditor(count: number) {
    return this.loadFromStorage(count)
  }
  
  // 真实的 load 实现（内部复用）
  // 备用的动态生成函数（仅用于超大数据测试）
  private loadFromStorage(count: number) {
    const surveyId = this.getActiveSurveyId()
    return this.load(count, surveyId)
  }

  private load(count: number, surveyId: string) {
    const all = JSON.parse(
      localStorage.getItem('questionnaires') || '{}'
    )

    // 如果存了，直接从localStorage中取出来
    if (all[surveyId]) {
      return all[surveyId]
    }

    //没有，那就直接创建给核心问卷
    const base = createQuestionnaireTemplate(
      surveyId,
      count
    )

    // 存储层和编辑层应该最好分为两层，编辑层是允许脏数据的，而存储层是不允许的，
    // 做任何拦截或者修改都可以在编辑层做，但是存储的时候是最终值
    // 更新本地保存的值
    all[surveyId] = base

    // 这中间可以插入其他适配操作。

    // 更新本地存储
    localStorage.setItem(
      'questionnaires',
      JSON.stringify(all)
    )

    return base
  }
  
  /**
   *
   * @param {object} storageSettings
   * @memberof SurveyStorageService
   * 存储态的JSON核心数据的结构和属性必须是合法的
   * 而在保存之前必须对其进行校验
   * 这里说一下JSON编辑器使用的JSON核心数据和其他两个页面使用的结构和属性是不一致的
   * JSON编辑器是loadQuestion之后直接使用
   * 预览页和编辑器页是loadQuestion之后还要after直接使用
   */
  saveFromJsonEditor(storageSettings: unknown) {
    validateStorageSchema(storageSettings)
    const surveyId = this.getActiveSurveyId()
    persist(storageSettings, surveyId)
  }

  
  /**
   *
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
  saveRuntimeSettings(runtimeSettings: unknown) {
    const surveyId = this.getActiveSurveyId()
    const rawObject = toRaw(runtimeSettings)
    const dataToSave = beforeSaveToDatabase(rawObject)
    persist(dataToSave, surveyId)
  }
}
