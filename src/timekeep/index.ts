import { v4 as uuid } from "uuid";
import type { Moment } from "moment";
import { strHash } from "@/utils/text";
import { isEmptyString } from "@/utils";
import { Timekeep, TimeEntry, TimeEntryGroup } from "@/timekeep/schema";
import { SortOrder, UnstartedOrder, TimekeepSettings } from "@/settings";

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
		if (entry.id === previousEntry.id) {
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
 * Updates the collapsed field on a group entry. Normal entries
 * wont be collapsed since they cannot be
 *
 * @param entry The entry to set the collapse state for
 * @param collapsed The collapse state
 * @returns The new updated entry
 */
export function setEntryCollapsed(
	entry: TimeEntry,
	collapsed: boolean
): TimeEntry {
	// Entry cannot be collapsed
	if (entry.subEntries === null) return entry;

	const newEntry: TimeEntry = { ...entry, collapsed };

	// Delete the collapsed field if not collapsed
	if (!collapsed) {
		delete newEntry.collapsed;
	}

	return newEntry;
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

		// Ignore already stopped entries and entries that aren't started
		if (entry.startTime === null || entry.endTime !== null) return entry;

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
		if (entry.id !== target.id) {
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
export function removeSubEntry(entry: TimeEntry, target: TimeEntry): TimeEntry {
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
		id: target.id,
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
		id: uuid(),
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

	return entry.startTime !== null && entry.endTime === null;
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
		} else if (entry.startTime !== null && entry.endTime === null) {
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

	// Entry is not started
	if (entry.startTime === null) {
		return 0;
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
 * Provides a sorted copy of the provided entries list.
 *
 * Recursively sorts the groups and sorts groups based
 * on the time entries within the group
 *
 * @param entries The list of entries
 * @param settings The timekeep settings for which order to use
 * @returns The sorted entries list
 */
export function getEntriesSorted(
	entries: TimeEntry[],
	settings: TimekeepSettings
): TimeEntry[] {
	// List order should be unchanged
	if (settings.sortOrder === SortOrder.INSERTION) {
		return entries;
	}

	// Reverse insertion is just .reverse on all the arrays
	if (settings.sortOrder === SortOrder.REVERSE_INSERTION) {
		return entries
			.map((entry): TimeEntry => {
				if (entry.subEntries !== null) {
					return {
						...entry,
						subEntries: getEntriesSorted(
							entry.subEntries,
							settings
						),
					};
				}

				return entry;
			})
			.reverse();
	}

	return stripEntriesIndex(
		entries
			// Map entries to recursively sort the subEntries
			.map((entry, index): TimeEntry & { index: number } => {
				if (entry.subEntries !== null) {
					return {
						...entry,
						subEntries: getEntriesSorted(
							entry.subEntries,
							settings
						),
						index,
					};
				}

				return { ...entry, index };
			})
			// Sort by comparator
			.sort(
				createEntriesComparator(
					settings.sortOrder === SortOrder.NEWEST_START,
					settings.unstartedOrder
				)
			)
	);
}

/**
 * Strips the "index" property from items, this property
 * is only used for sorting and needs to be removed after
 *
 * @param entries The entries to strip the index from
 * @returns The entries without the inmdex
 */
function stripEntriesIndex(
	entries: (TimeEntry & {
		index: number;
	})[]
) {
	return (
		entries
			// Map entries to recursively sort the subEntries
			.map(({ index: _, ...entry }): TimeEntry => {
				if (entry.subEntries !== null) {
					return {
						...entry,
						subEntries: stripEntriesIndex(
							entry.subEntries as (TimeEntry & {
								index: number;
							})[]
						),
					};
				}

				return entry;
			})
	);
}

/**
 * Creates a comparator function for stable sorting a list
 * of entries
 *
 * Entries are sorted in newest/oldest order based on the value
 * provided
 *
 * Any entries without a start time are sorted based on their
 * original order
 *
 * @param newest Whether to sort based on newest or oldest entries
 * @returns The comparator function
 */
function createEntriesComparator(
	newest: boolean,
	unstartedOrder: UnstartedOrder
) {
	return (
		a: TimeEntry & { index: number },
		b: TimeEntry & { index: number }
	): number => {
		// Get the start time for both
		const aStartTime = getStartTime(a, newest);
		const bStartTime = getStartTime(b, newest);

		// Sort newest when both have a start time
		if (aStartTime && bStartTime) {
			return newest
				? bStartTime.diff(aStartTime)
				: aStartTime.diff(bStartTime);
		}

		if (aStartTime) return unstartedOrder === UnstartedOrder.FIRST ? 1 : -1;
		if (bStartTime) return unstartedOrder === UnstartedOrder.FIRST ? -1 : 1;

		// Fallback to stable sort using the original index
		return a.index - b.index;
	};
}

/**
 * Gets either the newest or oldest start time from a entry
 *
 * @param entry The entry to get the start time from
 * @param newest Whether to get the newest or oldest
 * @returns The start time or null if none were available
 */
function getStartTime(entry: TimeEntry, newest: boolean): Moment | null {
	// Find the latest start time from entry
	if (entry.subEntries !== null) {
		return entry.subEntries.reduce(
			(previousValue, currentValue) => {
				if (previousValue === null) {
					return currentValue.startTime;
				}

				// Use the current value if its newer
				if (currentValue.startTime !== null) {
					const timeDiff = newest
						? previousValue.diff(currentValue.startTime)
						: currentValue.startTime.diff(previousValue);

					if (timeDiff > 0) {
						return currentValue.startTime;
					}
				}

				return previousValue;
			},
			null as Moment | null
		);
	}

	return entry.startTime;
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
			`${entry.name}${entry.startTime?.valueOf()}${entry.endTime?.valueOf()}`
		);
	}

	const subEntriesHash = entry.subEntries.reduce(
		(acc, subEntry) => acc + getUniqueEntryHash(subEntry),
		0
	);

	return strHash(`${entry.name}${subEntriesHash}`);
}
