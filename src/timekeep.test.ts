import { TimeEntry, Timekeep } from "./schema";
import { TimekeepSettings, defaultSettings } from "./settings";
import {
	LoadError,
	LoadSuccess,
	createEntry,
	getEntriesOrdered,
	getEntryDuration,
	getRunningEntry,
	getTotalDuration,
	getUniqueEntryHash,
	isEntryRunning,
	isKeepRunning,
	load,
	removeEntry,
	replaceTimekeepCodeblock,
	stopRunningEntries,
	updateEntry,
	withEntry,
	withSubEntry,
} from "./timekeep";
import moment from "moment";

/**
 * Generates a code block surrounding the provided JSON
 * with the provided leading and trailing number of lines
 *
 * @param json The JSON to put between the codeblocks
 * @param linesBefore Number of lines before the codeblock
 * @param linesAfter Number of lines after the codeblock
 * @returns The generated codeblock
 */
const createCodeBlock = (
	json: string,
	linesBefore: number,
	linesAfter: number
) => {
	let output = "";
	for (let i = 0; i < linesBefore; i++) {
		output += "\n";
	}
	output += "```\n";
	output += json;
	output += "\n```";
	for (let i = 0; i < linesAfter; i++) {
		output += "\n";
	}
	return output;
};

describe("replacing content", () => {
	it("should replace codeblock contents", () => {
		const lineStart = 4; // Line the codeblock should start on
		const lineEnd = lineStart + 2; // Line the codeblock should end on

		// Input data to replace
		const input = createCodeBlock(
			`{"entries":[{"name":"Block 1","startTime":"2024-03-17T01:33:51.630Z","endTime":"2024-03-17T01:33:55.151Z","subEntries":null}]}`,
			4,
			4
		);

		// Timekeep with a renamed block
		const inputTimekeep: Timekeep = {
			entries: [
				{
					name: "Block 2",
					startTime: moment("2024-03-17T01:33:51.630Z"),
					endTime: moment("2024-03-17T01:33:55.151Z"),
					subEntries: null,
				},
			],
		};

		// Value with the renamed block
		const expected = createCodeBlock(
			`{"entries":[{"name":"Block 2","startTime":"2024-03-17T01:33:51.630Z","endTime":"2024-03-17T01:33:55.151Z","subEntries":null}]}`,
			4,
			4
		);

		const output = replaceTimekeepCodeblock(
			inputTimekeep,
			input,
			lineStart,
			lineEnd
		);

		expect(output).toBe(expected);
	});

	it("should fail if codeblock is missing", () => {
		const input = createCodeBlock("", 4, 4);
		// Start not code fences
		expect(() =>
			replaceTimekeepCodeblock({ entries: [] }, input, 2, 4)
		).toThrow();

		// End not code fences
		expect(() =>
			replaceTimekeepCodeblock({ entries: [] }, input, 4, 8)
		).toThrow();
	});
});

describe("loading timekeep", () => {
	it("should give empty timekeep when given empty string", () => {
		const result = load("");

		expect(result.success).toBe(true);

		const successResult = result as LoadSuccess;

		// Ensure the contents match
		expect(successResult.timekeep).toEqual({ entries: [] });
	});

	it("should load valid timekeep successfully", () => {
		const data = `{"entries":[{"name":"Block 1","startTime":"2024-03-17T01:33:51.630Z","endTime":"2024-03-17T01:33:55.151Z","subEntries":null},{"name":"Block 2","startTime":"2024-03-17T01:33:51.630Z","endTime":null,"subEntries":null}]}`;
		const expected = {
			entries: [
				{
					name: "Block 1",
					startTime: moment("2024-03-17T01:33:51.630Z"),
					endTime: moment("2024-03-17T01:33:55.151Z"),
					subEntries: null,
				},
				{
					name: "Block 2",
					startTime: moment("2024-03-17T01:33:51.630Z"),
					endTime: null,
					subEntries: null,
				},
			],
		};

		const result = load(data);

		expect(result.success).toBe(true);

		const successResult = result as LoadSuccess;

		// Ensure the contents match
		expect(successResult.timekeep).toEqual(expected);
	});

	it("should give error on invalid timekeep (JSON)", () => {
		const data = "{";

		const result = load(data);

		expect(result.success).toBe(false);

		const errorResult = result as LoadError;

		expect(errorResult.error).toBe("Failed to parse timekeep JSON");
	});

	it("should give error on invalid timekeep (validation)", () => {
		const data = `{"entries":[{"startTime":"2024-03-17T01:33:51.630Z","endTime":"2024-03-17T01:33:55.151Z","subEntries":null}]}`;

		const result = load(data);

		expect(result.success).toBe(false);
	});
});

