import moment from "moment";
import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();
export const endTime = moment().add(15, "hours");

export const input: TimeEntry[] = [
	{
		id: "9054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Entry",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: "8054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: "7054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Running Entry",
				startTime: currentTime,
				endTime: null,
				subEntries: null,
			},
		],
	},
	{
		id: "6054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Running Entry",
		startTime: currentTime,
		endTime: null,
		subEntries: null,
	},
];

export const expected: TimeEntry[] = [
	{
		id: "9054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Entry",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: "8054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: "7054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Running Entry",
				startTime: currentTime,
				endTime: endTime,
				subEntries: null,
			},
		],
	},
	{
		id: "6054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Running Entry",
		startTime: currentTime,
		endTime: endTime,
		subEntries: null,
	},
];
