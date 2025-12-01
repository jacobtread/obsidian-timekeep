import { TimeEntry, Timekeep } from "./schema";

/**
 * Recursively extracts all entry names from a single entry
 * including nested sub-entries
 *
 * @param entry The entry to extract names from
 * @returns Set of unique entry names
 */
function extractNamesFromEntry(entry: TimeEntry): Set<string> {
	const names = new Set<string>();

	// Add the current entry name
	names.add(entry.name);

	// Recursively extract names from sub-entries
	if (entry.subEntries !== null) {
		for (const subEntry of entry.subEntries) {
			const subNames = extractNamesFromEntry(subEntry);
			subNames.forEach((name) => names.add(name));
		}
	}

	return names;
}

/**
 * Extracts all unique entry names from a timekeep
 *
 * @param timekeep The timekeep to extract names from
 * @returns Set of unique entry names
 */
export function extractNamesFromTimekeep(timekeep: Timekeep): Set<string> {
	const names = new Set<string>();

	for (const entry of timekeep.entries) {
		const entryNames = extractNamesFromEntry(entry);
		entryNames.forEach((name) => names.add(name));
	}

	return names;
}
