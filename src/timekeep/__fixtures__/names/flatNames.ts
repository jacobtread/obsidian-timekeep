import { TimeEntry } from "@/timekeep/schema";

export const input: TimeEntry[] = [
	{
		id: "9054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Part 1",
		startTime: null,
		endTime: null,
		subEntries: null,
	},
	{
		id: "9054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Part 2",
		startTime: null,
		endTime: null,
		subEntries: null,
	},
];

export const expected: string[] = ["Part 1", "Part 2"].sort();
