import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();
export const entryToRemove: TimeEntry = {
	id: 7,
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
		name: "Block Should be removed",
		startTime: null,
		endTime: null,
		subEntries: [],
	},
	{
		id: 3,
		name: "Block 4",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: 4,
				name: "Block 5",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},

			{
				id: 5,
				name: "Block 12",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
		],
	},
	{
		id: 6,
		name: "Block 6",
		startTime: null,
		endTime: null,
		subEntries: [],
		folder: true,
	},
	entryToRemove,
	{
		id: 8,
		name: "Block 2",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
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
		id: 3,
		name: "Block 4",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: 4,
				name: "Block 5",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: 5,
				name: "Block 12",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
		],
	},
	{
		id: 6,
		name: "Block 6",
		startTime: null,
		endTime: null,
		subEntries: [],
		folder: true,
	},
	{
		id: 8,
		name: "Block 2",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
];
