/**
 * ID store for timekeep entries
 */
export const timekeepId = createIdStore();

/**
 * ID store for entries within the timekeep merger modal
 */
export const timekeepMergerEntries = createIdStore();

/**
 * Store helper for tracking runtime IDs
 *
 * @returns
 */
export function createIdStore() {
	let nextId: number = 1;

	function next() {
		const value = nextId;
		nextId++;
		return value;
	}

	return {
		next,
	};
}
