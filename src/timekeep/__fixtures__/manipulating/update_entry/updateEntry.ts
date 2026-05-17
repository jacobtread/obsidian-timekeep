import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();

export const entryToUpdate: TimeEntry = {
	id: 1,
	name: "Block 1",
	startTime: currentTime,
	endTime: currentTime,
	subEntries: null,
};

export const updatedEntry: TimeEntry = {
	id: 2,
	name: "Block 1 Updated",
	startTime: currentTime,
	endTime: currentTime,
	subEntries: null,
};

export const entries: TimeEntry[] = [
	{
		id: 3,
		name: "Block 3",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
	{
		id: 4,
		name: "Block 4",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: 5,
				name: "Part 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
		],
	},
	entryToUpdate,
	{
		id: 6,
		name: "Block 2",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
];

export const expectedEntries: TimeEntry[] = [
	{
		id: 3,
		name: "Block 3",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
	{
		id: 4,
		name: "Block 4",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: 5,
				name: "Part 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
		],
	},
	updatedEntry,
	{
		id: 6,
		name: "Block 2",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
];
