import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();

export const name = "Block 2";
export const stopped = 2;

export const targetEntry: TimeEntry = {
	id: 2,
	name: "Part 1",
	startTime: currentTime,
	endTime: null,
	subEntries: null,
};

export const input: TimeEntry[] = [targetEntry];

export const expected: TimeEntry[] = [
	{
		id: 1,
		name: "Part 1",
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
				name: "Part 2",
				startTime: currentTime,
				endTime: null,
				subEntries: null,
			},
		],
	},
];
