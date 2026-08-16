import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();

export const targetEntryId = 5;

export const targetEntry: TimeEntry = {
	id: 5,
	name: "Running Entry",
	startTime: currentTime,
	endTime: null,
	subEntries: null,
};

export const input: TimeEntry[] = [
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
			{
				id: 3,
				name: "Part 2",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: 4,
						name: "Part 1",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					targetEntry,
				],
			},
		],
	},
];
