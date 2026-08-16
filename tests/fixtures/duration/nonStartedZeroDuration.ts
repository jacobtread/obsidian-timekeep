import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();

export const durationMs = 0;

export const input: TimeEntry = {
	id: 1,
	name: "Test",
	startTime: null,
	endTime: null,
	subEntries: null,
};
