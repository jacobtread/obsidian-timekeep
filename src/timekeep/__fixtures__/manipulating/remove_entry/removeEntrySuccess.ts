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
		id: "b8fbcb98-f1e9-4d80-8867-994f58191046",
		name: "Block 2",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
];
