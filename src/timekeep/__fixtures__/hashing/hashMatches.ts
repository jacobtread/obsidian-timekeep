import moment from "moment";
import { TimeEntry } from "@/timekeep/schema";

const currentTime = moment();

export const left: TimeEntry = {
	id: "9054dee3-8c15-493b-ad31-f070e08c2699",
	name: "Test",
	startTime: null,
	endTime: null,
	subEntries: [
		{
			id: "8054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Part 1",
			startTime: currentTime,
			endTime: currentTime,
			subEntries: null,
		},
		{
			id: "7054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Part 2",
			startTime: currentTime,
			endTime: currentTime,
			subEntries: null,
		},
	],
};

export const right: TimeEntry = {
	id: "9054dee3-8c15-493b-ad31-f070e08c2699",
	name: "Test",
	startTime: null,
	endTime: null,
	subEntries: [
		{
			id: "8054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Part 1",
			startTime: currentTime,
			endTime: currentTime,
			subEntries: null,
		},
		{
			id: "7054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Part 2",
			startTime: currentTime,
			endTime: currentTime,
			subEntries: null,
		},
	],
};
