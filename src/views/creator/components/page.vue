<template>
	<div class="question-container page-item" :class="{ 'is-selected': selected }" @click="$emit('click')">
		<div class="left-section">
			<div class="page-info">
				页码: {{ currentPage }}/{{ totalPages }}
			</div>
			<div class="question-name">
				{{ questionList }}
			</div>
		</div>
		<div class="operation-buttons" v-show="currentPage !== 1">
			<el-tooltip content="长按拖拽页面" placement="top">
				<el-button class="icon-button drag-handle">
					<el-icon>
						<Rank />
					</el-icon>
				</el-button>
			</el-tooltip>
			<el-tooltip content="删除" placement="top">
				<el-button class="icon-button" @click="handleDelete">
					<el-icon>
						<Delete />
					</el-icon>
				</el-button>
			</el-tooltip>
		</div>
	</div>
</template>

<script setup>

const props = defineProps({
	currentPage: {
		type: Number,
		required: true
	},
	totalPages: {
		type: Number,
		required: true
	},
	questionList: {
		type: String,
		default: ''
	},
	selected: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['delete', 'click'])

const handleDelete = () => {
	emit('delete')
}
</script>

<style scoped lang="scss">
.question-container.page-item {
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px 20px;
	background-color: #fff;
	border: 1px solid transparent;
	border-radius: 4px;
	margin: 10px 0;
	transition: border-color 0.3s ease;

	.left-section {
		display: flex;
		align-items: center;
		margin-left: 10px;
		gap: 20px;

		.page-info {
			color: #606266;
			font-size: 16px;
		}

		.question-name {
			color: #303133;
			font-size: 14px;
			max-width: 300px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	.icon-button {
		padding: 8px;
		border: none;
	}

	:deep(.el-button--text) {
		color: #409EFF;
	}

	&.is-selected {
		border: 1px solid #409EFF;
	}

	&:hover {
		border: 1px solid #409EFF;
	}

	&.sortable-ghost {
		opacity: 0.5;
		background: #c8ebfb;
	}

	&.sortable-drag {
		opacity: 0.8;
	}

	.operation-buttons {
		margin-right: 10px;
	}
}
</style>