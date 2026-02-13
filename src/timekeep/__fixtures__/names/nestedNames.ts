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
		id: "d25ab2f5-00ac-4c89-9168-6062f7e01688",
		name: "Part 2",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: "8fec44f0-9d5d-4b83-b960-63f73ec2d29d",
				name: "Part 3",
				startTime: null,
				endTime: null,
				subEntries: null,
			},
			{
				id: "4a806a42-7463-4bbc-82e8-4ef193ed5bc6",
				name: "Part 4",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: "609c792d-eebc-42bb-85a7-1614b5b0a792",
						name: "Part 5",
						startTime: null,
						endTime: null,
						subEntries: null,
					},
					{
						id: "7c7955f5-4363-4cc1-93a5-9f654ffc8767",
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
