import moment from "moment";
import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();

const durationMs = 500;

export const input: TimeEntry[] = [
	{
		id: "9054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Test",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: "8054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part A",
				startTime: currentTime,
				endTime: currentTime.clone().add(durationMs, "ms"),
				subEntries: null,
			},
			{
				id: "7054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part B",
				startTime: currentTime,
				endTime: currentTime.clone().add(durationMs, "ms"),
				subEntries: null,
			},
			{
				id: "6054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part c",
				startTime: currentTime,
				endTime: currentTime.clone().add(durationMs, "ms"),
				subEntries: null,
			},
		],
	},
	{
		id: "5054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Test",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: "4054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part A",
				startTime: currentTime,
				endTime: currentTime.clone().add(durationMs, "ms"),
				subEntries: null,
			},
			{
				id: "3054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part B",
				startTime: currentTime,
				endTime: currentTime.clone().add(durationMs, "ms"),
				subEntries: null,
			},
			{
				id: "2054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part c",
				startTime: currentTime,
				endTime: currentTime.clone().add(durationMs, "ms"),
				subEntries: null,
			},
		],
	},
];

export const expected = durationMs * 6;
