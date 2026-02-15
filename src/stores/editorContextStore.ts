import { defineStore } from 'pinia'

type SettingType = 'quickSetting' | 'questionSetting'

interface EditorState {
	activeEditorId: string | null
	currentQuestionId: string 
	settingType: SettingType
}

export const useEditorStore = defineStore('editor', {
	state: (): EditorState => ({
		activeEditorId: null, // 当前激活的编辑器ID
		currentQuestionId: '', // 当前选中的问题ID
		settingType: 'quickSetting', // 设置类型：quickSetting 或 questionSetting
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
		}
	},
}) 