import moment from "moment";

import { TimeEntryGroup } from "@/timekeep/schema";

export const currentTime = moment();

export const input: TimeEntryGroup = {
	id: 1,
	name: "Test",
	startTime: null,
	endTime: null,
	subEntries: [
		{
			id: 2,
			name: "Test",
			startTime: currentTime,
			endTime: currentTime,
			subEntries: null,
		},
	],
};
