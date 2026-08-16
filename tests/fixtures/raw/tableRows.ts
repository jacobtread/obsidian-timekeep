import moment from "moment";

export const output = [
	["Test", "20-01-01 13:00:00", "20-01-01 14:00:00", "1.00h"],
	["Test 2", "20-01-01 13:00:00", "20-01-01 15:00:00", "2.00h"],
];

export const currentTime = moment("2020-01-01T00:00:00Z");

export const entries = [
	{
		id: 1,
		name: "Test",
		startTime: moment(currentTime),
		endTime: moment(currentTime).add(1, "hour"),
		subEntries: null,
	},
	{
		id: 2,
		name: "Test 2",
		startTime: moment(currentTime),
		endTime: moment(currentTime).add(2, "hour"),
		subEntries: null,
	},
];
