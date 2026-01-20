import moment from "moment";

export const currentTime = moment();

export const input = {
	id: "9054dee3-8c15-493b-ad31-f070e08c2699",
	name: "Folder",
	startTime: null,
	endTime: null,
	subEntries: null,
	folder: true,
};

export const expected = {
	id: "9054dee3-8c15-493b-ad31-f070e08c2699",
	name: "Folder",
	startTime: null,
	endTime: null,
	subEntries: [
		{
			id: "8054dee3-8c15-493b-ad31-f070e08c2699",
			name: "New Entry",
			startTime: currentTime,
			endTime: null,
			subEntries: null,
		},
	],
	folder: true,
};
