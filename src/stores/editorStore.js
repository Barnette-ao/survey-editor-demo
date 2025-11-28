import { defineStore } from 'pinia'

export const useEditorStore = defineStore('editor', {
	state: () => ({
		activeEditorId: null, // 当前激活的编辑器ID
		contents: {}
	}),

	actions: {
		setActiveEditor(id) {
			this.activeEditorId = id
		},
		clearActiveEditor() {
			this.activeEditorId = null
		},
		// 新增的内容管理相关操作
		setContent(editorId, content) {
			this.contents[editorId] = content
		},
		getContent(editorId) {
			return this.contents[editorId] || ''
		},
		clearContent(editorId) {
			delete this.contents[editorId]
		},
		clearAllContents() {
			this.contents = {}
		}
	},

	persist: true,

}) 