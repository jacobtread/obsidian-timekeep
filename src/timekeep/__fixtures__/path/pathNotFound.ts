import moment from "moment";

import { TimeEntry } from "@/timekeep/schema";

export const currentTime = moment();

export const targetEntry: TimeEntry = {
	id: 1,
	name: "Part 1",
	startTime: currentTime,
	endTime: currentTime,
	subEntries: null,
};

export const entries = [];
export const expected = [];
