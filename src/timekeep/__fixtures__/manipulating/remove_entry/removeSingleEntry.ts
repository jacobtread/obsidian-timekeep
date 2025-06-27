import moment from "moment";

export const currentTime = moment();
export const entryToRemove = {
	id: "49b99108-b1ad-4355-baa9-89c49c342be2",
	name: "Block 1",
	startTime: currentTime,
	endTime: currentTime,
	subEntries: null,
};

export const entries = [
	{
		id: "eeab0abb-8038-4c65-8b89-1e6daa994549",
		name: "Block 3",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
	{
		id: "b8fbcb98-f1e9-4d80-8867-994f58191046",
		name: "Block 2",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: "76c19eb4-6bd1-49ac-bb63-68d6ef6335b8",
				name: "Block 3",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: "74850306-d21e-41c3-a046-0057c03b950b",
				name: "Block 3",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			entryToRemove,
		],
	},
];

export const expectedEntries = [
	{
		id: "eeab0abb-8038-4c65-8b89-1e6daa994549",
		name: "Block 3",
		startTime: currentTime,
		endTime: currentTime,
		subEntries: null,
	},
	{
		id: "b8fbcb98-f1e9-4d80-8867-994f58191046",
		name: "Block 2",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: "76c19eb4-6bd1-49ac-bb63-68d6ef6335b8",
				name: "Block 3",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: "74850306-d21e-41c3-a046-0057c03b950b",
				name: "Block 3",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
		],
	},
];
