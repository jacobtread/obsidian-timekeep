import moment from "moment";

export const currentTime = moment();

export const input = {
	id: "9054dee3-8c15-493b-ad31-f070e08c2699",
	name: "Entry",
	startTime: null,
	endTime: null,
	subEntries: [
		{
			id: "8054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Part 1",
			startTime: currentTime,
			endTime: currentTime,
			subEntries: null,
		},
		{
			id: "7054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Part 2",
			startTime: currentTime,
			endTime: currentTime,
			subEntries: null,
		},
	],
};

export const expected = {
	id: "9054dee3-8c15-493b-ad31-f070e08c2699",
	name: "Entry",
	startTime: null,
	endTime: null,
	subEntries: [
		{
			id: "8054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Part 1",
			startTime: currentTime,
			endTime: currentTime,
			subEntries: null,
		},
		{
			id: "7054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Part 2",
			startTime: currentTime,
			endTime: currentTime,
			subEntries: null,
		},
		{
			id: "6054dee3-8c15-493b-ad31-f070e08c2699",
			name: "New Entry",
			startTime: currentTime,
			endTime: null,
			subEntries: null,
		},
	],
};
