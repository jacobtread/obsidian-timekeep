// @vitest-environment happy-dom

import moment from "moment";
import { v4 } from "uuid";
import { beforeEach, it, describe, expect, afterEach } from "vitest";

import type { TimekeepSettings } from "@/settings";
import type { Store } from "@/store";
import type { Timekeep } from "@/timekeep/schema";

import { createMockContainer } from "@/__mocks__/obsidian";
import { defaultSettings } from "@/settings";
import { createStore } from "@/store";

import { TimesheetRunningEntry } from "./TimesheetRunningEntry";
import { TimesheetRunningEntryEditing } from "./TimesheetRunningEntryEditing";
import { TimesheetRunningEntryViewing } from "./TimesheetRunningEntryViewing";

describe("TimesheetRunningEntry", () => {
	let containerEl: HTMLElement;
	let timekeep: Store<Timekeep>;
	let settings: Store<TimekeepSettings>;
	let component: TimesheetRunningEntry;

	beforeEach(() => {
		containerEl = createMockContainer();
		timekeep = createStore({ entries: [] });
		settings = createStore(defaultSettings);
	});

	afterEach(() => {
		if (component) component.unload();
	});

	it("should load without error", () => {
		component = new TimesheetRunningEntry(containerEl, timekeep, settings);
		component.load();
	});

	it("should be undefined content without a running entry", () => {
		component = new TimesheetRunningEntry(containerEl, timekeep, settings);
		component.load();
		expect(component.getContent()).toBeUndefined();
	});

	it("should be TimesheetStartRunning when theres a running entry", () => {
		const start = moment();
		timekeep.setState({
			entries: [
				{
					id: v4(),
					name: "Test",
					startTime: moment(start),
					endTime: null,
					subEntries: null,
				},
			],
		});

		component = new TimesheetRunningEntry(containerEl, timekeep, settings);
		component.load();

		expect(component.getContent()).toBeInstanceOf(TimesheetRunningEntryViewing);
	});

	it("should be TimesheetStartEditing when theres a running entry and edit is pressed", () => {
		const start = moment();
		timekeep.setState({
			entries: [
				{
					id: v4(),
					name: "Test",
					startTime: moment(start),
					endTime: null,
					subEntries: null,
				},
			],
		});

		component = new TimesheetRunningEntry(containerEl, timekeep, settings);
		component.load();

		const content = component.getContent() as TimesheetRunningEntryViewing;
		content.onStartEditing();

		expect(component.getContent()).toBeInstanceOf(TimesheetRunningEntryEditing);
	});

	it("timekeep updates when editing should update the running entry", () => {
		const start = moment();
		timekeep.setState({
			entries: [
				{
					id: v4(),
					name: "Test",
					startTime: moment(start),
					endTime: null,
					subEntries: null,
				},
			],
		});

		component = new TimesheetRunningEntry(containerEl, timekeep, settings);
		component.load();

		const content = component.getContent() as TimesheetRunningEntryViewing;
		content.onStartEditing();

		expect(component.getContent()).toBeInstanceOf(TimesheetRunningEntryEditing);

		timekeep.setState(timekeep.getState());

		expect(component.getContent()).toBeInstanceOf(TimesheetRunningEntryEditing);
	});

	it("after a timekeep update when editing if theres no more current entry should return to undefined state", () => {
		const start = moment();
		timekeep.setState({
			entries: [
				{
					id: v4(),
					name: "Test",
					startTime: moment(start),
					endTime: null,
					subEntries: null,
				},
			],
		});

		component = new TimesheetRunningEntry(containerEl, timekeep, settings);
		component.load();

		const content = component.getContent() as TimesheetRunningEntryViewing;
		content.onStartEditing();

		expect(component.getContent()).toBeInstanceOf(TimesheetRunningEntryEditing);

		timekeep.setState({ entries: [] });

		expect(component.getContent()).toBeUndefined();
	});
});
