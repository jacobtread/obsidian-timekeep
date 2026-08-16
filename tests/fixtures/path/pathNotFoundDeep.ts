import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();

export const targetEntry: TimeEntry = {
	id: 1,
	name: "Part 1",
	startTime: currentTime,
	endTime: currentTime,
	subEntries: null,
};

export const entries = [
	{
		id: 2,
		name: "Part 1",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: 3,
				name: "Part 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: 4,
				name: "Part 2",
				startTime: null,
				endTime: null,
				subEntries: [],
			},
		],
	},
];
export const expected = [];
