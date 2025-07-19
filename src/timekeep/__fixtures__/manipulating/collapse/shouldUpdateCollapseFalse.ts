import moment from "moment";
import { TimeEntryGroup } from "@/timekeep/schema";

export const currentTime = moment();

export const input: TimeEntryGroup = {
	id: "9054dee3-8c15-493b-ad31-f070e08c2699",
	name: "Test",
	startTime: null,
	endTime: null,
	subEntries: [
		{
			id: "8054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Test",
			startTime: currentTime,
			endTime: currentTime,
			subEntries: null,
		},
	],
};
