import { v4 as uuid } from "uuid";
import type { Moment } from "moment";
import { isEmptyString } from "@/utils";
import { TimeEntry, TimeEntryGroup } from "@/timekeep/schema";

/**
 * Creates a new entry that has just started
 *
 * @param name The name for the entry
 * @param startTime The start time for the entry
 * @returns The created entry
 */
export function createEntry(name: string, startTime: Moment): TimeEntry {
	return {
		id: uuid(),
		name,
		startTime,
		endTime: null,
		subEntries: null,
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
	const entryName = getEntryName(name, entries);
	return [...entries, createEntry(entryName, startTime)];
}

/**
 * Get the name for a new entry
 *
 * If the name is empty "Block {N}" will be used where {N} is the number
 * of entries + 1
 *
 * @param name User provided name
 * @param entires The list of entries
 * @returns The new entry name
 */
function getEntryName(name: string, entries: TimeEntry[]) {
	// Assign a name automatically if not provided
	if (isEmptyString(name)) {
		name = `Block ${entries.length + 1}`;
	}

	return name;
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
	const entryName = getSubEntryName(name, groupEntry);
	const newEntry = createEntry(entryName, startTime);

	return {
		...groupEntry,
		subEntries: [...groupEntry.subEntries, newEntry],
	};
}

/**
 * Get the name for a new sub entry
 *
 * If the name is empty "Part {N}" will be used where {N} is the number
 * of entries in the group + 1
 *
 * @param name The user provided name
 * @param groupEntry The outer group entry
 * @returns The new entry name
 */
function getSubEntryName(name: string, groupEntry: TimeEntryGroup) {
	// Assign a name automatically if not provided
	if (isEmptyString(name)) {
		return `Part ${groupEntry.subEntries.length + 1}`;
	}

	return name;
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
	if (entry.subEntries !== null) {
		return entry;
	}

	return {
		id: uuid(),
		name: entry.name,
		subEntries: [{ ...entry, name: "Part 1" }],
		startTime: null,
		endTime: null,
	};
}
