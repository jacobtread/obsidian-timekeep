// @vitest-environment happy-dom

import moment from "moment";
import { v4 } from "uuid";
import { describe, it, vi, beforeEach, afterEach, expect } from "vitest";

import type { TimeEntry, Timekeep } from "@/timekeep/schema";

import { createMockContainer } from "@/__mocks__/obsidian";
import { defaultSettings, type TimekeepSettings } from "@/settings";
import { createStore, type Store } from "@/store";

import { TimesheetStartRunning } from "./timesheetStartRunning";

describe("TimesheetStartRunning", () => {
	let containerEl: HTMLElement;
	let timekeep: Store<Timekeep>;
	let settings: Store<TimekeepSettings>;
	let onStartEditing: VoidFunction;
	let component: TimesheetStartRunning;

	const start = moment();
	const entry: TimeEntry = {
		id: v4(),
		name: "Group",
		startTime: null,
		endTime: null,
		subEntries: [
			{
				id: v4(),
				name: "Test",
				startTime: moment(start),
				endTime: null,
				subEntries: null,
			},
		],
	};

	beforeEach(() => {
		containerEl = createMockContainer();
		timekeep = createStore({ entries: [] });
		settings = createStore(defaultSettings);
		onStartEditing = vi.fn();
	});

	afterEach(() => {
		if (component) component.unload();
	});

	it("should load without error", () => {
		component = new TimesheetStartRunning(
			containerEl,
			timekeep,
			settings,
			entry,
			onStartEditing
		);
		component.load();
	});

	it("should be able to stop the entry", () => {
		const start = moment();
		const end = moment().add(1, "hour");
		vi.setSystemTime(end.toDate());

		const id = v4();

		timekeep.setState({
			entries: [
				{
					id,
					name: "Test",
					startTime: moment(start),
					endTime: null,
					subEntries: null,
				},
			],
		});

		component = new TimesheetStartRunning(
			containerEl,
			timekeep,
			settings,
			entry,
			onStartEditing
		);

		const onStop = vi.spyOn(component, "onStop");

		component.load();

		const formEl = component.wrapperEl;
		expect(formEl).not.toBeNull();
		(formEl as HTMLFormElement).dispatchEvent(
			new SubmitEvent("submit", { bubbles: true, cancelable: true })
		);

		expect(onStop).toHaveBeenCalled();

		expect(timekeep.getState()).toEqual({
			entries: [
				{
					id,
					name: "Test",
					startTime: moment(start),
					endTime: moment(end),
					subEntries: null,
				},
			],
		});
	});

	it("nested running entry should have a path", () => {
		const start = moment();
		const end = moment().add(1, "hour");
		vi.setSystemTime(end.toDate());

		const entry = {
			id: v4(),
			name: "Test",
			startTime: moment(start),
			endTime: null,
			subEntries: null,
		};

		timekeep.setState({
			entries: [
				{
					id: v4(),
					name: "Outer",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							id: v4(),
							name: "Inner",
							startTime: null,
							endTime: null,
							subEntries: [entry],
						},
					],
				},
			],
		});

		component = new TimesheetStartRunning(
			containerEl,
			timekeep,
			settings,
			entry,
			onStartEditing
		);

		component.load();

		const pathEls = component.wrapperEl!.querySelectorAll(".timekeep-path-to-entry__segment");
		expect(pathEls.length).toBe(3);

		expect(pathEls.item(0).textContent).toBe("Outer >");
		expect(pathEls.item(1).textContent).toBe("Inner >");
		expect(pathEls.item(2).textContent).toBe("Test");
	});
});
