<template>
	<svg v-bind="svgProps" 
		@mouseover = "() => isHover = true"
		@mouseleave = "() => isHover = false"
	>
		<path 
			:fill = "isHover ? hoverColor : color"
			d="M368 672a64 64 0 1 1 0 128 64 64 0 0 1 0-128z m288 0a64 64 0 1 1 0 128 64 64 0 0 1 0-128zM368 448a64 64 0 1 1 0 128 64 64 0 0 1 0-128z m288 0a64 64 0 1 1 0 128 64 64 0 0 1 0-128z m-288-224a64 64 0 1 1 0 128 64 64 0 0 1 0-128z m288 0a64 64 0 1 1 0 128 64 64 0 0 1 0-128z" p-id="3037" 
		/>
	</svg>
</template>

<script setup>
import { useIcon } from '@/views/creator/components/Icons/useIcon';
const props = defineProps({
  color: { type: String, default: "#000000" },
  hoverColor: { type: String, default: "#409eff" },
  size: { type: [Number, String], default: 24 },
});

const isHover = ref(false);
const { svgProps } = useIcon(props);
</script>

<style scoped lang="scss">
@import "@/assets/styles/svgIcon.scss";
</style>
