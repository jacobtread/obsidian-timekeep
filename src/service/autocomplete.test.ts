import moment from "moment";
import { v4 } from "uuid";
import { describe, expect, it, vi } from "vitest";

import { MockVault } from "@/__mocks__/obsidian";
import { defaultSettings } from "@/settings";
import { createStore } from "@/store";
import { Timekeep } from "@/timekeep/schema";
import { createCodeBlock } from "@/utils/codeblock";

import { TimekeepAutocomplete } from "./autocomplete";
import { TimekeepRegistry } from "./registry";

describe("TimekeepAutocomplete", () => {
	describe("autocomplete enabled", () => {
		it("empty vault should have no names", async () => {
			const vault = new MockVault();
			const settings = createStore({ ...defaultSettings });

			const registry = new TimekeepRegistry(vault.asVault(), settings);
			registry.load();
			await registry.waitTasks();

			const autocomplete = new TimekeepAutocomplete(registry, settings);
			autocomplete.load();

			expect(autocomplete.names.getState()).toEqual([]);
		});

		it("populated vault should have names", async () => {
			const vault = new MockVault();
			vault.addFile(
				"test.timekeep",
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

			const settings = createStore({ ...defaultSettings });

			const registry = new TimekeepRegistry(vault.asVault(), settings);
			registry.load();
			await registry.waitTasks();

			const autocomplete = new TimekeepAutocomplete(registry, settings);
			autocomplete.load();

			expect(autocomplete.names.getState()).toEqual(["Test"]);
		});

		it("new files should cause an update to the available names", async () => {
			const vault = new MockVault();
			vault.addFile(
				"test.timekeep",
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

			const settings = createStore({ ...defaultSettings });

			const registry = new TimekeepRegistry(vault.asVault(), settings);
			registry.load();
			await registry.waitTasks();

			const autocomplete = new TimekeepAutocomplete(registry, settings);
			autocomplete.load();

			expect(autocomplete.names.getState()).toEqual(["Test"]);

			const changeListener = vi.fn(() => {});
			autocomplete.names.subscribe(changeListener);

			vault.addFile(
				"test2.timekeep",
				JSON.stringify({
					entries: [
						{
							id: v4(),
							name: "Test 2",
							startTime: moment("2020-01-01T00:00:00Z"),
							endTime: null,
							subEntries: null,
						},
					],
				} satisfies Timekeep)
			);

			await registry.waitTasks();

			expect(changeListener).toHaveBeenCalled();
			expect(autocomplete.names.getState()).toEqual(["Test", "Test 2"]);
		});

		it("removing files should cause an update to the available names", async () => {
			const vault = new MockVault();
			vault.addFile(
				"test.timekeep",
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
				"test2.timekeep",
				JSON.stringify({
					entries: [
						{
							id: v4(),
							name: "Test 2",
							startTime: moment("2020-01-01T00:00:00Z"),
							endTime: null,
							subEntries: null,
						},
					],
				} satisfies Timekeep)
			);

			const settings = createStore({ ...defaultSettings });

			const registry = new TimekeepRegistry(vault.asVault(), settings);
			registry.load();
			await registry.waitTasks();

			const autocomplete = new TimekeepAutocomplete(registry, settings);
			autocomplete.load();

			expect(autocomplete.names.getState()).toEqual(["Test", "Test 2"]);

			const changeListener = vi.fn(() => {});
			autocomplete.names.subscribe(changeListener);

			vault.removeFile("test2.timekeep");

			await registry.waitTasks();

			expect(changeListener).toHaveBeenCalled();
			expect(autocomplete.names.getState()).toEqual(["Test"]);
		});

		it("populated vault should have names excluding ignored names", async () => {
			const vault = new MockVault();
			vault.addFile(
				"test.timekeep",
				JSON.stringify({
					entries: [
						{
							id: v4(),
							name: "Test",
							startTime: moment("2020-01-01T00:00:00Z"),
							endTime: null,
							subEntries: null,
						},
						{
							id: v4(),
							name: "Block 1",
							startTime: moment("2020-01-01T00:00:00Z"),
							endTime: null,
							subEntries: null,
						},
						{
							id: v4(),
							name: "Part",
							startTime: moment("2020-01-01T00:00:00Z"),
							endTime: null,
							subEntries: null,
						},
						{
							id: v4(),
							name: "Part X",
							startTime: moment("2020-01-01T00:00:00Z"),
							endTime: null,
							subEntries: null,
						},
						{
							id: v4(),
							name: "",
							startTime: moment("2020-01-01T00:00:00Z"),
							endTime: null,
							subEntries: null,
						},
					],
				} satisfies Timekeep)
			);

			const content = createCodeBlock(
				`{"entries":[{"name":"Test 1","startTime":"2024-03-17T01:33:51.630Z","endTime":"2024-03-17T01:33:55.151Z","subEntries":null}]}`,
				4,
				4
			);
			vault.addFile("test.md", content);

			const settings = createStore({ ...defaultSettings });

			const registry = new TimekeepRegistry(vault.asVault(), settings);
			registry.load();
			await registry.waitTasks();

			const autocomplete = new TimekeepAutocomplete(registry, settings);
			autocomplete.load();

			expect(autocomplete.names.getState()).toEqual(["Part", "Part X", "Test", "Test 1"]);
		});

		it("populated vault with only ignored names should have no names", async () => {
			const vault = new MockVault();
			vault.addFile(
				"test.timekeep",
				JSON.stringify({
					entries: [
						{
							id: v4(),
							name: "Block 1",
							startTime: moment("2020-01-01T00:00:00Z"),
							endTime: null,
							subEntries: null,
						},
						{
							id: v4(),
							name: "Block 2",
							startTime: moment("2020-01-01T00:00:00Z"),
							endTime: null,
							subEntries: null,
						},
					],
				} satisfies Timekeep)
			);

			const content = createCodeBlock(
				`{"entries":[{"name":"Block 1","startTime":"2024-03-17T01:33:51.630Z","endTime":"2024-03-17T01:33:55.151Z","subEntries":null}]}`,
				4,
				4
			);
			vault.addFile("test.md", content);

			const settings = createStore({ ...defaultSettings });

			const registry = new TimekeepRegistry(vault.asVault(), settings);
			registry.load();
			await registry.waitTasks();

			const autocomplete = new TimekeepAutocomplete(registry, settings);
			autocomplete.load();

			expect(autocomplete.names.getState()).toEqual([]);
		});
	});

	describe("autocomplete disabled", () => {
		it("empty vault should have no names", async () => {
			const vault = new MockVault();
			const settings = createStore({ ...defaultSettings, autocompleteEnabled: false });

			const registry = new TimekeepRegistry(vault.asVault(), settings);
			registry.load();
			await registry.waitTasks();

			const autocomplete = new TimekeepAutocomplete(registry, settings);
			autocomplete.load();

			expect(autocomplete.names.getState()).toEqual([]);
		});

		it("populated vault should have no names", async () => {
			const vault = new MockVault();
			vault.addFile(
				"test.timekeep",
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

			const settings = createStore({ ...defaultSettings, autocompleteEnabled: false });

			const registry = new TimekeepRegistry(vault.asVault(), settings);
			registry.load();
			await registry.waitTasks();

			const autocomplete = new TimekeepAutocomplete(registry, settings);
			autocomplete.load();

			expect(autocomplete.names.getState()).toEqual([]);
		});
	});
});
