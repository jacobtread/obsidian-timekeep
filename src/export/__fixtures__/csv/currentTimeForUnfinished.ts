import fs from "fs/promises";
import moment from "moment";
import { v4 } from "uuid";

export const output = await fs.readFile("src/export/__fixtures__/csv/tableRows.csv", "utf-8");

export const start = moment("2020-01-01T00:00:00Z");
export const currentTime = moment(start).add(2, "hours");

export const entries = [
	{
		id: v4(),
		name: "Test",
		startTime: moment(start),
		endTime: moment(start).add(1, "hour"),
		subEntries: null,
	},
	{
		id: v4(),
		name: "Test 2",
		startTime: moment(start),
		endTime: moment(start).add(2, "hour"),
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
				startTime: moment(start),
				endTime: null,
				subEntries: null,
			},
		],
	},
];
