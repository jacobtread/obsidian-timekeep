import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();

export const input: TimeEntry = {
	id: 1,
	name: "Folder",
	startTime: null,
	endTime: null,
	subEntries: [],
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
			endTime: null,
			subEntries: null,
		},
	],
	folder: true,
};
