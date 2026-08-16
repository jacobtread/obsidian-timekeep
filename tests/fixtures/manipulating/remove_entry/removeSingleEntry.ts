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
				name: "Block 3",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: 4,
				name: "Block 3",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			entryToRemove,
		],
	},
];

export const expectedEntries: TimeEntry[] = [
	{
		id: 1,
		name: "Block 3",
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
				name: "Block 3",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: 4,
				name: "Block 3",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
		],
	},
];
