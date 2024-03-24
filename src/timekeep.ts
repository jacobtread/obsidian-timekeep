import { formatDuration, formatTimestamp, isEmptyString } from "./utils";
import { App, MarkdownSectionInformation, TFile, moment } from "obsidian";
import { TimekeepSettings } from "./settings";
import { TIMEKEEP, TimeEntry, Timekeep } from "./schema";

export interface SaveDetails {
	app: App;
	fileName: string;
	getSectionInfo: () => MarkdownSectionInformation | null;
}

export function createMarkdownTable(
	keep: Timekeep,
	settings: TimekeepSettings
): string {
	const table = [["Block", "Start time", "End time", "Duration"]];
	for (const entry of getEntriesOrdered(keep.entries, settings))
		table.push(...createTableRows(entry, settings));
	table.push([
		"**Total**",
		"",
		"",
		`**${formatDuration(getTotalDuration(keep.entries))}**`,
	]);

	let output = "";
	// calculate the width every column needs to look neat when monospaced
	const widths = Array.from(Array(4).keys()).map((i) =>
		Math.max(...table.map((a) => a[i].length))
	);
	for (let rowIndex = 0; rowIndex < table.length; rowIndex++) {
		// add separators after first row
		if (rowIndex == 1) {
			output +=
				"| " +
				Array.from(Array(4).keys())
					.map((i) => "-".repeat(widths[i]))
					.join(" | ") +
				" |\n";
		}

		const row: string[] = [];
		for (let columnIndex = 0; columnIndex < 4; columnIndex++) {
			row.push(
				table[rowIndex][columnIndex].padEnd(widths[columnIndex], " ")
			);
		}
		output += "| " + row.join(" | ") + " |\n";
	}

	return output;
}

export function createCsv(keep: Timekeep, settings: TimekeepSettings): string {
	let output = "";
	if (settings.csvTitle) {
		output +=
			["Block", "Start time", "End time", "Duration"].join(
				settings.csvDelimiter
			) + "\n";
	}

	for (const entry of getEntriesOrdered(keep.entries, settings)) {
		for (const row of createTableRows(entry, settings)) {
			output += row.join(settings.csvDelimiter) + "\n";
		}
	}
	return output;
}

function createTableRows(
	entry: TimeEntry,
	settings: TimekeepSettings
): string[][] {
	const rows = [
		[
			entry.name,
			entry.startTime ? formatTimestamp(entry.startTime, settings) : "",
			entry.endTime ? formatTimestamp(entry.endTime, settings) : "",
			entry.endTime || entry.subEntries
				? formatDuration(getEntryDuration(entry))
				: "",
		],
	];
	if (entry.subEntries) {
		for (const subEntry of getEntriesOrdered(entry.subEntries, settings))
			rows.push(...createTableRows(subEntry, settings));
	}
	return rows;
}

export async function save(
	keep: Timekeep,
	saveDetails: SaveDetails
): Promise<void> {
	const section = saveDetails.getSectionInfo();
	if (section === null) return;
	const file = saveDetails.app.vault.getAbstractFileByPath(
		saveDetails.fileName
	) as TFile | null;

	if (file === null) return;
	let content = await saveDetails.app.vault.read(file);

	// figure out what part of the content we have to edit
	const lines: string[] = content.split("\n");
	const prev: string = lines
		.filter((_, i) => i <= section.lineStart)
		.join("\n");
	const next: string = lines
		.filter((_, i) => i >= section.lineEnd)
		.join("\n");
	// edit only the code block content, leave the rest untouched
	content = `${prev}\n${JSON.stringify(keep)}\n${next}`;

	await saveDetails.app.vault.modify(file, content);
}

type LoadResult =
	| { success: true; timekeep: Timekeep }
	| { success: false; error: string };

/**
 * Attempts to load a {@see Timekeep} from the provided
 * JSON string
 *
 * @param value The JSON string to load from
 */
export function load(value: string): LoadResult {
	// Empty string should create an empty timekeep
	if (isEmptyString(value)) {
		return { success: true, timekeep: { entries: [] } };
	}

	// Load the JSON value
	let parsedValue: unknown;
	try {
		parsedValue = JSON.parse(value);
	} catch (e) {
		console.error("Failed to parse timekeep JSON", e);
		return { success: false, error: "Failed to parse timekeep JSON" };
	}

	// Parse the data against the schema
	const timekeepResult = TIMEKEEP.safeParse(parsedValue);
	if (!timekeepResult.success) {
		return { success: false, error: timekeepResult.error.toString() };
	}

	const timekeep = timekeepResult.data;
	return { success: true, timekeep };
}

/**
 * Creates a new entry that has just started
 *
 * @param name The name for the entry
 * @returns The created entry
 */
export function createEntry(name: string): TimeEntry {
	const startTime = moment();
	return {
		name,
		startTime,
		endTime: null,
		subEntries: null,
	};
}

export function getUniqueEntryHash(entry: TimeEntry): number {
	if (entry.subEntries === null) {
		return strHash(
			`${entry.name}${entry.startTime.valueOf()}${entry.endTime?.valueOf()}`
		);
	} else {
		const subEntriesHash = entry.subEntries.reduce(
			(acc, subEntry) => acc + getUniqueEntryHash(subEntry),
			0
		);
		return strHash(`${entry.name}${subEntriesHash}`);
	}
}

