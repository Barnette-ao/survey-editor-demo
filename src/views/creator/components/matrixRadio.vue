<template>
	<base-question :element="element" :show-question-number="showNumber">
		<template #options>
			<div class="matrix-content">
				<div class="matrix-container">
					<!-- 表头行 -->
					<div class="matrix-header">
						<div class="matrix-cell"></div>
						<div v-for="(column, index) in element.columns" :key="index" class="matrix-cell">
							<div class="cell-content">
								<div class="column" @click="$emit('click')">{{ column }}</div>
								<el-dropdown trigger="click" @command="handleColumnCommand">
									<div class="more-icon ">
										<img src="/images/questionnaire/otherBtn.png" width="18px" height="18px" />
									</div>
									<template #dropdown>
										<el-dropdown-menu>
											<el-dropdown-item :command="{ type: 'deleteColumn', index }">
												删除
											</el-dropdown-item>
										</el-dropdown-menu>
									</template>
								</el-dropdown>
							</div>
						</div>
					</div>

					<!-- 矩阵行 -->
					<div v-for="(row, rowIndex) in element.rows" :key="rowIndex" class="matrix-row">
						<div class="matrix-cell">
							<div class="cell-content">
								<div class="row" @click="$emit('click')">{{ row }}</div>
								<el-dropdown trigger="click" @command="handleRowCommand">
									<div class="more-icon ">
										<img src="/images/questionnaire/otherBtn.png" width="18px" height="18px" />
									</div>
									<template #dropdown>
										<el-dropdown-menu>
											<el-dropdown-item :command="{ type: 'deleteRow', index: rowIndex }">
												删除
											</el-dropdown-item>
										</el-dropdown-menu>
									</template>
								</el-dropdown>
							</div>
						</div>
						<div v-for="(column, colIndex) in element.columns" :key="colIndex" class="matrix-cell">
							<input type="radio" :name="'matrix-' + rowIndex" :value="colIndex">
						</div>
					</div>
				</div>

				<!-- 右侧按钮移到这里 -->
				<div class="matrix-side-buttons">
					<el-tooltip content="添加选项" placement="top">
						<el-button size="small" @click="addOption">
							<el-icon>
								<Plus />
							</el-icon>
						</el-button>
					</el-tooltip>
					<el-tooltip content="批量添加选项" placement="top">
						<el-button size="small" @click="showBatchAddOptionDialog">
							<el-icon>
								<Document />
							</el-icon>
						</el-button>
					</el-tooltip>
					<el-tooltip content="添加其他选项" placement="top">
						<el-button size="small" @click="addOtherOption">
							<el-icon>
								<el-icon>
									<Files />
								</el-icon>
							</el-icon>
						</el-button>
					</el-tooltip>
				</div>
			</div>

			<!-- 底部按钮 -->
			<div class="bottom-buttons">
				<el-tooltip content="添加矩阵行" placement="top">
					<el-button size="small" @click="addRow">
						<el-icon>
							<Plus />
						</el-icon>
					</el-button>
				</el-tooltip>
				<el-tooltip content="批量添加行" placement="top">
					<el-button size="small" @click="showBatchAddRowDialog">
						<el-icon>
							<Document />
						</el-icon>
					</el-button>
				</el-tooltip>
			</div>

			<!-- 批量添加行对话框 -->
			<el-dialog title="批量添加行" v-model="batchAddRowDialogVisible" width="500px">
				<el-input type="textarea" v-model="batchRowInput" :rows="5" placeholder="每行输入一个选项" />
				<template #footer>
					<el-button @click="batchAddRowDialogVisible = false">取消</el-button>
					<el-button type="primary" @click="confirmBatchAddRows">确定</el-button>
				</template>
			</el-dialog>

			<!-- 批量添加选项对话框 -->
			<el-dialog title="批量添加选项" v-model="batchAddOptionDialogVisible" width="500px">
				<el-input type="textarea" v-model="batchOptionInput" :rows="5" placeholder="每行输入一个选项" />
				<template #footer>
					<el-button @click="batchAddOptionDialogVisible = false">取消</el-button>
					<el-button type="primary" @click="confirmBatchAddOptions">确定</el-button>
				</template>
			</el-dialog>
		</template>
	</base-question>
</template>

<script setup>
import { ref, reactive } from 'vue'
import BaseQuestion from '@/components/Question/BaseQuestion.vue'

const emit = defineEmits(['update'])

const props = defineProps({
	showNumber: {
		type: Boolean,
		default: true
	},
	element: {
		type: Object,
		default: () => { }
	},
})

const updateColumns = (newColumns) => {
	emit('update', 'columns', newColumns)
}

const updateRows = (newRows) => {
	emit('update', 'rows', newRows)
}

// 处理选项文本变化
const handleColumnsChange = (index, newValue) => {
	const newColumns = [...props.element.columns]
	newColumns[index] = newValue.replace(/<\/?p>/g, '')
	updateColumns(newColumns)
}

const batchAddRowDialogVisible = ref(false)
const batchAddOptionDialogVisible = ref(false)
const batchRowInput = ref('')
const batchOptionInput = ref('')

