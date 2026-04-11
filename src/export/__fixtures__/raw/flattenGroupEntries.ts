import moment from "moment";
import { v4 } from "uuid";

export const output = [
	["Test", "20-01-01 13:00:00", "20-01-01 14:00:00", "1.00h"],
	["Test 2", "20-01-01 13:00:00", "20-01-01 15:00:00", "2.00h"],
	["Test Group", "", "", "2.00h"],
	["Test 3", "20-01-01 13:00:00", "20-01-01 15:00:00", "2.00h"],
];

export const currentTime = moment("2020-01-01T00:00:00Z");

export const entries = [
	{
		id: v4(),
		name: "Test",
		startTime: moment(currentTime),
		endTime: moment(currentTime).add(1, "hour"),
		subEntries: null,
	},
	{
		id: v4(),
		name: "Test 2",
		startTime: moment(currentTime),
		endTime: moment(currentTime).add(2, "hour"),
		subEntries: null,
	},
	{
		id: v4(),
		name: "Test Group",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: v4(),
				name: "Test 3",
				startTime: moment(currentTime),
				endTime: moment(currentTime).add(2, "hour"),
				subEntries: null,
			},
		],
	},
];
