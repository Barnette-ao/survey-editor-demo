import { defineAsyncComponent } from 'vue'

import radiogroup from "../components/radiogroup.vue"
import checkbox from "../components/checkbox.vue"
import dropdown from '../components/dropdown.vue'
import pickPicture from '../components/pickPicture.vue'
import matrixRadio from '../components/matrixRadio.vue'
import sigleText from '../components/sigleText.vue'
import multipleText from '../components/multipleText.vue'
import textgroup from '../components/textgroup.vue'
import scale from '../components/scale.vue'
import score from '../components/score.vue'
import evaluate from '../components/evaluate.vue'
import ranking from '../components/ranking.vue'
import panel from '../components/panel.vue'
import sign from '../components/sign.vue'
import fileupload from '../components/fileupload.vue'
import instruction from '../components/instruction.vue'

const RadiogroupSetting = defineAsyncComponent(() => import('../components/Property/radiogroupSetting.vue'))
const CheckboxSetting = defineAsyncComponent(() => import('../components/Property/checkboxSetting.vue'))
const DropdownSetting = defineAsyncComponent(() => import('../components/Property/dropdownSetting.vue'))
const MatrixradioSetting = defineAsyncComponent(() => import('../components/Property/matrixradioSetting.vue'))
const InstructionSetting = defineAsyncComponent(() => import('../components/Property/instructionSetting.vue'))
const ScaleSetting = defineAsyncComponent(() => import('../components/Property/scaleSetting.vue'))
const ScoreSetting = defineAsyncComponent(() => import('../components/Property/scoreSetting.vue'))
const EvaluateSetting = defineAsyncComponent(() => import('../components/Property/evaluateSetting.vue'))
const RankingSetting = defineAsyncComponent(() => import('../components/Property/rankingSetting.vue'))
const FileuploadSetting = defineAsyncComponent(() => import('../components/Property/fileuploadSetting.vue'))
const SingletextSetting = defineAsyncComponent(() => import('../components/Property/singletextSetting.vue'))
const MultipletextSetting = defineAsyncComponent(() => import('../components/Property/multipletextSetting.vue'))
const TextgroupSetting = defineAsyncComponent(() => import('../components/Property/textgroupSetting.vue'))
const PanelSetting = defineAsyncComponent(() => import('../components/Property/panelSetting.vue'))
const SignSetting = defineAsyncComponent(() => import('../components/Property/signSetting.vue'))


// 组件映射
export const componentMap = {
	html: instruction,
	radiogroup,
	checkbox,
	dropdown,
	ratinglabel: scale,
	ratingstars: score,
	ratingsmileys: evaluate,
	ranking,
	file: fileupload,
	imagepicker: pickPicture,
	text: sigleText,
	comment: multipleText,
	multipletext: textgroup,
	matrix: matrixRadio,
	panel,
	signaturepad: sign
}

// 设置组件映射
export const settingComponentMap = {
	html: InstructionSetting,
	radiogroup: RadiogroupSetting,
	checkbox: CheckboxSetting,
	dropdown: DropdownSetting,
	ratinglabel: ScaleSetting,
	ratingstars: ScoreSetting,
	ratingsmileys: EvaluateSetting,
	ranking: RankingSetting,
	file: FileuploadSetting,
	text: SingletextSetting,
	comment: MultipletextSetting,
	multipletext: TextgroupSetting,
	matrix: MatrixradioSetting,
	panel: PanelSetting,
	signaturepad: SignSetting
}

export const questionTemplates = [
	{
		"type": 'html',
		"title": "标题",
		"html": "请输入说明文字",
	},
	{
		"type": "radiogroup",
		"title": "请选择一个选项",
		"description": "",
		"isRequired": true,
		"choices": [{
			"value": "选项1",
			"showText": false,
			"textType": "text",
			"required": true,
		}, {
			"value": "选项2",
			"showText": false,
			"textType": "text",
			"required": true,
		}, {
			"value": "选项3",
			"showText": false,
			"textType": "text",
			"required": true,
		}],
	},
	{
		"type": 'checkbox',
		"isRequired": true,
		"showSelectAllItem": false,
		"title": "请选择以下选项（多选）",
		"description": "",
		"choices": [{
			"value": "选项1",
			"showText": false,
			"textType": "text",
			"required": true,
		}, {
			"value": "选项2",
			"showText": false,
			"textType": "text",
			"required": true,
		}, {
			"value": "选项3",
			"showText": false,
			"textType": "text",
			"required": true,
		}],
		"itemComponent": "survey-checkbox-newitem",
		"selectAllText": "全选",
	},
	{
		"type": 'dropdown',
		"isRequired": true,
		"title": "请选择一个选项",
		"description": "",
		"choices": [
			"选项1",
			"选项2",
			"选项3",
		],
	},
	{
		"type": 'rating',
		"isRequired": true,
		"title": "请您对此项目进行评价",
		"description": "",
		"rateType": "label",
		"displayMode": "buttons",
	},
	{
		"type": 'rating',
		"title": "请您对我们的服务进行评价",
		"description": "",
		"isRequired": true,
		"rateType": "stars",
		"displayMode": "buttons"
	},
	{
		"type": 'rating',
		"title": "请您对我们的服务进行评价",
		"description": "",
		"isRequired": true,
		"rateType": "smileys",
		"displayMode": "buttons"
	},
	{
		"type": 'ranking',
		"title": "请给以下选项排序",
		"description": "",
		"isRequired": true,
		"choices": [
			"选项1",
			"选项2",
			"选项3"
		]
	},
	{
		"type": 'file',
		"title": "请上传文件",
		"description": "",
		"isRequired": true,
		"storeDataAsText": false,
		"waitForUpload": "true",
		"fileOrPhotoPlaceholder": "点击或拖拽文件到此处上传",
		"photoPlaceholder": "点击或拖拽文件到此处上传",
		"filePlaceholder": "点击或拖拽文件到此处上传"
	},
	{
		"type": 'imagepicker',
		"isRequired": true,
		"isRequired": true,
		"title": "请选择以下图片",
		"choices": [],
		"imageFit": "cover"
	},
	{
		"type": 'text',
		"isRequired": true,
		"title": "请填写本项内容",
		"description": '',
	},
	{
		"type": 'comment',
		"isRequired": true,
		"placeholder": '请输入',
		"title": '请填写本项内容',
		"description": '',
	},
	{
		"type": 'multipletext',
		"title": "请填写以下内容",
		"description": "",
		"isRequired": true,
		"items": [
			{
				"name": "填空1",
			},
			{
				"name": "填空2",
			}
		]
	},
	{
		"type": 'matrix',
		"title": "请选择以下选项",
		"description": "",
		"isRequired": true,
		"columns": [
			"选项1",
			"选项2",
		],
		"rows": [
			"矩阵行1",
			"矩阵行2"
		]

	},
	{
		"type": 'panel',
	},
	{
		"type": 'signaturepad',
		"title": "请在虚线内签名",
		"description": "",
		"isRequired": true,
		"placeholder": '请在虚线内签名',
		"placeholderReadOnly": "签名",
	}
]

export const ratingTypeMap = {
	"label": "ratinglabel",
	"stars": "ratingstars",
	"smileys": "ratingsmileys",
}