<template>
	<div class="dragHandler">
		<div v-show="isVisible">
			<el-tooltip :content="tooltipContent" placement="top">
				<div class="drgBtn" @mousedown="handleMouseDown">
					<DragIcon :color="iconColor" :hoverColor="iconHoverColor" :size="iconSize" />
				</div>
			</el-tooltip>
		</div>
	</div>
</template>

<script setup>
import DragIcon from "@/views/creator/components/Icons/drag.vue";

const emit = defineEmits(['mousedown'])

const props = defineProps({
  tooltipContent: {
    type: String,
    default: '长按拖拽选项'
  },
  iconColor: {
    type: String,
    default: '#555'
  },
  iconHoverColor: {
    type: String,
    default: '#007BFF'
  },
  iconSize: {
    type: [String, Number],
    default: 20
  },
  isVisible: {
    type: Boolean,
    default: true
  }
})

const handleMouseDown = (event) => {
  emit('mousedown', event)
}
</script>

<style scoped lang="scss">
.drgBtn {
  cursor: move;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    opacity: 0.8;
  }
}

</style>