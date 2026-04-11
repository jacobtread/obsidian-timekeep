// @vitest-environment happy-dom

import moment from "moment";
import { App } from "obsidian";
import { v4 } from "uuid";
import { describe, beforeEach, it, expect, vi, afterEach } from "vitest";

import { createMockContainer, MockVault } from "@/__mocks__/obsidian";
import { defaultSettings, TimekeepSettings } from "@/settings";
import { createStore, Store } from "@/store";

import { TimesheetStatusBarItem } from "./TimesheetStatusBarItem";

import { TimeEntry } from "@/timekeep/schema";

import { TimekeepEntryItemType, TimekeepRegistry } from "@/service/registry";

describe("TimesheetStatusBarItem", () => {
	const start = moment();
	const oneHourLater = start.add(1, "hour");

	const entry: TimeEntry = {
		id: v4(),
		name: "Test",
		startTime: moment(start),
		endTime: null,
		subEntries: null,
	};
	let vault: MockVault;
	let app: App;
	let settings: Store<TimekeepSettings>;
	let registry: TimekeepRegistry;

	let containerEl: HTMLElement;

	beforeEach(() => {
		app = {} as App;
		vault = new MockVault();
		settings = createStore(defaultSettings);
		registry = new TimekeepRegistry(vault.asVault(), settings);

		vi.useFakeTimers();
		vi.setSystemTime(oneHourLater.toDate());

		containerEl = createMockContainer();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should load without error", () => {
		const file = vault.addFile("test.timekeep", "");
		const component = new TimesheetStatusBarItem(containerEl, app, registry, entry, {
			file,
			type: TimekeepEntryItemType.FILE,
		});

		expect(() => component.load()).not.toThrow();
	});

	it("should call onStop when the stop icon is clicked", () => {
		const file = vault.addFile("test.timekeep", "");
		const component = new TimesheetStatusBarItem(containerEl, app, registry, entry, {
			file,
			type: TimekeepEntryItemType.FILE,
		});

		const onStop = vi.spyOn(component, "onStop");
		component.load();

		// Simulate click on the stop icon
		const stopIcon = containerEl.querySelector(".button-icon");
		const event = new MouseEvent("click", { bubbles: true, cancelable: true });
		if (stopIcon) {
			stopIcon.dispatchEvent(event);
		}

		expect(onStop).toHaveBeenCalledTimes(1);
	});

	it("if stopping fails due to an error it should be logged", async () => {
		const file = vault.addFile("test.timekeep", "");
		vi.spyOn(registry, "tryStopEntry")
			//
			.mockRejectedValue(new Error("failed to stop"));

		const component = new TimesheetStatusBarItem(containerEl, app, registry, entry, {
			file,
			type: TimekeepEntryItemType.FILE,
		});
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
		const onStop = vi.spyOn(component, "onStop");
		component.load();

		await component.onStop();

		expect(onStop).toHaveBeenCalledTimes(1);
		expect(consoleError).toHaveBeenCalledTimes(1);
	});

	it("should call onOpen when the content area is clicked", () => {
		const file = vault.addFile("test.timekeep", "");
		const component = new TimesheetStatusBarItem(containerEl, app, registry, entry, {
			file,
			type: TimekeepEntryItemType.FILE,
		});

		const onOpen = vi.spyOn(component, "onOpen");
		component.load();

		// Simulate click on the content element
		const contentEl = containerEl.querySelector(".timekeep-status-item__content");
		const event = new MouseEvent("click", { bubbles: true, cancelable: true });
		if (contentEl) {
			contentEl.dispatchEvent(event);
		}

		expect(onOpen).toHaveBeenCalledTimes(1);
	});
});
