import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();

export const runningEntry: TimeEntry = {
	id: 3,
	name: "Running Entry",
	startTime: currentTime,
	endTime: null,
	subEntries: null,
};

export const input = [
	{
		id: 1,
		name: "Block 1",
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
			runningEntry,
		],
	},
];
