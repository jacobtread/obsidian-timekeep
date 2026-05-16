import moment, { Moment } from "moment";
import { v4 as uuid } from "uuid";
import * as v from "valibot";

/*
 * This file contains the strict schema for parsing timekeep data
 * it also contains the types for each timekeep structure.
 */

type RawTimeEntrySingle = v.InferOutput<typeof TIME_ENTRY_SINGLE>;
type RawTimeEntryGroupBase = v.InferOutput<typeof TIME_ENTRY_GROUP_BASE>;

// Type aliases from inferred zod types
export type TimeEntrySingle = RawTimeEntrySingle;
export type TimeEntryGroup = RawTimeEntryGroupBase & {
	id: string;
	subEntries: TimeEntry[];
};
export type TimeEntry = TimeEntrySingle | TimeEntryGroup;

export type Timekeep = v.InferOutput<typeof TIMEKEEP>;

const strToMoment = (value: string | null): Moment | null =>
	value === null ? null : moment(value);

// Schema for a time entry with no children
const TIME_ENTRY_SINGLE = v.pipe(
	v.object({
		// Name of the entry
		name: v.string(),

		// Start time for this entry
		startTime: v.pipe(v.nullable(v.string()), v.transform(strToMoment)),

		// End time for this entry, null when this entry is not finished
		endTime: v.pipe(v.nullable(v.string()), v.transform(strToMoment)),

		// Single entries have no children
		subEntries: v.null(),
	}),
	// At runtime a unique ID is inserted
	v.transform((entry) => ({
		...entry,
		id: uuid(),
	}))
);

// Schema for a time entry with children (Base portion, separate portion is required for recursion)
const TIME_ENTRY_GROUP_BASE = v.object({
	name: v.string(),
	startTime: v.null(),
	endTime: v.null(),
	// Optional field to indicate the entry is collapsed
	collapsed: v.optional(v.boolean()),
	// Optional field to indicate the entry should stay as a group when non-started and should only create
	// sub entries when starting
	folder: v.optional(v.boolean()),
});

const TIME_ENTRY_GROUP = v.pipe(
	v.object({
		...TIME_ENTRY_GROUP_BASE.entries,
		subEntries: v.lazy(() => TIME_ENTRY_ARRAY),
	}),
	// At runtime a unique ID is inserted
	v.transform((entry) => ({
		...entry,
		id: uuid(),
	}))
);

// Schema for time entries
const TIME_ENTRY: v.GenericSchema<TimeEntry> = v.union([
	TIME_ENTRY_SINGLE,
	TIME_ENTRY_GROUP,
	// Forcefully cast to the type as the type inference is unable to
	// properly type this recursive structure
]) as unknown as v.GenericSchema<TimeEntry>;

const TIME_ENTRY_ARRAY = v.array(TIME_ENTRY);

// Schema for an entire timekeep
export const TIMEKEEP = v.object({
	entries: TIME_ENTRY_ARRAY,
});

export function defaultTimekeep(): Timekeep {
	return { entries: [] };
}

export function stripTimekeepRuntimeData(timekeep: Timekeep): unknown {
	return {
		...timekeep,
		entries: stripEntriesRuntimeData(timekeep.entries),
	};
}

export function stripEntriesRuntimeData(entries: TimeEntry[]): unknown[] {
	return entries.map(stripEntryRuntimeData);
}

export function stripEntryRuntimeData(entry: TimeEntry): unknown {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars -- we are intentionally discarding the id
	const { id, ...entryWithoutId } = entry;

	if (entryWithoutId.subEntries !== null) {
		return {
			...entryWithoutId,
			subEntries: entryWithoutId.subEntries.map(stripEntryRuntimeData),
		};
	}

	return entryWithoutId;
}
