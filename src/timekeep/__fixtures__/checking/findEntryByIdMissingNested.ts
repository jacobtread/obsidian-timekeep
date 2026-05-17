import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();

export const targetEntryId = 4;

export const input: TimeEntry[] = [
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
				startTime: null,
				endTime: null,
				subEntries: [],
			},
		],
	},
];
