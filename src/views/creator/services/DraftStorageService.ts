import type { ComputedRef } from 'vue'
import { SurveyStorageService } from '@/views/creator/services/SurveyStorageService'
import {
  afterGetInitialSettings,
} from "@/views/creator/config/helpers";


type DraftState = object

interface DraftOperation {
  // 正向操作变更 
  apply(state: DraftState): DraftState
  // 反向操作变更   
  revert(state: DraftState): DraftState
}

const adapteStorageState = (storageState:unknown) => {
    const runingState = afterGetInitialSettings(storageState)
    return runingState
}

/**
 *
 * Draft层只管何时何地如何调用领域层
 * @export
 * @class DraftStorageService
 */
export class DraftStorageService {
  constructor(
    private storage: SurveyStorageService,
    private surveyId: ComputedRef<string>
  ) {}

  // 草稿层一个很重要的状态就是当前的草稿状态
  private draftState: object = {}
  
  /**
   * @private
   * @type {unknown[]}
   * @memberof DraftStorageService
   * 撤销操作顺序，它的语义是每个状态按照顺序
   */
  private undoStackBaseSnapshot: unknown[] = []
  private redoStackBaseSnapshot: unknown[] = []
  private undoStackBaseOperation: DraftOperation[] = []
  private redoStackBaseOperation: DraftOperation[] = []


  openWithRunningState() {
    // 存储态 -> 运行态
    const rawSettings = this.storage.open(this.surveyId.value)
    this.draftState = adapteStorageState(rawSettings)

    this.undoStackBaseOperation = []
    this.redoStackBaseOperation = []
    
    return this.draftState
  }

  openWithStorageState(){
    this.draftState = this.storage.open(this.surveyId.value)
    
    this.undoStackBaseSnapshot = []
    this.redoStackBaseSnapshot = []

    return this.draftState
  }

  
  /**
   * @param {unknown} snapshot
   * @memberof DraftStorageService
   * 状态快照式的undo/redo
   * - 只能在JSONEditor页面使用，在Design页面使用将出错
   * - 每一个replaceState就是一个历史记录点
   * - redo 只在 undo 之后执行才有意义，一旦编辑新内容，原来的redo作废
   */
  replaceState(snapshot: unknown) {
    if (this.draftState !== null) {
      this.undoStackBaseSnapshot.push(this.draftState)
      this.redoStackBaseSnapshot = []
    }
    this.draftState = snapshot
  }

  undoBaseSnapshot() {
    if (!this.undoStackBaseSnapshot.length) return
    this.redoStackBaseSnapshot.push(this.draftState)
    this.draftState = this.undoStackBaseSnapshot.pop()
    return this.draftState
  }

  redoBaseSnapshot() {
    if (!this.redoStackBaseSnapshot.length) return
    this.undoStackBaseSnapshot.push(this.draftState)
    this.draftState = this.redoStackBaseSnapshot.pop()
    return this.draftState
  }

  
  /**
   * @param {DraftOperation} op
   * @memberof DraftStorageService
   * 
   * 用户心智模型：若用户当前的操作是执行可撤销操作，那么Ta之前的操作是什么？
   * - 着重考虑两种：执行可撤销操作，撤销可执行操作, 恢复已经撤销的操作
   * - 执行可撤销操作 -> 执行可撤销操作 : applyOperation -> applyOperation
   * - 撤销可执行操作 -> 执行可撤销操作 : undoBaseOperation -> applyOperation
   * - 恢复已经撤销的操作 -> 执行可撤销操作 : redoBaseOperation -> applyOperation
   * 
   * 三种操作映射成一个公共函数，
   * 操作对象DraftOperation，核心数据draftState, undoStack, redoStack
   * draftState草稿态核心数据更新，执行正向变更操作
   * undoStack: 添加
   * redoStatk：重置为空，一编辑新内容那么前面的操作作废 
   */
  applyOperation(op: DraftOperation) {
    // 执行正向操作
    this.draftState = op.apply(this.draftState)
    // 可撤销操作序列加1
    this.undoStackBaseOperation.push(op)
    // 只要编辑新内容，原来的恢复操作序列清空
    // 操作
    this.redoStackBaseOperation = []
  }

  undoBaseOperation(){
    if(!this.undoStackBaseOperation.length) return 
    const draftOperation = this.undoStackBaseOperation.pop()
    
    // 类型守卫和断言
    if (!draftOperation) {
      throw new Error('Unexpected: draftOperation is undefined')
  }
    
    this.draftState = draftOperation.revert(this.draftState)
    this.redoStackBaseOperation.push(draftOperation)
    return this.draftState
  }

  redoBaseOperation(){
    if(!this.redoStackBaseOperation.length) return 
    const draftOperation = this.redoStackBaseOperation.pop()
    
    // 类型守卫和断言
    if (!draftOperation) {
      throw new Error('Unexpected: draftOperation is undefined')
    }
    
    this.draftState = draftOperation.apply(this.draftState)
    this.undoStackBaseOperation.push(draftOperation)
    return this.draftState
  }

  commitRuntime() {
    this.storage.saveRuntimeSettings(
      this.surveyId.value,
      this.draftState
    )
  }

  commitStorage() {
    this.storage.saveFromJsonEditor(
      this.surveyId.value,
      this.draftState
    )
  }
}
