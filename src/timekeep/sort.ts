import { TimeEntry } from "@/timekeep/schema";
import { SortOrder, UnstartedOrder, TimekeepSettings } from "@/settings";

import { getStartTime } from "./queries";

type TimeEntryWithIndex = TimeEntry & { index: number };

type EntriesComparator = (
	a: TimeEntryWithIndex,
	b: TimeEntryWithIndex
) => number;

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
		return getEntriesSortedReverseInsertion(entries);
	}

	return getEntriesSortedComparator(
		entries,
		createEntriesComparator(
			settings.sortOrder === SortOrder.NEWEST_START,
			settings.unstartedOrder
		)
	);
}

/**
 * Create a sorted list of entries sorting by the
 * reverse of the insertion order
 *
 * @param entries The entries
 * @returns The sorted entries
 */
function getEntriesSortedReverseInsertion(entries: TimeEntry[]): TimeEntry[] {
	return entries
		.map((entry): TimeEntry => {
			if (entry.subEntries !== null) {
				return {
					...entry,
					subEntries: getEntriesSortedReverseInsertion(
						entry.subEntries
					),
				};
			}

			return entry;
		})
		.reverse();
}

/**
 * Recursively applies sorting against the provided entries
 * using the comparator
 *
 * @param entries The entries to sort
 * @param comparator The comparator to sort by
 * @returns The sorted entries
 */
function getEntriesSortedComparator(
	entries: TimeEntry[],
	comparator: EntriesComparator
): TimeEntry[] {
	return stripEntriesIndex(
		entries
			// Map entries to recursively sort the subEntries
			.map((entry, index): TimeEntryWithIndex => {
				if (entry.subEntries !== null) {
					return {
						...entry,
						subEntries: getEntriesSortedComparator(
							entry.subEntries,
							comparator
						),
						index,
					};
				}

				return { ...entry, index };
			})
			// Sort by comparator
			.sort(comparator)
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
): EntriesComparator {
	return (a: TimeEntryWithIndex, b: TimeEntryWithIndex): number => {
		// Get the start time for both
		const aStartTime = getStartTime(a, newest);
		const bStartTime = getStartTime(b, newest);

		// Sort newest when both have a start time
		if (aStartTime && bStartTime) {
			return newest
				? bStartTime.diff(aStartTime)
				: aStartTime.diff(bStartTime);
		}

		if (aStartTime) {
			return unstartedOrder === UnstartedOrder.FIRST ? 1 : -1;
		}

		if (bStartTime) {
			return unstartedOrder === UnstartedOrder.FIRST ? -1 : 1;
		}

		// Fallback to stable sort using the original index
		return a.index - b.index;
	};
}

/**
 * Strips the "index" property from items, this property
 * is only used for sorting and needs to be removed after
 *
 * @param entries The entries to strip the index from
 * @returns The entries without the index
 */
function stripEntriesIndex(entries: TimeEntryWithIndex[]) {
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
