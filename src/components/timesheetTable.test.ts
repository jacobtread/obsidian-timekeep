// @vitest-environment happy-dom

import moment from "moment";
import { type App } from "obsidian";
import { v4 } from "uuid";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Timekeep } from "@/timekeep/schema";

import { createMockContainer } from "@/__mocks__/obsidian";
import { defaultSettings, type TimekeepSettings } from "@/settings";
import { createStore, type Store } from "@/store";
import { assert } from "@/utils/assert";

import { TimesheetTable } from "./timesheetTable";

describe("TimesheetTable", () => {
	let containerEl: HTMLElement;
	let app: App;
	let timekeep: Store<Timekeep>;
	let settings: Store<TimekeepSettings>;
	let component: TimesheetTable;

	beforeEach(() => {
		containerEl = createMockContainer();
		app = {} as App;
		timekeep = createStore({ entries: [] });
		settings = createStore(defaultSettings);
		component = new TimesheetTable(containerEl, app, timekeep, settings);
	});

	it("should load without error", () => {
		expect(() => component.load()).not.toThrow();
	});

	it("should be able to render rows", () => {
		const start = moment();
		timekeep.setState({
			entries: [
				{
					id: v4(),
					name: "Test",
					startTime: moment(start),
					endTime: moment(start),
					subEntries: null,
				},
			],
		});
		component.load();
	});

	it("should be able to render groups with nested rows", () => {
		const start = moment();
		timekeep.setState({
			entries: [
				{
					id: v4(),
					name: "Test",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							id: v4(),
							name: "Test",
							startTime: moment(start),
							endTime: moment(start),
							subEntries: null,
						},
					],
				},
			],
		});
		component.load();
	});

	it("disabling the limitTableSize setting should set maxHeight and overflowY", () => {
		settings.setState({ ...defaultSettings, limitTableSize: false });
		component.load();

		const wrapper = component.wrapperEl;
		assert(wrapper);

		expect(wrapper.style.maxHeight).toBe("");
		expect(wrapper.style.overflowY).toBe("");
	});

	it("should be to re-render on changed timekeep", () => {
		const start = moment();
		timekeep.setState({
			entries: [
				{
					id: v4(),
					name: "Test",
					startTime: null,
					endTime: null,
					subEntries: [
						{
							id: v4(),
							name: "Test",
							startTime: moment(start),
							endTime: moment(start),
							subEntries: null,
						},
					],
				},
			],
		});
		const removeChild = vi.spyOn(component, "removeChild");

		component.load();

		timekeep.setState({
			entries: [
				{
					id: v4(),
					name: "Test",
					startTime: null,
					endTime: null,
					subEntries: [],
				},
			],
		});

		expect(removeChild).toHaveBeenCalled();
	});
});
