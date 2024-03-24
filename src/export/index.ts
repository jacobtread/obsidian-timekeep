import { formatDuration, formatTimestamp } from "@/utils";
import { TimeEntry } from "@/schema";
import { TimekeepSettings } from "@/settings";
import { getEntriesOrdered, getEntryDuration } from "@/timekeep";

export const TOTAL_COLUMNS = 4;

export type RawTableRow = [string, string, string, string];

export { createCSV } from "./csv";
export { createMarkdownTable } from "./markdown-table";

/**
 * Flattens the nested timekeeping structure into a flat
 * list containing the data for each entry
 *
 * @param entries The entries to flatten
 * @param settings The settings to use while flattening
 * @returns The flattened rows
 */
export function createRawTable(
	entries: TimeEntry[],
	settings: TimekeepSettings
): RawTableRow[] {
	const rows: RawTableRow[] = [];

	for (let i = 0; i < entries.length; i++) {
		const entry = entries[i];
		rows.push(...createRawTableEntries(entry, settings));
	}

	return rows;
}

/**
 * Flattens the provided entry into a collection of table
 * rows containing the timekeeping data
 *
 * @param entry The entry to flatten
 * @param settings The settings to use while flattening
 * @returns The flattened rows
 */
export function createRawTableEntries(
	entry: TimeEntry,
	settings: TimekeepSettings
): RawTableRow[] {
	const rows: RawTableRow[] = [
		[
			entry.name,
			// Entry start and end times if available
			entry.startTime ? formatTimestamp(entry.startTime, settings) : "",
			entry.endTime ? formatTimestamp(entry.endTime, settings) : "",
			// Include duration for entries that are finished
			entry.endTime !== null || entry.subEntries !== null
				? formatDuration(getEntryDuration(entry))
				: "",
		],
	];

	if (entry.subEntries) {
		const entries = getEntriesOrdered(entry.subEntries, settings);
		for (let i = 0; i < entries.length; i++) {
			const entry = entries[i];
			rows.push(...createRawTableEntries(entry, settings));
		}
	}

	return rows;
}
