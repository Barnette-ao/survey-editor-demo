import { defineStore } from 'pinia'
import type { QuestionElement } from '@/views/creator/types/questionnaire'

type SettingType = 'quickSetting' | 'questionSetting'


export const useEditorStore = defineStore('editor', {
	state: (): any => ({
		activeEditorId: null, // 当前激活的编辑器ID
		currentQuestionId: '', // 当前选中的问题ID
		settingType: 'quickSetting', // 设置类型：quickSetting 或 questionSetting
		isCurrentQuestionAPage: false, // 当前选中的是否为页面
		pageIndex: -1, // 当前选中的页面索引
		logicDialogVisible: false, // 逻辑对话框是否可见
		selectedOptionIndex:-1, // 点击选项设置按钮的索引，默认为-1，语义为未选中
		isOptionSetting:false  // 单个选项的设置显现，默认不显示
	}),

	actions: {
		// 原子操作
		setActiveEditor(id: string) { 
			this.activeEditorId = id
		},
		clearActiveEditor() { 
			this.activeEditorId = null 
		},
		setCurrentQuestionId(id: string) { 
			this.currentQuestionId = id
		},
		clearCurrentQuestionId() { 
			this.currentQuestionId = ''
		},
		setSettingType(type: SettingType) { 
			this.settingType = type
		},
		setIsCurrentQuestionAPage(value:boolean){ 
			this.isCurrentQuestionAPage = value
		},
		setPageIndex(index:number){ 
			this.pageIndex = index
		},
		unsetPageIndex(){ 
			this.pageIndex = -1
		},
		setLogicDialogVisible(value:boolean){ 
			this.logicDialogVisible = value
		},
		setSelectedOptionIndex(index:number){ 
			this.selectedOptionIndex = index 
		},
		setIsOptionSetting(value:boolean){
			this.isOptionSetting = value
		},

		// 以下是业务操作
		isCurrentQuestion(elementId: string): boolean {
			return elementId === this.currentQuestionId
		},

		isPageSelected(pageIndex:number){
			return this.currentQuestionId === '' && this.pageIndex === pageIndex
		},

		selectPage(index: number) {
			this.setIsCurrentQuestionAPage(true)
			this.setPageIndex(index) 
			this.setSettingType('quickSetting')
			this.clearCurrentQuestionId()
		},

		selectQuestion(id: string) {
			this.setIsCurrentQuestionAPage(false)
			this.unsetPageIndex()
			this.setCurrentQuestionId(id)
			this.setSettingType('questionSetting')
		},
		
		clearSelection() {
			this.setIsCurrentQuestionAPage(false)
			this.unsetPageIndex()
			this.clearCurrentQuestionId()
			this.setSettingType('quickSetting')
		},

		selectOptionSetting(params:any){
			this.setCurrentQuestionId(params.id)
			if (params.isOpen) {
				this.setSettingType('questionSetting')
			}
			this.setIsOptionSetting(params.isOpen)
			this.setSelectedOptionIndex(params.index)
		},

		openLogicDialog() {
			this.setLogicDialogVisible(true)
		},

		closeLogicDialog() {
			this.setLogicDialogVisible(false)
		}
	},
}) 