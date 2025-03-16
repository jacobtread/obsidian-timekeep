import moment from "moment";

import { extractTimekeepCodeblocks } from "./parser";
import {
	SortOrder,
	UnstartedOrder,
	defaultSettings,
	TimekeepSettings,
} from "../settings";
import {
	Timekeep,
	TimeEntry,
	TimeEntryGroup,
	stripEntryRuntimeData,
	stripEntriesRuntimeData,
	stripTimekeepRuntimeData,
} from "./schema";
import {
	withEntry,
	createEntry,
	removeEntry,
	updateEntry,
	withSubEntry,
	isKeepRunning,
	isEntryRunning,
	removeSubEntry,
	getRunningEntry,
	getEntryDuration,
	getTotalDuration,
	getEntriesSorted,
	setEntryCollapsed,
	getUniqueEntryHash,
	stopRunningEntries,
} from "./index";

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
	output += "```timekeep\n";
	output += json;
	output += "\n```";
	for (let i = 0; i < linesAfter; i++) {
		output += "\n";
	}
	return output;
};

describe("manipulating entries", () => {
	describe("update entry", () => {
		it("updating existing entry should succeed", () => {
			const currentTime = moment();
			const entryToUpdate = {
				id: "5054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Block 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			};

			const updatedEntry = {
				id: "5054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Block 1 Updated",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			};

			const entries = [
				{
					id: "9054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Block 3",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
				{
					id: "8054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Block 3",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							id: "7054dee3-8c15-493b-ad31-f070e08c2699",
							name: "Part 1",
							startTime: currentTime,
							endTime: currentTime,
							subEntries: null,
						},
					],
				},
				entryToUpdate,
				{
					id: "6054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Block 2",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
			];

			const expectedEntries = [
				{
					id: "9054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Block 3",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
				{
					id: "8054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Block 3",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							id: "7054dee3-8c15-493b-ad31-f070e08c2699",
							name: "Part 1",
							startTime: currentTime,
							endTime: currentTime,
							subEntries: null,
						},
					],
				},
				updatedEntry,
				{
					id: "6054dee3-8c15-493b-ad31-f070e08c2699",
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
				id: "49b99108-b1ad-4355-baa9-89c49c342be2",
				name: "Block 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			};

			const entryToRemove = {
				id: "49b99108-b1ad-4355-baa9-89c49c342be2",
				name: "Block 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			};

			const output = removeSubEntry(parent, entryToRemove);
			expect(output).toEqual(parent);
		});

		it("remove on single entry should stay same if not target", () => {
			const currentTime = moment();
			const entryToRemove = {
				id: "49b99108-b1ad-4355-baa9-89c49c342be2",
				name: "Block 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			};

			const entries = [
				{
					id: "eeab0abb-8038-4c65-8b89-1e6daa994549",
					name: "Block 3",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
				{
					id: "b8fbcb98-f1e9-4d80-8867-994f58191046",
					name: "Block 2",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							id: "76c19eb4-6bd1-49ac-bb63-68d6ef6335b8",
							name: "Block 3",
							startTime: currentTime,
							endTime: currentTime,
							subEntries: null,
						},
						{
							id: "74850306-d21e-41c3-a046-0057c03b950b",
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
					id: "eeab0abb-8038-4c65-8b89-1e6daa994549",
					name: "Block 3",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
				{
					id: "b8fbcb98-f1e9-4d80-8867-994f58191046",
					name: "Block 2",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							id: "76c19eb4-6bd1-49ac-bb63-68d6ef6335b8",
							name: "Block 3",
							startTime: currentTime,
							endTime: currentTime,
							subEntries: null,
						},
						{
							id: "74850306-d21e-41c3-a046-0057c03b950b",
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
				id: "76c19eb4-6bd1-49ac-bb63-68d6ef6335b8",
				name: "Block 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			};

			const entries = [
				{
					id: "74850306-d21e-41c3-a046-0057c03b950b",
					name: "Block 3",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
				entryToRemove,
				{
					id: "b8fbcb98-f1e9-4d80-8867-994f58191046",
					name: "Block 2",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
			];

			const expectedEntries = [
				{
					id: "74850306-d21e-41c3-a046-0057c03b950b",
					name: "Block 3",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
				{
					id: "b8fbcb98-f1e9-4d80-8867-994f58191046",
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
				id: "76c19eb4-6bd1-49ac-bb63-68d6ef6335b8",
				name: "Block 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			};

			const entries = [
				{
					id: "9054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Block 3",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							id: "a3b4c0ca-9a9f-4b2c-8363-75c82bae692f",
							name: "Part 1",
							startTime: null,
							endTime: null,
							subEntries: [
								{
									id: "dc376d49-9ac6-4a27-adff-a4666f0031b4",
									name: "Part 1 A",
									startTime: currentTime,
									endTime: currentTime,
									subEntries: null,
								},
								{
									id: "a261164c-3456-420e-a773-37353f22450a",
									name: "Part 2",
									startTime: currentTime,
									endTime: currentTime,
									subEntries: null,
								},
								entryToRemove,
							],
						},
						{
							id: "f0ef900f-fa45-4031-94a4-b9290c8e655b",
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
					id: "9054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Block 3",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							id: "a3b4c0ca-9a9f-4b2c-8363-75c82bae692f",
							name: "Part 1",
							startTime: null,
							endTime: null,
							subEntries: [
								{
									id: "dc376d49-9ac6-4a27-adff-a4666f0031b4",
									name: "Part 1 A",
									startTime: currentTime,
									endTime: currentTime,
									subEntries: null,
								},
								{
									id: "a261164c-3456-420e-a773-37353f22450a",
									name: "Part 2",
									startTime: currentTime,
									endTime: currentTime,
									subEntries: null,
								},
							],
						},
						{
							id: "f0ef900f-fa45-4031-94a4-b9290c8e655b",
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
				id: "9054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Block 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			};

			const entries = [
				{
					id: "8054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Block 3",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							id: "7054dee3-8c15-493b-ad31-f070e08c2699",
							name: "Part 1",
							startTime: null,
							endTime: null,
							subEntries: [
								{
									id: "6054dee3-8c15-493b-ad31-f070e08c2699",
									name: "Part 1 A",
									startTime: currentTime,
									endTime: currentTime,
									subEntries: null,
								},
								{
									id: "5054dee3-8c15-493b-ad31-f070e08c2699",
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
					id: "8054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Block 3",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							id: "6054dee3-8c15-493b-ad31-f070e08c2699",
							name: "Part 1 A",
							startTime: currentTime,
							endTime: currentTime,
							subEntries: null,
						},
						{
							id: "5054dee3-8c15-493b-ad31-f070e08c2699",
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
				id: "9054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Block 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			};

			const entries = [
				{
					id: "8054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Block 3",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							id: "7054dee3-8c15-493b-ad31-f070e08c2699",
							name: "Part 1",
							startTime: null,
							endTime: null,
							subEntries: [
								{
									id: "6054dee3-8c15-493b-ad31-f070e08c2699",
									name: "Part 1 A",
									startTime: currentTime,
									endTime: currentTime,
									subEntries: null,
								},
								entryToRemove,
							],
						},
						{
							id: "5054dee3-8c15-493b-ad31-f070e08c2699",
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
					id: "8054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Block 3",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							id: "7054dee3-8c15-493b-ad31-f070e08c2699",
							name: "Part 1",
							startTime: currentTime,
							endTime: currentTime,
							subEntries: null,
						},
						{
							id: "5054dee3-8c15-493b-ad31-f070e08c2699",
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
			expect(stripEntryRuntimeData(entry)).toStrictEqual({
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
					id: "9054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Part 1",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
			];

			const expected = [
				{
					id: "9054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Part 1",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
				{
					id: "8054dee3-8c15-493b-ad31-f070e08c2699",
					name: "New Entry",
					startTime: currentTime,
					endTime: null,
					subEntries: null,
				},
			];

			const output = withEntry(input, "New Entry", currentTime);
			expect(stripEntriesRuntimeData(output)).toEqual(
				stripEntriesRuntimeData(expected)
			);
		});

		it("should generate block name when empty", () => {
			const currentTime = moment();

			const input = [
				{
					id: "9054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Part 1",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
			];

			const expected = [
				{
					id: "9054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Part 1",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
				{
					id: "8054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Block 2",
					startTime: currentTime,
					endTime: null,
					subEntries: null,
				},
			];

			const output = withEntry(input, "", currentTime);
			expect(stripEntriesRuntimeData(output)).toEqual(
				stripEntriesRuntimeData(expected)
			);
		});
	});

	describe("adding sub entry", () => {
		it("adding first entry should convert to group", () => {
			const currentTime = moment();

			const input = {
				id: "9054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Entry",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			};

			const expected = {
				id: "9054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Entry",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: "8054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 1",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						id: "7054dee3-8c15-493b-ad31-f070e08c2699",
						name: "New Entry",
						startTime: currentTime,
						endTime: null,
						subEntries: null,
					},
				],
			};

			const output = withSubEntry(input, "New Entry", currentTime);
			expect(stripEntryRuntimeData(output)).toEqual(
				stripEntryRuntimeData(expected)
			);
		});

		it("adding to group should extend sub entries", () => {
			const currentTime = moment();

			const input = {
				id: "9054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Entry",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: "8054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 1",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						id: "7054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 2",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
				],
			};

			const expected = {
				id: "9054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Entry",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: "8054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 1",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						id: "7054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 2",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						id: "6054dee3-8c15-493b-ad31-f070e08c2699",
						name: "New Entry",
						startTime: currentTime,
						endTime: null,
						subEntries: null,
					},
				],
			};

			const output = withSubEntry(input, "New Entry", currentTime);
			expect(stripEntryRuntimeData(output)).toEqual(
				stripEntryRuntimeData(expected)
			);
		});

		it("empty name should generate a part name (single)", () => {
			const currentTime = moment();

			const input = {
				id: "9054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Entry",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			};

			const expected = {
				id: "9054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Entry",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: "8054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 1",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						id: "7054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 2",
						startTime: currentTime,
						endTime: null,
						subEntries: null,
					},
				],
			};

			const output = withSubEntry(input, "", currentTime);
			expect(stripEntryRuntimeData(output)).toEqual(
				stripEntryRuntimeData(expected)
			);
		});

		it("empty name should generate a part name (group)", () => {
			const currentTime = moment();

			const input = {
				id: "9054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Entry",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: "8054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 1",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						id: "7054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 2",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
				],
			};

			const expected = {
				id: "9054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Entry",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: "8054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 1",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						id: "7054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 2",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						id: "6054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 3",
						startTime: currentTime,
						endTime: null,
						subEntries: null,
					},
				],
			};

			const output = withSubEntry(input, "", currentTime);
			expect(stripEntryRuntimeData(output)).toEqual(
				stripEntryRuntimeData(expected)
			);
		});
	});

	describe("stopping entries", () => {
		it("should stop running entries", () => {
			const currentTime = moment();
			const endTime = moment().add(15, "hours");

			const input = [
				{
					id: "9054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Entry",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							id: "8054dee3-8c15-493b-ad31-f070e08c2699",
							name: "Part 1",
							startTime: currentTime,
							endTime: currentTime,
							subEntries: null,
						},
						{
							id: "7054dee3-8c15-493b-ad31-f070e08c2699",
							name: "Running Entry",
							startTime: currentTime,
							endTime: null,
							subEntries: null,
						},
					],
				},
				{
					id: "6054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Running Entry",
					startTime: currentTime,
					endTime: null,
					subEntries: null,
				},
			];

			const expected = [
				{
					id: "9054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Entry",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							id: "8054dee3-8c15-493b-ad31-f070e08c2699",
							name: "Part 1",
							startTime: currentTime,
							endTime: currentTime,
							subEntries: null,
						},
						{
							id: "7054dee3-8c15-493b-ad31-f070e08c2699",
							name: "Running Entry",
							startTime: currentTime,
							endTime: endTime,
							subEntries: null,
						},
					],
				},
				{
					id: "6054dee3-8c15-493b-ad31-f070e08c2699",
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
				id: "9054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Running Entry",
				startTime: currentTime,
				endTime: null,
				subEntries: null,
			})
		).toBe(true);

		expect(
			isEntryRunning({
				id: "8054dee3-8c15-493b-ad31-f070e08c2699",
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
				id: "9054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Running Entry",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: "8054dee3-8c15-493b-ad31-f070e08c2699",
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
				id: "9054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Stopped Entry",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: "8054dee3-8c15-493b-ad31-f070e08c2699",
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
			id: "9054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Running Entry",
			startTime: currentTime,
			endTime: null,
			subEntries: null,
		};

		const input = [
			{
				id: "8054dee3-8c15-493b-ad31-f070e08c2699",
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
			id: "9054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Running Entry",
			startTime: currentTime,
			endTime: null,
			subEntries: null,
		};

		const input = [
			{
				id: "8054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Block 1",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: "7054dee3-8c15-493b-ad31-f070e08c2699",
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
				id: "9054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Block 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: "8054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Block 2",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: "7054dee3-8c15-493b-ad31-f070e08c2699",
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
			id: "9054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Running Entry",
			startTime: currentTime,
			endTime: null,
			subEntries: null,
		};

		const input: Timekeep = {
			entries: [
				{
					id: "8054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Block 1",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							id: "7054dee3-8c15-493b-ad31-f070e08c2699",
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
					id: "9054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Block 1",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
				{
					id: "8054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Block 2",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							id: "7054dee3-8c15-493b-ad31-f070e08c2699",
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
				id: "9054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: "8054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 2",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: "7054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 3",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: "6054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 3 1",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						id: "5054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 3 2",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
				],
			},
		];

		const expected = [
			{
				id: "7054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 3",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: "5054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 3 2",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						id: "6054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 3 1",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
				],
			},
			{
				id: "8054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 2",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: "9054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
		];

		const settings: TimekeepSettings = defaultSettings;
		settings.sortOrder = SortOrder.REVERSE_INSERTION;

		const output = getEntriesSorted(input, settings);
		expect(output).toEqual(expected);
	});

	it("should be in newest first order", () => {
		const currentTime = moment();

		const futureStartTime = currentTime.clone().add(5000, "ms");

		const input = [
			{
				id: "9054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: "8054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 1 null",
				startTime: null,
				endTime: null,
				subEntries: null,
			},
			{
				id: "7054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 2 null",
				startTime: null,
				endTime: null,
				subEntries: null,
			},
			{
				id: "6054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 2",
				startTime: futureStartTime,
				endTime: futureStartTime,
				subEntries: null,
			},
			{
				id: "5054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 3",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: "4054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 3 1",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						id: "3054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 3 2",
						startTime: futureStartTime,
						endTime: futureStartTime,
						subEntries: null,
					},
				],
			},
		];

		const expected = [
			{
				id: "6054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 2",
				startTime: futureStartTime,
				endTime: futureStartTime,
				subEntries: null,
			},
			{
				id: "9054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: "5054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 3",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: "3054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 3 2",
						startTime: futureStartTime,
						endTime: futureStartTime,
						subEntries: null,
					},
					{
						id: "4054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 3 1",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
				],
			},
			{
				id: "8054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 1 null",
				startTime: null,
				endTime: null,
				subEntries: null,
			},
			{
				id: "7054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 2 null",
				startTime: null,
				endTime: null,
				subEntries: null,
			},
		];

		const settings: TimekeepSettings = defaultSettings;
		settings.sortOrder = SortOrder.NEWEST_START;

		const output = getEntriesSorted(input, settings);
		expect(output).toEqual(expected);
	});

	it("should be in newest last order", () => {
		const currentTime = moment();

		const futureStartTime = currentTime.clone().add(5000, "ms");

		const input = [
			{
				id: "9054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: "8054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 2",
				startTime: futureStartTime,
				endTime: futureStartTime,
				subEntries: null,
			},
			{
				id: "7054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 1 null",
				startTime: null,
				endTime: null,
				subEntries: null,
			},
			{
				id: "6054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 3",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: "5054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 3 1",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						id: "4054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 3 2",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
				],
			},
		];

		const expected = [
			{
				id: "9054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: "6054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 3",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: "5054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 3 1",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						id: "4054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 3 2",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
				],
			},
			{
				id: "8054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 2",
				startTime: futureStartTime,
				endTime: futureStartTime,
				subEntries: null,
			},
			{
				id: "7054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 1 null",
				startTime: null,
				endTime: null,
				subEntries: null,
			},
		];

		const settings: TimekeepSettings = defaultSettings;
		settings.sortOrder = SortOrder.OLDEST_START;

		const output = getEntriesSorted(input, settings);
		expect(output).toEqual(expected);
	});
	it("should be in newest last order with nulls first", () => {
		const currentTime = moment();

		const futureStartTime = currentTime.clone().add(5000, "ms");

		const input = [
			{
				id: "9054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 2 null",
				startTime: null,
				endTime: null,
				subEntries: null,
			},
			{
				id: "8054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: "7054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 2",
				startTime: futureStartTime,
				endTime: futureStartTime,
				subEntries: null,
			},
			{
				id: "6054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 1 null",
				startTime: null,
				endTime: null,
				subEntries: null,
			},
			{
				id: "5054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 3",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: "454dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 3 1",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						id: "3054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 3 2",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
				],
			},
		];

		const expected = [
			{
				id: "9054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 2 null",
				startTime: null,
				endTime: null,
				subEntries: null,
			},
			{
				id: "6054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 1 null",
				startTime: null,
				endTime: null,
				subEntries: null,
			},
			{
				id: "8054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: "5054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 3",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: "454dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 3 1",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
					{
						id: "3054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part 3 2",
						startTime: currentTime,
						endTime: currentTime,
						subEntries: null,
					},
				],
			},
			{
				id: "7054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 2",
				startTime: futureStartTime,
				endTime: futureStartTime,
				subEntries: null,
			},
		];

		const settings: TimekeepSettings = defaultSettings;
		settings.sortOrder = SortOrder.OLDEST_START;
		settings.unstartedOrder = UnstartedOrder.FIRST;

		const output = getEntriesSorted(input, settings);
		expect(output).toEqual(expected);
	});

	it("order should not change", () => {
		const currentTime = moment();

		const input = [
			{
				id: "9054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: "8054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 2",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
		];

		const expected = [
			{
				id: "9054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 1",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
			{
				id: "8054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Part 2",
				startTime: currentTime,
				endTime: currentTime,
				subEntries: null,
			},
		];

		const settings: TimekeepSettings = defaultSettings;
		settings.sortOrder = SortOrder.INSERTION;

		const output = getEntriesSorted(input, settings);
		expect(output).toEqual(expected);
	});
});

describe("hashing", () => {
	it("hash should match when content matches", () => {
		const currentTime = moment();

		const left: TimeEntry = {
			id: "9054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Test",
			startTime: null,
			endTime: null,
			subEntries: [
				{
					id: "8054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Part 1",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
				{
					id: "7054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Part 2",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
			],
		};

		const right: TimeEntry = {
			id: "9054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Test",
			startTime: null,
			endTime: null,
			subEntries: [
				{
					id: "8054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Part 1",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
				{
					id: "7054dee3-8c15-493b-ad31-f070e08c2699",
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
			id: "9054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Test",
			startTime: currentTime,
			endTime: currentTime,
			subEntries: null,
		};

		const right: TimeEntry = {
			id: "9054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Test",
			startTime: null,
			endTime: null,
			subEntries: [
				{
					id: "8054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Part 1",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
				{
					id: "7054dee3-8c15-493b-ad31-f070e08c2699",
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
			id: "9054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Test",
			startTime: currentTime,
			endTime: currentTime.clone().add(durationMs, "ms"),
			subEntries: null,
		};

		const output = getEntryDuration(input, currentTime);

		expect(output).toBe(durationMs);
	});

	it("duration of non started entry should be zero", () => {
		const currentTime = moment();
		const durationMs = 0;

		const input: TimeEntry = {
			id: "9054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Test",
			startTime: null,
			endTime: null,
			subEntries: null,
		};

		const output = getEntryDuration(input, currentTime);

		expect(output).toBe(durationMs);
	});

	it("duration should include children", () => {
		const currentTime = moment();
		const durationMs = 500;

		const input: TimeEntry = {
			id: "9054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Test",
			startTime: null,
			endTime: null,
			subEntries: [
				{
					id: "8054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Part A",
					startTime: currentTime,
					endTime: currentTime.clone().add(durationMs, "ms"),
					subEntries: null,
				},
				{
					id: "7054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Part B",
					startTime: currentTime,
					endTime: currentTime.clone().add(durationMs, "ms"),
					subEntries: null,
				},
				{
					id: "6054dee3-8c15-493b-ad31-f070e08c2699",
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
			id: "9054dee3-8c15-493b-ad31-f070e08c2699",
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
				id: "9054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Test",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: "8054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part A",
						startTime: currentTime,
						endTime: currentTime.clone().add(durationMs, "ms"),
						subEntries: null,
					},
					{
						id: "7054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part B",
						startTime: currentTime,
						endTime: currentTime.clone().add(durationMs, "ms"),
						subEntries: null,
					},
					{
						id: "6054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part c",
						startTime: currentTime,
						endTime: currentTime.clone().add(durationMs, "ms"),
						subEntries: null,
					},
				],
			},
			{
				id: "5054dee3-8c15-493b-ad31-f070e08c2699",
				name: "Test",
				startTime: null,
				endTime: null,
				subEntries: [
					{
						id: "4054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part A",
						startTime: currentTime,
						endTime: currentTime.clone().add(durationMs, "ms"),
						subEntries: null,
					},
					{
						id: "3054dee3-8c15-493b-ad31-f070e08c2699",
						name: "Part B",
						startTime: currentTime,
						endTime: currentTime.clone().add(durationMs, "ms"),
						subEntries: null,
					},
					{
						id: "2054dee3-8c15-493b-ad31-f070e08c2699",
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

describe("extracting code blocks", () => {
	it("should extract codeblock contents", () => {
		// Input data to find
		const input1 = createCodeBlock(
			`{"entries":[{"name":"Block 1","startTime":"2024-03-17T01:33:51.630Z","endTime":"2024-03-17T01:33:55.151Z","subEntries":null}]}`,
			4,
			4
		);

		// Input data to find
		const input2 = createCodeBlock(
			`{"entries":[{"name":"Block 2","startTime":"2024-03-17T01:33:51.630Z","endTime":"2024-03-17T01:33:55.151Z","subEntries":null}]}`,
			4,
			4
		);

		// Timekeep with a renamed block
		const inputTimekeep1: Timekeep = {
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
		const inputTimekeep2: Timekeep = {
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

		const text = "\n\n\n" + input1 + "\n\n\n\n" + input2;

		const output = extractTimekeepCodeblocks(text);

		expect(stripTimekeepRuntimeData(output[0])).toStrictEqual(
			stripTimekeepRuntimeData(inputTimekeep1)
		);
		expect(stripTimekeepRuntimeData(output[1])).toStrictEqual(
			stripTimekeepRuntimeData(inputTimekeep2)
		);
		expect(output.length).toBe(2);
	});

	it("should ignore codeblocks that are not closed", () => {
		// Input data to find
		const input1 = createCodeBlock(
			`{"entries":[{"name":"Block 1","startTime":"2024-03-17T01:33:51.630Z","endTime":"2024-03-17T01:33:55.151Z","subEntries":null}]}`,
			4,
			4
		);

		// Timekeep with a renamed block
		const inputTimekeep1: Timekeep = {
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

		const text = "\n\n\n" + input1 + "\n\n\n\n```timekeep\n\n";

		const output = extractTimekeepCodeblocks(text);

		expect(stripTimekeepRuntimeData(output[0])).toStrictEqual(
			stripTimekeepRuntimeData(inputTimekeep1)
		);
		expect(output.length).toBe(1);
	});
});

describe("collapse state", () => {
	it("should update group collapse state when set to true", () => {
		const currentTime = moment();

		const input: TimeEntryGroup = {
			id: "9054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Test",
			startTime: null,
			endTime: null,
			subEntries: [
				{
					id: "8054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Test",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
			],
		};

		const collapsed = setEntryCollapsed(input, true);

		expect(collapsed.subEntries).not.toBeNull();
		expect((collapsed as TimeEntryGroup).collapsed).toBeDefined();
		expect((collapsed as TimeEntryGroup).collapsed).toBe(true);
	});

	it("collapsed state should be undefined when false", () => {
		const currentTime = moment();

		const input: TimeEntryGroup = {
			id: "9054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Test",
			startTime: null,
			endTime: null,
			subEntries: [
				{
					id: "8054dee3-8c15-493b-ad31-f070e08c2699",
					name: "Test",
					startTime: currentTime,
					endTime: currentTime,
					subEntries: null,
				},
			],
		};

		const collapsed = setEntryCollapsed(input, false);

		expect(collapsed.subEntries).not.toBeNull();
		expect((collapsed as TimeEntryGroup).collapsed).toBeUndefined();
	});

	it("should not set collapse state on single entry", () => {
		const currentTime = moment();

		const input: TimeEntry = {
			id: "9054dee3-8c15-493b-ad31-f070e08c2699",
			name: "Test",
			startTime: currentTime,
			endTime: currentTime,
			subEntries: null,
		};

		const collapsed = setEntryCollapsed(input, true);

		expect(collapsed.subEntries).toBeNull();
		expect((collapsed as TimeEntryGroup).collapsed).toBeUndefined();
	});
});
