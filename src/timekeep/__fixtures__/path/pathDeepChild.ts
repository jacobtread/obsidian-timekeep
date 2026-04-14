import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();

export const targetEntry: TimeEntry = {
	id: "9054dee3-8c15-493b-ad31-f070e08c2699",
	name: "Part 1",
	startTime: currentTime,
	endTime: currentTime,
	subEntries: null,
};

export const entries = [
	{
		id: "7054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Part 1",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: "7054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: "7054dee3-8c15-493b-ad31-f070e08c269a",
				name: "Part 2",
				startTime: null,
				endTime: null,
				subEntries: [targetEntry],
			},
		],
	},
];
export const expected = [
	{
		id: "7054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Part 1",
	},
	{
		id: "7054dee3-8c15-493b-ad31-f070e08c269a",
		name: "Part 2",
	},
	{
		id: "9054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Part 1",
	},
];
