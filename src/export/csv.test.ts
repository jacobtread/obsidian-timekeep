import { describe, expect, it } from "vitest";

import { defaultSettings } from "@/settings";

import { createCSV } from "./csv";

const normalizeLineEndings = (s: string) => s.replace(/\r\n?/g, "\n");

describe("createCSV", () => {
	it("should create entry table rows", async () => {
		const { entries, currentTime, output } = await import("./__fixtures__/csv/tableRows");
		const csv = createCSV({ entries }, defaultSettings, currentTime);
		expect(csv).toEqual(normalizeLineEndings(output));
	});

	it("should flatten group entries", async () => {
		const { entries, currentTime, output } =
			await import("./__fixtures__/csv/flattenGroupEntries");
		const csv = createCSV({ entries }, defaultSettings, currentTime);
		expect(csv).toEqual(normalizeLineEndings(output));
	});

	it("should use current time for unfinished entries", async () => {
		const { entries, currentTime, output } =
			await import("./__fixtures__/csv/flattenGroupEntries");

		const csv = createCSV({ entries }, defaultSettings, currentTime);
		expect(csv).toEqual(normalizeLineEndings(output));
	});
});
