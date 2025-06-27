import moment from "moment";
import { Timekeep } from "@/timekeep/schema";

import { createCodeBlock } from "./createCodeBlock";

// Input data to find
export const input1 = createCodeBlock(
	`{"entries":[{"name":"Block 1","startTime":"2024-03-17T01:33:51.630Z","endTime":"2024-03-17T01:33:55.151Z","subEntries":null}]}`,
	4,
	4
);

// Input data to find
export const input2 = createCodeBlock(
	`{"entries":[{"name":"Block 2","startTime":"2024-03-17T01:33:51.630Z","endTime":"2024-03-17T01:33:55.151Z","subEntries":null}]}`,
	4,
	4
);

// Timekeep with a renamed block
export const inputTimekeep1: Timekeep = {
	entries: [
		{
			id: "9054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Block 1",
			startTime: moment("2024-03-17T01:33:51.630Z"),
			endTime: moment("2024-03-17T01:33:55.151Z"),
			subEntries: null,
		},
	],
};

// Timekeep with a renamed block
export const inputTimekeep2: Timekeep = {
	entries: [
		{
			id: "9054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Block 2",
			startTime: moment("2024-03-17T01:33:51.630Z"),
			endTime: moment("2024-03-17T01:33:55.151Z"),
			subEntries: null,
		},
	],
};

export const text = "\n\n\n" + input1 + "\n\n\n\n" + input2;
