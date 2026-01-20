import moment from "moment";
import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();

export const targetEntryId = "9054dee3-8c15-493b-ad31-f070e08c2699";

export const input: TimeEntry[] = [
	{
		id: "7054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Part 1",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
];
