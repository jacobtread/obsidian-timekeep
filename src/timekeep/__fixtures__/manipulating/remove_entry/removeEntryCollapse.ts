import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();
export const entryToRemove: TimeEntry = {
	id: 5,
	name: "Block 1",
	startTime: currentTime,
	endTime: currentTime,
	subEntries: null,
};

export const entries: TimeEntry[] = [
	{
		id: 1,
		name: "Block 3",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: 2,
				name: "Part 1",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: 3,
						name: "Part 1 A",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						id: 4,
						name: "Part 2",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					entryToRemove,
				],
			},
		],
	},
];

export const expectedEntries: TimeEntry[] = [
	{
		id: 1,
		name: "Block 3",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: 3,
				name: "Part 1 A",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: 4,
				name: "Part 2",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
		],
	},
];
