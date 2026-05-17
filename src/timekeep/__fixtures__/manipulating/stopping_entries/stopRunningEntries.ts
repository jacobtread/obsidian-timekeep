import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();
export const endTime = moment().add(15, "hours");

export const input: TimeEntry[] = [
	{
		id: 1,
		name: "Entry",
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
				name: "Running Entry",
				startTime: currentTime,
				endTime: null,
				subEntries: null,
			},
		],
	},
	{
		id: 4,
		name: "Running Entry",
		startTime: currentTime,
		endTime: null,
		subEntries: null,
	},
];

export const expected: TimeEntry[] = [
	{
		id: 1,
		name: "Entry",
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
				name: "Running Entry",
				startTime: currentTime,
				endTime: endTime,
				subEntries: null,
			},
		],
	},
	{
		id: 4,
		name: "Running Entry",
		startTime: currentTime,
		endTime: endTime,
		subEntries: null,
	},
];
