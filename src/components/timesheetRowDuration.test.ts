// @vitest-environment happy-dom

import moment from "moment";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { createMockContainer } from "@/__mocks__/obsidian";
import * as queries from "@/timekeep/queries";
import * as timeUtils from "@/utils/time";

import { TimesheetRowDuration } from "./timesheetRowDuration";

describe("TimesheetRowDuration", () => {
	let container: HTMLElement;
	let entry: any;
	let component: TimesheetRowDuration;

	beforeEach(() => {
		container = createMockContainer();

		entry = { id: 1 }; // mock TimeEntry

		// Reset mocks
		vi.clearAllMocks();

		// Mock helper functions
		vi.spyOn(queries, "isEntryRunning").mockReturnValue(false);
		vi.spyOn(queries, "getEntryDuration").mockReturnValue(42); // arbitrary duration
		vi.spyOn(timeUtils, "formatDurationLong").mockReturnValue("42s");

		// Mock setInterval / clearInterval
		vi.useFakeTimers();

		component = new TimesheetRowDuration(container, entry);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should create a wrapper span with the correct class", () => {
		component.load();

		expect(component.wrapperEl).toBeInstanceOf(HTMLSpanElement);
		expect(component.wrapperEl?.className).toBe("timekeep-time");
	});

	it("should call updateTime on load", () => {
		const spy = vi.spyOn(component, "updateTime");

		component.load();

		expect(spy).toHaveBeenCalled();
	});

	it("should set textContent based on getEntryDuration and formatDurationLong", () => {
		component.load();

		expect(queries.getEntryDuration).toHaveBeenCalledWith(entry, expect.any(moment));
		expect(timeUtils.formatDurationLong).toHaveBeenCalledWith(42);
		expect(component.wrapperEl?.textContent).toBe("42s");
	});

	it("should schedule interval if entry is running", () => {
		(queries.isEntryRunning as any).mockReturnValue(true);
		const registerSpy = vi.spyOn(component, "registerInterval");

		component.load();

		expect(component.currentContentInterval).toBeDefined();
		expect(registerSpy).toHaveBeenCalledWith(component.currentContentInterval);
	});

	it("should clear existing interval before scheduling new one", () => {
		const fakeInterval = 1234;
		component.currentContentInterval = fakeInterval;
		const clearSpy = vi.spyOn(global, "clearInterval");

		(queries.isEntryRunning as any).mockReturnValue(true);
		component.load();

		expect(clearSpy).toHaveBeenCalledWith(fakeInterval);
	});

	it("should not schedule interval if entry is not running", () => {
		(queries.isEntryRunning as any).mockReturnValue(false);
		const registerSpy = vi.spyOn(component, "registerInterval");
		component.load();

		expect(component.currentContentInterval).not.toBeDefined();
		expect(registerSpy).not.toHaveBeenCalled();
	});

	it("update time should not work before load", () => {
		component.updateTime();

		expect(component.wrapperEl).toBeUndefined();
		expect(queries.getEntryDuration).not.toHaveBeenCalled();
	});
});
