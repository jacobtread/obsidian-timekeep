import {
	getEntryById,
	isKeepRunning,
	getPathToEntry,
	isEntryRunning,
	getRunningEntry,
	getEntryDuration,
	getTotalDuration,
	getUniqueEntryHash,
} from "./queries";

describe("getEntryById", () => {
	it("find top level entry", async () => {
		const { input, targetEntry, targetEntryId } = await import(
			"./__fixtures__/checking/findEntryById"
		);

		const output = getEntryById(targetEntryId, input);
		expect(output).toEqual(targetEntry);
	});

	it("find nested entry", async () => {
		const { input, targetEntry, targetEntryId } = await import(
			"./__fixtures__/checking/findEntryByIdNested"
		);

		const output = getEntryById(targetEntryId, input);
		expect(output).toEqual(targetEntry);
	});

	it("find entry non existent", async () => {
		const { input, targetEntryId } = await import(
			"./__fixtures__/checking/findEntryByIdMissing"
		);

		const output = getEntryById(targetEntryId, input);
		expect(output).toBeUndefined();
	});
});

describe("getPathToEntry", () => {
	it("path not found", async () => {
		const { targetEntry, entries, expected } = await import(
			"./__fixtures__/path/pathNotFound"
		);
		const output = getPathToEntry(entries, targetEntry);
		expect(output).toEqual(expected);
	});

	it("top level path found", () => {});

	it("deep path found", () => {});

	it("should find running entry path", async () => {
		const { input, runningEntry, path } = await import(
			"./__fixtures__/checking/findRunningEntryPath"
		);

		const output = getPathToEntry(input, runningEntry);
		expect(output).toEqual(path);
	});
});

describe("isEntryRunning", () => {
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
});

describe("getRunningEntry", () => {
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
});

describe("isKeepRunning", () => {
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

describe("getEntryDuration", () => {
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
});

describe("getTotalDuration", () => {
	it("should get total duration", async () => {
		const { input, currentTime, expected } = await import(
			"./__fixtures__/duration/totalDuration"
		);

		const output = getTotalDuration(input, currentTime);

		expect(output).toBe(expected);
	});
});

describe("getUniqueEntryHash", () => {
	it("hash should match when content matches", async () => {
		const { left, right } = await import(
			"./__fixtures__/hashing/hashMatches"
		);

		expect(getUniqueEntryHash(left)).toBe(getUniqueEntryHash(right));
	});

	it("hash shouldn't match when content is different", async () => {
		const { left, right } = await import(
			"./__fixtures__/hashing/hashDoesNotMatch"
		);

		expect(getUniqueEntryHash(left)).not.toBe(getUniqueEntryHash(right));
	});
});
