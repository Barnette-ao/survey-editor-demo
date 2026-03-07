<template>
	<base-question :element="element" :show-question-number="showNumber">
		<!-- 选项列表 -->
		<template #options="{ showAll }">
			<draggable 
				v-model="localItems"
				item-key="id"
				handle=".dragHandler"
				@change="onDragEnd"
			>
				<template #item="{ element: textbox, index }">
					<div
						v-show="showAll || index < 8"
						@mousemove="hoverIndex = index" 
						@mouseleave="hoverIndex = -1"
					>
						<div class="option-item">
							<DragHandler
								class="dragHandler"
								:is-visible="hoverIndex === index"
							/>
							<div class="optionItemBox">
								<customEditor 
									:model-value="textbox.name" 
									:editor-id="`textbox-${element.id}-${index}`" 
									@blur="onItemNameChange($event, index, element.id)"
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
				</template>
			</draggable>
		</template>

		<!-- 底部按钮 -->
		<template #bottom-actions>
			<div class="action-buttons">
				<el-button type="primary" text @click.stop="addItem">
					<el-icon>
						<Plus />
					</el-icon>添加选项
				</el-button>
				<el-button type="primary" text @click.stop="showBatchDialog">
					<el-icon>
						<Plus />
					</el-icon>批量添加选项
				</el-button>
			</div>
		</template>

		<!-- 批量添加对话框 -->
		<template #dialogs>
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
import draggable from 'vuedraggable'
import { ref, watch } from 'vue'
import BaseQuestion from '@/components/Question/BaseQuestion.vue'
import customEditor from "@/views/creator/components/customEditor.vue";
import DragHandler from "@/views/creator/components/Icons/dragIcon.vue";
import { useDraftActions } from "@/views/creator/composables/useDraftAction";
import { snapshot } from '@/views/creator/utils/shared'

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

const hoverIndex = ref(-1)
const batchDialogVisible = ref(false)
const batchItems = ref('')

const { applyUpdateElement, applyItemPropChange } = useDraftActions()

// 🔑 关键：items 使用与 choices 相同的 command
// newItems一定要是原始数据类型，也就是说其要去proxy化
const updateItems = (newItems) => {
	applyUpdateElement({
		questionId: props.element.id,
		key: 'items',
		value: newItems
	})
}

// 🔑 关键：使用 localItems 作为中间状态
const localItems = ref([])
watch(
	() => props.element.items, 
	(newValue) => {
		localItems.value = snapshot(newValue)
	}, 
	{ immediate: true }
)

// 🔑 拖拽结束处理
const onDragEnd = () => {	
  const newItems = snapshot(localItems.value)	
  updateItems(newItems)
}

// 添加填空项
const addItem = () => {
	const newItems = snapshot(props.element.items)
	newItems.push({ name: `填空${newItems.length + 1}` })
	updateItems(newItems)
}

// 删除填空项
const deleteItem = (index) => {
	const newItems = snapshot(props.element.items)
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
	const newItemsArray = batchItems.value
		.split('\n')
		.map(item => item.trim())
		.filter(item => item !== '')
		.map(item => ({ name: item }))

	if (newItemsArray.length === 0) {
		ElMessage.warning('请输入有效的填空项')
		return
	}

	const updatedItems = snapshot([...props.element.items, ...newItemsArray])
	updateItems(updatedItems)

	batchDialogVisible.value = false
	ElMessage.success('批量添加成功')
}

// 🔑 关键：编辑 item.name 时使用 applyItemPropChange
const onItemNameChange = (event, itemIndex, elementId) => {
	applyItemPropChange({
		questionId: elementId,
		itemIndex: itemIndex,
		key: "name",
		value: event,
	})
}
</script>

<style scoped lang="scss">
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