<template>
	<base-question :element="element" 
		:show-question-number="false" 
		@click="$emit('click')"
		@copy="id => emit('copy', id)" 
		@delete="id => emit('delete', id)" 
		:isShowHeadAction = "isShowHeadAction"
		:isEditable="isEditable"
	>
		<template #options>
			<!-- 说明文字区域 -->
			<div class="instruction-content">
				<customEditor 
					:model-value="element.html"  
					width="600px"
					:editor-id="`instruction-${element.id}`" 
					@click="$emit('click')"
					@blur="changeHtmlPorp" 
				/>
			</div>
		</template>
	</base-question>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseQuestion from '@/components/Question/BaseQuestion.vue'
import customEditor from "@/views/creator/components/customEditor.vue";
import { useDraftActions } from "@/views/creator/composables/useDraftAction";

const emit = defineEmits(['click', 'copy', 'delete', 'update'])

const props = defineProps({
	element: {
		type: Object,
		default: () => { }
	},
	isShowHeadAction: {
		type: Boolean,
		default: true
	},
	isEditable: {
		type: Boolean,
		default: false
	}
})

const { applyElementPropChange } = useDraftActions()
const changeHtmlPorp = (value) => {
	applyElementPropChange({
		questionId:element.id,
		key: "html",
		value
	})
}
</script>

<style scoped>
/* 说明文字区域样式 */
.instruction-content {
	margin-left: 20px;
	width: 100%;
}
</style>