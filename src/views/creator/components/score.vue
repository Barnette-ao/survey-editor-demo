<template>
	<base-question :element="element" :show-question-number="showNumber">
		<template #options>
			<!-- 评分选项 -->
			<div class="score-content">
				<div class="score-options">
					<div class="stars-list">
						<div v-for="n in starCount" :key="n" class="star-item">
							<el-icon color="#aaaaaa" size="28">
								<StarFilled />
							</el-icon>
						</div>
					</div>
				</div>
			</div>
		</template>
		<!-- 底部操作按钮 -->
		<template #bottom-actions>
			<div class="action-buttons">
				<el-button type="primary" text @click="handleAddOption">
					<el-icon>
						<Plus />
					</el-icon>
					添加选项
				</el-button>
				<el-button type="primary" text @click="handleBatchAdd">
					<el-icon>
						<Plus />
					</el-icon>
					批量添加选项
				</el-button>
			</div>
		</template>
		<!-- 批量添加对话框 -->
		<template #dialogs>
			<el-dialog v-model="batchDialogVisible" title="批量添加" width="500px">
				<el-input v-model="batchInput" type="textarea" :rows="8" placeholder="请输入选项内容，每行一个选项" />
				<template #footer>
					<span class="dialog-footer">
						<el-button @click="batchDialogVisible = false">取消</el-button>
						<el-button type="primary" @click="handleBatchConfirm">确认</el-button>
					</span>
				</template>
			</el-dialog>
		</template>
	</base-question>
</template>

<script setup>
import { ref, computed } from 'vue'
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

const starCount = computed(() => {
	const rateMin = props.element.rateMin || 1
	const rateMax = props.element.rateMax || 5
	const rateStep = props.element.rateStep || 1

	return Math.floor((rateMax - rateMin) / rateStep) + 1
})

// 批量添加相关
const batchDialogVisible = ref(false)
const batchInput = ref('')

const handleAddOption = () => {
	starCount.value++
}

const handleBatchAdd = () => {
	batchDialogVisible.value = true
}

const handleBatchConfirm = () => {
	const lines = batchInput.value.split('\n').filter(line => line.trim())
	starCount.value = lines.length || 1
	batchDialogVisible.value = false
	batchInput.value = ''
}

</script>

<style scoped>
/* 保持评分内容样式不变 */
.score-content {
	margin-left: 40px;
	padding-bottom: 16px;
	width: 60%;
}

.stars-list {
	margin-left: 10px;
	display: flex;
	justify-content: space-between;
}

.star-icon {
	font-size: 24px;
	color: #dcdfe6;
	cursor: default;
}

.dialog-footer {
	margin-top: 20px;
	display: flex;
	justify-content: flex-end;
	gap: 12px;
}
</style>