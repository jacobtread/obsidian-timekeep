import { TIMEKEEP, TimeEntry, Timekeep } from "@/schema";
import { TimekeepSettings } from "@/settings";
import { isEmptyString } from "@/utils";
import { strHash } from "@/utils/text";
import moment from "moment";

/**
 * Replaces the contents of a specific timekeep codeblock within
 * a file returning the modified contents to be saved
 */
export function replaceTimekeepCodeblock(
	timekeep: Timekeep,
	content: string,
	lineStart: number,
	lineEnd: number
): string {
	const timekeepJSON = JSON.stringify(timekeep);

	// The actual JSON is the line after the code block start
	const contentStart = lineStart + 1;
	const contentLength = lineEnd - contentStart;

	// Split the content into lines
	const lines = content.split("\n");

	// Sanity checks to prevent overriding content
	if (!lines[lineStart].startsWith("```")) {
		throw new Error(
			"Content timekeep out of sync, line number for codeblock start doesn't match: " +
				content[lineStart]
		);
	}

	if (!lines[lineEnd].startsWith("```")) {
		throw new Error(
			"Content timekeep out of sync, line number for codeblock end doesn't match" +
				content[lineEnd]
		);
	}

	// Splice the new JSON content in between the codeblock, removing the old codeblock lines
	lines.splice(contentStart, contentLength, timekeepJSON);

	return lines.join("\n");
}

export type LoadResult = LoadSuccess | LoadError;

export type LoadSuccess = { success: true; timekeep: Timekeep };
export type LoadError = { success: false; error: string };

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
		return {
			success: false,
			error: "Failed to parse timekeep JSON",
		};
	}

	// Parse the data against the schema
	const timekeepResult = TIMEKEEP.safeParse(parsedValue);
	if (!timekeepResult.success) {
		return {
			success: false,
			error: timekeepResult.error.toString(),
		};
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
export function createEntry(name: string, startTime: moment.Moment): TimeEntry {
	return {
		name,
		startTime,
		endTime: null,
		subEntries: null,
	};
}

/**
 * Recursively updates a collection of entries, finding a possibly deeply nested
 * old entry by reference replacing it with a new entry
 *
 * @param entries The entries to make the update within
 * @param previousEntry The old entry to update
 * @param newEntry The new entry to take its place
 * @returns The collection with the updated entry
 */
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
	if (entries.includes(target)) {
		return entries.filter((entry) => entry !== target);
	}

	return entries.map((entry) =>
		entry.subEntries !== null ? removeSubEntry(entry, target) : entry
	);
}

/**
 * Stops any entries in the provided list that are running
 * returning a list of the new non running entries
 *
 * @param entries
 */
export function stopRunningEntries(
	entries: TimeEntry[],
	endTime: moment.Moment
): TimeEntry[] {
	return entries.map((entry) => {
		if (entry.subEntries) {
			return {
				...entry,
				subEntries: stopRunningEntries(entry.subEntries, endTime),
			};
		}

		return {
			...entry,
			endTime: entry.endTime ?? endTime,
		};
	});
}

/**
 * Removes a sub entry from the provided parent, returning
 * the new parent entry
 *
 * Removes the `target` element from the children of the provided `parent`.
 *
 * If only one item remains after removing the item will be collapsed into
 * the parent. When collapsed the sub entry will inherit the name of the parent entry
 *
 *
 * @param parent The parent to remove from
 * @param target The entry to remove
 * @returns The new parent entry
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

	// Too many/little items to collapse
	if (filtered.length != 1) {
		return {
			...parent,
			subEntries: filtered,
		};
	}

	const item = filtered[0];

	if (item.subEntries === null) {
		return {
			...item,
			name: parent.name,
		};
	}

	return {
		name: parent.name,
		subEntries: item.subEntries,
		startTime: null,
		endTime: null,
	};
}

/**
 * Creates a new sub-entry within the provided `parent`. If the parent
 * is a group then a new sub-entry will be added, otherwise the entry
 * will be converted to a group and the parent will become a child of the
 * group.
 *
 * @param parent The parent entry
 * @param name The name of the new entry
 */
