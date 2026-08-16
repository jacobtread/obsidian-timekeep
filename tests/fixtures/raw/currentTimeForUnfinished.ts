import moment from "moment";

export const output = [
	["Test", "20-01-01 13:00:00", "20-01-01 14:00:00", "1.00h"],
	["Test 2", "20-01-01 13:00:00", "20-01-01 15:00:00", "2.00h"],
	["Test Group", "", "", "2.00h"],
	["Test 3", "20-01-01 13:00:00", "20-01-01 15:00:00", "2.00h"],
];

export const start = moment("2020-01-01T00:00:00Z");
export const currentTime = moment(start).add(2, "hours");

export const entries = [
	{
		id: 1,
		name: "Test",
		startTime: moment(start),
		endTime: moment(start).add(1, "hour"),
		subEntries: null,
	},
	{
		id: 2,
		name: "Test 2",
		startTime: moment(start),
		endTime: moment(start).add(2, "hour"),
		subEntries: null,
	},
	{
		id: 3,
		name: "Test Group",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: 4,
				name: "Test 3",
				startTime: moment(start),
				endTime: null,
				subEntries: null,
			},
		],
	},
];
