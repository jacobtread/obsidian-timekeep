export function debounced<T extends unknown[], V>(
	cb: (...args: T) => V,
	timeout: number
): (...args: T) => void {
	let timer: number | null = null;

	return function (...args: T): void {
		if (timer) {
			window.clearTimeout(timer);
		}

		timer = window.setTimeout(() => {
			cb(...args);
		}, timeout);
	};
}
