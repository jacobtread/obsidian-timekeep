import moment from "moment";
import { Timekeep, TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();

export const runningEntry: TimeEntry = {
	id: "9054dee3-8c15-493b-ad31-f070e08c2699",
	name: "Running Entry",
	startTime: currentTime,
	endTime: null,
	subEntries: null,
};

export const input: Timekeep = {
	entries: [
		{
			id: "8054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Block 1",
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
				runningEntry,
			],
		},
	],
};
