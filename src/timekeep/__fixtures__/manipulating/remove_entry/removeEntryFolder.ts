import moment from "moment";

export const currentTime = moment();
export const entryToRemove = {
	id: "9054dee3-8c15-493b-ad31-f070e08c2699",
	name: "Block 1",
	startTime: currentTime,
	endTime: currentTime,
	subEntries: null,
};

export const entries = [
	{
		id: "8054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Block 3",
		startTime: null,
		endTime: null,
		subEntries: [entryToRemove],
		folder: true,
	},
];

export const expectedEntries = [
	{
		id: "8054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Block 3",
		startTime: null,
		endTime: null,
		subEntries: [],
		folder: true,
	},
];