const addRow = () => {
	const newRows = [...props.element.rows];
	newRows.push(`矩阵行${newRows.length + 1}`)
	updateRows(newRows)
}

const addOption = () => {
	const newColumns = [...props.element.columns];
	const otherIndex = newColumns.findIndex(column => column == "其他")

	if (otherIndex != -1) {
		newColumns.splice(otherIndex, 0, `选项${newColumns.length}`)
	} else {
		newColumns.push(`选项${newColumns.length + 1}`)
	}

	updateColumns(newColumns)
}

const addOtherOption = () => {
	const newColumns = [...props.element.columns];
	newColumns.push("其他")
	updateColumns(newColumns)
}

const showBatchAddRowDialog = () => {
	batchAddRowDialogVisible.value = true
	batchRowInput.value = ''
}

const showBatchAddOptionDialog = () => {
	batchAddOptionDialogVisible.value = true
	batchOptionInput.value = ''
}

const confirmBatchAddRows = () => {
	const newRows = batchRowInput.value.split('\n').filter(row => row.trim())

	if (newRows.length === 0) {
		ElMessage.warning('请输入有效的选项')
		return
	}

	const newChoices = [...props.element.rows, ...newRows]
	updateRows(newChoices)

	batchAddRowDialogVisible.value = false
	ElMessage.success('批量添加成功')
}

const addOptions = (newOptions) => {
	let newChoices = [...props.element.columns]
	// 查找是否存在其他项
	const otherOptionIndex = newChoices.findIndex(choice => choice === '其他')
	// 如果存在其他项，在其他项之前插入新选项
	if (otherOptionIndex !== -1) {
		newChoices.splice(otherOptionIndex, 0, ...newOptions)
	} else {
		// 如果不存在其他项，直接添加到末尾
		newChoices = [...props.element.columns, ...newOptions]
	}

	return newChoices
}

const confirmBatchAddOptions = () => {
	const newOptions = batchOptionInput.value.split('\n').filter(option => option.trim())

	if (newOptions.length === 0) {
		ElMessage.warning('请输入有效的选项')
		return
	}

	const newChoices = addOptions(newOptions)
	updateColumns(newChoices)

	batchAddOptionDialogVisible.value = false
	ElMessage.success('批量添加成功')
}


const handleColumnCommand = ({ type, index }) => {
	if (type === 'deleteColumn') {
		const newColumns = [...props.element.columns]
		newColumns.splice(index, 1)
		updateColumns(newColumns)
	}
}

const handleRowCommand = ({ type, index }) => {
	if (type === 'deleteRow') {
		const newRows = [...props.element.rows]
		newRows.splice(index, 1)
		updateRows(newRows)
	}
}

</script>

<style lang="scss" scoped>
/* 矩阵内容区域的布局 */
.matrix-content {
	margin-left: 40px;
	position: relative;
	display: flex;
	width: 30%;
}

.matrix-container {
	flex: 1;
	border: 1px solid #dcdfe6;
	border-radius: 4px;
	margin-bottom: 10px;
	background-color: #fff;
}

.matrix-header {
	display: flex;
	background-color: #f5f7fa;
	border-bottom: 1px solid #dcdfe6;
	font-size: 15px;
}

.matrix-row {
	display: flex;
	border-bottom: 1px solid #dcdfe6;
	transition: background-color 0.3s;
	font-size: 15px;

	&:last-child {
		border-bottom: none;
	}

	&:hover {
		background-color: #f5f7fa;
	}
}

.matrix-cell {
	flex: 0 0 auto;
	padding: 12px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-right: 1px solid #dcdfe6;
	min-width: 120px;

	&:first-child {
		min-width: 120px;
		flex: 0 0 auto;
		justify-content: flex-start;
	}

	&:last-child {
		border-right: none;
	}

	&:not(:first-child) {
		min-width: 80px;
		flex: 1 1 0;
	}
}

.bottom-buttons {
	margin-left: 25px;
	margin-top: 10px;
	display: flex;
	gap: 10px;
}

.matrix-side-buttons {
	display: flex;
	flex-direction: column;
	gap: 10px;
	margin-left: 10px;
}

:deep(.el-button--small) {
	margin: 0 0 0 12px;
}

.el-button {
	transition: all 0.3s;
}

.el-button:hover {
	transform: scale(1.05);
}

/* 单选框样式 */
input[type="radio"] {
	width: 16px;
	height: 16px;
	cursor: pointer;
}

.cell-content {
	display: flex;
	align-items: center;
	width: 100%;
	justify-content: space-around;

	:deep(.editor-wrapper) {
		width: 100%;
	}

	:deep(.editor-wrapper .choiceBtn) {
		display: none;
	}
}

.more-icon {
	margin-top: 4px;
	cursor: pointer;
	color: #909399;
	font-size: 13px;
	transition: color 0.3s;
}

.more-icon:hover {
	color: #409EFF;
}

/* 调整下拉菜单的样式 */
:deep(.el-dropdown-menu) {
	min-width: 80px;
}

:deep(.el-dropdown-menu__item) {
	padding: 8px 16px;
	font-size: 14px;
}

:deep(.el-dropdown-menu__item:hover) {
	background-color: #f5f7fa;
	color: #409EFF;
}
</style>