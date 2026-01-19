import { stripEntriesRuntimeData } from "./schema";
import { startNewEntry, startNewNestedEntry } from "./start";

describe("startNewEntry", () => {
	it("starting a new entry should stop any running entries", async () => {
		const { currentTime, stopped, name, input, expected } = await import(
			"./__fixtures__/manipulating/start_entry/startShouldStopRunning"
		);

		const output = startNewEntry(name, currentTime, input);
		const stoppedEntry = output.find((entry) => entry.id === stopped);

		expect(stoppedEntry).toBeDefined();
		expect(stoppedEntry!.endTime).not.toBeNull();

		expect(stripEntriesRuntimeData(output)).toEqual(
			stripEntriesRuntimeData(expected)
		);
	});

	it("starting a new entry should add a new entry", async () => {
		const { currentTime, name, input, expected } = await import(
			"./__fixtures__/manipulating/start_entry/startShouldStopRunning"
		);

		const output = startNewEntry(name, currentTime, input);
		expect(stripEntriesRuntimeData(output)).toEqual(
			stripEntriesRuntimeData(expected)
		);
	});
});

describe("startNewNestedEntry", () => {
	it("starting a new entry should stop any running entries", async () => {
		const { currentTime, targetEntry, input, expected } = await import(
			"./__fixtures__/manipulating/start_entry/startNotStartedEntry"
		);

		const output = startNewNestedEntry(currentTime, targetEntry.id, input);
		expect(stripEntriesRuntimeData(output)).toEqual(
			stripEntriesRuntimeData(expected)
		);
	});

	it("starting a new entry within a folder should create a subentry", async () => {
		const { currentTime, targetEntry, input, expected } = await import(
			"./__fixtures__/manipulating/start_entry/startNestedFolderEntry"
		);

		const output = startNewNestedEntry(currentTime, targetEntry.id, input);
		expect(stripEntriesRuntimeData(output)).toEqual(
			stripEntriesRuntimeData(expected)
		);
	});

	it("starting a new entry should stop any running entries", async () => {
		const { currentTime, targetEntry, input, expected } = await import(
			"./__fixtures__/manipulating/start_entry/startNotStartedEntry"
		);

		const output = startNewNestedEntry(currentTime, targetEntry.id, input);
		expect(stripEntriesRuntimeData(output)).toEqual(
			stripEntriesRuntimeData(expected)
		);
	});

	it("starting a new entry should stop any running entries", async () => {
		const { currentTime, targetEntryId, input, expected } = await import(
			"./__fixtures__/manipulating/start_entry/startNestedNonExistent"
		);

		const output = startNewNestedEntry(currentTime, targetEntryId, input);
		expect(stripEntriesRuntimeData(output)).toEqual(
			stripEntriesRuntimeData(expected)
		);
	});

	it("starting a new entry should stop any running entries", async () => {
		const { currentTime, stopped, targetEntry, input, expected } =
			await import(
				"./__fixtures__/manipulating/start_entry/startNestedShouldStopRunning"
			);

		const output = startNewNestedEntry(currentTime, targetEntry.id, input);

		const outerEntry = output[0];
		const stoppedEntry = outerEntry.subEntries?.find(
			(entry) => entry.id === stopped
		);

		expect(stoppedEntry).toBeDefined();
		expect(stoppedEntry!.endTime).not.toBeNull();

		expect(stripEntriesRuntimeData(output)).toEqual(
			stripEntriesRuntimeData(expected)
		);
	});

	it("starting a new entry should add a new entry", async () => {
		const { currentTime, targetEntry, input, expected } = await import(
			"./__fixtures__/manipulating/start_entry/startNestedShouldStopRunning"
		);

		const output = startNewNestedEntry(currentTime, targetEntry.id, input);
		expect(stripEntriesRuntimeData(output)).toEqual(
			stripEntriesRuntimeData(expected)
		);
	});
});
