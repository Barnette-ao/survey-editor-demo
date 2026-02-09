import Sortable from "sortablejs";
import { formattedNumber } from "@/views/creator/config/adapter";
import { handleDeletePage } from "@/views/creator/config/page";
import { spliteOffOnePageIntoPages,addEmptyPageBeforePage } from "@/views/creator/config/page";


// 存储所有创建的 Sortable 实例
const sortableInstances = [];

// 初始化题目拖拽
export const initSortable = (questionSettings, instructionElementId, istarg) => {
	// 先销毁之前的实例
	destroySortableInstances();

	const pageContainers = document.querySelectorAll(".page-container");
	// console.log("pageContainers", pageContainers)
	pageContainers.forEach((container) => {
		const instance = Sortable.create(container, {
			animation: 150,
			handle: ".drag-handle",
			ghostClass: "sortable-ghost",
			dragClass: "sortable-drag",
			group: "questions", // 允许跨容器拖拽
			onMove: ({ related, willInsertAfter }) => {
				// 不允许任何元素被拖到第一个元素的位置
				if (related &&
					related.getAttribute('id') === instructionElementId &&
					!willInsertAfter) {
					return false;
				}

				return true;
			},
			// oldIndex: 选中元素（题目或页码），在原页面中的索引
			// newIndex: 拖拽落点在落点位置，在目标页面中的索引
			onEnd: ({ oldIndex, newIndex, from, to }) => {
				console.log("onEnd", oldIndex, newIndex)
				istarg.value = true;
				// fromPageIndex:拖拽元素,拖拽前，所属页面在页面数组中的索引
				// toPageIndex:拖拽元素，拖拽后，所属页面在页面数组中的索引
				const fromPageIndex = parseInt(from.dataset.pageIndex);
				const toPageIndex = parseInt(to.dataset.pageIndex);
				console.log("fromPageIndex", fromPageIndex)
				console.log("toPageIndex", toPageIndex)

				// 只有一页的情况下，不会插入页码元素，所以视图上索引为0的元素是第一页的
				// 第一个题目元素，不是页码元素。
				// 而且在多页的情况下，第一个页码组件是没有拖拽按钮的。能拖拽的页码组件，是第
				// 2，3，4，5...页。
				if (questionSettings.value.pages.length > 1 && oldIndex === 0) {
					dragPage(questionSettings, newIndex, fromPageIndex, toPageIndex)
				} else {
					// 拖拽的是题目元素组件
					// 问卷只有一页时，在div pageContainer视图上，索引为0的元素是第一个页面的
					// 第一个题目元素。在数据层面，该题目的索引为1，而不是0。简介元素的索引才是0。
					// 所以在只有一个页面的情况下，题目元素在数据层面的索引 = 页面上的索引 + 1。
					if (questionSettings.value.pages.length === 1 && fromPageIndex === 0) {
						oldIndex += 1
					}

					if (questionSettings.value.pages.length === 1 && toPageIndex === 0) {
						newIndex += 1
					}
					// 当toPageIndex !== 0,说明问卷中有页码组件，页码组件的位置在题目组件之前
					// oldIndex或者newIndex表示，选中元素或拖拽的落点（题目或页码），在原页面中的索引
					// 所以视图上，页码组件的索引是0，在数据层面，questionSettings.pages[pageIndex]
					// 中索引0的元素是该页面的第一个元素，该元素在视图上，索引为1，所以如果不是拖拽元素所
					// 属页面或者落点元素所属页面不是第一页，那么元素在数据层面的索引 = 页面上的索引 - 1。
					if (toPageIndex !== 0) {
						newIndex -= 1
					}

					if (fromPageIndex !== 0) {
						oldIndex -= 1
					}

					dragQuestionElement(questionSettings, fromPageIndex, toPageIndex, oldIndex, newIndex)
				}

				//重新为整个问卷的所有题目排序
				formattedNumber(questionSettings.value)

				const newPages = JSON.parse(JSON.stringify(questionSettings.value.pages));
				questionSettings.value.pages = [];
				nextTick(() => {
					istarg.value = false
					questionSettings.value.pages = newPages
				});
			}
		});
		// 保存实例以便后续销毁
		sortableInstances.push(instance);
	});
};

// 销毁所有 Sortable 实例
const destroySortableInstances = () => {
	sortableInstances.forEach(instance => {
		if (instance && typeof instance.destroy === 'function') {
			instance.destroy();
		}
	});
	sortableInstances.length = 0;
};



const dragPage = (questionSettings, newIndex, fromPageIndex, toPageIndex) => {
	// 拖拽的落点为题目元素组件
	if (newIndex !== 0) {
		dragPageToElement(questionSettings, newIndex, fromPageIndex, toPageIndex)
	}
	// 拖拽的落点为页码组件
	else {
		dragPageToPage(questionSettings, fromPageIndex, toPageIndex)
	}
}

