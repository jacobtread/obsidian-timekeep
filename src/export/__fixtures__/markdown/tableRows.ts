import fs from "fs/promises";
import moment from "moment";
import { v4 } from "uuid";

export const output = await fs.readFile("src/export/__fixtures__/markdown/tableRows.md", "utf-8");

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
];
