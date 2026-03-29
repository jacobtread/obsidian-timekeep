/**
 * Checks if the provided string value is made up of
 * only numbers
 *
 * @param value The value to check
 * @returns Whether the value is only numbers
 */
export function isNumberText(value: string): boolean {
	return /^\d+$/.test(value);
}
