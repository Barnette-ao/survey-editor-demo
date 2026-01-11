import { toRaw } from 'vue'
import { getQuestionnaireById, updateQuestionnaire } from "@/api/questionnaire.js";
import {
	afterGetInitialSettings,
	beforeSaveToDatabase
} from "@/views/creator/config/helpers";

// 获取问卷 ID（从 URL 或使用默认值）
const urlParams = new URLSearchParams(window.location.search);
const qid = urlParams.get("id") || '1'; // 默认使用 ID 为 1 的问卷

// 默认的初始配置
const defaultSettings = {
	title: "新问卷",
	description: "请填写问卷描述",
	pages: [
		{
			name: "page1",
			elements: []
		}
	]
};

// 从 Mock API 或 localStorage 获取配置
const getInitialSettings = async () => {
	try {
		// 先尝试从 localStorage 获取
		const localData = localStorage.getItem(`questionnaire_${qid}`);
		if (localData) {
			console.log("从 localStorage 加载配置");
			return JSON.parse(localData);
		}

		// 如果 localStorage 没有，从 Mock API 获取
		const res = await getQuestionnaireById(qid);
		if (res.code === 200 && res.data) {
			console.log("从 Mock API 加载配置", res.data);
			return res.data;
		}
	} catch (error) {
		console.warn("加载配置失败，使用默认配置", error);
	}
	
	// 如果都失败，返回默认配置
	return defaultSettings;
}

export const loadSettingsFromDatabase = async () => {
	let settings = await getInitialSettings()
	return afterGetInitialSettings(settings)
}

// 更新配置的方法
export const updateDefaultSettings = (newSettings) => {
	const rawObject = toRaw(newSettings);
	const dataToSave = beforeSaveToDatabase(rawObject)
	
	// 保存到 localStorage
	localStorage.setItem(`baseQuestion`, JSON.stringify(dataToSave));
	console.log("updateDefaultSettings baseQuestion",JSON.parse(localStorage.getItem(`baseQuestion`)))
}


