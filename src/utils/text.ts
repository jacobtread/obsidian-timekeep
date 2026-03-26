/**
 * Checks if the provided string is empty
 *
 * @param value The string to check
 * @returns Whether the string is empty
 */
export function isEmptyString(value: string): boolean {
	return value.trim().length === 0;
}
