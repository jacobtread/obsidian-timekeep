import moment from "moment";

export const currentTime = moment();

export const entryToUpdate = {
	id: "5054dee3-8c15-493b-ad31-f070e08c2699",
	name: "Block 1",
	startTime: currentTime,
	endTime: currentTime,
	subEntries: null,
};

export const updatedEntry = {
	id: "5054dee3-8c15-493b-ad31-f070e08c2699",
	name: "Block 1 Updated",
	startTime: currentTime,
	endTime: currentTime,
	subEntries: null,
};

export const entries = [
	{
		id: "9054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Block 3",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
	{
		id: "8054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Block 3",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: "7054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
		],
	},
	entryToUpdate,
	{
		id: "6054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Block 2",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
];

export const expectedEntries = [
	{
		id: "9054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Block 3",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
	{
		id: "8054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Block 3",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: "7054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
		],
	},
	updatedEntry,
	{
		id: "6054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Block 2",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
];
