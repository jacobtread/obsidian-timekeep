import moment from "moment";

const currentTime = moment();

export const runningEntry = {
	id: "9054dee3-8c15-493b-ad31-f070e08c2699",
	name: "Running Entry",
	startTime: currentTime,
	endTime: null,
	subEntries: null,
};

export const input = [
	{
		id: "8054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Block 1",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
	runningEntry,
];
