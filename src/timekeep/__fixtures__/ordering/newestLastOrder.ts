import moment from "moment";
import { TimeEntry } from "@/timekeep/schema";

const currentTime = moment();

const futureStartTime = currentTime.clone().add(5000, "ms");

export const input: TimeEntry[] = [
	{
		id: "9054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Part 1",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
	{
		id: "8054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Part 2",
		startTime: futureStartTime,
		endTime: futureStartTime,
		subEntries: null,
	},
	{
		id: "7054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Part 1 null",
		startTime: null,
		endTime: null,
		subEntries: null,
	},
	{
		id: "6054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Part 3",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: "5054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 3 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: "4054dee3-8c15-493b-ad31-f070e08c2699",
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
		id: "9054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Part 1",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
	{
		id: "6054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Part 3",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: "5054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 3 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: "4054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 3 2",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
		],
	},
	{
		id: "8054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Part 2",
		startTime: futureStartTime,
		endTime: futureStartTime,
		subEntries: null,
	},
	{
		id: "7054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Part 1 null",
		startTime: null,
		endTime: null,
		subEntries: null,
	},
];
