<template>
	<base-question :element="element" :show-question-number="showNumber" @click="$emit('click')"
		@copy="id => emit('copy', id)" @delete="id => emit('delete', id)">
		<!-- 选项列表 -->
		<template #options>
			<div :class="`textgroup-list-${element.id}`">
				<div v-for="(textbox, index) in element.items" :key="index" @mousemove="hoverIndex = index" 
				@mouseleave="hoverIndex = -1">
					<div class="option-item">
						<DragHandler :is-visible="hoverIndex === index" @mousedown="emit('click')" />
						<div class="optionItemBox">
							<customEditor 
								:model-value="textbox.name" 
								:editor-id="`textbox-${element.id}-${index}`" 
								@click="$emit('click')"
								@blur="onItemNameChange($event, element.id)"
							>
							</customEditor>
							<el-button class="delete-option" @click="deleteItem(index)">
								<el-icon>
									<Delete />
								</el-icon>
							</el-button>
						</div>
					</div>
					<div class="input-preview">
						<el-input disabled placeholder="填写者内容输入区" />
					</div>
				</div>
			</div>

			<!-- 底部按钮 -->
			<div class="bottom-actions">
				<div class="action-buttons">
					<el-button type="primary" text @click="addItem">
						<el-icon>
							<Plus />
						</el-icon>添加选项
					</el-button>
					<el-button type="primary" text @click="showBatchDialog">
						<el-icon>
							<Plus />
						</el-icon>批量添加选项
					</el-button>
				</div>
			</div>

			<!-- 批量添加对话框 -->
			<el-dialog v-model="batchDialogVisible" title="批量添加选项" width="500px">
				<el-input v-model="batchItems" type="textarea" :rows="10" placeholder="请输入选项标题，每行一个" />
				<template #footer>
					<span class="dialog-footer">
						<el-button @click="batchDialogVisible = false">取消</el-button>
						<el-button type="primary" @click="confirmBatchAdd">确定</el-button>
					</span>
				</template>
			</el-dialog>
		</template>
	</base-question>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
// 移除 ElMessage 导入，使用全局配置
// 移除图标导入，使用全局注册
import BaseQuestion from '@/components/Question/BaseQuestion.vue'
import customEditor from "@/views/creator/components/customEditor.vue";
import DragHandler from "@/views/creator/components/Icons/dragIcon.vue";
import { initOptionsSortable } from '@/views/creator/config/dragOption';
import { useDraftActions } from "@/views/creator/composables/useDraftAction";

const emit = defineEmits(['click', 'copy', 'delete', 'update'])

const props = defineProps({
	element: {
		type: Object,
		default: () => { }
	},
	showNumber: {
		type: Boolean,
		default: true
	}
})

onMounted(() => {
  nextTick(() => {
    initOptionsSortable('textgroup-list', props.element, updateItems);
  });
});

const hoverIndex = ref(-1)

const batchDialogVisible = ref(false)
const batchItems = ref('')

// 更新填空项列表
const updateItems = (newItems) => {
	emit('update', 'items', newItems)
}

// 添加填空项
const addItem = () => {
	const newItems = [...props.element.items]
	newItems.push({ name: `填空${newItems.length + 1}` })
	updateItems(newItems)
}

// 删除填空项
const deleteItem = (index) => {
	const newItems = [...props.element.items]
	newItems.splice(index, 1)
	updateItems(newItems)
}

// 显示批量添加对话框
const showBatchDialog = () => {
	batchDialogVisible.value = true
	batchItems.value = ''
}

// 确认批量添加
const confirmBatchAdd = () => {
	const newItems = batchItems.value
		.split('\n')
		.map(item => item.trim())
		.filter(item => item !== '')
		.map(item => ({ name: item }))

	if (newItems.length === 0) {
		this.$message.warning('请输入有效的填空项')
		return
	}

	const updatedItems = [...props.element.items, ...newItems]
	updateItems(updatedItems)

	batchDialogVisible.value = false
	this.$message.success('批量添加成功')
}

const { applyItemPropChange } = useDraftAction()
const onChoiceValueChange = (event, itemIndex, elementId) => {
	applyItemPropChange({
		questionId: elementId,
		itemIndex: itemIndex,
		key: "name",
		value: event,
	})
}
</script>

<style scoped lang="scss">
@import '@/assets/styles/dragStyle.scss';

.option-item {
	display: flex;
	align-items: center;
	margin: 10px 0;
	gap: 10px;
	width: 100%;

	&:hover {
		:deep(.editor-wrapper) {
			border: 1px dashed rgb(170, 170, 170);
		}
	}

	.optionItemBox {
		flex: 1;
		display: flex;
	}

	.dragHandler {
		width: 20px;
		height: 20px;
	}
}

.option-item .delete-option {
	opacity: 0;
	transition: opacity 0.3s ease;
	flex-shrink: 0;
	margin-left: 8px;
	border: none;
	padding: 8px;
	background: transparent;

	&:hover {
		color: #f56c6c;
	}
}

.option-item:hover .delete-option {
	opacity: 1;
}

.action-buttons {
	display: flex;
	gap: 20px;
}

.input-preview {
	margin-top: 10px;
	margin-left: 30px;
	width: 30%;
}

.input-preview :deep(.el-input.is-disabled .el-input__inner) {
	cursor: default
}

/* 底部按钮样式 */
.bottom-actions {
	margin-left: 25px;
	margin-top: 20px;
}

.action-buttons {
	display: flex;
	gap: 20px;
}

/* 对话框样式 */
.dialog-footer {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	margin-top: 20px;
}
</style>