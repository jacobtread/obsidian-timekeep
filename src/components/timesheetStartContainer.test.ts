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

import { TimesheetStartContainer } from "./timesheetStartContainer";
import { TimesheetStartEditing } from "./timesheetStartEditing";
import { TimesheetStartRunning } from "./timesheetStartRunning";

describe("TimesheetStartContainer", () => {
	let containerEl: HTMLElement;
	let timekeep: Store<Timekeep>;
	let settings: Store<TimekeepSettings>;
	let component: TimesheetStartContainer;

	beforeEach(() => {
		containerEl = createMockContainer();
		timekeep = createStore({ entries: [] });
		settings = createStore(defaultSettings);
	});

	afterEach(() => {
		if (component) component.unload();
	});

	it("should load without error", () => {
		component = new TimesheetStartContainer(containerEl, timekeep, settings);
		component.load();
	});

	it("should be undefined content without a running entry", () => {
		component = new TimesheetStartContainer(containerEl, timekeep, settings);
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

		component = new TimesheetStartContainer(containerEl, timekeep, settings);
		component.load();

		expect(component.getContent()).toBeInstanceOf(TimesheetStartRunning);
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

		component = new TimesheetStartContainer(containerEl, timekeep, settings);
		component.load();

		const content = component.getContent() as TimesheetStartRunning;
		content.onStartEditing();

		expect(component.getContent()).toBeInstanceOf(TimesheetStartEditing);
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

		component = new TimesheetStartContainer(containerEl, timekeep, settings);
		component.load();

		const content = component.getContent() as TimesheetStartRunning;
		content.onStartEditing();

		expect(component.getContent()).toBeInstanceOf(TimesheetStartEditing);

		timekeep.setState(timekeep.getState());

		expect(component.getContent()).toBeInstanceOf(TimesheetStartEditing);
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

		component = new TimesheetStartContainer(containerEl, timekeep, settings);
		component.load();

		const content = component.getContent() as TimesheetStartRunning;
		content.onStartEditing();

		expect(component.getContent()).toBeInstanceOf(TimesheetStartEditing);

		timekeep.setState({ entries: [] });

		expect(component.getContent()).toBeUndefined();
	});
});
