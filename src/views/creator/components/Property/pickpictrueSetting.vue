<template>
	<div class="pickpicture-setting">
		<base-question-setting
			:element-id="element.id" 
			v-model:required="requiredValue" 
			v-model:showNumber="showNumberValue"
			:show-number-item="showNumberItem" 
			v-model:isAddSubDescription="isAddSubDescriptionValue"
			v-model:advancedLogicText="choiceShowHideValue" 
			@setLogic="emit('setLogic', element)"
		>
		</base-question-setting>

		<!-- 选项设置 -->
		<div class="setting-section">
			<div class="section-title">选项设置</div>
			<div class="section-content">
				<div class="setting-item">
					<span>选项随机排列</span>
					<el-switch v-model="randomOrder" />
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from 'vue'
import BaseQuestionSetting from '@/components/Question/BaseQuestionSetting.vue'
import { useCommonComputed } from '@/views/creator/utils/commonComputed'

const props = defineProps({
	element: {
		type: Object,
		required: true
	},
	showNumber: {
		type: Boolean,
		default: true
	},
	showNumberItem: {
		type: Boolean,
		required: true
	}
})

const emit = defineEmits(['update:required', 'update:showNumber', 'setting-update', 'setLogic'])
const { choiceShowHideValue } = useCommonComputed(props, emit)

const requiredValue = computed({
	get: () => props.element.isRequired,
	set: (value) => emit('update:required', value)
})

const showNumberValue = computed({
	get: () => props.showNumber,
	set: (value) => emit('update:showNumber', value)
})

const randomOrder = computed({
	get: () => props.element.randomOrder,
	set: (value) => emit('setting-update', 'randomOrder', value)
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

		span {
			color: #606266;
			font-size: 14px;
		}
	}
}

:deep(.el-switch) {
	--el-switch-on-color: #409eff;
}

:deep(.el-switch.is-checked .el-switch__core) {
	border-color: #409eff;
	background-color: #409eff;
}
</style>