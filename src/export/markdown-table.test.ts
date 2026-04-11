import { describe, expect, it } from "vitest";

import { defaultSettings } from "@/settings";

import { createMarkdownTable } from "./markdown-table";

const normalizeLineEndings = (s: string) => s.replace(/\r\n?/g, "\n");

describe("createMarkdownTable", () => {
	it("should create entry table rows", async () => {
		const { entries, currentTime, output } = await import("./__fixtures__/markdown/tableRows");
		const markdown = createMarkdownTable({ entries }, defaultSettings, currentTime);
		expect(markdown).toEqual(normalizeLineEndings(output));
	});

	it("should flatten group entries", async () => {
		const { entries, currentTime, output } =
			await import("./__fixtures__/markdown/flattenGroupEntries");
		const markdown = createMarkdownTable({ entries }, defaultSettings, currentTime);
		expect(markdown).toEqual(normalizeLineEndings(output));
	});

	it("should use current time for unfinished entries", async () => {
		const { entries, currentTime, output } =
			await import("./__fixtures__/markdown/flattenGroupEntries");

		const markdown = createMarkdownTable({ entries }, defaultSettings, currentTime);
		expect(markdown).toEqual(normalizeLineEndings(output));
	});
});
