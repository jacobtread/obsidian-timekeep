import { describe, expect, it } from "vitest";

import { defaultSettings } from "@/settings";

import { createRawTable } from ".";

describe("createRawTable", () => {
	it("should create entry table rows", async () => {
		const { entries, currentTime, output } = await import("./__fixtures__/raw/tableRows");
		const tableRows = createRawTable(entries, defaultSettings, currentTime);
		expect(tableRows).toEqual(output);
	});

	it("should flatten group entries", async () => {
		const { entries, currentTime, output } =
			await import("./__fixtures__/raw/flattenGroupEntries");
		const tableRows = createRawTable(entries, defaultSettings, currentTime);
		expect(tableRows).toEqual(output);
	});

	it("should use current time for unfinished entries", async () => {
		const { entries, currentTime, output } =
			await import("./__fixtures__/raw/flattenGroupEntries");

		const tableRows = createRawTable(entries, defaultSettings, currentTime);
		expect(tableRows).toEqual(output);
	});
});
