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
		subEntries: [
			{
				id: "7054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 1",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: "6054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 1 A",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						id: "5054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 2",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					entryToRemove,
				],
			},
		],
	},
];

export const expectedEntries = [
	{
		id: "8054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Block 3",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: "6054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 1 A",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: "5054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 2",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
		],
	},
];
