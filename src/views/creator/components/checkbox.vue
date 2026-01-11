<template>
	<base-question :element="element" :show-question-number="showNumber" :logicRuleNum="logicRuleNum"
		@click="handleClick" @copy="id => emit('copy', id)" @delete="id => emit('delete', id)"
		@setLogic="element => emit('setLogic', element)">
		<!-- 选项列表 -->
		<template #options>
			<div :class="`checkbox-option-list-${element.id}`">
				<div v-for="(choice, index) in element.choices" 
					:key="index"
					@mousemove="hoverIndex = index" 
					@mouseleave="hoverIndex = -1"
				>
					<div class="option-item">
						<DragHandler :is-visible="hoverIndex === index" @mousedown="emit('click')" />
						<div class="optionItemBox">
							<customEditor v-model="choice.value" :targetObject="element.choices[index]" targetKey="value"
								:editor-id="`choice-${element.id}-${index}`" @click="$emit('click')">
								<template #choiceIcon>
									<div class="choiceIcon"></div>
								</template>
							</customEditor>
							<el-button class="setting-option" @click="settingOption($event, index)">
								<el-icon>
									<Setting />
								</el-icon>
							</el-button>
							<el-button class="delete-option" @click="deleteOption(index)">
								<el-icon>
									<Delete />
								</el-icon>
							</el-button>
						</div>
					</div>
					<div class="mark" v-show="choice.showText"></div>
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
				<el-button type="primary" text @click="addOtherOption">
					<el-icon>
						<Plus />
					</el-icon>添加其他项
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
import BaseQuestion from '@/components/Question/BaseQuestion.vue'
import customEditor from "@/views/creator/components/customEditor.vue";
import DragHandler from "@/views/creator/components/Icons/dragIcon.vue";
import { initOptionsSortable } from '@/views/creator/config/dragOption';

const emit = defineEmits(['click', 'copy', 'delete', 'update', 'optionSetting', 'setLogic'])

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
    initOptionsSortable('checkbox-option-list', props.element, updateChoices);
  });
});

const hoverIndex = ref(-1)

const batchDialogVisible = ref(false)
const batchOptions = ref('')

const updateChoices = (newChoices) => {
	emit('update', 'choices', newChoices)
}

const getNewChoiceItem = (otherOptionIndex, newChoices) => {
	let index = otherOptionIndex === -1 ? newChoices.length + 1 : newChoices.length

	return {
		"value": `选项${index}`,
		"showText": false,
		"textType": "text",
		"required": true,
	}
}

// 添加单个选项
const addOption = () => {
	const newChoices = [...props.element.choices]
	// 查找是否存在其他项
	const otherOptionIndex = newChoices.findIndex(choice => choice.value === '其他')
	const newChoiceItem = getNewChoiceItem(otherOptionIndex, newChoices)

	// 如果存在其他项，在其他项之前插入新选项
	if (otherOptionIndex !== -1) {
		newChoices.splice(otherOptionIndex, 0, newChoiceItem)
	} else {
		// 如果不存在其他项，直接添加到末尾
		newChoices.push(newChoiceItem)
	}

	updateChoices(newChoices)
}

// 添加其他选项
const addOtherOption = () => {
	const newChoices = [...props.element.choices]
	const otherChoiceItem = {
		"value": '其他',
		"showText": true,
		"textType": "text",
		"required": true,
	}
	newChoices.push(otherChoiceItem)
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

const formattedNewOption = (newOptions) => {
	return newOptions.map((element) => {
		return {
			"value": element,
			"showText": false,
			"textType": "text",
			"required": true,
		}
	})
}

const addOptions = (newOptions) => {
	let newChoices = [...props.element.choices]
	// 查找是否存在其他项
	const otherOptionIndex = newChoices.findIndex(choice => choice.value === '其他')

	newOptions = formattedNewOption(newOptions)
	// 如果存在其他项，在其他项之前插入新选项
	if (otherOptionIndex !== -1) {
		newChoices.splice(otherOptionIndex, 0, ...newOptions)
	} else {
		// 如果不存在其他项，直接添加到末尾
		newChoices = [...props.element.choices, ...newOptions]
	}

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

const settingOption = (event, index) => {
	// 发送选项设置事件，并传递选项索引
	emit('optionSetting', { index: index, isOpen: true, id: props.element.id })
	// 阻止事件冒泡，防止触发题目的点击事件
	event.stopPropagation()
}

// 添加点击事件处理
const handleClick = () => {
	// 点击题目时，关闭选项设置模式
	emit('optionSetting', { index: -1, isOpen: false })
	emit('click')
}


</script>

<style scoped lang="scss">
@import '@/assets/styles/dragStyle.scss';

.option-item {
	display: flex;
	align-items: center;
	margin: 10px 0 10px 0;
	gap: 10px;
	width: 100%;

	.choiceContainer{
		width: 100%;
		display: flex;
		align-items: center;
	}

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

	.choiceIcon {
		width: 18px;
		height: 18px;
		background-color: rgb(239, 241, 247);
	}

}

.option-item .delete-option {
	opacity: 0;
	transition: opacity 0.3s ease;
	flex-shrink: 0;
	margin-left: 0px;
	border: none;
	padding: 8px 0;
	background: transparent;

	&:hover {
		color: #f56c6c;
	}
}

.option-item:hover .delete-option {
	opacity: 1;
}

.option-item .setting-option {
	opacity: 0;
	transition: opacity 0.3s ease;
	flex-shrink: 0;
	// margin-left: 8px;
	border: none;
	padding: 8px;
	background: transparent;

	&:hover {
		color: rgb(94, 158, 255);
	}
}

.option-item:hover .setting-option {
	opacity: 1;
}

:deep(.el-checkbox__input.is-disabled) {
	margin-bottom: 8px;
}

.mark {
  margin: 0 0 0px 62px;
  width: 70px;
  height: 20px;
  background-color: rgb(240, 241, 248);
}



</style>