function strHash(str: string): number {
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
 * Removes a time entry from the provided list returning
 * the new list
 *
 * @param entries
 * @param target
 */
export function removeEntry(
	entries: TimeEntry[],
	target: TimeEntry
): TimeEntry[] {
	if (entries.contains(target)) {
		return entries.filter((entry) => entry !== target);
	} else {
		return entries.map((entry) =>
			entry.subEntries !== null ? removeSubEntry(entry, target) : entry
		);
	}
}

/**
 * Stops any entries in the provided list that are running
 * returning a list of the new non running entries
 *
 * @param entries
 */
export function stopRunningEntries(entries: TimeEntry[]): TimeEntry[] {
	return entries.map((entry) => {
		if (entry.subEntries) {
			return {
				name: entry.name,
				startTime: null,
				endTime: null,
				subEntries: stopRunningEntries(entry.subEntries),
			};
		} else {
			return {
				name: entry.name,
				startTime: entry.startTime,
				endTime: entry.endTime ?? moment(),
				subEntries: null,
			};
		}
	});
}

export function updateEntry(
	entries: TimeEntry[],
	previousEntry: TimeEntry,
	newEntry: TimeEntry
): TimeEntry[] {
	return entries.map((entry) => {
		if (entry === previousEntry) {
			return newEntry;
		} else if (entry.subEntries !== null) {
			return {
				...entry,
				subEntries: updateEntry(
					entry.subEntries,
					previousEntry,
					newEntry
				),
			};
		} else {
			return entry;
		}
	});
}

/**
 * Removes a sub entry from the provided parent, returning
 * the new parent entry
 *
 * @param parent The parent to alter
 * @param target The removal target
 */
export function removeSubEntry(
	parent: TimeEntry,
	target: TimeEntry
): TimeEntry {
	// Parent has no children
	if (parent.subEntries === null) return parent;
	// Filter out the target value
	const filtered = parent.subEntries
		.filter((entry) => entry !== target)
		// Remove any matching sub entries recursively
		.map((entry) =>
			entry.subEntries !== null ? removeSubEntry(entry, target) : entry
		);

	if (filtered.length > 1) {
		return {
			name: parent.name,
			subEntries: filtered,
			startTime: null,
			endTime: null,
		};
	}

	const item = filtered[0];

	// We can only collapse if the item is not a group
	if (item.subEntries === null) {
		return {
			name: parent.name,
			subEntries: null,
			startTime: item.startTime,
			endTime: item.endTime,
		};
	} else {
		return {
			name: parent.name,
			subEntries: item.subEntries,
			startTime: null,
			endTime: null,
		};
	}
}

/**
 * Starts a new sub entry within the provided entry
 * using the provided name
 *
 * @param parent The parent entry
 * @param name The name of the new entry
 */
export function withSubEntry(parent: TimeEntry, name: string): TimeEntry {
	// Parent already has children, append to existing
	if (parent.subEntries !== null) {
		// Assign a name automatically if not provided
		if (isEmptyString(name)) {
			name = `Part ${parent.subEntries.length + 1}`;
		}

		return {
			name: parent.name,
			subEntries: [...parent.subEntries, createEntry(name)],
			startTime: null,
			endTime: null,
		};
	}

	// Assign a name automatically if not provided
	if (isEmptyString(name)) {
		name = `Part 2`;
	}

	return {
		name: parent.name,
		// Move the parent into its first sub entry
		subEntries: [{ ...parent, name: "Part 1" }, createEntry(name)],
		startTime: null,
		endTime: null,
	};
}

/**
 * Determines whether the provided timekeep is running
 *
 * @param timekeep The timekeep to check
 * @returns Whether the timekeep is running
 */
export function isKeepRunning(timekeep: Timekeep): boolean {
	return getRunningEntry(timekeep.entries) !== null;
}

/**
 * Checks whether the provided entry is still running
 *
 * @param entry
 * @returns
 */
export function isEntryRunning(entry: TimeEntry) {
	if (entry.subEntries !== null) {
		return getRunningEntry(entry.subEntries) !== null;
	} else {
		return entry.endTime === null;
	}
}

/**
 * Searches recursively through the list of entires
 * searching for an entry that hasn't been stopped yet
 *
 * @param entries The entries to search
 * @return The found entry or null
 */
export function getRunningEntry(entries: TimeEntry[]): TimeEntry | null {
	for (let i = 0; i < entries.length; i++) {
		const entry = entries[i];
		// Search sub entries if they are present
		if (entry.subEntries !== null) {
			const activeEntry = getRunningEntry(entry.subEntries);
			if (activeEntry !== null) {
				return activeEntry;
			}
		} else if (isEntryRunning(entry)) {
			return entry;
		}
	}

	return null;
}

/**
 *
 * @param entry
 * @returns
 */
export function getEntryDuration(entry: TimeEntry): number {
	if (entry.subEntries !== null) {
		return getTotalDuration(entry.subEntries);
	}

	// Get the end time or use current time if not ended
	const endTime = entry.endTime ?? moment();
	return endTime.diff(entry.startTime);
}

/**
 *
 * @param entries
 * @returns
 */
export function getTotalDuration(entries: TimeEntry[]): number {
	let duration = 0;
	for (let i = 0; i < entries.length; i++) {
		const entry = entries[i];
		duration += getEntryDuration(entry);
	}
	return duration;
}

export function getEntriesOrdered(
	entries: TimeEntry[],
	settings: TimekeepSettings
): TimeEntry[] {
	return settings.reverseSegmentOrder ? entries.slice().reverse() : entries;
}
