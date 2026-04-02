import type { App } from "obsidian";

import { describe, vi, it, expect } from "vitest";

import {
	MockComponent,
	MockNotice,
	MockTAbstractFile,
	MockTFile,
	MockTFolder,
	MockVault,
} from "@/__mocks__/obsidian";

import stopAllTimekeeps from "./stopAllTimekeeps";

vi.mock("obsidian", () => {
	return {
		TFile: MockTFile,
		TFolder: MockTFolder,
		TAbstractFile: MockTAbstractFile,
		Vault: MockVault,
		Component: MockComponent,
		Notice: MockNotice,
	};
});

describe("stopFileTimekeeps", () => {
	it("when nothing is stopped should get a notice", async () => {
		const vault = new MockVault();
		const app = {
			vault: vault.asVault(),
		} as App;

		const command = stopAllTimekeeps(app);
		const callback = command.callback!;
		await callback();
		expect(MockNotice).toHaveBeenLastCalledWith("Nothing to stop.", 1500);
	});

	it("when stopped timekeeps should report count", async () => {
		const vault = new MockVault();

		const content = createCodeBlock(
			`{"entries":[{"name":"Block 1","startTime":"2024-03-17T01:33:51.630Z","endTime":null,"subEntries":null}]}`,
			4,
			4
		);

		vault.addFile("test.md", content);

		const app = {
			vault: vault.asVault(),
		} as App;

		const command = stopAllTimekeeps(app);
		const callback = command.callback!;
		await callback();
		expect(MockNotice).toHaveBeenLastCalledWith("Stopped 1 tracker", 1500);
	});

	it("when stopped timekeeps should report count for multiple", async () => {
		const vault = new MockVault();

		const content1 = createCodeBlock(
			`{"entries":[{"name":"Block 1","startTime":"2024-03-17T01:33:51.630Z","endTime":null,"subEntries":null}]}`,
			4,
			4
		);

		const content2 = createCodeBlock(
			`{"entries":[{"name":"Block 1","startTime":"2024-03-17T01:33:51.630Z","endTime":null,"subEntries":null}]}`,
			4,
			4
		);

		vault.addFile("test.md", content1);
		vault.addFile("test2.md", content2);

		const app = {
			vault: vault.asVault(),
		} as App;

		const command = stopAllTimekeeps(app);
		const callback = command.callback!;
		await callback();
		expect(MockNotice).toHaveBeenLastCalledWith("Stopped 2 trackers", 1500);
	});

	it("on error the error should be reported", async () => {
		const vault = new MockVault();

		vault.read.mockRejectedValueOnce(new Error("test error"));

		const content = createCodeBlock(
			`{"entries":[{"name":"Block 1","startTime":"2024-03-17T01:33:51.630Z","endTime":null,"subEntries":null}]}`,
			4,
			4
		);

		vault.addFile("test.md", content);

		const app = {
			vault: vault.asVault(),
		} as App;

		const command = stopAllTimekeeps(app);
		const callback = command.callback!;
		await callback();
		expect(MockNotice).toHaveBeenLastCalledWith("Failed to stop timekeeps: test error", 1500);
	});
});

/**
 * Generates a code block surrounding the provided JSON
 * with the provided leading and trailing number of lines
 *
 * @param json The JSON to put between the codeblocks
 * @param linesBefore Number of lines before the codeblock
 * @param linesAfter Number of lines after the codeblock
 * @returns The generated codeblock
 */
const createCodeBlock = (json: string, linesBefore: number, linesAfter: number) => {
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
