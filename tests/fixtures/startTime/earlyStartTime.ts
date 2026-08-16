import moment from "moment";

export const currentTime = moment();

export const entry = {
	id: 1,
	name: "Part 1",
	startTime: null,
	endTime: null,
	subEntries: [
		{
			id: 2,
			name: "Part 1",
			startTime: currentTime.add(1, "hours"),
			endTime: currentTime.add(1, "hours"),
			subEntries: null,
		},
		{
			id: 3,
			name: "Part 1",
			startTime: currentTime,
			endTime: currentTime,
			subEntries: null,
		},
		{
			id: 4,
			name: "Part 1",
			startTime: null,
			endTime: null,
			subEntries: null,
		},
		{
			id: 5,
			name: "Part 1",
			startTime: currentTime.add(2, "hours"),
			endTime: currentTime.add(2, "hours"),
			subEntries: null,
		},
	],
};

export const output = currentTime;
