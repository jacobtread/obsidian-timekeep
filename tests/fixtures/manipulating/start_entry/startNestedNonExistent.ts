import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();

export const targetEntryId = 2;

export const input: TimeEntry[] = [
	{
		id: 1,
		name: "Part 1",
		startTime: null,
		endTime: null,
		subEntries: null,
	},
];

export const expected: TimeEntry[] = [
	{
		id: 1,
		name: "Part 1",
		startTime: null,
		endTime: null,
		subEntries: null,
	},
];
