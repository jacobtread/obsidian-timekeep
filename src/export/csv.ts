import { Timekeep } from "src/schema";
import { RawTableRow, createRawTable } from ".";
import { TimekeepSettings } from "src/settings";

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
 * @returns The generated CSV
 */
export function createCSV(
	timekeep: Timekeep,
	settings: TimekeepSettings
): string {
	const rawTable: RawTableRow[] = [
		// CSV header row
		createHeader(),
		// CSV raw table contents
		...createRawTable(timekeep.entries, settings),
	];

	let output = "";

	for (let rowIndex = 0; rowIndex < rawTable.length; rowIndex += 1) {
		output += rawTable[rowIndex].join(settings.csvDelimiter) + "\n";
	}

	return output;
}
