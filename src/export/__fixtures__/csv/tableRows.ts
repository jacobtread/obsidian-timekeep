import fs from "fs/promises";
import moment from "moment";

export const output = await fs.readFile("src/export/__fixtures__/csv/tableRows.csv", "utf-8");

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
