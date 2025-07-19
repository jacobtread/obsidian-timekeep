import type { Moment } from "moment";
import { TimeEntry } from "@/timekeep/schema";

/**
 * Recursively updates a collection of entries, finding a possibly deeply nested
 * old entry by reference replacing it with a new entry
 *
 * @param entries The entries to make the update within
 * @param previousEntryId The ID of the old entry to update
 * @param newEntry The new entry to take its place
 * @returns The collection with the updated entry
 */
export function updateEntry(
	entries: TimeEntry[],
	previousEntryId: string,
	newEntry: TimeEntry
): TimeEntry[] {
	return entries.map((entry) => {
		if (entry.id === previousEntryId) {
			return newEntry;
		}

		if (entry.subEntries !== null) {
			return {
				...entry,
				subEntries: updateEntry(
					entry.subEntries,
					previousEntryId,
					newEntry
				),
			};
		}

		return entry;
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
	if (entry.subEntries === null) {
		return entry;
	}

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
		if (entry.startTime === null || entry.endTime !== null) {
			return entry;
		}

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
			const collapsedEntry = makeEntrySingle(updatedEntry);

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
	if (entry.subEntries === null) {
		return entry;
	}

	// Remove the entry from the children
	const subEntries = removeEntry(entry.subEntries, target);

	return { ...entry, subEntries };
}

/**
 * If the provided entry is a group with only one entry then
 * it turns that group entry into a single entry
 *
 * @param target The entry to collapse
 * @returns The collapsed entry
 */
function makeEntrySingle(target: TimeEntry): TimeEntry {
	// Target has no entries to collapse
	if (target.subEntries === null) {
		return target;
	}

	// Don't collapse if more than 1 entry
	if (target.subEntries.length > 1) {
		return target;
	}

	const firstEntry = target.subEntries[0];

	return {
		...firstEntry,
		id: target.id,
		name: target.name,
	};
}
