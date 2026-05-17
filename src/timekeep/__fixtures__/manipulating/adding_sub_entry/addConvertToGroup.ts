import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();

export const input: TimeEntry = {
	id: 1,
	name: "Entry",
	startTime: currentTime,
	endTime: currentTime,
	subEntries: null,
};

export const expected: TimeEntry = {
	id: 1,
	name: "Entry",
	startTime: null,
	endTime: null,
	subEntries: [
		{
			id: 2,
			name: "Part 1",
			startTime: currentTime,
			endTime: currentTime,
			subEntries: null,
		},
		{
			id: 3,
			name: "New Entry",
			startTime: currentTime,
			endTime: null,
			subEntries: null,
		},
	],
};
