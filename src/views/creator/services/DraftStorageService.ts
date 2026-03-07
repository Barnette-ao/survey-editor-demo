import { ref, readonly } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { SurveyStorageService } from '@/views/creator/services/SurveyStorageService'
import {
  afterGetInitialSettings,
} from "@/views/creator/utils/adapter";
import {
  isEqual
} from "@/views/creator/utils/logicRule";
import {createCompositeCommand} from "@/views/creator/commands"

type DraftState = unknown

export interface Command {
  // 正向操作变更 
  execute(state: DraftState): DraftState
  // 反向操作变更   
  undo(state: DraftState): DraftState
  getExecuteMeta?():any
  getUndoMeta?():any
}

type HistoryEntry =
  | { kind: 'operation', cmd: Command }
  | { kind: 'snapshot', prevState: DraftState }

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
  private undoStack: HistoryEntry[] = []
  private redoStack: HistoryEntry[] = []


  open() {
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
      this.undoStack.push({
        kind: 'snapshot',
        prevState: this._draftState.value
      })
      this.redoStack = []
    }
    this._draftState.value = snapshot
  }

  /**
   * @param {Command} op
   * @memberof DraftStorageService
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
    this.undoStack.push({
      kind: 'operation',
      cmd: cmd
    })
    this.redoStack = []
    return cmd.getExecuteMeta?.() 
  }

  applyBatch(cmds:Command[]) {
    const compositeCmd = createCompositeCommand(cmds)
    this.applyOperation(compositeCmd)
  }

  undo(){
    if(!this.undoStack.length) return
    const historyEntry:HistoryEntry = this.undoStack.pop()!
    // 基于操作的undo
    if(historyEntry.kind === "operation"){
      this._draftState.value = historyEntry.cmd.undo(this._draftState.value)  
      this.redoStack.push(historyEntry)
      this._draftState.value = historyEntry.cmd.undo(this._draftState.value)
      return historyEntry.cmd.getUndoMeta?.()
    }else{
      // 基于状态的undo
      this.redoStack.push({
        kind: 'snapshot',
        prevState: this._draftState.value
      })
      this._draftState.value = this.undoStack.pop()
    }
  }

  redo(){
    if(!this.redoStack.length) return
    const historyEntry:HistoryEntry = this.redoStack.pop()!
    if(historyEntry.kind === "operation"){
      this._draftState.value = historyEntry.cmd.execute(this._draftState.value)  
      this.undoStack.push(historyEntry)
      return historyEntry.cmd.getExecuteMeta?.()
    }else{
      this.undoStack.push({
        kind:"snapshot",
        prevState:this._draftState.value
      })
      this._draftState.value = historyEntry.prevState
    }
  }

  save() {
    this.storage.save(
      this.surveyId.value,
      this._draftState.value
    )
  }
}

