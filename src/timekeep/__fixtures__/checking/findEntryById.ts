import moment from "moment";

export const currentTime = moment();

export const targetEntryId = "9054dee3-8c15-493b-ad31-f070e08c2699";

export const targetEntry = {
	id: "9054dee3-8c15-493b-ad31-f070e08c2699",
	name: "Running Entry",
	startTime: currentTime,
	endTime: null,
	subEntries: null,
};

export const input = [
	{
		id: "7054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Part 1",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
	targetEntry,
];
