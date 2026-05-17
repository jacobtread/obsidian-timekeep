import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();
export const entryToRemove: TimeEntry = {
	id: 2,
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
		subEntries: [entryToRemove],
		folder: true,
	},
];

export const expectedEntries: TimeEntry[] = [
	{
		id: 1,
		name: "Block 3",
		startTime: null,
		endTime: null,
		subEntries: [],
		folder: true,
	},
];
