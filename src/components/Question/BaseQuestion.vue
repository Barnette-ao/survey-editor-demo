<template>
	<div class="question-container" :class="{ 'is-selected': selected }" @click="handleContainerClick">
		<!-- 题目头部 -->
		<div class="question-header">
			<div class="left-section">
				<span class="question-number">
					<span class="starMark" v-show="required">*</span>
					<span v-show="showQuestionNumber">
						{{ number }}
					</span>
				</span>
				<customEditor  
					:model-value="title" 
					:editor-id="`title-${element.id}`" 
					:isEditable="isEditable" 
					@click="handleContainerClick"
					@blur="changeElementTitle" 
				/>
			</div>

			<slot name="header-actions">
				<div class="operation-buttons" v-show ="isShowHeadAction">
					<el-tooltip 
						:content="content" 
						placement="top" 
						v-if="isSelectElement"
					>
						<el-button v-if="!isCollapsed" class="icon-button" @click.stop="handleCollapse">
							<el-icon>
								<Remove />
							</el-icon>
						</el-button>
						<el-button v-else class="icon-button" @click.stop="handleCollapse">
							<el-icon><CirclePlus /></el-icon>
						</el-button>
					</el-tooltip>
					<el-tooltip content="长按拖拽题目" placement="top">
						<el-button class="icon-button drag-handle">
							⋮⋮
						</el-button>
					</el-tooltip>
					<el-tooltip content="逻辑设置" placement="top">
						<el-badge 
							:hidden="logicRuleNum === 0" 
							:value="logicRuleNum" 
							class="item"
						>
							<el-button class="icon-button" @click.stop="handleSetLogic">
								<el-icon>
									<Connection />
								</el-icon>
							</el-button>
						</el-badge>
					</el-tooltip>
					<el-tooltip content="复制" placement="top">
						<el-button class="icon-button" @click.stop="handleCopy">
							<el-icon>
								<CopyDocument />
							</el-icon>
						</el-button>
					</el-tooltip>
					<el-tooltip content="删除" placement="top">
						<el-button class="icon-button" @click.stop="handleDelete">
							<el-icon>
								<Delete />
							</el-icon>
						</el-button>
					</el-tooltip>
				</div>
			</slot>
		</div>

		<div class="subDescription" v-show="element.showSubDescription">
			<customEditor 
				:model-value="description" 
				:editor-id="`description-${element.id}`" 
				@click="handleContainerClick"
				@blur="changeElementDescription"
			/>
		</div>

		<!-- 选项列表 -->
		<div class="options-container">
			<slot name="options" :show-all="!isCollapsed"></slot>
		</div>

		<!-- 底部操作 -->
		<div class="bottom-actions" v-show="selected">
			<slot name="bottom-actions"></slot>
		</div>

		<!-- 批量添加对话框 -->
		<slot name="dialogs"></slot>

	</div>
</template>

<script setup>
import { computed, ref } from 'vue'
import customEditor from "@/views/creator/components/customEditor.vue";
import { useDraftActions } from "@/views/creator/composables/useDraftAction";
import { useEditorStore } from "@/stores/editorContextStore";
import { useDraftContext } from "@/views/creator/composables/useDraftContext";
import { findLogicRulesByElementId } from '@/views/creator/config/logicRule'

const props = defineProps({
	element: {
		type: Object,
		default: () => { }
	},
	showQuestionNumber: {
		type: Boolean,
		default: true
	},
	isEditable: {
		type: Boolean,
		default: false
	},
	isShowHeadAction: {
		type: Boolean,
		default: true
	}
})

const isCollapsed = ref(false)
const handleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const title = computed(() =>
	props.element.title !== undefined
		? props.element.title
		: props.element.name !== undefined
			? props.element.name
			: "标题"
)
const isSelectElement = computed(() => ['checkbox','dropdown','radiogroup','ranking'].includes(props.element.type))
const content = computed(() => !isCollapsed.value ? '折叠' : '展开')
const number = computed(() => props.element.number || 1)
const description = computed(() => props.element.description || "请输入题干说明")
const required = computed(() => {
	if (props.element.type === "html") return false;
	else return props.element.isRequired
})

const { 
	applyElementPropChange, 
	applyAddElement,
	applyDeleteElement, 
} = useDraftActions()

