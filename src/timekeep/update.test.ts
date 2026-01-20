import { TimeEntryGroup } from "./schema";
import {
	updateEntry,
	removeEntry,
	removeSubEntry,
	setEntryCollapsed,
	stopRunningEntries,
} from "./update";

describe("updateEntry", () => {
	it("updating existing entry should succeed", async () => {
		const { entries, entryToUpdate, updatedEntry, expectedEntries } =
			await import(
				"./__fixtures__/manipulating/update_entry/updateEntry"
			);

		const updated = updateEntry(entries, entryToUpdate.id, updatedEntry);
		expect(updated).toEqual(expectedEntries);
	});
});

describe("setEntryCollapsed", () => {
	it("should update group collapse state when set to true", async () => {
		const { input } = await import(
			"./__fixtures__/manipulating/collapse/shouldUpdateCollapseTrue"
		);

		const collapsed = setEntryCollapsed(input, true);

		expect(collapsed.subEntries).not.toBeNull();
		expect((collapsed as TimeEntryGroup).collapsed).toBeDefined();
		expect((collapsed as TimeEntryGroup).collapsed).toBe(true);
	});

	it("collapsed state should be undefined when false", async () => {
		const { input } = await import(
			"./__fixtures__/manipulating/collapse/shouldUpdateCollapseFalse"
		);
		const collapsed = setEntryCollapsed(input, false);

		expect(collapsed.subEntries).not.toBeNull();
		expect((collapsed as TimeEntryGroup).collapsed).toBeUndefined();
	});

	it("should not set collapse state on single entry", async () => {
		const { input } = await import(
			"./__fixtures__/manipulating/collapse/shouldNotCollapseSingleEntry"
		);

		const collapsed = setEntryCollapsed(input, true);

		expect(collapsed.subEntries).toBeNull();
		expect((collapsed as TimeEntryGroup).collapsed).toBeUndefined();
	});
});

describe("stopRunningEntries", () => {
	it("should stop running entries", async () => {
		const { input, endTime, expected } = await import(
			"./__fixtures__/manipulating/stopping_entries/stopRunningEntries"
		);

		const output = stopRunningEntries(input, endTime);
		expect(output).toEqual(expected);
	});
});

describe("removeEntry", () => {
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

	it("should not collapse folder on empty entries", async () => {
		const { entries, entryToRemove, expectedEntries } = await import(
			"./__fixtures__/manipulating/remove_entry/removeEntryFolder"
		);
		const updated = removeEntry(entries, entryToRemove);
		expect(updated).toEqual(expectedEntries);
	});
});

describe("removeSubEntry", () => {
	it("attempting to remove sub entry on non group should do nothing", async () => {
		const { parent, entryToRemove } = await import(
			"./__fixtures__/manipulating/remove_entry/removeEntry"
		);
		const output = removeSubEntry(parent, entryToRemove);
		expect(output).toEqual(parent);
	});
});
