import { ref } from 'vue'

export function useDesignState(currentQuestionId) {
  // UI 状态
  const hoveredQuestionType = ref('')
  const isCurrentQuestionAPage = ref(false)
  const pageIndex = ref(-1)
  const settingType = ref("quickSetting")
  
  // 逻辑设置相关状态
  const logicDialogVisible = ref(false)
  const settedLogicElement = ref({})
  
  // 选项设置相关状态
  const isOptionSetting = ref(false)
  const selectedOptionIndex = ref(-1)

  // 设置选项
  const settingTypeOptions = [
    { label: "快捷设置", value: "quickSetting" },
    { label: "题目设置", value: "questionSetting" }
  ]

  // 页面点击处理
  const handlePageClick = (index) => {
    settingType.value = "quickSetting"
    isCurrentQuestionAPage.value = true
    pageIndex.value = index
    currentQuestionId.value = ""
  }

  // 题目点击处理
  const handleQuestionClick = (id) => {
    settingType.value = "questionSetting"
    isCurrentQuestionAPage.value = false
    currentQuestionId.value = id
    pageIndex.value = -1
  }

  // 选项设置更新处理
  const handleOptionSettingUpdate = (params) => {
    currentQuestionId.value = params.id

    if (params.isOpen) {
      settingType.value = "questionSetting"
    }

    isOptionSetting.value = params.isOpen
    selectedOptionIndex.value = params.index
  }

  // 逻辑设置处理
  const handleSetLogic = (element) => {
    settedLogicElement.value = element
    logicDialogVisible.value = true
  }

  // 关闭逻辑对话框
  const closeLogicDialog = () => {
    logicDialogVisible.value = false
  }

  return {
    // 状态
    hoveredQuestionType,
    currentQuestionId,
    isCurrentQuestionAPage,
    pageIndex,
    settingType,
    settingTypeOptions,
    logicDialogVisible,
    settedLogicElement,
    isOptionSetting,
    selectedOptionIndex,
    
    // 方法
    handlePageClick,
    handleQuestionClick,
    handleOptionSettingUpdate,
    handleSetLogic,
    closeLogicDialog
  }
}