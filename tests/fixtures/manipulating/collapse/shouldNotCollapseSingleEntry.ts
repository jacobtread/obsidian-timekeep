import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();

export const input: TimeEntry = {
	id: 1,
	name: "Test",
	startTime: currentTime,
	endTime: currentTime,
	subEntries: null,
};