describe("manipulating entries", () => {
	describe("update entry", () => {
		it("updating existing entry should succeed", () => {
			const currentTime = moment();
			const entryToUpdate = {
				name: "Block 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			};

			const updatedEntry = {
				name: "Block 1 Updated",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			};

			const entries = [
				{
					name: "Block 3",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
				{
					name: "Block 3",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							name: "Part 1",
							startTime: currentTime,
							endTime: currentTime,
							subEntries: null,
						},
					],
				},
				entryToUpdate,
				{
					name: "Block 2",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
			];

			const expectedEntries = [
				{
					name: "Block 3",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
				{
					name: "Block 3",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							name: "Part 1",
							startTime: currentTime,
							endTime: currentTime,
							subEntries: null,
						},
					],
				},
				updatedEntry,
				{
					name: "Block 2",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
			];

			const updated = updateEntry(entries, entryToUpdate, updatedEntry);
			expect(updated).toEqual(expectedEntries);
		});
	});

	describe("remove entry", () => {
		it("attempting to remove sub entry on non group should do nothing", () => {
			const currentTime = moment();

			const parent = {
				name: "Block 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			};
			const entryToRemove = {
				name: "Block 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			};

			const output = removeEntry([parent], entryToRemove);
			expect(output).toEqual([parent]);
		});

		it("remove on single entry should stay same if not target", () => {
			const currentTime = moment();
			const entryToRemove = {
				name: "Block 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			};

			const entries = [
				{
					name: "Block 3",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
				{
					name: "Block 2",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							name: "Block 3",
							startTime: currentTime,
							endTime: currentTime,
							subEntries: null,
						},
						{
							name: "Block 3",
							startTime: currentTime,
							endTime: currentTime,
							subEntries: null,
						},
						entryToRemove,
					],
				},
			];

			const expectedEntries = [
				{
					name: "Block 3",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
				{
					name: "Block 2",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							name: "Block 3",
							startTime: currentTime,
							endTime: currentTime,
							subEntries: null,
						},
						{
							name: "Block 3",
							startTime: currentTime,
							endTime: currentTime,
							subEntries: null,
						},
					],
				},
			];

			const updated = removeEntry(entries, entryToRemove);
			expect(updated).toEqual(expectedEntries);
		});

		it("should be able to remove entry", () => {
			const currentTime = moment();
			const entryToRemove = {
				name: "Block 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			};

			const entries = [
				{
					name: "Block 3",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
				entryToRemove,
				{
					name: "Block 2",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
			];

			const expectedEntries = [
				{
					name: "Block 3",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
				{
					name: "Block 2",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
			];

			const updated = removeEntry(entries, entryToRemove);
			expect(updated).toEqual(expectedEntries);
		});

		it("should be able to remove nested entry", () => {
			const currentTime = moment();
			const entryToRemove = {
				name: "Block 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			};

			const entries = [
				{
					name: "Block 3",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							name: "Part 1",
							startTime: null,
							endTime: null,
							subEntries: [
								{
									name: "Part 1 A",
									startTime: currentTime,
									endTime: currentTime,
									subEntries: null,
								},
								{
									name: "Part 2",
									startTime: currentTime,
									endTime: currentTime,
									subEntries: null,
								},
								entryToRemove,
							],
						},
						{
							name: "Part 2",
							startTime: currentTime,
							endTime: currentTime,
							subEntries: null,
						},
					],
				},
			];

			const expectedEntries = [
				{
					name: "Block 3",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							name: "Part 1",
							startTime: null,
							endTime: null,
							subEntries: [
								{
									name: "Part 1 A",
									startTime: currentTime,
									endTime: currentTime,
									subEntries: null,
								},
								{
									name: "Part 2",
									startTime: currentTime,
									endTime: currentTime,
									subEntries: null,
								},
							],
						},
						{
							name: "Part 2",
							startTime: currentTime,
							endTime: currentTime,
							subEntries: null,
						},
					],
				},
			];

			const updated = removeEntry(entries, entryToRemove);
			expect(updated).toEqual(expectedEntries);
		});

		it("should collapse groups with only one entry on remove", () => {
			const currentTime = moment();
			const entryToRemove = {
				name: "Block 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			};

			const entries = [
				{
					name: "Block 3",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							name: "Part 1",
							startTime: null,
							endTime: null,
							subEntries: [
								{
									name: "Part 1 A",
									startTime: currentTime,
									endTime: currentTime,
									subEntries: null,
								},
								{
									name: "Part 2",
									startTime: currentTime,
									endTime: currentTime,
									subEntries: null,
								},
								entryToRemove,
							],
						},
					],
				},
			];

			const expectedEntries = [
				{
					name: "Block 3",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							name: "Part 1 A",
							startTime: currentTime,
							endTime: currentTime,
							subEntries: null,
						},
						{
							name: "Part 2",
							startTime: currentTime,
							endTime: currentTime,
							subEntries: null,
						},
					],
				},
			];

			const updated = removeEntry(entries, entryToRemove);
			expect(updated).toEqual(expectedEntries);
		});

		it("should collapse groups with only one entry on remove (single)", () => {
			const currentTime = moment();
			const entryToRemove = {
				name: "Block 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			};

			const entries = [
				{
					name: "Block 3",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							name: "Part 1",
							startTime: null,
							endTime: null,
							subEntries: [
								{
									name: "Part 1 A",
									startTime: currentTime,
									endTime: currentTime,
									subEntries: null,
								},
								entryToRemove,
							],
						},
						{
							name: "Part 1",
							startTime: currentTime,
							endTime: currentTime,
							subEntries: null,
						},
					],
				},
			];

			const expectedEntries = [
				{
					name: "Block 3",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							name: "Part 1",
							startTime: currentTime,
							endTime: currentTime,
							subEntries: null,
						},
						{
							name: "Part 1",
							startTime: currentTime,
							endTime: currentTime,
							subEntries: null,
						},
					],
				},
			];

			const updated = removeEntry(entries, entryToRemove);
			expect(updated).toEqual(expectedEntries);
		});
	});

	describe("adding entry", () => {
		it("creating entry should use current time", () => {
			const currentTime = moment();

			const entry = createEntry("Block 1", currentTime);
			expect(entry).toStrictEqual({
				name: "Block 1",
				startTime: currentTime,
				endTime: null,
				subEntries: null,
			});
		});

		it("should add new entry to entries", () => {
			const currentTime = moment();

			const input = [
				{
					name: "Part 1",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
			];

			const expected = [
				{
					name: "Part 1",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
				{
					name: "New Entry",
					startTime: currentTime,
					endTime: null,
					subEntries: null,
				},
			];

			const output = withEntry(input, "New Entry", currentTime);
			expect(output).toEqual(expected);
		});

		it("should generate block name when empty", () => {
			const currentTime = moment();

			const input = [
				{
					name: "Part 1",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
			];

			const expected = [
				{
					name: "Part 1",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
				{
					name: "Block 2",
					startTime: currentTime,
					endTime: null,
					subEntries: null,
				},
			];

			const output = withEntry(input, "", currentTime);
			expect(output).toEqual(expected);
		});
	});

	describe("adding sub entry", () => {
		it("adding first entry should convert to group", () => {
			const currentTime = moment();

			const input = {
				name: "Entry",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			};

			const expected = {
				name: "Entry",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						name: "Part 1",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						name: "New Entry",
						startTime: currentTime,
						endTime: null,
						subEntries: null,
					},
				],
			};

			const output = withSubEntry(input, "New Entry", currentTime);
			expect(output).toEqual(expected);
		});

		it("adding to group should extend sub entries", () => {
			const currentTime = moment();

			const input = {
				name: "Entry",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						name: "Part 1",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						name: "Part 2",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
				],
			};

			const expected = {
				name: "Entry",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						name: "Part 1",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						name: "Part 2",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						name: "New Entry",
						startTime: currentTime,
						endTime: null,
						subEntries: null,
					},
				],
			};

			const output = withSubEntry(input, "New Entry", currentTime);
			expect(output).toEqual(expected);
		});

		it("empty name should generate a part name (single)", () => {
			const currentTime = moment();

			const input = {
				name: "Entry",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			};

			const expected = {
				name: "Entry",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						name: "Part 1",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						name: "Part 2",
						startTime: currentTime,
						endTime: null,
						subEntries: null,
					},
				],
			};

			const output = withSubEntry(input, "", currentTime);
			expect(output).toEqual(expected);
		});

		it("empty name should generate a part name (group)", () => {
			const currentTime = moment();

			const input = {
				name: "Entry",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						name: "Part 1",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						name: "Part 2",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
				],
			};

			const expected = {
				name: "Entry",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						name: "Part 1",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						name: "Part 2",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						name: "Part 3",
						startTime: currentTime,
						endTime: null,
						subEntries: null,
					},
				],
			};

			const output = withSubEntry(input, "", currentTime);
			expect(output).toEqual(expected);
		});
	});

	describe("stopping entries", () => {
		it("should stop running entries", () => {
			const currentTime = moment();
			const endTime = moment().add(15, "hours");

			const input = [
				{
					name: "Entry",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							name: "Part 1",
							startTime: currentTime,
							endTime: currentTime,
							subEntries: null,
						},
						{
							name: "Running Entry",
							startTime: currentTime,
							endTime: null,
							subEntries: null,
						},
					],
				},
				{
					name: "Running Entry",
					startTime: currentTime,
					endTime: null,
					subEntries: null,
				},
			];

			const expected = [
				{
					name: "Entry",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							name: "Part 1",
							startTime: currentTime,
							endTime: currentTime,
							subEntries: null,
						},
						{
							name: "Running Entry",
							startTime: currentTime,
							endTime: endTime,
							subEntries: null,
						},
					],
				},
				{
					name: "Running Entry",
					startTime: currentTime,
					endTime: endTime,
					subEntries: null,
				},
			];

			const output = stopRunningEntries(input, endTime);
			expect(output).toEqual(expected);
		});
	});
});

