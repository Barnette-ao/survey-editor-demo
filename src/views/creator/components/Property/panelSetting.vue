<template>
	<div class="panel-setting">
		<base-question-setting
			:element-id="element.id" 
			v-model:required="requiredValue" 
			v-model:showNumber="showNumberValue"
			:show-number-item="false" 
			v-model:isAddSubDescription="isAddSubDescriptionValue" />

		<div class="setting-section">
			<div class="section-title">选项设置</div>
			<div class="section-content">
				<div class="setting-item">
					<span>问题随机排列</span>
					<el-switch v-model="randomOrder" />
				</div>
				<div class="setting-item">
					<span>添加内部缩进</span>
					<el-select v-model="indent" size="small" placeholder="0">
						<el-option v-for="n in 4" :key="n" :label="(n - 1)" :value="n - 1" />
					</el-select>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseQuestionSetting from '@/components/Question/BaseQuestionSetting.vue'

const props = defineProps({
	element: {
		type: Object,
		required: true
	},
	showNumber: {
		type: Boolean,
		default: true
	},
})

const emit = defineEmits(['update:required', 'update:showNumber', 'setting-update'])

const requiredValue = computed({
	get: () => props.element.isRequired,
	set: (value) => emit('update:required', value)
})

const showNumberValue = computed({
	get: () => props.showNumber,
	set: (value) => emit('update:showNumber', value)
})

const randomOrder = computed({
	get: () => (props.element.questionsOrder && props.element.questionsOrder == "random") || false,
	set: (value) => emit('setting-update', "questionsOrder", value)
})

const indent = computed({
	get: () => props.element.innerIndent || 0,
	set: (value) => emit('setting-update', "innerIndent", value)
})

const isAddSubDescriptionValue = computed({
	get: () => {
		return props.element.showSubDescription || false
	},
	set: (value) => {
		emit('setting-update', 'showSubDescription', value)
		if (!value) {
			emit('setting-update', 'description', '')
		}
	}
})

</script>

<style scoped lang="scss">
@import '@/assets/styles/questionSetting.scss';

.section-content {
	.setting-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 8px 0;
		/* border-bottom: 1px solid #ebeef5; */

		span {
			color: #606266;
			font-size: 14px;
		}
	}
}

.setting-link {
	color: #409eff;
	cursor: pointer;
	font-size: 14px;

	&:hover {
		color: #66b1ff;
	}
}

:deep(.el-select) {
	width: 60px;
}

:deep(.el-switch) {
	--el-switch-on-color: #409eff;
}

:deep(.el-switch.is-checked .el-switch__core) {
	border-color: #409eff;
	background-color: #409eff;
}
</style>