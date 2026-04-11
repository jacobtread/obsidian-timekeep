// @vitest-environment happy-dom

import type { App } from "obsidian";

import moment from "moment";
import { v4 } from "uuid";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockContainer, MockVault } from "@/__mocks__/obsidian";
import { defaultSettings, type TimekeepSettings } from "@/settings";
import { createStore, type Store } from "@/store";

import { DomComponent } from "../DomComponent";
import { TimesheetStatusBar } from "./TimesheetStatusBar";
import { TimesheetStatusBarItem } from "./TimesheetStatusBarItem";

import { TimeEntry } from "@/timekeep/schema";

import { TimekeepEntryItemType, TimekeepRegistry } from "@/service/registry";

describe("TimesheetStatusBar", () => {
	let dom: HTMLElement;
	let containerEl: HTMLElement;
	let vault: MockVault;
	let app: App;
	let settings: Store<TimekeepSettings>;
	let registry: TimekeepRegistry;
	let component: TimesheetStatusBar;

	beforeEach(() => {
		app = {} as App;
		vault = new MockVault();
		dom = createMockContainer();
		containerEl = dom.createDiv();
		settings = createStore(defaultSettings);
		registry = new TimekeepRegistry(vault.asVault(), settings);

		component = new TimesheetStatusBar(containerEl, app, registry);
	});

	it("should load without error", () => {
		expect(() => component.load()).not.toThrow();
	});

	it("on unload it should remove itself from the container", () => {
		component.load();
		component.unload();
		expect(dom.contains(containerEl)).toBe(false);
	});

	it("should unload children items when re-rendering", () => {
		const nestedItem = new DomComponent(component.wrapperEl);
		const unload = vi.spyOn(nestedItem, "unload");
		component.items.push(nestedItem as TimesheetStatusBarItem);
		component.load();
		expect(unload).toHaveBeenCalled();
	});

	it("should be able to render a file based status item", () => {
		const start = moment();
		const entry: TimeEntry = {
			id: v4(),
			name: "Test",
			startTime: moment(start),
			endTime: null,
			subEntries: null,
		};

		const file = vault.addFile("test.timekeep", "");
		registry.entries.setState([
			{ file, timekeep: { entries: [entry] }, type: TimekeepEntryItemType.FILE },
		]);
		component.load();
		expect(component.items.length).toBe(1);
	});

	it("should be able to render a markdown based status item", () => {
		const start = moment();
		const entry: TimeEntry = {
			id: v4(),
			name: "Test",
			startTime: moment(start),
			endTime: null,
			subEntries: null,
		};

		const file = vault.addFile("test.md", "");
		registry.entries.setState([
			{
				file,
				timekeeps: [{ timekeep: { entries: [entry] }, startLine: 0, endLine: 2 }],
				type: TimekeepEntryItemType.MARKDOWN,
			},
		]);
		component.load();
		expect(component.items.length).toBe(1);
	});
});