describe("checking entries", () => {
	it("should show timekeep running", () => {});

	it("should show timekeep stopped", () => {});

	it("should determine entry running state", () => {
		const currentTime = moment();
		expect(
			isEntryRunning({
				name: "Running Entry",
				startTime: currentTime,
				endTime: null,
				subEntries: null,
			})
		).toBe(true);

		expect(
			isEntryRunning({
				name: "Stopped Entry",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			})
		).toBe(false);
	});

	it("should determine entry running state (nested)", () => {
		const currentTime = moment();
		expect(
			isEntryRunning({
				name: "Running Entry",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						name: "Running Entry",
						startTime: currentTime,
						endTime: null,
						subEntries: null,
					},
				],
			})
		).toBe(true);

		expect(
			isEntryRunning({
				name: "Stopped Entry",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						name: "Stopped Entry",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
				],
			})
		).toBe(false);
	});

	it("should find running entry", () => {
		const currentTime = moment();
		const runningEntry = {
			name: "Running Entry",
			startTime: currentTime,
			endTime: null,
			subEntries: null,
		};

		const input = [
			{
				name: "Block 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			runningEntry,
		];

		const output = getRunningEntry(input);

		expect(output).toBe(runningEntry);
	});

	it("should find nested running entry", () => {
		const currentTime = moment();
		const runningEntry = {
			name: "Running Entry",
			startTime: currentTime,
			endTime: null,
			subEntries: null,
		};

		const input = [
			{
				name: "Block 1",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						name: "Part 1",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					runningEntry,
				],
			},
		];

		const output = getRunningEntry(input);

		expect(output).toBe(runningEntry);
	});

	it("should not find running entry", () => {
		const currentTime = moment();

		const input = [
			{
				name: "Block 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				name: "Block 2",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						name: "Part 1",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
				],
			},
		];

		const output = getRunningEntry(input);

		expect(output).toBe(null);
	});

	it("should show keep running", () => {
		const currentTime = moment();
		const runningEntry = {
			name: "Running Entry",
			startTime: currentTime,
			endTime: null,
			subEntries: null,
		};

		const input: Timekeep = {
			entries: [
				{
					name: "Block 1",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							name: "Part 1",
							startTime: currentTime,
							endTime: currentTime,
							subEntries: null,
						},
						runningEntry,
					],
				},
			],
		};

		expect(isKeepRunning(input)).toBe(true);
	});

	it("should show keep not running", () => {
		const currentTime = moment();

		const input: Timekeep = {
			entries: [
				{
					name: "Block 1",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
				{
					name: "Block 2",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							name: "Part 1",
							startTime: currentTime,
							endTime: currentTime,
							subEntries: null,
						},
					],
				},
			],
		};

		expect(isKeepRunning(input)).toBe(false);
	});
});

