/**
 * Simple hashing function for creating a number hash
 * for a string
 *
 * @param str The string to hash
 * @returns The hash result
 */
export function strHash(str: string): number {
	let hash = 0;
	if (str.length === 0) return hash;

	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash |= 0;
	}

	return hash;
}

/**
 * Checks if the provided string is empty
 *
 * @param value The string to check
 * @returns Whether the string is empty
 */
export function isEmptyString(value: string): boolean {
	return value.trim().length === 0;
}
