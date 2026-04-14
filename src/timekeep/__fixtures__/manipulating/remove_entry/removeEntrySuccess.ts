import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();
export const entryToRemove: TimeEntry = {
	id: "76c19eb4-6bd1-49ac-bb63-68d6ef6335b8",
	name: "Block 1",
	startTime: currentTime,
	endTime: currentTime,
	subEntries: null,
};

export const entries: TimeEntry[] = [
	{
		id: "74850306-d21e-41c3-a046-0057c03b950b",
		name: "Block 3",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
	{
		id: "1f683adc-0205-4a18-9b1b-ada64a4b0553",
		name: "Block Should be removed",
		startTime: null,
		endTime: null,
		subEntries: [],
	},
	{
		id: "36c3a34a-208c-4975-bae7-ff833e8017ac",
		name: "Block 4",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: "cbfb3b78-dd7f-4ee2-99ea-34d6b0626e23",
				name: "Block 5",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},

			{
				id: "35ff21e3-af83-45b6-86a2-7e141a12c37f",
				name: "Block 12",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
		],
	},
	{
		id: "a9bda6f2-568c-4d11-a3be-e8586bde8b1c",
		name: "Block 6",
		startTime: null,
		endTime: null,
		subEntries: [],
		folder: true,
	},
	entryToRemove,
	{
		id: "b8fbcb98-f1e9-4d80-8867-994f58191046",
		name: "Block 2",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
];

export const expectedEntries: TimeEntry[] = [
	{
		id: "74850306-d21e-41c3-a046-0057c03b950b",
		name: "Block 3",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
	{
		id: "36c3a34a-208c-4975-bae7-ff833e8017ac",
		name: "Block 4",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: "cbfb3b78-dd7f-4ee2-99ea-34d6b0626e23",
				name: "Block 5",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: "35ff21e3-af83-45b6-86a2-7e141a12c37f",
				name: "Block 12",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
		],
	},
	{
		id: "a9bda6f2-568c-4d11-a3be-e8586bde8b1c",
		name: "Block 6",
		startTime: null,
		endTime: null,
		subEntries: [],
		folder: true,
	},
	{
		id: "b8fbcb98-f1e9-4d80-8867-994f58191046",
		name: "Block 2",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
];