describe("ordering entries", () => {
	it("should be in reverse order", () => {
		const currentTime = moment();

		const input = [
			{
				name: "Part 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				name: "Part 2",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
		];

		const expected = [
			{
				name: "Part 2",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				name: "Part 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
		];

		const settings: TimekeepSettings = defaultSettings;
		settings.reverseSegmentOrder = true;

		const output = getEntriesOrdered(input, settings);
		expect(output).toEqual(expected);
	});

	it("order should not change", () => {
		const currentTime = moment();

		const input = [
			{
				name: "Part 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				name: "Part 2",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
		];

		const expected = [
			{
				name: "Part 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				name: "Part 2",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
		];

		const settings: TimekeepSettings = defaultSettings;
		settings.reverseSegmentOrder = false;

		const output = getEntriesOrdered(input, settings);
		expect(output).toEqual(expected);
	});
});

describe("hashing", () => {
	it("hash should match when content matches", () => {
		const currentTime = moment();

		const left: TimeEntry = {
			name: "Test",
			startTime: null,
			endTime: null,
			subEntries: [
				{
					name: "Part 1",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
				{
					name: "Part 2",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
			],
		};

		const right: TimeEntry = {
			name: "Test",
			startTime: null,
			endTime: null,
			subEntries: [
				{
					name: "Part 1",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
				{
					name: "Part 2",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
			],
		};

		expect(getUniqueEntryHash(left)).toBe(getUniqueEntryHash(right));
	});

	it("hash shouldn't match when content doesn't", () => {
		const currentTime = moment();

		const left: TimeEntry = {
			name: "Test",
			startTime: currentTime,
			endTime: currentTime,
			subEntries: null,
		};

		const right: TimeEntry = {
			name: "Test",
			startTime: null,
			endTime: null,
			subEntries: [
				{
					name: "Part 1",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
				{
					name: "Part 1",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
			],
		};

		expect(getUniqueEntryHash(left)).not.toBe(getUniqueEntryHash(right));
	});
});

describe("duration", () => {
	it("should get entry duration", () => {
		const currentTime = moment();
		const durationMs = 500;

		const input: TimeEntry = {
			name: "Test",
			startTime: currentTime,
			endTime: currentTime.clone().add(durationMs, "ms"),
			subEntries: null,
		};

		const output = getEntryDuration(input, currentTime);

		expect(output).toBe(durationMs);
	});

	it("duration should include children", () => {
		const currentTime = moment();
		const durationMs = 500;

		const input: TimeEntry = {
			name: "Test",
			startTime: null,
			endTime: null,
			subEntries: [
				{
					name: "Part A",
					startTime: currentTime,
					endTime: currentTime.clone().add(durationMs, "ms"),
					subEntries: null,
				},
				{
					name: "Part B",
					startTime: currentTime,
					endTime: currentTime.clone().add(durationMs, "ms"),
					subEntries: null,
				},
				{
					name: "Part c",
					startTime: currentTime,
					endTime: currentTime.clone().add(durationMs, "ms"),
					subEntries: null,
				},
			],
		};

		const expected = durationMs * 3;

		const output = getEntryDuration(input, currentTime);

		expect(output).toBe(expected);
	});

	it("duration should use current as end for unfinished entries", () => {
		const currentTime = moment();
		const durationMs = 500;
		const endTime = currentTime.clone().add(durationMs, "ms");

		const input: TimeEntry = {
			name: "Test",
			startTime: currentTime,
			endTime: null,
			subEntries: null,
		};

		const output = getEntryDuration(input, endTime);

		expect(output).toBe(durationMs);
	});

	it("should get total duration", () => {
		const currentTime = moment();
		const durationMs = 500;

		const input: TimeEntry[] = [
			{
				name: "Test",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						name: "Part A",
						startTime: currentTime,
						endTime: currentTime.clone().add(durationMs, "ms"),
						subEntries: null,
					},
					{
						name: "Part B",
						startTime: currentTime,
						endTime: currentTime.clone().add(durationMs, "ms"),
						subEntries: null,
					},
					{
						name: "Part c",
						startTime: currentTime,
						endTime: currentTime.clone().add(durationMs, "ms"),
						subEntries: null,
					},
				],
			},
			{
				name: "Test",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						name: "Part A",
						startTime: currentTime,
						endTime: currentTime.clone().add(durationMs, "ms"),
						subEntries: null,
					},
					{
						name: "Part B",
						startTime: currentTime,
						endTime: currentTime.clone().add(durationMs, "ms"),
						subEntries: null,
					},
					{
						name: "Part c",
						startTime: currentTime,
						endTime: currentTime.clone().add(durationMs, "ms"),
						subEntries: null,
					},
				],
			},
		];

		const expected = durationMs * 6;

		const output = getTotalDuration(input, currentTime);

		expect(output).toBe(expected);
	});
});
