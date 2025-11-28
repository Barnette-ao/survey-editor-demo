<template>
	<div class="sign-setting">
		<base-question-setting 
			:element-id="element.id"
			v-model:required="requiredValue" 
			v-model:showNumber="showNumberValue"
			:show-number-item="showNumberItem" 
			v-model:isAddSubDescription="isAddSubDescriptionValue" 
			@setLogic="emit('setLogic', element)"
			v-model:advancedLogicText="choiceShowHideValue" 
		/>

		<!-- 签名设置 -->
		<div class="setting-section">
			<div class="section-title">签名设置</div>
			<div class="section-content">
				<div class="setting-item">
					<span>默认文本</span>
					<el-input v-model="placeholderValue" size="small" />
				</div>
				<div class="setting-item">
					<span>显示清除按钮</span>
					<el-switch v-model="allowClear" />
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
	},
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

const placeholderValue = computed({
	get: () => props.element.placeholder || '请在虚线内签名',
	set: (value) => emit('setting-update', 'placeholder', value)
})

const allowClear = computed({
	get: () => props.element.allowClear ?? true,
	set: (value) => emit('setting-update', 'allowClear', value)
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

:deep(.el-input) {
	width: 120px;
}
</style>