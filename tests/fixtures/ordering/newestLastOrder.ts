import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

const currentTime = moment();

const futureStartTime = currentTime.clone().add(5000, "ms");

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
		startTime: futureStartTime,
		endTime: futureStartTime,
		subEntries: null,
	},
	{
		id: 3,
		name: "Part 1 null",
		startTime: null,
		endTime: null,
		subEntries: null,
	},
	{
		id: 4,
		name: "Part 3",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: 5,
				name: "Part 3 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: 6,
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
		id: 1,
		name: "Part 1",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
	{
		id: 4,
		name: "Part 3",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: 5,
				name: "Part 3 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: 6,
				name: "Part 3 2",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
		],
	},
	{
		id: 2,
		name: "Part 2",
		startTime: futureStartTime,
		endTime: futureStartTime,
		subEntries: null,
	},
	{
		id: 3,
		name: "Part 1 null",
		startTime: null,
		endTime: null,
		subEntries: null,
	},
];
