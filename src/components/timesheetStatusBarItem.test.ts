// @vitest-environment happy-dom

import moment from "moment";
import { v4 } from "uuid";
import { describe, beforeEach, it, expect, vi, afterEach } from "vitest";

import { createMockContainer } from "@/__mocks__/obsidian";
import { TimeEntry } from "@/timekeep/schema";

import { TimesheetStatusBarItem } from "./timesheetStatusBarItem";

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
	let containerEl: HTMLElement;
	let onOpen: VoidFunction;
	let onStop: VoidFunction;

	beforeEach(() => {
		onOpen = vi.fn();
		onStop = vi.fn();

		vi.useFakeTimers();
		vi.setSystemTime(oneHourLater.toDate());

		containerEl = createMockContainer();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("should initialize with the correct entry and callback functions", () => {
		const statusBarItem = new TimesheetStatusBarItem(containerEl, entry, onOpen, onStop);

		expect(statusBarItem.entry).toBe(entry);
		expect(statusBarItem.onOpen).toBe(onOpen);
		expect(statusBarItem.onStop).toBe(onStop);
	});

	it("should call onStop when the stop icon is clicked", () => {
		const statusBarItem = new TimesheetStatusBarItem(containerEl, entry, onOpen, onStop);
		statusBarItem.load();

		// Simulate click on the stop icon
		const stopIcon = containerEl.querySelector(".button-icon");
		const event = new MouseEvent("click", { bubbles: true, cancelable: true });
		if (stopIcon) {
			stopIcon.dispatchEvent(event);
		}

		expect(onStop).toHaveBeenCalledTimes(1);
	});

	it("should call onOpen when the content area is clicked", () => {
		const statusBarItem = new TimesheetStatusBarItem(containerEl, entry, onOpen, onStop);
		statusBarItem.load();

		// Simulate click on the content element
		const contentEl = containerEl.querySelector(".timekeep-status-item__content");
		const event = new MouseEvent("click", { bubbles: true, cancelable: true });
		if (contentEl) {
			contentEl.dispatchEvent(event);
		}

		expect(onOpen).toHaveBeenCalledTimes(1);
	});
});
