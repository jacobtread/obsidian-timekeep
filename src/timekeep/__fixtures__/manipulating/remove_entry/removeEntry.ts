import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();

export const parent: TimeEntry = {
	id: 1,
	name: "Block 1",
	startTime: currentTime,
	endTime: currentTime,
	subEntries: null,
};

export const entryToRemove: TimeEntry = {
	id: 1,
	name: "Block 1",
	startTime: currentTime,
	endTime: currentTime,
	subEntries: null,
};
