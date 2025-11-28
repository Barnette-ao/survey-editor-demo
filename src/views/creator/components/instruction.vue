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
				<customEditor v-model="element.html" :targetObject="element" targetKey="html" width="600px"
					:editor-id="`instruction-${element.id}`" @click="$emit('click')" />
			</div>
		</template>
	</base-question>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseQuestion from '@/components/Question/BaseQuestion.vue'
import customEditor from "@/views/creator/components/customEditor.vue";

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

</script>

<style scoped>
/* 说明文字区域样式 */
.instruction-content {
	margin-left: 20px;
	width: 100%;
}
</style>