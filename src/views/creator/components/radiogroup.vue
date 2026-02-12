<template>
	<base-question :element="element" :show-question-number="showNumber" :logicRuleNum="logicRuleNum"
		@click="handleClick" @copy="id => emit('copy', id)" @delete="id => emit('delete', id)"
		@setLogic="element => emit('setLogic', element)">
		<!-- 选项列表 -->
		<template #options ="{ showAll }">
			<div :class="`radiogroup-option-list-${element.id}`" >
				<div v-for="(choice, index) in element.choices" 
					v-show="showAll || index < 8"
					@mousemove="hoverIndex = index" 
					@mouseleave="hoverIndex = -1"
				>
					 <div class="option-item">
						<DragHandler :is-visible="hoverIndex === index" @mousedown="emit('click')"/>
						<div class="optionItemBox"  >
							<customEditor v-model="choice.value" :targetObject="element.choices[index]" targetKey="value"
								:editor-id="`choice-${element.id}-${index}`" @click="emit('click')">
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
				<el-button type="primary" text @click.stop="addOption">
					<el-icon>
						<Plus />
					</el-icon>添加选项
				</el-button>
				<el-button type="primary" text @click.stop="addOtherOption">
					<el-icon>
						<Plus />
					</el-icon>添加其他项
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
import BaseQuestion from '@/components/Question/BaseQuestion.vue'
import customEditor from "@/views/creator/components/customEditor.vue";
import DragHandler from "@/views/creator/components/Icons/dragIcon.vue";
import { initOptionsSortable } from '@/views/creator/config/dragOption';
import { ref, nextTick, onMounted } from 'vue'
import { 
  addSingleOption, 
  addOtherOption as addOtherOptionUtil, 
  deleteOptionAtIndex, 
  addBatchOptions, 
  parseBatchInput 
} from '@/views/creator/composables/useChoiceOperations';

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
    initOptionsSortable('radiogroup-option-list', props.element, updateChoices);
  });
});

const hoverIndex = ref(-1)

const batchDialogVisible = ref(false)
const batchOptions = ref('')

const updateChoices = (newChoices) => {
	emit('update', 'choices', newChoices)
}

// 添加单个选项
const addOption = () => {
	const newChoices = addSingleOption(props.element.choices)
	updateChoices(newChoices)
}

// 添加其他选项
const addOtherOption = () => {
	const newChoices = addOtherOptionUtil(props.element.choices)
	updateChoices(newChoices)
}


// 删除选项
const deleteOption = (index) => {
	const newChoices = deleteOptionAtIndex(props.element.choices, index)
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

	const newChoices = addBatchOptions(props.element.choices, newOptions)
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
	margin: 10px 0;
	gap: 10px;
	width: 100%;

	// 当父元素 hover 时，控制子元素 editor-wrapper 的边框
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
		border-radius: 50%;
		background-color: rgb(239, 241, 247);
	}
}

.option-item .delete-option {
	opacity: 0;
	transition: opacity 0.3s ease;
	flex-shrink: 0;
	margin-left: 0px;
	border: none;
	padding: 8px 0px;
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


.mark {
  margin: 0 0 0px 62px;
  width: 70px;
  height: 20px;
  background-color: rgb(240, 241, 248);
}
</style>