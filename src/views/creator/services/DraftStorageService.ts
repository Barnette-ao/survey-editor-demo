import { ref, readonly } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { SurveyStorageService } from '@/views/creator/services/SurveyStorageService'
import {
  afterGetInitialSettings,
} from "@/views/creator/config/adapter";
import {
  isEqual
} from "@/views/creator/config/logicRule";
import {createCompositeCommand} from "@/views/creator/commands"

type DraftState = unknown

export interface Command {
  // 正向操作变更 
  execute(state: DraftState): DraftState
  // 反向操作变更   
  undo(state: DraftState): DraftState
  getMeta?():any
}

const adapteStorageState = (storageState:unknown) => {
    const runingState = afterGetInitialSettings(storageState)
    return runingState
}

// 空数组结构
function createEmptyDraftState(): DraftState {
  return {
    title:"",
    description:"",
    pages: [{
      name:"",
      elements:[]
    }],
    logicRules: [],
    questionsOnPageMode:"", 
    triggers:[],
    showQuestionNumbers:true
  }
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
  private _draftState: Ref<DraftState> = ref(createEmptyDraftState())
  private isInistialized = false

  // UI 只能读
  get draftState() {
    return readonly(this._draftState)
  }

  /**
   * @private
   * @type {unknown[]}
   * @memberof DraftStorageService
   * 撤销操作顺序，它的语义是每个状态按照顺序
   */
  private undoStackBaseSnapshot: unknown[] = []
  private redoStackBaseSnapshot: unknown[] = []
  private undoStackBaseOperation: Command[] = []
  private redoStackBaseOperation: Command[] = []


  openWithRunningState() {
    // 存储态 -> 运行态
    if(this.isInistialized) return 
    const rawSettings = this.storage.open(this.surveyId.value)
    this._draftState.value = adapteStorageState(rawSettings)
    this.isInistialized = true
  }
  
  /**
   * @param {unknown} snapshot
   * @memberof DraftStorageService
   * 状态快照式的undo/redo
   * undo中的操作对象：prev state Model
   * - 只能在JSONEditor页面使用，在Design页面使用将出错
   * - 每一个replaceState就是一个历史记录点
   * - redo 只在 undo 之后执行才有意义，一旦编辑新内容，原来的redo作废
   * 
   * 举例：
   * 状态序列：S0 -> S1 -> S2 -> S3
   * replaceState执行下的undostack和this.draftState[当前态]
   * 当前态this.draftState：S3
   * undostack: S0, S1, S2
   * 且 undostack中的元素的值各个不同
   *  
   * undostack的栈顶元素是上一次的状态，永远不会是当前的状态
   * 所以重置当前为上一次状态的操作为redostack.push(当前态)+当前态 = undostack.pop()
   * 
   */
  replaceState(snapshot: unknown) {
    if (!isEqual(snapshot,this._draftState.value)) {
      this.undoStackBaseSnapshot.push(this._draftState.value)
      this.redoStackBaseSnapshot = []
    }
    this._draftState.value = snapshot
  }

  undoBaseSnapshot() {
    if (!this.undoStackBaseSnapshot.length) return
    this.redoStackBaseSnapshot.push(this._draftState.value)
    this._draftState.value = this.undoStackBaseSnapshot.pop() 
  }

  redoBaseSnapshot() {
    if (!this.redoStackBaseSnapshot.length) return
    this.undoStackBaseSnapshot.push(this._draftState.value)
    this._draftState.value = this.redoStackBaseSnapshot.pop()
  }

  
  /**
   * @param {Command} op
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
  applyOperation(cmd: Command) {
    const nextState = cmd.execute(this._draftState.value)
    this._draftState.value = nextState 
    this.undoStackBaseOperation.push(cmd)
    this.redoStackBaseOperation = []
    return cmd.getMeta?.()
  }

  applyBatch(cmds:Command[]) {
    const compositeCmd = createCompositeCommand(cmds)
    this.applyOperation(compositeCmd)
  }

  undoBaseOperation(){
    if(!this.undoStackBaseOperation.length) return 
    const undoCommand:Command = this.undoStackBaseOperation.pop()!
    this._draftState.value = undoCommand.undo(this._draftState.value)
    this.redoStackBaseOperation.push(undoCommand)
  }

  // 这里必须存在一个时序耦合，即redo必须在undo之后执行
  redoBaseOperation(){
    if(!this.redoStackBaseOperation.length) return 
    const redoCommand:Command = this.redoStackBaseOperation.pop()!
    this._draftState.value = redoCommand.execute(this._draftState.value)  
    this.undoStackBaseOperation.push(redoCommand)
  }

  commitRuntime() {
    this.storage.save(
      this.surveyId.value,
      this._draftState.value
    )
  }
}

