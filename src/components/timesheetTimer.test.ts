// @vitest-environment happy-dom

import { describe, it, beforeEach, expect } from "vitest";

import { createMockContainer } from "@/__mocks__/obsidian";

import { TimesheetTimer } from "./timesheetTimer";

describe("TimesheetTimer", () => {
	let container: ReturnType<typeof createMockContainer>;
	let timer: TimesheetTimer;

	beforeEach(() => {
		container = createMockContainer();
		timer = new TimesheetTimer(container, "Test Label");
	});

	it("should create timer elements on load", () => {
		timer.load();

		const timerEl = container.children[0] as HTMLElement;
		expect(timerEl).toBeDefined();
		expect(timerEl.className).toBe("timekeep-timer");

		const primary = timerEl.children[0] as HTMLElement;
		const secondary = timerEl.children[1] as HTMLElement;
		const label = timerEl.children[2] as HTMLElement;

		expect(primary.className).toBe("timekeep-timer-value");
		expect(secondary.className).toBe("timekeep-timer-value-small");
		expect(label.textContent).toBe("Test Label");

		expect(primary.textContent).toBe("");
		expect(secondary.textContent).toBe(" ");
		expect(secondary.hidden).toBe(false);
	});

	it("should remove timer element on unload", () => {
		timer.load();
		const timerEl = container.children[0] as HTMLElement;
		expect(timerEl).toBeDefined();

		timer.unload();
		expect(timerEl.parentElement).toBeNull();
	});

	it("should hide or show the timer element", () => {
		timer.load();
		const timerEl = container.children[0] as HTMLElement;

		timer.setHidden(true);
		expect(timerEl.hidden).toBe(true);

		timer.setHidden(false);
		expect(timerEl.hidden).toBe(false);
	});

	it("should set primary and secondary values correctly", () => {
		timer.load();
		const timerEl = container.children[0] as HTMLElement;
		const primary = timerEl.children[0] as HTMLDivElement;
		const secondary = timerEl.children[1] as HTMLDivElement;

		timer.setValues("1h 55m 30s", "1.9h");
		expect(primary.textContent).toBe("1h 55m 30s");
		expect(secondary.textContent).toBe("1.9h");
		expect(secondary.hidden).toBe(false);

		timer.setValues("2h 0m 5s", "");
		expect(primary.textContent).toBe("2h 0m 5s");
		expect(secondary.textContent).toBe("");
		expect(secondary.hidden).toBe(true);
	});

	it("secondary value should be hidden if it is empty", () => {
		timer.load();

		const timerEl = container.children[0] as HTMLElement;
		const secondary = timerEl.children[1] as HTMLDivElement;

		timer.setValues("1h 55m 30s", "1.9h");
		expect(secondary.hidden).toBe(false);

		timer.setValues("2h 0m 5s", "");
		expect(secondary.hidden).toBe(true);
	});

	it("should not throw if setValues called before onload", () => {
		expect(() => timer.setValues("1", "2")).not.toThrow();
	});

	it("should not throw if setHidden called before onload", () => {
		expect(() => timer.setHidden(true)).not.toThrow();
	});
});
