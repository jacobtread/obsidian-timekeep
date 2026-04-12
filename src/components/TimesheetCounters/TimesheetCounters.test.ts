// @vitest-environment happy-dom

import moment from "moment";
import { v4 } from "uuid";
import { describe, it, expect, vi, beforeEach, afterEach, assert } from "vitest";

import { createMockContainer } from "@/__mocks__/obsidian";
import { defaultSettings, TimekeepSettings } from "@/settings";
import { createStore, Store } from "@/store";

import { TimesheetCounters } from "./TimesheetCounters";
import { TimesheetTimer } from "./TimesheetTimer";

import * as queries from "@/timekeep/queries";
import { defaultTimekeep, Timekeep } from "@/timekeep/schema";

describe("TimesheetCounters", () => {
	let container: HTMLElement;
	let settingsStore: Store<TimekeepSettings>;
	let timekeepStore: Store<Timekeep>;
	let component: TimesheetCounters;

	beforeEach(() => {
		vi.clearAllMocks();
		vi.useFakeTimers();

		container = createMockContainer();
		settingsStore = createStore({ ...defaultSettings });
		timekeepStore = createStore(defaultTimekeep());

		component = new TimesheetCounters(container, settingsStore, timekeepStore);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should initialize wrapper and timers on load", () => {
		component.load();

		expect(component.wrapperEl).toBeInstanceOf(HTMLDivElement);
		expect(component.wrapperEl?.className).toBe("timekeep-timers");

		expect(component.currentTimer).toBeInstanceOf(TimesheetTimer);
		expect(component.totalTimer).toBeInstanceOf(TimesheetTimer);
	});

	it("should call updateTimers on load", () => {
		const spy = vi.spyOn(component, "updateTimers");

		component.load();

		expect(spy).toHaveBeenCalled();
	});

	it("should set timer values using getEntryDuration and getTotalDuration", () => {
		component.load();

		assert(component.currentTimer && component.totalTimer);

		const currentSetValues = vi.spyOn(component.currentTimer, "setValues");
		const totalSetValues = vi.spyOn(component.totalTimer, "setValues");
		const setCurrentHidden = vi.spyOn(component.currentTimer, "setHidden");

		component.onUpdate();

		expect(setCurrentHidden).toHaveBeenCalledWith(true);
		expect(currentSetValues).toHaveBeenCalledWith("0s", "0.00h");
		expect(totalSetValues).toHaveBeenCalledWith("0s", "0.00h");
	});

	it("should schedule interval if keep is running", () => {
		vi.spyOn(queries, "isKeepRunning")
			//
			.mockReturnValue(true);

		const registerSpy = vi.spyOn(component, "registerInterval");

		component.load();

		expect(component.currentContentInterval).toBeDefined();
		expect(registerSpy).toHaveBeenCalledWith(component.currentContentInterval);
	});

	it("should clear existing interval before scheduling new one", () => {
		const isKeepRunning = vi.spyOn(queries, "isKeepRunning").mockReturnValue(false);

		const fakeIntervalID = 1000;
		component.currentContentInterval = fakeIntervalID;
		const clearSpy = vi.spyOn(global, "clearInterval");

		isKeepRunning.mockReturnValue(true);
		component.load();

		expect(clearSpy).toHaveBeenCalledWith(fakeIntervalID);
	});

	it("should show the current and total duration if theres a running entry", () => {
		const start = moment();
		const oneHourLater = moment(start).add(1, "hour");

		vi.useFakeTimers();
		vi.setSystemTime(oneHourLater.toDate());

		component.load();

		assert(component.currentTimer && component.totalTimer);

		const currentSetValues = vi.spyOn(component.currentTimer, "setValues");
		const totalSetValues = vi.spyOn(component.totalTimer, "setValues");
		const setCurrentHidden = vi.spyOn(component.currentTimer, "setHidden");

		timekeepStore.setState({
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

		expect(setCurrentHidden).toHaveBeenCalledWith(false);
		expect(currentSetValues).toHaveBeenCalledWith("1h 0s", "1.00h");
		expect(totalSetValues).toHaveBeenCalledWith("1h 0s", "1.00h");
	});

	it("should show total duration as the sum of all entry durations", () => {
		const start = moment();
		const oneHourLater = moment(start).add(1, "hour");

		vi.useFakeTimers();
		vi.setSystemTime(oneHourLater.toDate());

		component.load();

		assert(component.currentTimer && component.totalTimer);

		const currentSetValues = vi.spyOn(component.currentTimer, "setValues");
		const totalSetValues = vi.spyOn(component.totalTimer, "setValues");
		const setCurrentHidden = vi.spyOn(component.currentTimer, "setHidden");

		timekeepStore.setState({
			entries: [
				// 1h elapsed entry
				{
					id: v4(),
					name: "Test",
					startTime: moment(start),
					endTime: null,
					subEntries: null,
				},
				// 2h entry
				{
					id: v4(),
					name: "Test",
					startTime: moment(start).subtract(1, "hour"),
					endTime: moment(oneHourLater),
					subEntries: null,
				},
			],
		});

		expect(setCurrentHidden).toHaveBeenCalledWith(false);
		expect(currentSetValues).toHaveBeenCalledWith("1h 0s", "1.00h");
		expect(totalSetValues).toHaveBeenCalledWith("3h 0s", "3.00h");
	});
});