const dragPageToElement = (questionSettings, newIndex, fromPageIndex, toPageIndex) => {
	// 计算改变拖拽页码块前一页的大小，因为之后的删除页码操作和插入新页码操作会改变数据结构，所以
	// 一定要在handleDeletePage执行之前计算
	const prePageIndex = fromPageIndex - 1;
	const prePageSize = questionSettings.value.pages[prePageIndex].elements.length
	// 将拖拽前的页码从整个问卷中删除
	// 将被拖拽页的所有元素全部插入上一页中。该数据操作对应删除页码组件的操作。
	handleDeletePage(
		questionSettings,
		questionSettings.value.pages[fromPageIndex],
		fromPageIndex
	)

	console.log("questionSettings.value.pages", questionSettings.value.pages)



	// 找到插入新页面的元素索引，并插入新页面
	// 然后在落点位置，插入新的页码组件。该数据操作对应选中一个题目元素，然后插入新的页码组件的操作。
	findIndexToAddNewPage(
		questionSettings,
		fromPageIndex,
		toPageIndex,
		newIndex,
		prePageSize
	)
}

const findIndexToAddNewPage = (questionSettings, fromPageIndex, toPageIndex, newIndex, prePageSize) => {
	// 向上拖拽，包括跨页拖拽页码组件和未跨页向上拖拽页码组件，都可以用下面的处理方法
	if (fromPageIndex > toPageIndex) {
		// 向上拖拽，落点是第一页，那么elementIndex = newIndex - 1,因为第一页的视图上多了一个页码组件
		// 在数据层面，第一页的elements数组的第一个元素是简介元素。所以现在newIndex代表落点页面的索引,
		// elementIndex表示新插入的页码组件的前一个题目元素在原页面的索引。
		// 所以在这种情况下，elementIndex = newIndex - 1
		// 如果落点不在第一页， 
		// 因为不是第一页的情况下，视图上题目索引 = 数据层面的题目元素的索引 + 1
		// newIndex数据层面的索引 = newIndex - 1，elementIndex = newIndex在数据层面的索引 - 1
		// 所以elementIndex = newIndex - 2	
		const elementIndex = toPageIndex === 0 ? newIndex - 1 : newIndex - 2
		spliteOffOnePageIntoPages(questionSettings, elementIndex, toPageIndex)
	}
	// 向下拖拽，包括未跨页向下拖拽页码组件和跨页面向下拖拽
	else {
		// 向下拖拽，如果落点和拖拽页块属于同一页，那么将该页所有的题目元素插入该页之前一页的末尾
		// 对于同一页的情况，只要记录位移的距离，而newIndex等价于向前一页的末尾插入的元素个数，比如
		// newIndex=2，表示向前一页的末尾插入2个元素。那么选中元素的数据层面的索引elementIndex
		// 就是前面插入的最后一个元素的索引。prePageSize表示前一页的题目元素个数,newIndex表示插入
		// 前一页的元素个数所以prePageSize + newIndex表示插入前一页的元素个数。elementIndex
		// 就是前面插入的最后一个元素的索引 = prePageSize + newIndex - 1
		// 如果落点和拖拽页块不属于同一页,视图上题目索引 = 数据层面的题目元素的索引 + 1
		// newIndex数据层面的索引 = newIndex - 1，
		// elementIndex = newIndex在数据层面的索引 - 1
		// 所以elementIndex = newIndex - 2	
		const elementIndex = fromPageIndex == toPageIndex
			? newIndex - 1 + prePageSize
			: newIndex - 2
		spliteOffOnePageIntoPages(questionSettings, elementIndex, toPageIndex - 1)
	}

}

const dragPageToPage = (questionSettings, fromPageIndex, toPageIndex) => {
	handleDeletePage(
		questionSettings,
		questionSettings.value.pages[fromPageIndex],
		fromPageIndex
	);
	// 在落点页面之前插入一个空页面
	addEmptyPageBeforePage(questionSettings, toPageIndex - 1)
}


const dragQuestionElement = (questionSettings, fromPageIndex, toPageIndex, oldIndex, newIndex) => {
	// 直接操作原数组（避免浅拷贝问题）
	const element = questionSettings.value.pages[fromPageIndex].elements.splice(oldIndex, 1)[0];

	if (fromPageIndex === toPageIndex) {
		questionSettings.value.pages[fromPageIndex].elements.splice(newIndex, 0, element);
	} else {
		questionSettings.value.pages[toPageIndex].elements.splice(newIndex, 0, element);
	}
};