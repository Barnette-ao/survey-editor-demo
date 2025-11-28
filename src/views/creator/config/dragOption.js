import Sortable from "sortablejs";

// 存储选项拖拽的 Sortable 实例
const optionSortableInstances = {};

export const initOptionsSortable = (containerClass, element, updateCallback) => {
	// 先销毁之前的实例
	destroyOptionSortable(containerClass, element.id);

	const optionsContainer = document.querySelector(`.${containerClass}-${element.id}`);
	if (!optionsContainer) return;

	const instance = Sortable.create(optionsContainer, {
		animation: 150,
		handle: ".drgBtn",
		ghostClass: "sortable-ghost",
		dragClass: "sortable-drag",
		onEnd: ({ oldIndex, newIndex }) => {
			// 文本框组对应的element中没有choices属性，有items属性
			const sourceArray = element.type === "multipletext"
				? element.items
				: element.choices;

			// 创建响应式数组的浅拷贝（保持Proxy特性）
			const newChoices = [...sourceArray];
			// 移动的元素不能用深拷贝，只能用浅拷贝，只有这样才能保持响应式
			const [movedItem] = newChoices.splice(oldIndex, 1);
			newChoices.splice(newIndex, 0, movedItem);
			updateCallback(newChoices);

			// 在下一个事件循环中重新初始化
			setTimeout(() => {
				initOptionsSortable(containerClass, element, updateCallback);
			}, 0);
		}
	});

	// 保存实例以便后续销毁
	optionSortableInstances[`${containerClass}-${element.id}`] = instance;
};

// 销毁特定的选项拖拽实例
const destroyOptionSortable = (containerClass, elementId) => {
	const key = `${containerClass}-${elementId}`;
	if (optionSortableInstances[key]) {
		optionSortableInstances[key].destroy();
		delete optionSortableInstances[key];
	}
};

// 添加一个清理所有实例的方法
export const destroyAllOptionSortables = () => {
	Object.values(optionSortableInstances).forEach(instance => {
		if (instance && typeof instance.destroy === 'function') {
			instance.destroy();
		}
	});
	Object.keys(optionSortableInstances).forEach(key => {
		delete optionSortableInstances[key];
	});
};