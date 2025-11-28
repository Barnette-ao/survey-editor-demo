import { ref } from 'vue';

export function useIcon(props) {
	const svgProps = {
		width: props.size,
		height: props.size,
		class: 'icon-button',
		viewBox: '0 0 1024 1024',
		version: '1.1',
		xmlns: 'http://www.w3.org/2000/svg',
	};

	return {
		svgProps
	};
}