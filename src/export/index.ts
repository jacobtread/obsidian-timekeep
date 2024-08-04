import { TimeEntry } from "@/schema";
import type { Moment } from "moment";
import { TimekeepSettings } from "@/settings";
import { formatDuration, formatDurationLong, formatTimestamp } from "@/utils";
import { getEntryDuration, getEntriesOrdered } from "@/timekeep";

export { createCSV } from "./csv";
export { createMarkdownTable } from "./markdown-table";

export type RawTableRow = [string, string, string, string];

export const TOTAL_COLUMNS = 4;

/**
 * Flattens the nested timekeeping structure into a flat
 * list containing the data for each entry
 *
 * @param entries The entries to flatten
 * @param settings The settings to use while flattening
 * @param currentTime The current time to use for unfinished entries
 * @returns The flattened rows
 */
export function createRawTable(
	entries: TimeEntry[],
	settings: TimekeepSettings,
	currentTime: Moment
): RawTableRow[] {
	return entries.flatMap((entry) =>
		createRawTableEntries(entry, settings, currentTime)
	);
}

/**
 * Flattens the provided entry into a collection of table
 * rows containing the timekeeping data
 *
 * @param entry The entry to flatten
 * @param settings The settings to use while flattening
 * @param currentTime The current time to use for unfinished entries
 * @returns The flattened rows
 */
export function createRawTableEntries(
	entry: TimeEntry,
	settings: TimekeepSettings,
	currentTime: Moment
): RawTableRow[] {
	const rows: RawTableRow[] = [
		[
			entry.name,
			// Entry start and end times if available
			entry.startTime ? formatTimestamp(entry.startTime, settings) : "",
			entry.endTime ? formatTimestamp(entry.endTime, settings) : "",
			// Include duration for entries that are finished
			(entry.startTime !== null && entry.endTime !== null) ||
			entry.subEntries !== null
				? formatDuration(
						settings.exportDurationFormat,
						getEntryDuration(entry, currentTime)
					)
				: "",
		],
	];

	if (entry.subEntries) {
		const entries = getEntriesOrdered(entry.subEntries, settings);

		for (const entry of entries) {
			rows.push(...createRawTableEntries(entry, settings, currentTime));
		}
	}

	return rows;
}