export function withSubEntry(
	parent: TimeEntry,
	name: string,
	startTime: moment.Moment
): TimeEntry {
	// Parent already has children, append to existing
	if (parent.subEntries !== null) {
		// Assign a name automatically if not provided
		if (isEmptyString(name)) {
			name = `Part ${parent.subEntries.length + 1}`;
		}

		return {
			...parent,
			subEntries: [...parent.subEntries, createEntry(name, startTime)],
		};
	}

	// Assign a name automatically if not provided
	if (isEmptyString(name)) {
		name = `Part 2`;
	}

	return {
		name: parent.name,
		// Move the parent into its first sub entry
		subEntries: [
			{ ...parent, name: "Part 1" },
			createEntry(name, startTime),
		],
		startTime: null,
		endTime: null,
	};
}

/**
 * Extends the provided list of entries with a new entry
 * of the provided name
 *
 * @param entries The collection of entries
 * @param name The name for the new entry
 * @param startTime The start time of the new entry
 */
export function withEntry(
	entries: TimeEntry[],
	name: string,
	startTime: moment.Moment
): TimeEntry[] {
	// Assign a name automatically if not provided
	if (isEmptyString(name)) {
		name = `Block ${entries.length + 1}`;
	}

	return [...entries, createEntry(name, startTime)];
}

/**
 * Determines whether any of the entries in the provided timekeep
 * are actively running
 *
 * @param timekeep The timekeep to check
 * @returns Whether the timekeep is running
 */
export function isKeepRunning(timekeep: Timekeep): boolean {
	return getRunningEntry(timekeep.entries) !== null;
}

/**
 * Checks whether the provided entry is still running. For groups
 * this will check all of the sub-entries for running
 *
 * @param entry The entry to check
 * @returns Whether the entry or any sub-entries are running
 */
export function isEntryRunning(entry: TimeEntry) {
	if (entry.subEntries !== null) {
		return getRunningEntry(entry.subEntries) !== null;
	}

	return entry.endTime === null;
}

/**
 * Searches recursively through the list of entires
 * searching for an entry that hasn't been stopped yet
 *
 * @param entries The entries to search
 * @return The running entry if found or null
 */
export function getRunningEntry(entries: TimeEntry[]): TimeEntry | null {
	for (const entry of entries) {
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
 * Gets the duration in milliseconds of the entry
 * and the entry children if it is a group
 *
 * @param entry The entry to get the duration from
 * @param currentTime The current time to use for unfinished entries
 * @returns The duration in milliseconds
 */
export function getEntryDuration(
	entry: TimeEntry,
	currentTime: moment.Moment
): number {
	if (entry.subEntries !== null) {
		return getTotalDuration(entry.subEntries, currentTime);
	}

	// Get the end time or use current time if not ended
	const endTime = entry.endTime ?? currentTime;
	return endTime.diff(entry.startTime);
}

/**
 * Gets the total duration of all the provided entries
 * in milliseconds
 *
 * @param entries The entries
 * @param currentTime The current time to use for unfinished entries
 * @returns The total duration in milliseconds
 */
export function getTotalDuration(
	entries: TimeEntry[],
	currentTime: moment.Moment
): number {
	return entries.reduce(
		(totalDuration, entry) =>
			totalDuration + getEntryDuration(entry, currentTime),
		0
	);
}

/**
 * Provides a new list of time entires re-ordered to match
 * the current timekeep settings ordering
 *
 * @param entries The collection of entries
 * @param settings The timekeep settings
 * @returns The entries in the timekeep order
 */
export function getEntriesOrdered(
	entries: TimeEntry[],
	settings: TimekeepSettings
): TimeEntry[] {
	// Reverse ordered entries
	if (settings.reverseSegmentOrder) {
		return entries.slice().reverse();
	}

	return entries;
}

/**
 * Creates a semi-unique hash for the provided `entry` used on
 * the React side as keys to reduce re-rendering for entries
 * that haven't changed
 *
 * @param entry The entry to hash
 * @returns The hash value
 */
export function getUniqueEntryHash(entry: TimeEntry): number {
	if (entry.subEntries === null) {
		return strHash(
			`${entry.name}${entry.startTime.valueOf()}${entry.endTime?.valueOf()}`
		);
	}

	const subEntriesHash = entry.subEntries.reduce(
		(acc, subEntry) => acc + getUniqueEntryHash(subEntry),
		0
	);

	return strHash(`${entry.name}${subEntriesHash}`);
}
