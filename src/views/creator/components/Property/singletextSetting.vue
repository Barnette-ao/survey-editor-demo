<template>
	<div class="singletext-setting">
		<base-question-setting
			:element-id="element.id" 
			v-model:required="requiredValue" 
			v-model:showNumber="showNumberValue"
			:show-number-item="showNumberItem" 
			v-model:isAddSubDescription="isAddSubDescriptionValue"
			@setLogic="emit('setLogic', element)"
			v-model:advancedLogicText="choiceShowHideValue" 
		>
		</base-question-setting>

		<div class="setting-section">
			<div class="section-title">填写限制</div>
			<div class="section-content">
				<div class="setting-item">
					<span>最多填写</span>
					<div>
						<el-input-number v-model="maxLength" size="small" :min="0" controls-position="right" />
						<span class="text-number">字</span>
					</div>

				</div>
				<div class="setting-item">
					<span>默认文本</span>
					<el-input v-model="defaultText" size="small" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseQuestionSetting from '@/components/Question/BaseQuestionSetting.vue'
import { useCommonComputed } from '@/views/creator/utils/commonComputed'


// 响应式变量
const props = defineProps({
	element: {
		type: Object,
		required: true
	},
	showNumber: {
		type: Boolean,
		required: true
	},
	showNumberItem: {
		type: Boolean,
		required: true
	},
})

const emit = defineEmits(['update:required', 'update:showNumber', 'setting-update', 'setLogic'])

const { choiceShowHideValue } = useCommonComputed(props, emit)

const defaultText = computed({
	get: () => props.element.placeholder || '请输入',
	set: (value) => emit('setting-update', 'placeholder', value)
})

const maxLength = computed({
	get: () => props.element.maxLength || 0,
	set: (value) => emit('setting-update', 'maxLength', value)
})

const requiredValue = computed({
	get: () => props.element.isRequired,
	set: (value) => emit('update:required', value)
})

const showNumberValue = computed({
	get: () => props.showNumber,
	set: (value) => emit('update:showNumber', value)
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

		.text-number {
			margin-left: 4px;
			color: #606266;
			font-size: 14px;
		}
	}
}

.item-with-icon {
	display: flex;
	align-items: center;
	gap: 4px;
}

.help-icon {
	color: #909399;
	cursor: pointer;
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
	width: 120px;
}

:deep(.el-switch) {
	--el-switch-on-color: #409eff;
}

:deep(.el-switch.is-checked .el-switch__core) {
	border-color: #409eff;
	background-color: #409eff;
}

:deep(.el-input-number) {
	width: 50px;
}

:deep(.el-input-number .el-input-number__decrease),
:deep(.el-input-number .el-input-number__increase) {
	display: none;
	border: none;
	background: none;
}

:deep(.el-input-number:hover .el-input-number__decrease),
:deep(.el-input-number:hover .el-input-number__increase) {
	display: flex;
}

:deep(.el-input-number:hover .el-input__wrapper) {
	box-shadow: 0 0 0 1px #409EFF !important;
}

:deep(.el-input-number .el-input__wrapper) {
	padding: 0 4px;
}

:deep(.el-input-number .el-input__inner) {
	text-align: left;
	padding-left: 6px;
	color: #606266;
	transition: color 0.3s;
}

:deep(.el-input-number:hover .el-input__inner) {
	color: #409EFF;
}

:deep(.el-input) {
	width: 90px;
}

:deep(.el-input__wrapper) {
	box-shadow: none !important;
	transition: box-shadow 0.3s;
}

:deep(.el-input__wrapper:hover) {
	box-shadow: 0 0 0 1px #409EFF !important;
}

:deep(.el-input__wrapper:focus-within) {
	box-shadow: 0 0 0 1px #409EFF !important;
}

/* 默认文本框样式 */
:deep(.el-input .el-input__inner) {
	color: #606266;
	transition: color 0.3s;
}

:deep(.el-input:hover .el-input__inner) {
	color: #409EFF;
}

/* 数字输入框和默认文本框的通用样式 */
:deep(.el-input__wrapper),
:deep(.el-input-number .el-input__wrapper) {
	box-shadow: 0 0 0 1px #dcdfe6 !important;
	transition: all 0.3s;
}

/* 数字输入框样式 */
:deep(.el-input-number .el-input__inner) {
	text-align: left;
	padding-left: 6px;
	color: #606266;
	transition: color 0.3s;
}

:deep(.el-input-number:hover .el-input__inner) {
	color: #409EFF;
}

:deep(.el-input-number:hover .el-input__wrapper) {
	box-shadow: 0 0 0 1px #409EFF !important;
}

/* 默认文本框样式 */
:deep(.el-input .el-input__inner) {
	color: #606266;
	transition: color 0.3s;
}

:deep(.el-input:hover .el-input__inner) {
	color: #409EFF;
}

:deep(.el-input:hover .el-input__wrapper) {
	box-shadow: 0 0 0 1px #409EFF !important;
}

/* 控制按钮样式 */
:deep(.el-input-number .el-input-number__decrease),
:deep(.el-input-number .el-input-number__increase) {
	display: none;
	border: none;
	background: none;
}

:deep(.el-input-number:hover .el-input-number__decrease),
:deep(.el-input-number:hover .el-input-number__increase) {
	display: flex;
}
</style>