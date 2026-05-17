import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();

export const targetEntry: TimeEntry = {
	id: 1,
	name: "Part 1",
	startTime: null,
	endTime: null,
	subEntries: null,
};

export const input: TimeEntry[] = [targetEntry];

export const expected: TimeEntry[] = [
	{
		id: 1,
		name: "Part 1",
		startTime: currentTime,
		endTime: null,
		subEntries: null,
	},
];
