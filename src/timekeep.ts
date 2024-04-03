import { TIMEKEEP, TimeEntry, TimeEntryGroup, Timekeep } from "@/schema";
import { TimekeepSettings } from "@/settings";
import { isEmptyString } from "@/utils";
import { strHash } from "@/utils/text";
import type { Moment } from "moment";

export type LoadResult = LoadSuccess | LoadError;

export type LoadSuccess = { success: true; timekeep: Timekeep };
export type LoadError = { success: false; error: string };

/**
 * Attempts to load a {@see Timekeep} from the provided
 * JSON string
 *
 * @param value The JSON string to load from
 * @return The load result
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

/**
 * Creates a new entry that has just started
 *
 * @param name The name for the entry
 * @param startTime The start time for the entry
 * @returns The created entry
 */
export function createEntry(name: string, startTime: Moment): TimeEntry {
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
 * Stops any entries in the provided list that are running
 * returning a list of the new non running entries
 *
 * @param entries The entries to stop
 * @returns The new list of stopped entries
 */
export function stopRunningEntries(
	entries: TimeEntry[],
	endTime: Moment
): TimeEntry[] {
	return entries.map((entry) => {
		// Stop the sub entries
		if (entry.subEntries) {
			return {
				...entry,
				subEntries: stopRunningEntries(entry.subEntries, endTime),
			};
		}

		// Ignore already stopped entries
		if (entry.endTime !== null) return entry;

		// Stop the current entry
		return {
			...entry,
			endTime,
		};
	});
}

/**
 * Recursively removes the `target` entry from the provided
 * list of entries.
 *
 * Collapses entries after removing elements from the list
 *
 * @param entries The entries to remove from
 * @param target The target entry to remove
 * @returns The new list with the entry removed
 */
export function removeEntry(
	entries: TimeEntry[],
	target: TimeEntry
): TimeEntry[] {
	return entries.reduce((acc: TimeEntry[], entry: TimeEntry) => {
		if (entry !== target) {
			// Filter sub entries for matching entries
			const updatedEntry = removeSubEntry(entry, target);
			// Collapse any entries that need to be
			const collapsedEntry = collapseEntry(updatedEntry);

			// Add non-empty entries to the accumulator
			if (
				collapsedEntry.subEntries === null ||
				collapsedEntry.subEntries.length > 0
			) {
				acc.push(collapsedEntry);
			}
		}

		return acc;
	}, []);
}

/**
 * Removes the provided `target` from the entry and its
 * children if present
 *
 * @param entry The entry to remove from
 * @param target The target to remove
 * @returns The map function
 */
function removeSubEntry(entry: TimeEntry, target: TimeEntry): TimeEntry {
	// Ignore non groups
	if (entry.subEntries === null) return entry;

	// Remove the entry from the children
	const subEntries = removeEntry(entry.subEntries, target);

	return { ...entry, subEntries };
}

/**
 * Collapses the provided entry returning the collapsed entry
 *
 * Only collapses the entry if its a group, if the entry has only
 * one sub entry in it then the group becomes just a single entry
 * inheriting the timing from the one child entry
 *
 * @param target The entry to collapse
 * @returns The collapsed entry
 */
function collapseEntry(target: TimeEntry): TimeEntry {
	// Target has no entries to collapse
	if (target.subEntries === null) return target;

	// Don't collapse if more than 1 entry
	if (target.subEntries.length > 1) return target;

	const firstEntry = target.subEntries[0];

	return {
		...firstEntry,
		name: target.name,
	};
}

/**
 * Makes the provided `entry` into a group. If the entry
 * is already a group no change is made.
 *
 * If the entry is not a group, the entry will be converted to a
 * group, the start and end times from the entry will be moved into
 * the group as its first entry titled "Part 1".
 *
 * @param entry The entry to create a group from
 * @returns The group entry
 */
function makeGroupEntry(entry: TimeEntry): TimeEntryGroup {
	if (entry.subEntries !== null) return entry;

	return {
		name: entry.name,
		subEntries: [{ ...entry, name: "Part 1" }],
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
 * @returns The new collection of entries
 */
export function withEntry(
	entries: TimeEntry[],
	name: string,
	startTime: Moment
): TimeEntry[] {
	// Assign a name automatically if not provided
	if (isEmptyString(name)) {
		name = `Block ${entries.length + 1}`;
	}

	return [...entries, createEntry(name, startTime)];
}

/**
 * Creates a new sub entry within the provided `parent`. The parent
 * will be converted to a group if its not already one
 *
 * @param parent The parent entry
 * @param name The name for the new entry
 * @param startTime The start time for the new entry
 * @returns The updated/created entry
 */
export function withSubEntry(
	parent: TimeEntry,
	name: string,
	startTime: Moment
): TimeEntry {
	const groupEntry = makeGroupEntry(parent);

	// Assign a name automatically if not provided
	if (isEmptyString(name)) {
		name = `Part ${groupEntry.subEntries.length + 1}`;
	}

	const newEntry = createEntry(name, startTime);

	return {
		...groupEntry,
		subEntries: [...groupEntry.subEntries, newEntry],
	};
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
 * Searches through the nested list of time entries using
 * a "stack" depth-first search approach attempting to
 * find an entry that is running
 *
 * @param entries The entries to search
 * @return The running entry if found or null
 */
export function getRunningEntry(entries: TimeEntry[]): TimeEntry | null {
	const stack: TimeEntry[] = [...entries];

	while (stack.length > 0) {
		const entry: TimeEntry = stack.pop()!;

		if (entry.subEntries !== null) {
			stack.push(...entry.subEntries);
		} else if (entry.endTime === null) {
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
	currentTime: Moment
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
	currentTime: Moment
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
