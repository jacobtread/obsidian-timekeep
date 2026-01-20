import moment from "moment";
import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();

export const input: TimeEntry[] = [
	{
		id: "9054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Part 1",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
	{
		id: "15b24c72-2e71-4070-8331-49eb48bf94c5",
		name: "Part 2",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
];

export const expected: TimeEntry[] = [
	{
		id: "9054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Part 1",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
	{
		id: "15b24c72-2e71-4070-8331-49eb48bf94c5",
		name: "Part 2",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
	{
		id: "76233ea4-5840-479a-a946-0f5b2610cfa7",
		name: "New Test Entry",
		startTime: currentTime,
		endTime: null,
		subEntries: null,
	},
];
