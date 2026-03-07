import { computed, type WritableComputedRef } from 'vue'

// Type definitions
interface QuestionElement {
	choicesShowHide?: string;
	[key: string]: unknown;
}

interface CommonComputedProps {
	element: QuestionElement;
}

type EmitFunction = (event: 'setting-update', key: string, value: string) => void;

interface CommonComputedReturn {
	choiceShowHideValue: WritableComputedRef<string>;
}

export function useCommonComputed(
	props: CommonComputedProps, 
	emit: EmitFunction
): CommonComputedReturn {
	const choiceShowHideValue = computed<string>({
		get: () => props.element.choicesShowHide || "",
		set: (value: string) => emit('setting-update', 'choicesShowHide', value)
	})

	return {
		choiceShowHideValue
	}
}
