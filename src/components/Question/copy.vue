<template>
	<div class="question-container" :class="{ 'is-selected': selected }" @click="handleContainerClick">
		<!-- 题目头部 -->
		<div class="question-header">
			<div class="left-section" :class="{ 'hidden-section': hideLeftSection }">
				<span class="question-number">
					<span class="starMark" v-show="required">*</span>
					<span v-show="showQuestionNumber">
						{{ number }}
					</span>
				</span>
				<customEditor :model-value="title" :targetObject="element" targetKey="title" width="400px"
					:editor-id="`title-${element.id}`" @click="handleContainerClick" />
			</div>

			<!-- <div class="subDescription">
					<customEditor :model-value="title" :targetObject="targetObject" :targetKey="targetKey" width="400px"
						:editor-id="editorId" @click="handleContainerClick" />
				 </div> 
			-->

			<slot name="header-actions">
				<div class="operation-buttons">
					<el-tooltip content="逻辑设置" placement="top">
						<el-button class="icon-button">
							<el-icon>
								<Connection />
							</el-icon>
						</el-button>
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

		<!-- 选项列表 -->
		<div class="options-container">
			<slot name="options"></slot>
		</div>

		<!-- 底部操作 -->
		<div class="bottom-actions">
			<slot name="bottom-actions"></slot>
		</div>

		<!-- 批量添加对话框 -->
		<slot name="dialogs"></slot>
	</div>
</template>

<script setup>
import { computed } from 'vue'
import customEditor from "@/views/creator/components/customEditor.vue";

const props = defineProps({
	element: {
		type: Object,
		default: () => { }
	},
	showQuestionNumber: {
		type: Boolean,
		default: true
	},
	hideLeftSection: {
		type: Boolean,
		default: false
	},
	selected: {
		type: Boolean,
		default: false
	},
})

const emit = defineEmits(['click', 'copy', 'delete', 'blur'])

const number = computed({
	get: () => props.element.number || 1,
})

const required = computed({
	get: () => props.element.isrRequired || true,
})

const title = computed({
	get: () => props.element.title || "标题",
})

const handleCopy = () => {
	emit('copy', props.element.id)
}

const handleDelete = () => {
	emit('delete', props.element.id)
}

const handleContainerClick = () => {
	emit('click')
}




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
	margin-bottom: 20px;
	padding: 0 10px;
	position: relative;
}

.left-section {
	display: flex;
	align-items: center;
	gap: 10px;
	flex: 1;
	// background-color: #409EFF;



}

.hidden-section {
	visibility: hidden;
}

.header-actions {
	display: flex;
	justify-content: flex-end;
}

.question-number {
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
}

.options-container {
	margin: 20px 0;
	padding: 0 40px;
}

.bottom-actions {
	margin-top: 20px;
	padding-left: 40px;
}

:deep(.el-button--text) {
	color: #409EFF;
}
</style>