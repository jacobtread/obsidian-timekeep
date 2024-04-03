import { Timekeep } from "@/schema";
import { RawTableRow, createRawTable } from "@/export";
import { TimekeepSettings } from "@/settings";
import type { Moment } from "moment";

/**
 * Creates the CSV header row
 *
 * @returns The created row
 */
function createHeader(): RawTableRow {
	return ["Block", "Start Time", "End time", "Duration"];
}

/**
 * Generates a CSV from the timekeep data
 *
 * @param timekeep The timekeep data
 * @param settings The timekeep settings
 * @param currentTime The current time to use for unfinished entries
 * @returns The generated CSV
 */
export function createCSV(
	timekeep: Timekeep,
	settings: TimekeepSettings,
	currentTime: Moment
): string {
	const rawTable: RawTableRow[] = [
		// CSV header row
		createHeader(),
		// CSV raw table contents
		...createRawTable(timekeep.entries, settings, currentTime),
	];

	let output = "";

	for (const row of rawTable) {
		output += row.join(settings.csvDelimiter) + "\n";
	}

	return output;
}
