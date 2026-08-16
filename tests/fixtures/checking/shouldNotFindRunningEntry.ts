import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();

export const input: TimeEntry[] = [
	{
		id: 1,
		name: "Block 1",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
	{
		id: 2,
		name: "Block 2",
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
		],
	},
];
