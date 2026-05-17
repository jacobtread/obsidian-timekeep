import { TimeEntry } from "@/timekeep/schema";

export const input: TimeEntry[] = [
	{
		id: 1,
		name: "Part 1",
		startTime: null,
		endTime: null,
		subEntries: null,
	},
	{
		id: 2,
		name: "Part 2",
		startTime: null,
		endTime: null,
		subEntries: null,
	},
];

export const expected: string[] = ["Part 1", "Part 2"].sort();
