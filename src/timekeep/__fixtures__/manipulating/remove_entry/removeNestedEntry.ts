import moment from "moment";

export const currentTime = moment();
export const entryToRemove = {
	id: "76c19eb4-6bd1-49ac-bb63-68d6ef6335b8",
	name: "Block 1",
	startTime: currentTime,
	endTime: currentTime,
	subEntries: null,
};

export const entries = [
	{
		id: "9054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Block 3",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: "a3b4c0ca-9a9f-4b2c-8363-75c82bae692f",
				name: "Part 1",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: "dc376d49-9ac6-4a27-adff-a4666f0031b4",
						name: "Part 1 A",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						id: "a261164c-3456-420e-a773-37353f22450a",
						name: "Part 2",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					entryToRemove,
				],
			},
			{
				id: "f0ef900f-fa45-4031-94a4-b9290c8e655b",
				name: "Part 2",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
		],
	},
];

export const expectedEntries = [
	{
		id: "9054dee3-8c15-493b-ad31-f070e08c2699",
		name: "Block 3",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: "a3b4c0ca-9a9f-4b2c-8363-75c82bae692f",
				name: "Part 1",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: "dc376d49-9ac6-4a27-adff-a4666f0031b4",
						name: "Part 1 A",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						id: "a261164c-3456-420e-a773-37353f22450a",
						name: "Part 2",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
				],
			},
			{
				id: "f0ef900f-fa45-4031-94a4-b9290c8e655b",
				name: "Part 2",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
		],
	},
];
