<template>
	<div class="evaluate-setting">
		<base-question-setting 
			:element-id="element.id"
			v-model:advancedLogicText="choiceShowHideValue" 
			v-model:required="requiredValue" 
			v-model:showNumber="showNumberValue"
			:show-number-item="showNumberItem" 
			v-model:isAddSubDescription="isAddSubDescriptionValue"
			@setLogic="emit('setLogic', element)" 
		/>
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
	},
})

const emit = defineEmits(['update:required', 'update:showNumber', 'setting-update','setLogic'])

const { choiceShowHideValue } = useCommonComputed(props, emit)

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

<style scoped>
@import '@/assets/styles/questionSetting.scss';

.section-content .setting-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 0;
}

.section-content .setting-item span {
	color: #606266;
	font-size: 14px;
}

.item-with-icon {
	display: flex;
	align-items: center;
	gap: 4px;
}

.setting-link {
	color: #409eff;
	cursor: pointer;
	font-size: 14px;
}

.setting-link:hover {
	color: #66b1ff;
}

:deep(.el-switch) {
	--el-switch-on-color: #409eff;
}

:deep(.el-switch.is-checked .el-switch__core) {
	border-color: #409eff;
	background-color: #409eff;
}
</style>