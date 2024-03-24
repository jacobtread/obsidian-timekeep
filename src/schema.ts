import moment from "moment";
import { z } from "zod";

/*
 * This file contains the strict schema for parsing timekeep data
 * it also contains the types for each timekeep structure.
 */

type TimeEntryGroupBase = z.output<typeof TIME_ENTRY_GROUP_BASE>;

// Type aliases from inferred zod types
export type TimeEntrySingle = z.output<typeof TIME_ENTRY_SINGLE>;
export type TimeEntryGroup = TimeEntryGroupBase & { subEntries: TimeEntry[] };
export type TimeEntry = TimeEntrySingle | TimeEntryGroup;
export type Timekeep = z.output<typeof TIMEKEEP>;

// Schema for a time entry with no children
const TIME_ENTRY_SINGLE = z.object({
	// Name of the entry
	name: z.string(),
	// Start time for this entry
	startTime: z.string().transform((value) => moment(value)),
	// End time for this entry, null when this entry is not finished
	endTime: z
		.string()
		.nullable()
		.transform((value) => (value === null ? null : moment(value))),
	// Single entries have no children
	subEntries: z.null(),
});

// Schema for a time entry with children (Base portion, separate portion is required for recursion)
const TIME_ENTRY_GROUP_BASE = z.object({
	name: z.string(),
	startTime: z.null(),
	endTime: z.null(),
});

// Schema for a time entry group
const TIME_ENTRY_GROUP: z.ZodType<
	TimeEntryGroup,
	z.ZodTypeDef,
	TimeEntryGroupBase
> = TIME_ENTRY_GROUP_BASE.extend({
	subEntries: z.lazy(() =>
		z.array(z.union([TIME_ENTRY_SINGLE, TIME_ENTRY_GROUP]))
	),
});

// Schema for time entries
const TIME_ENTRY = z.union([TIME_ENTRY_SINGLE, TIME_ENTRY_GROUP]);

// Schema for an entire timekeep
export const TIMEKEEP = z.object({
	entries: z.array(TIME_ENTRY),
});
