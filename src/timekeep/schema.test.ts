import moment from "moment";
import { parse } from "valibot";
import { expect, it, describe, Mock } from "vitest";

import { timekeepId } from "@/timekeep/id";
import { TIMEKEEP } from "@/timekeep/schema";

describe("schema transform", () => {
	it("transforms input with an added id", () => {
		(timekeepId.next as Mock).mockReturnValue(1);

		const input = {
			entries: [
				{
					name: "Block 2",
					startTime: "2024-03-17T01:33:51.630Z",
					endTime: "2024-03-17T01:33:55.151Z",
					subEntries: null,
				},
				{
					name: "Block 2",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							name: "Block 2",
							startTime: "2024-03-17T01:33:51.630Z",
							endTime: "2024-03-17T01:33:55.151Z",
							subEntries: null,
						},
					],
				},
			],
		};
		const result = parse(TIMEKEEP, input);

		expect(result).toEqual({
			entries: [
				{
					id: 1,
					name: "Block 2",
					startTime: moment("2024-03-17T01:33:51.630Z"),
					endTime: moment("2024-03-17T01:33:55.151Z"),
					subEntries: null,
				},
				{
					id: 1,
					name: "Block 2",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							id: 1,
							name: "Block 2",
							startTime: moment("2024-03-17T01:33:51.630Z"),
							endTime: moment("2024-03-17T01:33:55.151Z"),
							subEntries: null,
						},
					],
				},
			],
		});

		expect(timekeepId.next).toHaveBeenCalled();
	});
});
