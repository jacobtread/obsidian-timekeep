import moment from "moment";

export const currentTime = moment();

export const name = "Block 2";
export const stopped = "9054dee3-8c15-493b-ad31-f070e08c2699";

export const targetEntry = {
	id: "9054dee3-8c15-493b-ad31-f070e08c2699",
	name: "Block",
	startTime: currentTime,
	endTime: null,
	subEntries: null,
};

export const input = [targetEntry];

export const expected = [
	{
		id: "9054dee3-8c15-493b-ad31-f070e08c269a",
		name: "Block",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: "9054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: "8054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 2",
				startTime: currentTime,
				endTime: null,
				subEntries: null,
			},
		],
	},
];
