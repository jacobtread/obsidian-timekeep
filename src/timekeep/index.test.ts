import moment from "moment";

import { extractTimekeepCodeblocks } from "./parser";
import {
	SortOrder,
	UnstartedOrder,
	defaultSettings,
	TimekeepSettings,
} from "../settings";
import {
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

describe("manipulating entries", () => {
	describe("update entry", () => {
		it("updating existing entry should succeed", async () => {
			const { entries, entryToUpdate, updatedEntry, expectedEntries } =
				await import(
					"./__fixtures__/manipulating/update_entry/updateEntry"
				);
			const updated = updateEntry(entries, entryToUpdate, updatedEntry);
			expect(updated).toEqual(expectedEntries);
		});
	});

	describe("remove entry", () => {
		it("attempting to remove sub entry on non group should do nothing", async () => {
			const { parent, entryToRemove } = await import(
				"./__fixtures__/manipulating/remove_entry/removeEntry"
			);
			const output = removeSubEntry(parent, entryToRemove);
			expect(output).toEqual(parent);
		});

		it("remove on single entry should stay same if not target", async () => {
			const { entries, entryToRemove, expectedEntries } = await import(
				"./__fixtures__/manipulating/remove_entry/removeSingleEntry"
			);

			const updated = removeEntry(entries, entryToRemove);
			expect(updated).toEqual(expectedEntries);
		});

		it("should be able to remove entry", async () => {
			const { entries, entryToRemove, expectedEntries } = await import(
				"./__fixtures__/manipulating/remove_entry/removeEntrySuccess"
			);
			const updated = removeEntry(entries, entryToRemove);
			expect(updated).toEqual(expectedEntries);
		});

		it("should be able to remove nested entry", async () => {
			const { entries, entryToRemove, expectedEntries } = await import(
				"./__fixtures__/manipulating/remove_entry/removeNestedEntry"
			);
			const updated = removeEntry(entries, entryToRemove);
			expect(updated).toEqual(expectedEntries);
		});

		it("should collapse groups with only one entry on remove", async () => {
			const { entries, entryToRemove, expectedEntries } = await import(
				"./__fixtures__/manipulating/remove_entry/removeEntryCollapse"
			);
			const updated = removeEntry(entries, entryToRemove);
			expect(updated).toEqual(expectedEntries);
		});

		it("should collapse groups with only one entry on remove (single)", async () => {
			const { entries, entryToRemove, expectedEntries } = await import(
				"./__fixtures__/manipulating/remove_entry/removeEntryCollapseSingle"
			);
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

			const output = withEntry(input, "", currentTime);
			expect(stripEntriesRuntimeData(output)).toEqual(
				stripEntriesRuntimeData(expected)
			);
		});
	});

	describe("adding sub entry", () => {
		it("adding first entry should convert to group", async () => {
			const { input, currentTime, expected } = await import(
				"./__fixtures__/manipulating/adding_sub_entry/addConvertToGroup"
			);
			const output = withSubEntry(input, "New Entry", currentTime);
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

	describe("stopping entries", () => {
		it("should stop running entries", async () => {
			const { input, endTime, expected } = await import(
				"./__fixtures__/manipulating/stopping_entries/stopRunningEntries"
			);

			const output = stopRunningEntries(input, endTime);
			expect(output).toEqual(expected);
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
});

describe("checking entries", () => {
	it("should show timekeep running", () => {});

	it("should show timekeep stopped", () => {});

	it("should determine entry running state", async () => {
		const { running, notRunning } = await import(
			"./__fixtures__/checking/runningState"
		);

		expect(isEntryRunning(running)).toBe(true);
		expect(isEntryRunning(notRunning)).toBe(false);
	});

	it("should determine entry running state (nested)", async () => {
		const { runningNested, stoppedNested } = await import(
			"./__fixtures__/checking/runningState"
		);

		expect(isEntryRunning(runningNested)).toBe(true);
		expect(isEntryRunning(stoppedNested)).toBe(false);
	});

	it("should find running entry", async () => {
		const { input, runningEntry } = await import(
			"./__fixtures__/checking/shouldFindRunningEntry"
		);

		const output = getRunningEntry(input);

		expect(output).toBe(runningEntry);
	});

	it("should find nested running entry", async () => {
		const { input, runningEntry } = await import(
			"./__fixtures__/checking/shouldFindRunningEntryNested"
		);

		const output = getRunningEntry(input);

		expect(output).toBe(runningEntry);
	});

	it("should not find running entry", async () => {
		const { input } = await import(
			"./__fixtures__/checking/shouldNotFindRunningEntry"
		);

		const output = getRunningEntry(input);

		expect(output).toBe(null);
	});

	it("should show keep running", async () => {
		const { input } = await import(
			"./__fixtures__/checking/shouldBeRunning"
		);

		expect(isKeepRunning(input)).toBe(true);
	});

	it("should show keep not running", async () => {
		const { input } = await import(
			"./__fixtures__/checking/shouldNotBeRunning"
		);

		expect(isKeepRunning(input)).toBe(false);
	});
});

describe("ordering entries", () => {
	it("should be in reverse order", async () => {
		const { input, expected } = await import(
			"./__fixtures__/ordering/reverseOrder"
		);

		const settings: TimekeepSettings = defaultSettings;
		settings.sortOrder = SortOrder.REVERSE_INSERTION;

		const output = getEntriesSorted(input, settings);
		expect(output).toEqual(expected);
	});

	it("should be in newest first order", async () => {
		const { input, expected } = await import(
			"./__fixtures__/ordering/newestFirstOrder"
		);

		const settings: TimekeepSettings = defaultSettings;
		settings.sortOrder = SortOrder.NEWEST_START;

		const output = getEntriesSorted(input, settings);
		expect(output).toEqual(expected);
	});

	it("should be in newest last order", async () => {
		const { input, expected } = await import(
			"./__fixtures__/ordering/newestLastOrder"
		);

		const settings: TimekeepSettings = defaultSettings;
		settings.sortOrder = SortOrder.OLDEST_START;

		const output = getEntriesSorted(input, settings);
		expect(output).toEqual(expected);
	});

	it("should be in newest last order with nulls first", async () => {
		const { input, expected } = await import(
			"./__fixtures__/ordering/newestLastNullsFirst"
		);

		const settings: TimekeepSettings = defaultSettings;
		settings.sortOrder = SortOrder.OLDEST_START;
		settings.unstartedOrder = UnstartedOrder.FIRST;

		const output = getEntriesSorted(input, settings);
		expect(output).toEqual(expected);
	});

	it("order should not change", async () => {
		const { input, expected } = await import(
			"./__fixtures__/ordering/orderShouldNotChange"
		);

		const settings: TimekeepSettings = defaultSettings;
		settings.sortOrder = SortOrder.INSERTION;

		const output = getEntriesSorted(input, settings);
		expect(output).toEqual(expected);
	});
});

describe("hashing", () => {
	it("hash should match when content matches", async () => {
		const { left, right } = await import(
			"./__fixtures__/hashing/hashMatches"
		);

		expect(getUniqueEntryHash(left)).toBe(getUniqueEntryHash(right));
	});

	it("hash shouldn't match when content doesn't", async () => {
		const { left, right } = await import(
			"./__fixtures__/hashing/hashDoesNotMatch"
		);

		expect(getUniqueEntryHash(left)).not.toBe(getUniqueEntryHash(right));
	});
});

describe("duration", () => {
	it("should get entry duration", async () => {
		const { input, currentTime, durationMs } = await import(
			"./__fixtures__/duration/shouldGetEntryDuration"
		);

		const output = getEntryDuration(input, currentTime);

		expect(output).toBe(durationMs);
	});

	it("duration of non started entry should be zero", async () => {
		const { input, currentTime, durationMs } = await import(
			"./__fixtures__/duration/nonStartedZeroDuration"
		);

		const output = getEntryDuration(input, currentTime);

		expect(output).toBe(durationMs);
	});

	it("duration should include children", async () => {
		const { input, currentTime, expected } = await import(
			"./__fixtures__/duration/durationIncludeChildren"
		);

		const output = getEntryDuration(input, currentTime);

		expect(output).toBe(expected);
	});

	it("duration should use current as end for unfinished entries", async () => {
		const { input, endTime, durationMs } = await import(
			"./__fixtures__/duration/currentEndUnfinished"
		);

		const output = getEntryDuration(input, endTime);

		expect(output).toBe(durationMs);
	});

	it("should get total duration", async () => {
		const { input, currentTime, expected } = await import(
			"./__fixtures__/duration/totalDuration"
		);

		const output = getTotalDuration(input, currentTime);

		expect(output).toBe(expected);
	});
});

describe("extracting code blocks", () => {
	it("should extract codeblock contents", async () => {
		const { text, inputTimekeep1, inputTimekeep2 } = await import(
			"./__fixtures__/extracting/codeblockContents"
		);

		const output = extractTimekeepCodeblocks(text);

		expect(stripTimekeepRuntimeData(output[0])).toStrictEqual(
			stripTimekeepRuntimeData(inputTimekeep1)
		);
		expect(stripTimekeepRuntimeData(output[1])).toStrictEqual(
			stripTimekeepRuntimeData(inputTimekeep2)
		);
		expect(output.length).toBe(2);
	});

	it("should ignore codeblocks that are not closed", async () => {
		const { text, inputTimekeep1 } = await import(
			"./__fixtures__/extracting/unclosedCodeBlock"
		);
		const output = extractTimekeepCodeblocks(text);

		expect(stripTimekeepRuntimeData(output[0])).toStrictEqual(
			stripTimekeepRuntimeData(inputTimekeep1)
		);
		expect(output.length).toBe(1);
	});
});
