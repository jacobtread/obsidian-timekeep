import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();

export const targetEntryId = 2;

export const targetEntry: TimeEntry = {
	id: 2,
	name: "Running Entry",
	startTime: currentTime,
	endTime: null,
	subEntries: null,
};

export const input: TimeEntry[] = [
	{
		id: 1,
		name: "Part 1",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
	targetEntry,
];
