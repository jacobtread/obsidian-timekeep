import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();

export const input: TimeEntry = {
	id: 1,
	name: "Folder",
	startTime: null,
	endTime: null,
	subEntries: [
		{
			id: 2,
			name: "New Entry",
			startTime: currentTime,
			endTime: currentTime,
			subEntries: null,
		},
	],
	folder: true,
};

export const expected: TimeEntry = {
	id: 1,
	name: "Folder",
	startTime: null,
	endTime: null,
	subEntries: [
		{
			id: 2,
			name: "New Entry",
			startTime: currentTime,
			endTime: currentTime,
			subEntries: null,
		},
		{
			id: 3,
			name: "New Entry 2",
			startTime: currentTime,
			endTime: null,
			subEntries: null,
		},
	],
	folder: true,
};
