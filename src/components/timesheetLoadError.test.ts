// @vitest-environment happy-dom

import { describe, it, expect, beforeEach } from "vitest";

import { createMockContainer } from "@/__mocks__/obsidian";

import { TimesheetLoadError } from "./timesheetLoadError";

describe("TimesheetLoadError", () => {
	let container: HTMLElement;
	let errorMsg: string;
	let component: TimesheetLoadError;

	beforeEach(() => {
		container = createMockContainer();
		errorMsg = "Network error";
		component = new TimesheetLoadError(container, errorMsg);
	});

	it("should render the error message inside a wrapper on load", () => {
		component.onload();
		expect(container.children.length).toBe(1);

		const wrapper = container.children[0] as HTMLElement;
		expect(wrapper.className).toBe("timekeep-container");

		const p = wrapper.querySelector("p");
		expect(p).not.toBeNull();
		expect(p!.textContent).toBe(`Failed to load timekeep: ${errorMsg}`);
	});

	it("should remove wrapper on unload", () => {
		component.onload();

		expect(container.children.length).toBe(1);

		component.unload();
		expect(container.children.length).toBe(0);
	});
});
