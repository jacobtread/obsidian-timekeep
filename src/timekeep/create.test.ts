import moment from "moment";

import { withEntry, createEntry, withSubEntry } from "./create";
import { stripEntryRuntimeData, stripEntriesRuntimeData } from "./schema";

describe("createEntry", () => {
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

	it("each created entry should have a unique id", () => {
		const currentTime = moment();

		const entry1 = createEntry("Block 1", currentTime);
		const entry2 = createEntry("Block 2", currentTime);
		expect(entry1.id).not.toBe(entry2.id);
	});
});

describe("withEntry", () => {
	it("should add new entry to entries", async () => {
		const { input, currentTime, expected } = await import(
			"./__fixtures__/manipulating/adding_entry/addNewEntry"
		);
		const output = withEntry(input, "New Entry", currentTime);
		expect(stripEntriesRuntimeData(output)).toEqual(
			stripEntriesRuntimeData(expected)
		);
	});

	it("should generate block name when empty", async () => {
		const { input, currentTime, expected } = await import(
			"./__fixtures__/manipulating/adding_entry/addEmptyBlockName"
		);

		const output1 = withEntry(input, "", currentTime);
		expect(stripEntriesRuntimeData(output1)).toEqual(
			stripEntriesRuntimeData(expected)
		);

		// Empty whitespace string should also count as an empty name
		const output2 = withEntry(input, " ".repeat(5), currentTime);
		expect(stripEntriesRuntimeData(output2)).toEqual(
			stripEntriesRuntimeData(expected)
		);
	});

	it("should maintain existing entries when adding to a list", async () => {
		const { input, currentTime, expected } = await import(
			"./__fixtures__/manipulating/adding_entry/addEntryToList"
		);

		const output = withEntry(input, "New Test Entry", currentTime);
		expect(stripEntriesRuntimeData(output)).toEqual(
			stripEntriesRuntimeData(expected)
		);
	});
});

describe("withSubEntry", () => {
	it("adding first entry should convert to group", async () => {
		const { input, currentTime, expected } = await import(
			"./__fixtures__/manipulating/adding_sub_entry/addConvertToGroup"
		);
		const output = withSubEntry(input, "New Entry", currentTime);
		expect(stripEntryRuntimeData(output)).toEqual(
			stripEntryRuntimeData(expected)
		);
	});

	it("adding first entry for folder should populate subentries", async () => {
		const { input, currentTime, expected } = await import(
			"./__fixtures__/manipulating/adding_sub_entry/addFolderPopulateSubEntries"
		);
		const output = withSubEntry(input, "New Entry", currentTime);
		expect(stripEntryRuntimeData(output)).toEqual(
			stripEntryRuntimeData(expected)
		);
	});

	it("adding first entry for folder should extend subentries", async () => {
		const { input, currentTime, expected } = await import(
			"./__fixtures__/manipulating/adding_sub_entry/addFolderExtendSubEntries"
		);
		const output = withSubEntry(input, "New Entry 2", currentTime);
		expect(stripEntryRuntimeData(output)).toEqual(
			stripEntryRuntimeData(expected)
		);
	});

	it("adding to group should extend sub entries", async () => {
		const { input, currentTime, expected } = await import(
			"./__fixtures__/manipulating/adding_sub_entry/addToGroupExtendSubEntries"
		);

		const output = withSubEntry(input, "New Entry", currentTime);
		expect(stripEntryRuntimeData(output)).toEqual(
			stripEntryRuntimeData(expected)
		);
	});

	it("empty name should generate a part name (single)", async () => {
		const { input, currentTime, expected } = await import(
			"./__fixtures__/manipulating/adding_sub_entry/emptyNameCreatePartNameSingle"
		);

		const output = withSubEntry(input, "", currentTime);
		expect(stripEntryRuntimeData(output)).toEqual(
			stripEntryRuntimeData(expected)
		);
	});

	it("empty name should generate a part name (group)", async () => {
		const { input, currentTime, expected } = await import(
			"./__fixtures__/manipulating/adding_sub_entry/emptyNameCreatePartNameGroup"
		);

		const output = withSubEntry(input, "", currentTime);
		expect(stripEntryRuntimeData(output)).toEqual(
			stripEntryRuntimeData(expected)
		);
	});
});
