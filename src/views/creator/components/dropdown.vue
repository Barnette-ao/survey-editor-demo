<template>
	<base-question :element="element" :show-question-number="showNumber" :logicRuleNum="logicRuleNum"
		@click="$emit('click')" @copy="id => emit('copy', id)" @delete="id => emit('delete', id)"
		@setLogic="element => emit('setLogic', element)">
		<!-- 选项列表 -->
		<template #options="{ showAll }">
			<div :class="`dropdown-option-list-${element.id}`">
				<div v-for="(choice, index) in element.choices" 
					v-show="showAll || index < 8"
					class="option-item"
					@mousemove="hoverIndex = index" 
					@mouseleave="hoverIndex = -1">
					<DragHandler :is-visible="hoverIndex === index" @mousedown="emit('click')" />
					<div class="optionItemBox">
						<customEditor :modelValue="choice" @update:modelValue="updateChoice(index, $event)"
							:targetObject="element.choices" :targetKey="index + ''"
							:editor-id="`choice-${element.id}-${index}`" @click="$emit('click')">
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
			</div>
			
		</template>

		<!-- 底部操作按钮 -->
		<template #bottom-actions>
			<div class="action-buttons">
				<el-button type="primary" text @click="addOption">
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
import { ref, nextTick, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import BaseQuestion from '@/components/Question/BaseQuestion.vue'
import customEditor from "@/views/creator/components/customEditor.vue";
import DragHandler from "@/views/creator/components/Icons/dragIcon.vue";
import { initOptionsSortable } from '@/views/creator/config/dragOption';

const emit = defineEmits(['click', 'copy', 'delete', 'update', 'setLogic'])

const props = defineProps({
	element: {
		type: Object,
		default: () => { }
	},
	showNumber: {
		type: Boolean,
		default: true
	},
	logicRuleNum: {
		type: Number,
		default: 0
	},
})

onMounted(() => {
  nextTick(() => {
    initOptionsSortable('dropdown-option-list', props.element, updateChoices);
  });
});

const updateChoice = (index, newValue) => {
    const newChoices = [...props.element.choices]
    newChoices[index] = newValue
    updateChoices(newChoices)
}

const hoverIndex = ref(-1)

const batchDialogVisible = ref(false)
const batchOptions = ref('')

const updateChoices = (newChoices) => {
	emit('update', 'choices', newChoices)
}

// 添加单个选项
const addOption = () => {
	const newChoices = [...props.element.choices]
	newChoices.push(`选项${newChoices.length + 1}`)
	updateChoices(newChoices)
}

// 删除选项
const deleteOption = (index) => {
	const newChoices = [...props.element.choices]
	newChoices.splice(index, 1)
	updateChoices(newChoices)
}

// 显示批量添加对话框
const showBatchDialog = () => {
	batchDialogVisible.value = true
	batchOptions.value = ''
}

const addOptions = (newOptions) => {
	let newChoices = [...props.element.choices]
	newChoices = [...props.element.choices, ...newOptions]
	return newChoices
}

// 确认批量添加
const confirmBatchAdd = () => {
	const newOptions = batchOptions.value
		.split('\n')
		.filter(option => option.trim())
		.map(option => option.trim())

	if (newOptions.length === 0) {
		ElMessage.warning('请输入有效的选项')
		return
	}

	const newChoices = addOptions(newOptions)
	updateChoices(newChoices)

	batchDialogVisible.value = false
	ElMessage.success('批量添加成功')
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