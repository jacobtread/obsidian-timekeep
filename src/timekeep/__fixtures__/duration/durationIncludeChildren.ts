import moment from "moment";

import { TimeEntry } from "../../schema";

export const currentTime = moment();
export const durationMs = 500;

export const input: TimeEntry = {
	id: 1,
	name: "Test",
	startTime: null,
	endTime: null,
	subEntries: [
		{
			id: 2,
			name: "Part A",
			startTime: currentTime,
			endTime: currentTime.clone().add(durationMs, "ms"),
			subEntries: null,
		},
		{
			id: 3,
			name: "Part B",
			startTime: currentTime,
			endTime: currentTime.clone().add(durationMs, "ms"),
			subEntries: null,
		},
		{
			id: 4,
			name: "Part c",
			startTime: currentTime,
			endTime: currentTime.clone().add(durationMs, "ms"),
			subEntries: null,
		},
	],
};

export const expected = durationMs * 3;