const changeElementDescription = (value) => {
	applyElementPropChange({
		questionId:element.id,
		key: "description",
		value
	})
}

const changeElementTitle = (value) => {
	applyElementPropChange({
		questionId:props.element.id,
		key: "title",
		value
	})
}

const editorStore = useEditorStore()
const setCurrentElementId = () => {
	const currentElementId = props.element.id
	editorStore.setCurrentQuestionId(currentElementId)
}

const handleCopy = () => {
	setCurrentElementId()
	applyAddElement({
		selectedQuestionId: editorStore.currentQuestionId,
		elementType: props.element.type,
	})
	ElMessage.success('复制成功')
}

const handleDelete = () => {
	setCurrentElementId()
	ElMessageBox.confirm('确定要删除该题目吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
	  applyDeleteElement({
		elementId: editorStore.currentQuestionId,
	  })
      if (editorStore.isCurrentQuestion(editorStore.currentQuestionId)) {
        editorStore.clearCurrentQuestion()
		editorStore.setSettingType('quickSetting')
      }

      ElMessage.success('删除成功')
    })
}

const handleContainerClick = () => {
	editorStore.selectOptionSetting({ 
		index: -1, 
		isOpen: false,
		id:props.element.id  
	})
	editorStore.setSettingType('questionSetting')
}

const handleSetLogic = () => {
	setCurrentElementId()
	editorStore.openLogicDialog()
}


const selected = computed(() => editorStore.isCurrentQuestion(props.element.id))  

const { draftState } = useDraftContext()
const logicRuleNum= computed(() => {
	const rules = findLogicRulesByElementId(
		draftState.value?.logicRules ?? [],
		props.element.id
	)
	return rules.length
})




</script>

<style scoped lang="scss">
.question-container {
	position: relative;
	padding: 20px;
	background-color: #fff;
	border: 1px solid transparent;
	border-radius: 4px;
	margin: 10px 0;
	transition: border-color 0.3s ease;
	width: 100%;

	&.is-selected {
		border: 1px solid #409EFF;
	}

	&:hover {
		border: 1px solid #409EFF;
	}
}

.question-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 10px;
	padding: 0 10px;
	position: relative;

	.left-section {
		display: flex;
		align-items: center;

		width: 60%;
		min-width: 0;

		:deep(.editor-wrapper) {
			width: 100%;
			min-width: 0;
		}
	}
}

.subDescription {
	margin-left: 12px;
	background-color: rgb(248, 249, 251);
	width: calc(60% - 12px);
	font-size: 15px;

	:deep(.editor-wrapper) {
		width: 100%;

		.wang-editor-wrapper {
			flex: 1;
			min-width: 0;
		}
	}
}

:deep(.el-button+.el-button){
	margin-left: 0px;
}

.hidden-section {
	visibility: hidden;
}

.header-actions {
	display: flex;
	justify-content: flex-end;
}

.question-number {
	margin-right: 10px;
	margin-top: 3px;
	font-weight: bold;
	color: #606266;
}

.starMark {
	color: #f56c6c;
}

.operation-buttons {
	display: flex;
	gap: 8px;
	position: absolute;
	right: 10px;
	top: 50%;
	transform: translateY(-50%);
}

.icon-button {
	padding: 8px;
	border: none;
	cursor: pointer;
}

/* 鼠标点击：无轮廓 */
.icon-button:focus {
  outline: none;
}

/* 键盘导航：优雅轮廓 */
.icon-button:focus-visible {
  outline: 2px solid #1a73e8;
  outline-offset: 2px;
  border-radius: 4px;
}

.options-container {
	margin: 20px 0;
	padding: 0 40px 0 10px;
}

.bottom-actions {
	margin-top: 20px;
	padding-left: 40px;

	transition: opacity 0.3s ease;
  	opacity: 1;
}

// 当不显示时，设置透明度为0
.bottom-actions[style*="display: none"] {
  opacity: 0;
}

:deep(.el-button--text) {
	color: #409EFF;
}

.drag-handle {
	cursor: move;
}

.sortable-ghost {
	opacity: 0.5;
	background: #c8ebfb;
}

.sortable-drag {
	opacity: 0.8;
}
</style>