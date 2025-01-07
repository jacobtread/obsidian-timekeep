import moment from "moment";
import { randomUUID } from "crypto";

import { TIMEKEEP } from "./schema";

jest.mock("crypto", () => ({
	randomUUID: jest.fn(() => "mocked-uuid"),
}));

describe("schema transform", () => {
	it("transforms input with an added id", () => {
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
		const result = TIMEKEEP.parse(input);

		expect(result).toEqual({
			entries: [
				{
					id: "mocked-uuid",
					name: "Block 2",
					startTime: moment("2024-03-17T01:33:51.630Z"),
					endTime: moment("2024-03-17T01:33:55.151Z"),
					subEntries: null,
				},
				{
					id: "mocked-uuid",
					name: "Block 2",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							id: "mocked-uuid",
							name: "Block 2",
							startTime: moment("2024-03-17T01:33:51.630Z"),
							endTime: moment("2024-03-17T01:33:55.151Z"),
							subEntries: null,
						},
					],
				},
			],
		});

		expect(randomUUID).toHaveBeenCalled();
	});
});
