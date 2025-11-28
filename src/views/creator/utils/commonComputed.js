import { computed } from 'vue'

export function useCommonComputed(props, emit) {
	const choiceShowHideValue = computed({
		get: () => props.element.choicesShowHide || "",
		set: (value) => emit('setting-update', 'choicesShowHide', value)
	})

	return {
		choiceShowHideValue
	}
}

