import type { Moment } from "moment";
import { TimeEntry } from "@/timekeep/schema";

import { getEntryById } from "./queries";
import { updateEntry, stopRunningEntries } from "./update";
import { withEntry, createEntry, withSubEntry } from "./create";

/**
 * Start a new entry in the provided set of entires
 *
 * @param name Name of the new entry
 * @param currentTime The current time to use for the start time
 * @param entries Entries to append to
 * @returns Entries with the new entry added
 */
export function startNewEntry(
	name: string,
	currentTime: Moment,
	entries: TimeEntry[]
): TimeEntry[] {
	// Stop any already running entries
	entries = stopRunningEntries(entries, currentTime);

	// Add the new entry
	entries = withEntry(entries, name, currentTime);
	return entries;
}

/**
 * Start a new entry that is a sub-entry of the provided
 * target entry
 *
 * @param currentTime Current time to use as the start time for the new entry
 * @param targetEntryId Entry ID to start the sub-entry within
 * @param entries Set of entries to update
 * @returns The updated entries set
 */
export function startNewNestedEntry(
	currentTime: Moment,
	targetEntryId: string,
	entries: TimeEntry[]
): TimeEntry[] {
	// Stop any already running entries
	entries = stopRunningEntries(entries, currentTime);

	// Get the updated stopped entry
	const currentEntry = getEntryById(targetEntryId, entries);
	if (currentEntry === undefined) {
		return entries;
	}

	// If the entry has been started or is a group create a new child entry
	if (currentEntry.subEntries !== null || currentEntry.startTime !== null) {
		return updateEntry(
			entries,
			// Ensure the current entry is ended
			currentEntry.id,
			withSubEntry(currentEntry, "", currentTime)
		);
	}

	// If the entry hasn't been started then start it
	return updateEntry(
		entries,
		currentEntry.id,
		createEntry(currentEntry.name, currentTime)
	);
}
