import moment from "moment";
import { TimeEntry } from "@/timekeep/schema";

const currentTime = moment();

export const running: TimeEntry = {
	id: "9054dee3-8c15-493b-ad31-f070e08c2699",
	name: "Running Entry",
	startTime: currentTime,
	endTime: null,
	subEntries: null,
};

export const notRunning: TimeEntry = {
	id: "8054dee3-8c15-493b-ad31-f070e08c2699",
	name: "Stopped Entry",
	startTime: currentTime,
	endTime: currentTime,
	subEntries: null,
};

export const runningNested: TimeEntry = {
	id: "9054dee3-8c15-493b-ad31-f070e08c2699",
	name: "Running Entry",
	startTime: null,
	endTime: null,
	subEntries: [
		{
			id: "8054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Running Entry",
			startTime: currentTime,
			endTime: null,
			subEntries: null,
		},
	],
};

export const stoppedNested: TimeEntry = {
	id: "9054dee3-8c15-493b-ad31-f070e08c2699",
	name: "Stopped Entry",
	startTime: null,
	endTime: null,
	subEntries: [
		{
			id: "8054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Stopped Entry",
			startTime: currentTime,
			endTime: currentTime,
			subEntries: null,
		},
	],
};
