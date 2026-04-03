// @vitest-environment happy-dom

import { describe, it, expect, vi, beforeEach, Mock } from "vitest";

import { createMockContainer } from "@/__mocks__/obsidian";
import { createStore, Store } from "@/store";
import { stripTimekeepRuntimeData, Timekeep } from "@/timekeep/schema";

import { TimesheetSaveError } from "./timesheetSaveError";

describe("TimesheetSaveError", () => {
	let container: HTMLElement;
	let timekeepStore: Store<Timekeep>;
	let handleSaveTimekeep: (value: Timekeep) => Promise<void>;
	let component: TimesheetSaveError;

	let writeText: Mock<() => any>;

	beforeEach(() => {
		container = createMockContainer();
		timekeepStore = createStore({ entries: [] });
		handleSaveTimekeep = vi.fn().mockResolvedValue(undefined as void);
		component = new TimesheetSaveError(container, timekeepStore, handleSaveTimekeep);

		writeText = vi.fn().mockResolvedValue(undefined);

		// Mock the clipboard
		Object.defineProperty(globalThis.navigator, "clipboard", {
			configurable: true,
			value: {
				writeText,
			},
		});
	});

	it("renders wrapper, error message, and buttons on load", () => {
		component.onload();

		const wrapper = container.querySelector(".timekeep-container");
		expect(wrapper).not.toBeNull();

		const errorDiv = wrapper!.querySelector(".timekeep-error");
		expect(errorDiv).not.toBeNull();

		expect(errorDiv!.textContent).toContain("Warning");
		expect(errorDiv!.textContent).toContain("Failed to save current timekeep");

		const actions = wrapper!.querySelector(".timekeep-actions");
		expect(actions).not.toBeNull();

		const buttons = Array.from(actions!.querySelectorAll("button")).map((b) => b.textContent);
		expect(buttons).toContain("Retry");
		expect(buttons).toContain("Copy Timekeep");
	});

	it("calls handleSaveTimekeep on retry button click", () => {
		component.onload();
		component.onRetrySave();
		expect(handleSaveTimekeep).toHaveBeenCalledWith(timekeepStore.getState());
	});

	it("writes JSON to clipboard on copy button click", async () => {
		component.onload();

		await component.onCopy();

		expect(writeText).toHaveBeenCalledWith(
			JSON.stringify(stripTimekeepRuntimeData(timekeepStore.getState()))
		);
	});

	it("removes wrapper on unload", () => {
		component.onload();
		component.onunload();
		const wrapper = container.querySelector(".timekeep-container");
		expect(wrapper).toBeNull();
	});
});
