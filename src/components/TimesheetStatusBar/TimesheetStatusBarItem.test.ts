// @vitest-environment happy-dom

import moment from "moment";
import { App } from "obsidian";
import { describe, beforeEach, it, expect, vi, afterEach } from "vitest";

import { createMockContainer, MockVault } from "@/__mocks__/obsidian";
import { defaultSettings, TimekeepSettings } from "@/settings";
import { createStore, Store } from "@/store";

import { TimesheetStatusBarItem } from "./TimesheetStatusBarItem";

import { TimeEntry, Timekeep } from "@/timekeep/schema";

import { TimekeepEntryItemType, TimekeepRegistry } from "@/service/registry";

describe("TimesheetStatusBarItem", () => {
	const start = moment();
	const oneHourLater = start.add(1, "hour");

	const entry: TimeEntry = {
		id: 1,
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
		const component = new TimesheetStatusBarItem(
			containerEl,
			app,
			registry,
			{ ...defaultSettings, statusBarShowFolderPath: false },
			entry,
			{ entries: [entry] },
			{
				file,
				type: TimekeepEntryItemType.FILE,
			}
		);

		expect(() => component.load()).not.toThrow();
	});

	it("should call onStop when the stop icon is clicked", () => {
		const file = vault.addFile("test.timekeep", "");
		const component = new TimesheetStatusBarItem(
			containerEl,
			app,
			registry,
			{ ...defaultSettings, statusBarShowFolderPath: false },
			entry,
			{ entries: [entry] },
			{
				file,
				type: TimekeepEntryItemType.FILE,
			}
		);

		const onStop = vi.spyOn(component, "onStop");
		component.load();

		// Simulate click on the stop icon
		const stopIcon = containerEl.querySelector(".timekeep-button-icon");
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

		const component = new TimesheetStatusBarItem(
			containerEl,
			app,
			registry,
			{ ...defaultSettings, statusBarShowFolderPath: false },
			entry,
			{ entries: [entry] },
			{
				file,
				type: TimekeepEntryItemType.FILE,
			}
		);
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
		const onStop = vi.spyOn(component, "onStop");
		component.load();

		await component.onStop();

		expect(onStop).toHaveBeenCalledTimes(1);
		expect(consoleError).toHaveBeenCalledTimes(1);
	});

	it("should call onOpen when the content area is clicked", () => {
		const file = vault.addFile("test.timekeep", "");
		const component = new TimesheetStatusBarItem(
			containerEl,
			app,
			registry,
			{ ...defaultSettings, statusBarShowFolderPath: false },
			entry,
			{ entries: [entry] },
			{
				file,
				type: TimekeepEntryItemType.FILE,
			}
		);

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

	it("nested file path should be included in name when showFolderPath is true", () => {
		const file = vault.addFile("nested/path/test.timekeep", "");
		const component = new TimesheetStatusBarItem(
			containerEl,
			app,
			registry,
			{ ...defaultSettings, statusBarShowFolderPath: true },
			entry,
			{ entries: [entry] },
			{
				file,
				type: TimekeepEntryItemType.FILE,
			}
		);

		component.load();

		const nameEl = component.containerEl.querySelector(".timekeep-status-item__name");
		expect(nameEl).not.toBeNull();

		expect(nameEl!.textContent.startsWith("nested/path: ")).toBeTruthy();
	});

	it("nested file path should not be included in name when showFolderPath is false", () => {
		const file = vault.addFile("nested/path/test.timekeep", "");
		const component = new TimesheetStatusBarItem(
			containerEl,
			app,
			registry,
			{ ...defaultSettings, statusBarShowFolderPath: false },
			entry,
			{ entries: [entry] },
			{
				file,
				type: TimekeepEntryItemType.FILE,
			}
		);

		component.load();

		const nameEl = component.containerEl.querySelector(".timekeep-status-item__name");
		expect(nameEl).not.toBeNull();

		expect(nameEl!.textContent.startsWith("nested/path: ")).not.toBeTruthy();
	});

	it("non generic parent name should be used when statusBarPreferNonGenericParent is true", () => {
		const file = vault.addFile("nested/path/test.timekeep", "");

		const runningEntry = {
			id: 4,
			name: "Part 2",
			startTime: moment(start),
			endTime: null,
			subEntries: null,
		};

		const entry: TimeEntry = {
			id: 1,
			name: "Good block name",
			startTime: null,
			endTime: null,
			subEntries: [
				{
					id: 2,
					name: "Part 1",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							id: 3,
							name: "Part 1",
							startTime: moment(start),
							endTime: moment(start),
							subEntries: null,
						},
						runningEntry,
					],
				},
			],
		};

		const timekeep: Timekeep = { entries: [entry] };

		const component = new TimesheetStatusBarItem(
			containerEl,
			app,
			registry,
			{
				...defaultSettings,
				statusBarShowFolderPath: false,
				statusBarPreferNonGenericParent: true,
			},
			runningEntry,
			timekeep,
			{
				file,
				type: TimekeepEntryItemType.FILE,
			}
		);

		component.load();

		const nameEl = component.containerEl.querySelector(".timekeep-status-item__name");
		expect(nameEl).not.toBeNull();
		expect(nameEl!.textContent.startsWith("Good block name / Part 2:")).toBeTruthy();
	});

	it("when statusBarPreferNonGenericParent is true if no non generic parent is found nothing should be used other than the entry name", () => {
		const file = vault.addFile("nested/path/test.timekeep", "");

		const runningEntry = {
			id: 4,
			name: "Part 2",
			startTime: moment(start),
			endTime: null,
			subEntries: null,
		};

		const entry: TimeEntry = {
			id: 1,
			name: "Part 1",
			startTime: null,
			endTime: null,
			subEntries: [
				{
					id: 2,
					name: "Part 1",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							id: 3,
							name: "Part 1",
							startTime: moment(start),
							endTime: moment(start),
							subEntries: null,
						},
						runningEntry,
					],
				},
			],
		};

		const timekeep: Timekeep = { entries: [entry] };

		const component = new TimesheetStatusBarItem(
			containerEl,
			app,
			registry,
			{
				...defaultSettings,
				statusBarShowFolderPath: false,
				statusBarPreferNonGenericParent: true,
			},
			runningEntry,
			timekeep,
			{
				file,
				type: TimekeepEntryItemType.FILE,
			}
		);

		component.load();

		const nameEl = component.containerEl.querySelector(".timekeep-status-item__name");
		expect(nameEl).not.toBeNull();
		expect(nameEl!.textContent.startsWith("Part 2:")).toBeTruthy();
	});

	it("when statusBarPreferNonGenericParent is true the path should not duplicate the entry name if its not generic", () => {
		const file = vault.addFile("nested/path/test.timekeep", "");

		const runningEntry = {
			id: 4,
			name: "Example Block",
			startTime: moment(start),
			endTime: null,
			subEntries: null,
		};

		const entry: TimeEntry = runningEntry;
		const timekeep: Timekeep = { entries: [entry] };

		const component = new TimesheetStatusBarItem(
			containerEl,
			app,
			registry,
			{
				...defaultSettings,
				statusBarShowFolderPath: false,
				statusBarPreferNonGenericParent: true,
			},
			runningEntry,
			timekeep,
			{
				file,
				type: TimekeepEntryItemType.FILE,
			}
		);

		component.load();

		const nameEl = component.containerEl.querySelector(".timekeep-status-item__name");
		expect(nameEl).not.toBeNull();
		expect(nameEl!.textContent.startsWith("Example Block / Example Block:")).toBeFalsy();
	});

	it("only the entry name should be used when statusBarPreferNonGenericParent is false", () => {
		const file = vault.addFile("nested/path/test.timekeep", "");

		const runningEntry = {
			id: 4,
			name: "Part 2",
			startTime: moment(start),
			endTime: null,
			subEntries: null,
		};

		const entry: TimeEntry = {
			id: 1,
			name: "Good block name",
			startTime: null,
			endTime: null,
			subEntries: [
				{
					id: 2,
					name: "Part 1",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							id: 3,
							name: "Part 1",
							startTime: moment(start),
							endTime: moment(start),
							subEntries: null,
						},
						runningEntry,
					],
				},
			],
		};

		const timekeep: Timekeep = { entries: [entry] };

		const component = new TimesheetStatusBarItem(
			containerEl,
			app,
			registry,
			{
				...defaultSettings,
				statusBarShowFolderPath: false,
				statusBarPreferNonGenericParent: false,
			},
			runningEntry,
			timekeep,
			{
				file,
				type: TimekeepEntryItemType.FILE,
			}
		);

		component.load();

		const nameEl = component.containerEl.querySelector(".timekeep-status-item__name");
		expect(nameEl).not.toBeNull();
		expect(nameEl!.textContent.startsWith("Part 2:")).toBeTruthy();
	});
});
