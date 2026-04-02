import moment from "moment";
import { v4 } from "uuid";
import { describe, vi, it, expect } from "vitest";

import { MockVault } from "@/__mocks__/obsidian";
import { defaultSettings } from "@/settings";
import { createStore } from "@/store";
import { stripTimekeepRuntimeData, Timekeep } from "@/timekeep/schema";
import { createCodeBlock } from "@/utils/codeblock";

import { TimekeepEntryItemType, TimekeepRegistry, TimekeepRegistryEntryMarkdown } from "./registry";

describe("TimekeepRegistry", () => {
	describe("getFileRegistryEntry", () => {
		it("returns null for markdown without timekeeps", async () => {
			const vault = new MockVault();
			const file = vault.addFile("test.md", "# hello");

			let result = await TimekeepRegistry.getFileRegistryEntry(vault.asVault(), file, false);
			expect(result).toBeNull();

			result = await TimekeepRegistry.getFileRegistryEntry(vault.asVault(), file, true);
			expect(result).toBeNull();
		});

		it("returns markdown entry with timekeeps", async () => {
			const content = createCodeBlock(
				`{"entries":[{"name":"Block 1","startTime":"2024-03-17T01:33:51.630Z","endTime":"2024-03-17T01:33:55.151Z","subEntries":null}]}`,
				4,
				4
			);

			const vault = new MockVault();
			const file = vault.addFile("test.md", content);

			let result = await TimekeepRegistry.getFileRegistryEntry(vault.asVault(), file, false);

			expect(result).not.toBeNull();
			expect(result!.type).toBe(TimekeepEntryItemType.MARKDOWN);
			expect((result as TimekeepRegistryEntryMarkdown).timekeeps.length).toBeGreaterThan(0);

			result = await TimekeepRegistry.getFileRegistryEntry(vault.asVault(), file, true);

			expect(result).not.toBeNull();
			expect(result!.type).toBe(TimekeepEntryItemType.MARKDOWN);
			expect((result as TimekeepRegistryEntryMarkdown).timekeeps.length).toBeGreaterThan(0);
		});

		it("returns file entry for valid .timekeep file", async () => {
			const content = JSON.stringify({ entries: [] });

			const vault = new MockVault();
			const file = vault.addFile("test.timekeep", content);

			let result = await TimekeepRegistry.getFileRegistryEntry(vault.asVault(), file, false);

			expect(result).not.toBeNull();
			expect(result?.type).toBe(TimekeepEntryItemType.FILE);

			result = await TimekeepRegistry.getFileRegistryEntry(vault.asVault(), file, true);

			expect(result).not.toBeNull();
			expect(result?.type).toBe(TimekeepEntryItemType.FILE);
		});

		it("returns null for invalid .timekeep file", async () => {
			const spy = vi.spyOn(console, "error").mockImplementation(() => {});
			const vault = new MockVault();
			const file = vault.addFile("bad.timekeep", "invalid");

			let result = await TimekeepRegistry.getFileRegistryEntry(vault.asVault(), file, false);
			expect(result).toBeNull();
			expect(spy).toHaveBeenCalled();

			result = await TimekeepRegistry.getFileRegistryEntry(vault.asVault(), file, true);
			expect(result).toBeNull();
			expect(spy).toHaveBeenCalled();
		});

		it("returns null for unknown file extension", async () => {
			const spy = vi.spyOn(console, "error").mockImplementation(() => {});
			const vault = new MockVault();
			const file = vault.addFile("bad.unknown", "invalid");

			let result = await TimekeepRegistry.getFileRegistryEntry(vault.asVault(), file, false);
			expect(result).toBeNull();
			expect(spy).toHaveBeenCalled();

			result = await TimekeepRegistry.getFileRegistryEntry(vault.asVault(), file, true);
			expect(result).toBeNull();
			expect(spy).toHaveBeenCalled();
		});
	});

	describe("getTimekeepsWithinVault", () => {
		it("filters only md and timekeep files", async () => {
			const spy = vi.spyOn(console, "error").mockImplementation(() => {});
			const vault = new MockVault();
			vault.addFile("a.md", "# no tk");
			vault.addFile("b.timekeep", JSON.stringify({ entries: [] }));
			vault.addFile("c.txt", "ignored");

			let result = await TimekeepRegistry.getTimekeepsWithinVault(vault.asVault(), false);
			expect(result.length).toBe(1); // only valid timekeep file
			expect(spy).toHaveBeenCalled();

			result = await TimekeepRegistry.getTimekeepsWithinVault(vault.asVault(), true);
			expect(result.length).toBe(1); // only valid timekeep file
			expect(spy).toHaveBeenCalled();
		});

		it("returns only valid entries", async () => {
			const spy = vi.spyOn(console, "error").mockImplementation(() => {});
			const vault = new MockVault();
			vault.addFile("a.timekeep", JSON.stringify({ entries: [] }));
			vault.addFile("b.timekeep", "bad");

			let result = await TimekeepRegistry.getTimekeepsWithinVault(vault.asVault(), false);

			expect(result.length).toBe(1);
			expect(spy).toHaveBeenCalled();

			result = await TimekeepRegistry.getTimekeepsWithinVault(vault.asVault(), true);
			expect(result.length).toBe(1);
			expect(spy).toHaveBeenCalled();
		});
	});

	describe("updateFromFile", () => {
		it("adds new entry", async () => {
			const vault = new MockVault();
			const file = vault.addFile("a.timekeep", JSON.stringify({ entries: [] }));

			const registry = new TimekeepRegistry(vault.asVault(), createStore(defaultSettings));

			await registry.updateFromFile(file);

			const entries = registry.entries.getState();
			expect(entries.length).toBe(1);
			expect(entries[0].file).toBe(file);
		});

		it("replaces existing entry for same file", async () => {
			const vault = new MockVault();
			const file = vault.addFile("a.timekeep", JSON.stringify({ entries: [] }));

			const registry = new TimekeepRegistry(vault.asVault(), createStore(defaultSettings));

			await registry.updateFromFile(file);
			await registry.updateFromFile(file);

			const entries = registry.entries.getState();
			expect(entries.length).toBe(1);
		});

		it("removes entry if file becomes invalid", async () => {
			const spy = vi.spyOn(console, "error").mockImplementation(() => {});

			const vault = new MockVault();
			const file = vault.addFile("a.timekeep", JSON.stringify({ entries: [] }));

			const registry = new TimekeepRegistry(vault.asVault(), createStore(defaultSettings));

			await registry.updateFromFile(file);

			await vault.write(file, "invalid");

			await registry.updateFromFile(file);

			expect(registry.entries.getState().length).toBe(0);
			expect(spy).toHaveBeenCalled();
		});
	});

	describe("loadFromVault", () => {
		it("loads entries into store", async () => {
			const vault = new MockVault();
			vault.addFile("a.timekeep", JSON.stringify({ entries: [] }));

			const registry = new TimekeepRegistry(vault.asVault(), createStore(defaultSettings));

			await registry.loadFromVault();

			expect(registry.entries.getState().length).toBe(1);
		});
	});

	describe("tryStopEntry", () => {
		it("updates markdown timekeep block", async () => {
			const content = createCodeBlock(
				`{"entries":[{"name":"Block 1","startTime":"2024-03-17T01:33:51.630Z","endTime":null,"subEntries":null}]}`,
				4,
				4
			);

			const vault = new MockVault();
			const file = vault.addFile("a.md", content);

			const registry = new TimekeepRegistry(vault.asVault(), createStore(defaultSettings));

			const entry = await TimekeepRegistry.getFileRegistryEntry(vault.asVault(), file);
			const tk = (entry! as TimekeepRegistryEntryMarkdown).timekeeps[0];

			await registry.tryStopEntry({
				type: TimekeepEntryItemType.MARKDOWN,
				file,
				position: {
					startLine: tk.startLine,
					endLine: tk.endLine,
				},
			});

			expect(vault.process).toHaveBeenCalled();

			const newContent = await vault.read(file);
			expect(newContent).not.toBe(content);
		});

		it("does not update markdown timekeep block if timekeep cannot be found", async () => {
			const spy = vi.spyOn(console, "error").mockImplementation(() => {});
			const content = createCodeBlock(
				`{"entries":[{"name":"Block 1","startTime":"2024-03-17T01:33:51.630Z","endTime":null,"subEntries":null}]}`,
				4,
				4
			);

			const vault = new MockVault();
			const file = vault.addFile("a.md", content);

			const registry = new TimekeepRegistry(vault.asVault(), createStore(defaultSettings));

			const entry = await TimekeepRegistry.getFileRegistryEntry(vault.asVault(), file);
			const tk = (entry! as TimekeepRegistryEntryMarkdown).timekeeps[0];

			await vault.write(file, "Test");

			await registry.tryStopEntry({
				type: TimekeepEntryItemType.MARKDOWN,
				file,
				position: {
					startLine: tk.startLine,
					endLine: tk.endLine,
				},
			});

			expect(vault.process).toHaveBeenCalled();
			expect(spy).toHaveBeenCalled();

			const newContent = await vault.read(file);
			expect(newContent).toBe("Test");
		});

		it("updates .timekeep file", async () => {
			const inputTimekeep: Timekeep = {
				entries: [
					{
						id: v4(),
						name: "Test",
						startTime: moment("2020-01-01T00:00:00Z"),
						endTime: null,
						subEntries: null,
					},
				],
			};
			const content = JSON.stringify(stripTimekeepRuntimeData(inputTimekeep));
			const vault = new MockVault();
			const file = vault.addFile("a.timekeep", content);

			const registry = new TimekeepRegistry(vault.asVault(), createStore(defaultSettings));

			await registry.tryStopEntry({
				type: TimekeepEntryItemType.FILE,
				file,
			});

			expect(vault.process).toHaveBeenCalled();

			const newContent = await vault.read(file);
			expect(newContent).not.toBe(content);
		});

		it("does not modify .timekeep file if the file is no longer valid", async () => {
			const spy = vi.spyOn(console, "error").mockImplementation(() => {});
			const inputTimekeep: Timekeep = {
				entries: [
					{
						id: v4(),
						name: "Test",
						startTime: moment("2020-01-01T00:00:00Z"),
						endTime: null,
						subEntries: null,
					},
				],
			};
			const content = JSON.stringify(stripTimekeepRuntimeData(inputTimekeep));
			const vault = new MockVault();
			const file = vault.addFile("a.timekeep", content);

			const registry = new TimekeepRegistry(vault.asVault(), createStore(defaultSettings));

			await vault.write(file, "Test");

			await registry.tryStopEntry({
				type: TimekeepEntryItemType.FILE,
				file,
			});

			expect(vault.process).toHaveBeenCalled();
			expect(spy).toHaveBeenCalled();

			const newContent = await vault.read(file);
			expect(newContent).toBe("Test");
		});

		it("throws if file is null", async () => {
			const vault = new MockVault();
			const registry = new TimekeepRegistry(vault.asVault(), createStore(defaultSettings));

			await expect(
				registry.tryStopEntry({
					type: TimekeepEntryItemType.FILE,
					file: null as any,
				})
			).rejects.toThrow();
		});
	});

	describe("file creation", () => {
		it("adding a valid timekeep file should update the entries", async () => {
			const vault = new MockVault();
			const registry = new TimekeepRegistry(vault.asVault(), createStore(defaultSettings));
			registry.load();

			await registry.waitTasks();

			const changeListener = vi.fn(() => {});
			registry.entries.subscribe(changeListener);

			vault.addFile(
				"a.timekeep",
				JSON.stringify({
					entries: [
						{
							id: v4(),
							name: "Test",
							startTime: moment("2020-01-01T00:00:00Z"),
							endTime: null,
							subEntries: null,
						},
					],
				} satisfies Timekeep)
			);

			await registry.waitTasks();

			expect(changeListener).toHaveBeenCalled();
			expect(registry.entries.getState().length).toBe(1);
		});

		it("adding a valid timekeep markdown file should update the entries", async () => {
			const vault = new MockVault();
			const registry = new TimekeepRegistry(vault.asVault(), createStore(defaultSettings));
			registry.load();

			await registry.waitTasks();

			const changeListener = vi.fn(() => {});
			registry.entries.subscribe(changeListener);

			const content = createCodeBlock(
				`{"entries":[{"name":"Block 1","startTime":"2024-03-17T01:33:51.630Z","endTime":"2024-03-17T01:33:55.151Z","subEntries":null}]}`,
				4,
				4
			);

			vault.addFile("a.md", content);
			await registry.waitTasks();

			expect(changeListener).toHaveBeenCalled();
			expect(registry.entries.getState().length).toBe(1);
		});

		it("adding a invalid timekeep file should not update the entries", async () => {
			const vault = new MockVault();
			const registry = new TimekeepRegistry(vault.asVault(), createStore(defaultSettings));
			registry.load();

			await registry.waitTasks();

			const changeListener = vi.fn(() => {});
			registry.entries.subscribe(changeListener);

			vault.addFile("a.timekeep", "invalid");
			await registry.waitTasks();

			expect(changeListener).toHaveBeenCalled();
			expect(registry.entries.getState().length).toBe(0);
		});

		it("creating a folder should not update the entries", async () => {
			const vault = new MockVault();
			const registry = new TimekeepRegistry(vault.asVault(), createStore(defaultSettings));
			registry.load();

			await registry.waitTasks();

			const changeListener = vi.fn(() => {});
			registry.entries.subscribe(changeListener);

			vault.addFolder("test");
			await registry.waitTasks();

			expect(changeListener).not.toHaveBeenCalled();
			expect(registry.entries.getState().length).toBe(0);
		});
	});

	describe("file modification", () => {
		it("updating a file should update entries", async () => {
			const vault = new MockVault();
			const file = vault.addFile("a.timekeep", "");

			const registry = new TimekeepRegistry(vault.asVault(), createStore(defaultSettings));
			registry.load();

			await registry.waitTasks();

			const changeListener = vi.fn(() => {});
			registry.entries.subscribe(changeListener);

			await vault.write(
				file,
				JSON.stringify({
					entries: [
						{
							id: v4(),
							name: "Test",
							startTime: moment("2020-01-01T00:00:00Z"),
							endTime: null,
							subEntries: null,
						},
					],
				} satisfies Timekeep)
			);
			await registry.waitTasks();

			expect(changeListener).toHaveBeenCalled();
			expect(registry.entries.getState().length).toBe(1);
		});

		it("updating a folder should not update entries", async () => {
			const vault = new MockVault();
			vault.addFile("a.md", "");
			vault.addFolder("test");

			const registry = new TimekeepRegistry(vault.asVault(), createStore(defaultSettings));
			registry.load();

			await registry.waitTasks();

			const changeListener = vi.fn(() => {});
			registry.entries.subscribe(changeListener);

			vault.modify("test");

			await registry.waitTasks();

			expect(changeListener).not.toHaveBeenCalled();
			expect(registry.entries.getState().length).toBe(0);
		});
	});

	describe("file removal", () => {
		it("removes entry when file deleted", async () => {
			const vault = new MockVault();
			vault.addFile(
				"a.timekeep",
				JSON.stringify({
					entries: [
						{
							id: v4(),
							name: "Test",
							startTime: moment("2020-01-01T00:00:00Z"),
							endTime: null,
							subEntries: null,
						},
					],
				} satisfies Timekeep)
			);

			const registry = new TimekeepRegistry(vault.asVault(), createStore(defaultSettings));
			registry.load();

			const changeListener = vi.fn(() => {});
			registry.entries.subscribe(changeListener);

			vault.removeFile("a.timekeep");

			expect(changeListener).toHaveBeenCalled();
			expect(registry.entries.getState().length).toBe(0);
		});

		it("only removes the entry of the file that was deleted", async () => {
			const vault = new MockVault();
			vault.addFile(
				"a.timekeep",
				JSON.stringify({
					entries: [
						{
							id: v4(),
							name: "Test",
							startTime: moment("2020-01-01T00:00:00Z"),
							endTime: null,
							subEntries: null,
						},
					],
				} satisfies Timekeep)
			);

			vault.addFile(
				"b.timekeep",
				JSON.stringify({
					entries: [
						{
							id: v4(),
							name: "Test",
							startTime: moment("2020-01-01T00:00:00Z"),
							endTime: null,
							subEntries: null,
						},
					],
				} satisfies Timekeep)
			);

			const registry = new TimekeepRegistry(vault.asVault(), createStore(defaultSettings));
			registry.load();

			await registry.waitTasks();

			const changeListener = vi.fn(() => {});
			registry.entries.subscribe(changeListener);

			vault.removeFile("a.timekeep");

			await registry.waitTasks();

			expect(changeListener!).toHaveBeenCalled();
			expect(registry.entries.getState().length).toBe(1);
		});

		it("removing untracked files does nothing", async () => {
			const vault = new MockVault();
			vault.addFile(
				"a.timekeep",
				JSON.stringify({
					entries: [
						{
							id: v4(),
							name: "Test",
							startTime: moment("2020-01-01T00:00:00Z"),
							endTime: null,
							subEntries: null,
						},
					],
				} satisfies Timekeep)
			);

			vault.addFile("b.unknown", "");

			const registry = new TimekeepRegistry(vault.asVault(), createStore(defaultSettings));
			registry.load();
			await registry.waitTasks();

			vault.removeFile("b.unknown");
			expect(registry.entries.getState().length).toBe(1);
		});

		it("removing folder does nothing", async () => {
			const vault = new MockVault();
			vault.addFile(
				"a.timekeep",
				JSON.stringify({
					entries: [
						{
							id: v4(),
							name: "Test",
							startTime: moment("2020-01-01T00:00:00Z"),
							endTime: null,
							subEntries: null,
						},
					],
				} satisfies Timekeep)
			);

			vault.addFolder("b.unknown");

			const registry = new TimekeepRegistry(vault.asVault(), createStore(defaultSettings));
			registry.load();
			await registry.waitTasks();

			vault.removeFile("b.unknown");
			expect(registry.entries.getState().length).toBe(1);
		});
	});

	describe("onload", () => {
		it("does nothing if registry disabled", () => {
			const vault = new MockVault();
			const registry = new TimekeepRegistry(
				vault.asVault(),
				createStore({ ...defaultSettings, registryEnabled: false })
			);

			registry.load();

			expect(vault.on).not.toHaveBeenCalled();
		});

		it("registers vault events when enabled", () => {
			const vault = new MockVault();
			const registry = new TimekeepRegistry(vault.asVault(), createStore(defaultSettings));

			registry.load();

			expect(vault.on).toHaveBeenCalledTimes(3);
		});

		it("handle loading failure", async () => {
			const spy = vi.spyOn(console, "error").mockImplementation(() => {});
			const vault = new MockVault();
			vault.addFile("test.md", "test");

			const registry = new TimekeepRegistry(vault.asVault(), createStore(defaultSettings));

			vault.read.mockRejectedValue(new Error("failed to read file"));

			registry.load();

			await registry.waitTasks();

			expect(spy).toHaveBeenCalled();
		});
	});
});
