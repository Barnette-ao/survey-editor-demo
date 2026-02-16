import { defineStore } from 'pinia'
import type { QuestionElement } from '@/views/creator/types/questionnaire'

type SettingType = 'quickSetting' | 'questionSetting'

interface EditorState {
	activeEditorId: string | null
	currentQuestionId: string 
	settingType: SettingType
	isCurrentQuestionAPage: boolean
	pageIndex: number
	logicDialogVisible: boolean
	settedLogicElement: QuestionElement | null
}

export const useEditorStore = defineStore('editor', {
	state: (): EditorState => ({
		activeEditorId: null, // 当前激活的编辑器ID
		currentQuestionId: '', // 当前选中的问题ID
		settingType: 'quickSetting', // 设置类型：quickSetting 或 questionSetting
		isCurrentQuestionAPage: false, // 当前选中的是否为页面
		pageIndex: -1, // 当前选中的页面索引
		logicDialogVisible: false, // 逻辑对话框是否可见
		settedLogicElement: null, // 设置逻辑的元素
	}),

	actions: {
		setActiveEditor(id: string) {
			this.activeEditorId = id
		},

		clearActiveEditor() {
			this.activeEditorId = null
		},

		setCurrentQuestion(id: string) {
			this.currentQuestionId = id
		},

		clearCurrentQuestion() {
			this.currentQuestionId = ''
		},

		setSettingType(type: SettingType) {
			this.settingType = type
		},

		isCurrentQuestion(elementId: string): boolean {
			return elementId === this.currentQuestionId
		},

		selectPage(index: number) {
			this.isCurrentQuestionAPage = true
			this.pageIndex = index
			this.settingType = 'quickSetting'
			this.currentQuestionId = ''
		},

		selectQuestion(id: string) {
			this.isCurrentQuestionAPage = false
			this.pageIndex = -1
			this.currentQuestionId = id
			this.settingType = 'questionSetting'
		},
		
		clearSelection() {
			this.isCurrentQuestionAPage = false
			this.pageIndex = -1
			this.currentQuestionId = ''
			this.settingType = 'quickSetting'
		},

		openLogicDialog(element: QuestionElement) {
			this.settedLogicElement = element
			this.logicDialogVisible = true
		},

		closeLogicDialog() {
			this.logicDialogVisible = false
			this.settedLogicElement = null
		}
	},
}) 