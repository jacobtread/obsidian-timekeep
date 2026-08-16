import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

const currentTime = moment();

export const input: TimeEntry[] = [
	{
		id: 1,
		name: "Part 1",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
	{
		id: 2,
		name: "Part 2",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
];

export const expected: TimeEntry[] = [
	{
		id: 1,
		name: "Part 1",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
	{
		id: 2,
		name: "Part 2",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
];
