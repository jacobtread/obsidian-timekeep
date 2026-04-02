import type { App } from "obsidian";

import { describe, vi, it, expect } from "vitest";

import { MockNotice, MockVault } from "@/__mocks__/obsidian";
import { createCodeBlock } from "@/utils/codeblock";

import stopFileTimekeeps from "./stopFileTimekeeps";

describe("stopFileTimekeeps", () => {
	it("when no active file is detected should get a notice", async () => {
		const app = {
			workspace: {
				activeEditor: {
					file: null,
				},
			},
		} as App;

		const command = stopFileTimekeeps(app);
		const callback = command.callback!;
		await callback();
		expect(MockNotice).toHaveBeenLastCalledWith("No active file detected", 1500);
	});

	it("when theres nothing to stop should get a notice", async () => {
		const vault = new MockVault();

		const content = createCodeBlock(
			`{"entries":[{"name":"Block 1","startTime":"2024-03-17T01:33:51.630Z","endTime":"2024-03-17T01:33:55.151Z","subEntries":null}]}`,
			4,
			4
		);

		const file = vault.addFile("test.md", content);

		const app = {
			vault: vault.asVault(),
			workspace: {
				activeEditor: {
					file,
				},
			},
		} as App;

		const command = stopFileTimekeeps(app);
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

		const file = vault.addFile("test.md", content);

		const app = {
			vault: vault.asVault(),
			workspace: {
				activeEditor: {
					file,
				},
			},
		} as App;

		const command = stopFileTimekeeps(app);
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

		const file = vault.addFile("test.md", content1 + content2);

		const app = {
			vault: vault.asVault(),
			workspace: {
				activeEditor: {
					file,
				},
			},
		} as App;

		const command = stopFileTimekeeps(app);
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

		const file = vault.addFile("test.md", content);

		const app = {
			vault: vault.asVault(),
			workspace: {
				activeEditor: {
					file,
				},
			},
		} as App;

		const command = stopFileTimekeeps(app);
		const callback = command.callback!;
		await callback();
		expect(MockNotice).toHaveBeenLastCalledWith("Failed to stop timekeeps: test error", 1500);
	});
});
