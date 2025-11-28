<template>
	<base-question :element="element" :show-question-number="showNumber" :logicRuleNum="logicRuleNum"
		@copy="id => emit('copy', id)" @delete="id => emit('delete', id)" @click="$emit('click')"
		@setLogic="element => emit('setLogic', element)">
		<template #options>
			<!-- 图片上传区域 -->
			<div class="options-container">
				<div class="picture-list">
					<div v-for="(item, index) in element.choices" :key="index" class="picture-item">
						<div class="picture-box" @mouseenter="activeIndex = index" @mouseleave="activeIndex = -1">
							<img :src="item.imageLink" class="preview-image" />
							<div class="picture-overlay" :class="{ active: activeIndex === index }">
								<div class="picture-actions">
									<el-tooltip content="更换" placement="top">
										<el-button class="action-btn" @click.stop="handleReplace(index)">
											<el-icon>
												<RefreshRight />
											</el-icon>
										</el-button>
									</el-tooltip>
									<el-tooltip content="删除" placement="top">
										<el-button class="action-btn" @click.stop="deletePicture(index)">
											<el-icon>
												<Delete />
											</el-icon>
										</el-button>
									</el-tooltip>
								</div>
							</div>
							<div class="pictrue-name">
								<el-input
									v-model="item.name"
									style="width: 100%"
									placeholder="请输入图片名称"
									clearable
								/>
							</div>

						</div>
					</div>

					<div class="upload-box" @click="triggerUpload">
						<input type="file" ref="fileInput" accept="image/*" multiple style="display: none" 
							@change="handleFileChange" />
						<el-icon class="upload-icon">
							<Plus />
						</el-icon>
						<div class="upload-text">按住 Ctrl 可选择多张</div>
						<div class="upload-text">单次上传</div>
						<div class="upload-text">最多10张图片</div>
					</div>
				</div>
			</div>

		</template>
	</base-question>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Connection, CopyDocument, Delete, Plus, RefreshRight } from '@element-plus/icons-vue'
import BaseQuestion from '@/components/Question/BaseQuestion.vue'
// import { UploadImages } from "@/api/common.js";

const emit = defineEmits(['click', 'copy', 'delete', 'update', 'setLogic'])


const props = defineProps({
	element: {
		type: Object,
		default: () => { }
	},
	showNumber: {
		type: Boolean,
		default: true
	},
	logicRuleNum: {
		type: Number,
		default: 0
	},
})

const fileInput = ref(null)
const activeIndex = ref(-1)

// 触发文件选择
const triggerUpload = () => {
	if (props.element.choices.length >= 10) {
		ElMessage.warning('最多只能上传10张图片')
		return
	}
	fileInput.value.click()
}

const updateChoice = (newValue) => {
	emit('update', 'choices', newValue)
}

// 处理文件选择
const handleFileChange = (event) => {
	const files = Array.from(event.target.files)
	if (!files.length) return

	// 检查是否超出限制
    if (props.element.choices.length + files.length > 10) {
        ElMessage.warning('选择的图片数量超出限制，最多只能上传10张图片')
        return
    }

	// 检查文件类型
	if (files.some(file => !file.type.startsWith('image/'))) {
		ElMessage.error('请选择图片文件')
		return
	}

	const formData = new FormData();
	files.forEach(file => {
        formData.append(file.name, file);
    });

	UploadImages(formData).then((resd) => {
		const { code, data, msg } = resd;
		if (code == 200) {
			data.forEach((imageLink, idx) => {
                props.element.choices.push({
                    imageLink,
                    value: `Image${props.element.choices.length + 1}`
                })
            })
			updateChoice(props.element.choices)
		} else {
			ElMessage.error(`上传失败，原因:${msg}!`);
		}
	});

	// 清空input以允许重复选择同一文件
	event.target.value = ''
}

// 删除图片
const deletePicture = (index) => {
	props.element.choices.splice(index, 1)

	updateChoice(props.element.choices)
}

// 处理图片替换
const handleReplace = (index) => {
	const input = document.createElement('input')
	input.type = 'file'
	input.accept = 'image/*'
	input.multiple = true // 允许选择多个文件
	input.onchange = (event) => {
		const files = Array.from(event.target.files)
		if (!files) return

		if (files.some(file => !file.type.startsWith('image/'))) {
			ElMessage.error('请选择图片文件')
			return
		}

		const formData = new FormData();
		files.forEach(file => {
            formData.append(file.name, file);
        });

		UploadImages(formData).then((resd) => {
			const { code, data, msg } = resd;
			if (code == 200) {
				// 替换当前图片并添加其他图片
				props.element.choices[index] = {
					imageLink: data[0],
					value: `Image${props.element.choices.length}`,
				}
				// 从第二张图片开始添加到列表末尾
                for (let i = 1; i < data.length; i++) {
                    props.element.choices.push({
                        imageLink: data[i],
                        value: `Image${props.element.choices.length + 1}`
                    })
                }
				updateChoice(props.element.choices)
			} else {
				ElMessage.error(`上传失败，原因:${msg}!`);
			}
		});
	}
	input.click()
}

</script>

<style scoped lang="scss">
/* 图片列表样式 */
.picture-list {
	margin-left: 40px;
	display: flex;
	flex-wrap: wrap;
	gap: 20px;
}

.picture-item {
	position: relative;
	width: 140px;
	height: 196px;
}

.picture-box {
	width: 100%;
	height: 100%;
	position: relative;
	border-radius: 4px;
	overflow: hidden;
}

.preview-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.picture-overlay {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	opacity: 0;
	transition: opacity 0.3s;
}

.picture-overlay.active {
	opacity: 1;
}

.picture-actions {
	position: absolute;
	top: 8px;
	right: 8px;
	display: flex;

}

.pictrue-name{
	position: absolute;
	top: 70%;
	right: 0px;
}

.action-btn {
	padding: 0px;
	height: 28px;
	width: 28px;
	color: #fff;
	background-color: rgba(0, 0, 0, 0.5);
	border: none;
	border-radius: 4px;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: all 0.3s;
}

.action-btn:hover {
	background-color: rgba(0, 0, 0, 0.7);
}

.action-btn :deep(.el-icon) {
	font-size: 16px;
}

/* 上传按钮样式 */
.upload-box {
	width: 140px;
	height: 196px;
	border: 1px dashed #dcdfe6;
	border-radius: 4px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	cursor: pointer;
	transition: all 0.3s;
}

.upload-box:hover {
	border-color: #409EFF;

	.upload-icon {
		color: #409EFF;
	}

	.upload-text {
		color: #409EFF;
	}
}

.upload-icon {
	font-size: 28px;
	color: #909399;
	margin-bottom: 8px;
}

.upload-text {
	color: #909399;
	font-size: 14px;
	line-height: 1.4;
}

/* 底部按钮样式 */
.bottom-actions {
	margin-top: 20px;
}

.action-buttons {
	display: flex;
	gap: 20px;
}

:deep(.el-button--text) {
	color: #409EFF;
}

/* 其他通用样式保持不变 */
</style>