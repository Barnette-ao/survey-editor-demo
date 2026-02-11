import { defineStore } from 'pinia'

export const useEditorStore = defineStore('editor', {
	state: () => ({
		activeEditorId: null, // 当前激活的编辑器ID
	}),

	actions: {
		setActiveEditor(id) {
			this.activeEditorId = id
		},
		clearActiveEditor() {
			this.activeEditorId = null
		}
	},

	persist: true,
}) 