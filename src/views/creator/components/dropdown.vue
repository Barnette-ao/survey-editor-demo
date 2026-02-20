<template>
	<base-question :element="element" :show-question-number="showNumber">
		<!-- 选项列表 -->
		<template #options="{ showAll }">
			<draggable 
				v-model="localChoices"
				item-key="id"
				handle=".dragHandler"
				@change="onDragEnd"
			>
				<template #item="{ element: choice, index }">
					<div
						v-show="showAll || index < 8"
						class="option-item"
						@mousemove="hoverIndex = index" 
						@mouseleave="hoverIndex = -1"
					>
						<DragHandler
							class="dragHandler"
							:is-visible="hoverIndex === index"
						/>
						<div class="optionItemBox">
							<customEditor 
								:model-value="choice" 
								:editor-id="`choice-${element.id}-${index}`" 
								@blur="changeChoiceValue($event, index, element.id)"
							>
								<template #choiceIcon>
									<el-icon color="#606266">
										<CaretBottom />
									</el-icon>
								</template>
							</customEditor>
							<el-button class="delete-option" @click="deleteOption(index)">
								<el-icon>
									<Delete />
								</el-icon>
							</el-button>
						</div>   
					</div>
				</template>
			</draggable>
		</template>

		<!-- 底部操作按钮 -->
		<template #bottom-actions>
			<div class="action-buttons">
				<el-button type="primary" text @click.stop="addOption">
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

		<!-- 批量添加选项对话框 -->
		<template #dialogs>
			<el-dialog v-model="batchDialogVisible" title="批量添加选项" width="500px">
				<el-input v-model="batchOptions" type="textarea" :rows="10" placeholder="请输入选项，每行一个选项" />
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
import { 
  addSimpleOption, 
  deleteSimpleOptionAtIndex, 
  addSimpleBatchOptions, 
  parseBatchInput 
} from '@/views/creator/composables/useChoiceOperations';
import { snapshot } from '@/views/creator/config/shared'

const emit = defineEmits(['update'])

const props = defineProps({
	element: {
		type: Object,
		default: () => { }
	},
	showNumber: {
		type: Boolean,
		default: true
	},
})

const hoverIndex = ref(-1)
const batchDialogVisible = ref(false)
const batchOptions = ref('')

const { applyChoicePropChange, applyUpdateChoices } = useDraftActions()

// newChoices一定要是原始数据类型，也就是说其要去proxy化
const updateChoices = (newChoices) => {
	applyUpdateChoices({
		questionId: props.element.id,
		key: 'choices',
		value: newChoices
	})
}

// 🔑 关键：使用 localChoices 作为中间状态
const localChoices = ref([])
watch(
	() => props.element.choices, 
	(newValue) => {
		localChoices.value = snapshot(newValue)
	}, 
	{ immediate: true }
)

// 🔑 拖拽结束处理
const onDragEnd = () => {	
  const newChoices = snapshot(localChoices.value)	
  updateChoices(newChoices)
}

// 添加单个选项
const addOption = () => {
	const newChoices = addSimpleOption(props.element.choices)
	updateChoices(newChoices)
}

// 删除选项
const deleteOption = (index) => {
	const newChoices = deleteSimpleOptionAtIndex(props.element.choices, index)
	updateChoices(newChoices)
}

// 显示批量添加对话框
const showBatchDialog = () => {
	batchDialogVisible.value = true
	batchOptions.value = ''
}

// 确认批量添加
const confirmBatchAdd = () => {
	const newOptions = parseBatchInput(batchOptions.value)

	if (newOptions.length === 0) {
		ElMessage.warning('请输入有效的选项')
		return
	}

	const newChoices = addSimpleBatchOptions(props.element.choices, newOptions)
	updateChoices(newChoices)

	batchDialogVisible.value = false
	ElMessage.success('批量添加成功')
}

// 🔑 关键：对于字符串数组，直接更新整个 choices 数组
const changeChoiceValue = (newValue, choiceIndex, elementId) => {
	const newChoices = [...props.element.choices]
	newChoices[choiceIndex] = newValue
	updateChoices(newChoices)
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
</style>