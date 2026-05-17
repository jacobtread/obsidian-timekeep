import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

const currentTime = moment();

export const running: TimeEntry = {
	id: 1,
	name: "Running Entry",
	startTime: currentTime,
	endTime: null,
	subEntries: null,
};

export const notRunning: TimeEntry = {
	id: 2,
	name: "Stopped Entry",
	startTime: currentTime,
	endTime: currentTime,
	subEntries: null,
};

export const runningNested: TimeEntry = {
	id: 1,
	name: "Running Entry",
	startTime: null,
	endTime: null,
	subEntries: [
		{
			id: 2,
			name: "Running Entry",
			startTime: currentTime,
			endTime: null,
			subEntries: null,
		},
	],
};

export const stoppedNested: TimeEntry = {
	id: 1,
	name: "Stopped Entry",
	startTime: null,
	endTime: null,
	subEntries: [
		{
			id: 2,
			name: "Stopped Entry",
			startTime: currentTime,
			endTime: currentTime,
			subEntries: null,
		},
	],
};
