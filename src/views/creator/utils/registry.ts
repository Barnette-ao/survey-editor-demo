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
	radiogroup: radiogroup,
	checkbox: checkbox,
	dropdown: dropdown,
	ratinglabel: scale,
	ratingstars: score,
	ratingsmileys: evaluate,
	ranking: ranking,
	file: fileupload,
	imagepicker: pickPicture,
	text: sigleText,
	comment: multipleText,
	multipletext: textgroup,
	matrix: matrixRadio,
	panel: panel,
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

export const ratingTypeMap = {
	"label": "ratinglabel",
	"stars": "ratingstars",
	"smileys": "ratingsmileys",
}