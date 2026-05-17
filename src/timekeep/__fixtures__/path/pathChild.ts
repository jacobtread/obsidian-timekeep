import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();

export const targetEntry: TimeEntry = {
	id: 2,
	name: "Part 1",
	startTime: currentTime,
	endTime: currentTime,
	subEntries: null,
};

export const entries: TimeEntry[] = [
	{
		id: 1,
		name: "Part 1",
		startTime: null,
		endTime: null,
		subEntries: [targetEntry],
	},
];
export const expected = [
	{ id: 1, name: "Part 1" },
	{ id: 2, name: "Part 1" },
];
