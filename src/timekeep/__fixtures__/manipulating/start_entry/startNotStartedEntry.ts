import moment from "moment";

export const currentTime = moment();

export const targetEntry = {
	id: "9054dee3-8c15-493b-ad31-f070e08c2699",
	name: "Part 1",
	startTime: null,
	endTime: null,
	subEntries: null,
};

export const input = [targetEntry];

export const expected = [
	{
		id: "9054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Part 1",
		startTime: currentTime,
		endTime: null,
		subEntries: null,
	},
];
