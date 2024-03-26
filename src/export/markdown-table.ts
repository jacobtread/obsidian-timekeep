import { TimeEntry, Timekeep } from "@/schema";
import { RawTableRow, TOTAL_COLUMNS, createRawTable } from "@/export";
import { formatDuration } from "@/utils";
import { getTotalDuration } from "@/timekeep";
import { TimekeepSettings } from "@/settings";

/**
 * Creates the table header row
 *
 * @returns The created row
 */
function createHeader(): RawTableRow {
	return ["Block", "Start Time", "End time", "Duration"];
}

/**
 * Creates the markdown table footer row containing
 * the total duration of all the entries
 *
 * @param entries The collection of entries
 * @returns The created row
 */
function createFooter(entries: TimeEntry[]): RawTableRow {
	const total: string = formatDuration(getTotalDuration(entries));
	return ["**Total**", "", "", `**${total}**`];
}

/**
 * Finds the max width of a column across the provided rows, used
 * to ensure the output generates correct width columns
 *
 * @param table The rows to measure the column width on
 * @param columnIndex The column index to measure
 * @returns The max width of the column
 */
function getColumnMaxWidth(table: RawTableRow[], columnIndex: number): number {
	let maxWidth = 0;

	for (const row of table) {
		const column: string = row[columnIndex];
		maxWidth = Math.max(column.length, maxWidth);
	}

	return maxWidth;
}

/**
 * Creates a flat markdown table from the provided timekeeping
 * data and settings
 *
 * @param timekeep The timekeep data
 * @param settings The timekeep settings
 * @returns The generated markdown table
 */
export function createMarkdownTable(
	timekeep: Timekeep,
	settings: TimekeepSettings
): string {
	const rawTable: RawTableRow[] = [
		// Markdown header row
		createHeader(),
		// Markdown raw table contents
		...createRawTable(timekeep.entries, settings),
		// Markdown footer row
		createFooter(timekeep.entries),
	];

	// Array of indexes for all the columns (0 - TOTAL_COLUMNS)
	const columnIndexes = Array.from(Array(TOTAL_COLUMNS).keys());

	// Widths of each column
	const columnWidths = columnIndexes.map((columnIndex) =>
		getColumnMaxWidth(rawTable, columnIndex)
	);

	let output = "";

	for (let rowIndex = 0; rowIndex < rawTable.length; rowIndex += 1) {
		// Add "-----" separator after the heading row
		if (rowIndex == 1) {
			output += "| ";

			// Add the " --- | " separators for each column
			output += columnIndexes
				.map((columnIndex) => "-".repeat(columnWidths[columnIndex]))
				.join(" | ");

			output += " |\n";
		}

		output += "| ";
		output += columnIndexes
			.map((columnIndex) =>
				rawTable[rowIndex][columnIndex]
					// Pad the row value to the column max width
					.padEnd(columnWidths[columnIndex])
			)
			.join(" | ");

		output += " |\n";
	}

	return output;
}
