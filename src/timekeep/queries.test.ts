import { expect, it, describe } from "vitest";

import {
	getEntryById,
	isKeepRunning,
	getPathToEntry,
	isEntryRunning,
	getRunningEntry,
	getEntryDuration,
	getTotalDuration,
	getEntriesNames,
	getStartTime,
} from "./queries";
import { TimeEntry } from "./schema";

describe("getEntryById", () => {
	it("find top level entry", async () => {
		const { input, targetEntry, targetEntryId } =
			await import("@fixtures/checking/findEntryById");

		const output = getEntryById(targetEntryId, input);
		expect(output).toEqual(targetEntry);
	});

	it("find nested entry", async () => {
		const { input, targetEntry, targetEntryId } =
			await import("@fixtures/checking/findEntryByIdNested");

		const output = getEntryById(targetEntryId, input);
		expect(output).toEqual(targetEntry);
	});

	it("find nested entry second element", async () => {
		const { input, targetEntry, targetEntryId } =
			await import("@fixtures/checking/findEntryByIdNestedSecond");

		const output = getEntryById(targetEntryId, input);
		expect(output).toEqual(targetEntry);
	});

	it("find entry non existent", async () => {
		const { input, targetEntryId } = await import("@fixtures/checking/findEntryByIdMissing");

		const output = getEntryById(targetEntryId, input);
		expect(output).toBeUndefined();
	});

	it("find entry non existent nested", async () => {
		const { input, targetEntryId } =
			await import("@fixtures/checking/findEntryByIdMissingNested");

		const output = getEntryById(targetEntryId, input);
		expect(output).toBeUndefined();
	});
});

describe("getPathToEntry", () => {
	it("path not found", async () => {
		const { targetEntry, entries, expected } = await import("@fixtures/path/pathNotFound");
		const output = getPathToEntry(entries, targetEntry);
		expect(output).toEqual(expected);
	});

	it("top level path found", async () => {
		const { targetEntry, entries, expected } = await import("@fixtures/path/pathTopLevel");
		const output = getPathToEntry(entries, targetEntry);
		expect(output).toEqual(expected);
	});

	it("child path found", async () => {
		const { targetEntry, entries, expected } = await import("@fixtures/path/pathChild");
		const output = getPathToEntry(entries, targetEntry);
		expect(output).toEqual(expected);
	});

	it("deep child path found", async () => {
		const { targetEntry, entries, expected } = await import("@fixtures/path/pathDeepChild");
		const output = getPathToEntry(entries, targetEntry);
		expect(output).toEqual(expected);
	});

	it("deep child path not found", async () => {
		const { targetEntry, entries, expected } = await import("@fixtures/path/pathNotFoundDeep");
		const output = getPathToEntry(entries, targetEntry);
		expect(output).toEqual(expected);
	});

	it("should find running entry path", async () => {
		const { input, runningEntry, path } =
			await import("@fixtures/checking/findRunningEntryPath");

		const output = getPathToEntry(input, runningEntry);
		expect(output).toEqual(path);
	});
});

describe("isEntryRunning", () => {
	it("should determine entry running state", async () => {
		const { running, notRunning } = await import("@fixtures/checking/runningState");

		expect(isEntryRunning(running)).toBe(true);
		expect(isEntryRunning(notRunning)).toBe(false);
	});

	it("should determine entry running state (nested)", async () => {
		const { runningNested, stoppedNested } = await import("@fixtures/checking/runningState");

		expect(isEntryRunning(runningNested)).toBe(true);
		expect(isEntryRunning(stoppedNested)).toBe(false);
	});
});

describe("getRunningEntry", () => {
	it("should find running entry", async () => {
		const { input, runningEntry } = await import("@fixtures/checking/shouldFindRunningEntry");

		const output = getRunningEntry(input);

		expect(output).toBe(runningEntry);
	});

	it("should find nested running entry", async () => {
		const { input, runningEntry } =
			await import("@fixtures/checking/shouldFindRunningEntryNested");

		const output = getRunningEntry(input);

		expect(output).toBe(runningEntry);
	});

	it("should not find running entry", async () => {
		const { input } = await import("@fixtures/checking/shouldNotFindRunningEntry");

		const output = getRunningEntry(input);

		expect(output).toBe(null);
	});
});

describe("isKeepRunning", () => {
	it("should show keep running", async () => {
		const { input } = await import("@fixtures/checking/shouldBeRunning");

		expect(isKeepRunning(input)).toBe(true);
	});

	it("should show keep not running", async () => {
		const { input } = await import("@fixtures/checking/shouldNotBeRunning");

		expect(isKeepRunning(input)).toBe(false);
	});
});

describe("getEntryDuration", () => {
	it("should get entry duration", async () => {
		const { input, currentTime, durationMs } =
			await import("@fixtures/duration/shouldGetEntryDuration");

		const output = getEntryDuration(input, currentTime);

		expect(output).toBe(durationMs);
	});

	it("duration of non started entry should be zero", async () => {
		const { input, currentTime, durationMs } =
			await import("@fixtures/duration/nonStartedZeroDuration");

		const output = getEntryDuration(input, currentTime);

		expect(output).toBe(durationMs);
	});

	it("duration should include children", async () => {
		const { input, currentTime, expected } =
			await import("@fixtures/duration/durationIncludeChildren");

		const output = getEntryDuration(input, currentTime);

		expect(output).toBe(expected);
	});

	it("duration should use current as end for unfinished entries", async () => {
		const { input, endTime, durationMs } =
			await import("@fixtures/duration/currentEndUnfinished");

		const output = getEntryDuration(input, endTime);

		expect(output).toBe(durationMs);
	});
});

describe("getTotalDuration", () => {
	it("should get total duration", async () => {
		const { input, currentTime, expected } = await import("@fixtures/duration/totalDuration");

		const output = getTotalDuration(input, currentTime);

		expect(output).toBe(expected);
	});
});

describe("getEntriesNames", () => {
	it("empty list should return no names", () => {
		const input: TimeEntry[] = [];
		const expected: string[] = [];

		const output = new Set<string>();

		getEntriesNames(input, output);

		// Sort output for consistent result
		const outputSet = Array.from(output).sort();
		expect(outputSet).toEqual(expected);
	});

	it("should return all names from a flat list", async () => {
		const { input, expected } = await import("@fixtures/names/flatNames");

		const output = new Set<string>();

		getEntriesNames(input, output);

		// Sort output for consistent result
		const outputSet = Array.from(output).sort();
		expect(outputSet).toEqual(expected);
	});

	it("should return all names including names from nested entries", async () => {
		const { input, expected } = await import("@fixtures/names/nestedNames");

		const output = new Set<string>();
		getEntriesNames(input, output);

		// Sort output for consistent result
		const outputSet = Array.from(output).sort();
		expect(outputSet).toEqual(expected);
	});
});

describe("getStartTime", () => {
	it("should pick the earliest start time", async () => {
		const { entry, output } = await import("@fixtures/startTime/earlyStartTime");

		expect(getStartTime(entry, false)).toEqual(output);
	});
});
