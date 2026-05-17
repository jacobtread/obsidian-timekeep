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
		subEntries: [
			{
				id: 3,
				name: "Part 3",
				startTime: null,
				endTime: null,
				subEntries: null,
			},
			{
				id: 4,
				name: "Part 4",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: 5,
						name: "Part 5",
						startTime: null,
						endTime: null,
						subEntries: null,
					},
					{
						id: 6,
						name: "Part 6",
						startTime: null,
						endTime: null,
						subEntries: null,
					},
				],
			},
		],
	},
];

export const expected: string[] = [
	"Part 1",
	"Part 2",
	"Part 3",
	"Part 4",
	"Part 5",
	"Part 6",
].sort();
