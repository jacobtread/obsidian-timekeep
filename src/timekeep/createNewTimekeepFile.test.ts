import { App } from "obsidian";
import { describe, expect, it, vi } from "vitest";

import { MockVault } from "@/__mocks__/obsidian";

import { createNewTimekeepFile } from "./createNewTimekeepFile";

describe("createNewTimekeepFile", () => {
	it("should use Untitled.timekeep when the file name is not in use", async () => {
		const vault = new MockVault();
		const openFile = vi.fn();
		const app = {
			vault,
			workspace: {
				getLeaf() {
					return { openFile };
				},
			},
		} as any as App;

		const folder = vault.addFolder("test");
		await createNewTimekeepFile(app, folder);

		const files = vault.getFiles();
		const file = files.find((file) => file.name === "Untitled.timekeep");
		expect(file).toBeDefined();
	});

	it("should increment the name counter until a unused name is found", async () => {
		const vault = new MockVault();
		const openFile = vi.fn();
		const app = {
			vault,
			workspace: {
				getLeaf() {
					return { openFile };
				},
			},
		} as any as App;

		const folder = vault.addFolder("test");
		vault.addFile("test/Untitled.timekeep", "");

		for (let i = 1; i <= 10; i++) {
			vault.addFile(`test/Untitled ${i}.timekeep`, "");
		}

		await createNewTimekeepFile(app, folder);

		const files = vault.getFiles();
		const file = files.find((file) => file.name === "Untitled 11.timekeep");
		expect(file).toBeDefined();
	});
});
