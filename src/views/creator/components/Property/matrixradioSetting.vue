<template>
	<div class="matrixradio-setting">
		<base-question-setting
			:element-id="element.id"
			v-model:advancedLogicText="choiceShowHideValue" 
			v-model:required="requiredValue" 
			v-model:showNumber="showNumberValue"
			:show-number-item="showNumberItem" 
			v-model:isAddSubDescription="isAddSubDescriptionValue"
			@setLogic="emit('setLogic', element)" 
		>
		</base-question-setting>
		<!-- 其他特定设置... -->
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'
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

const emit = defineEmits(['update:required', 'update:showNumber', 'setLogic'])

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

<style scoped lang="scss">
.setting-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 8px 0;

	.item-with-icon {
		display: flex;
		align-items: center;
		gap: 4px;

		span {
			color: #606266;
			font-size: 14px;
		}
	}
}
</style>