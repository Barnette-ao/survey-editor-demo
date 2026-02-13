import { deletePage as handleDeletePageCore } from "@/views/creator/config/page";


// 能删除的page的索引大于等于1，第一页禁止删除，删除一页即将待删除页的所有题目
// 元素加入前一页中 (wrapper function)
export const deletePage = (questionSettings, page, index) => {
	const cloned = handleDeletePageCore(questionSettings.value, page, index)
	questionSettings.value = cloned
};










 