import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();

export const durationMs = 500;

export const input: TimeEntry = {
	id: 1,
	name: "Test",
	startTime: currentTime,
	endTime: currentTime.clone().add(durationMs, "ms"),
	subEntries: null,
};
