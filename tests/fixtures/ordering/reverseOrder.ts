import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();

export const input: TimeEntry[] = [
	{
		id: 1,
		name: "Part 1",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
	{
		id: 2,
		name: "Part 2",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
	{
		id: 3,
		name: "Part 3",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: 4,
				name: "Part 3 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: 5,
				name: "Part 3 2",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
		],
	},
];

export const expected: TimeEntry[] = [
	{
		id: 3,
		name: "Part 3",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: 5,
				name: "Part 3 2",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: 4,
				name: "Part 3 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
		],
	},
	{
		id: 2,
		name: "Part 2",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
	{
		id: 1,
		name: "Part 1",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
];
