// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import type { Store } from "@/store";

import { createMockContainer, MockVault } from "@/__mocks__/obsidian";
import { TimekeepAutocomplete } from "@/service/autocomplete";
import { TimekeepRegistry } from "@/service/registry";
import { defaultSettings, type TimekeepSettings } from "@/settings";
import { createStore } from "@/store";
import * as debounceUtil from "@/utils/debounce";

import { TimesheetNameInput } from "./timesheetNameInput";

describe("TimesheetNameInput", () => {
	let containerEl: HTMLElement;
	let vault: MockVault;

	let settings: Store<TimekeepSettings>;
	let registry: TimekeepRegistry;
	let autocomplete: TimekeepAutocomplete;
	let debounced: Mock<typeof debounceUtil.debounced>;

	beforeEach(() => {
		vi.clearAllMocks();

		vault = new MockVault();
		containerEl = createMockContainer();
		settings = createStore(defaultSettings);

		registry = new TimekeepRegistry(vault.asVault(), settings);
		autocomplete = new TimekeepAutocomplete(registry, settings);

		debounced = vi
			.spyOn(debounceUtil, "debounced")
			// Mock debounce that just immediately calls the function without debouncing
			.mockImplementation((callback) => {
				return function (...args) {
					callback(...args);
				};
			});
	});

	it("should load without error", () => {
		const component = new TimesheetNameInput(containerEl, autocomplete);
		expect(() => component.load()).not.toThrow();
	});

	it("typing should not render suggestions when there is no data", () => {
		const component = new TimesheetNameInput(containerEl, autocomplete);

		const onDebouncedChange = vi.spyOn(component, "onDebouncedChange");
		const setSuggestionFocus = vi.spyOn(component, "setSuggestionFocus");

		component.load();

		const inputEl = containerEl.querySelector(".timekeep-name")! as HTMLInputElement;
		expect(inputEl).not.toBeNull();

		inputEl.value = "Test";
		inputEl.dispatchEvent(new Event("input", { bubbles: true }));

		// Debounced change should occur
		expect(debounced).toHaveBeenCalledOnce();
		expect(onDebouncedChange).toHaveBeenCalledOnce();

		// Selection focus should reset
		expect(setSuggestionFocus).toHaveBeenCalledExactlyOnceWith(-1);

		// Suggestions should stay empty
		const suggestions = containerEl.querySelectorAll(".timekeep-suggestion");
		expect(suggestions.length).toBe(0);
	});

	it("typing should render suggestions after a debounce", () => {
		const component = new TimesheetNameInput(containerEl, autocomplete);

		const getFilteredSuggestions = vi
			.spyOn(component, "getFilteredSuggestions")
			.mockReturnValueOnce([
				{ item: "Test", refIndex: 0 },
				{ item: "Test 2", refIndex: 1 },
			]);
		const onDebouncedChange = vi.spyOn(component, "onDebouncedChange");
		const setSuggestionFocus = vi.spyOn(component, "setSuggestionFocus");

		component.load();

		const inputEl = containerEl.querySelector(".timekeep-name")! as HTMLInputElement;
		expect(inputEl).not.toBeNull();

		inputEl.value = "Test";
		inputEl.dispatchEvent(new Event("input", { bubbles: true }));

		// Debounced change should occur
		expect(debounced).toHaveBeenCalledOnce();
		expect(onDebouncedChange).toHaveBeenCalledOnce();
		expect(getFilteredSuggestions).toHaveBeenCalledOnce();

		// Selection focus should reset to the first suggestion
		expect(setSuggestionFocus).toHaveBeenLastCalledWith(0);

		// Suggestions should stay empty
		const suggestions = containerEl.querySelectorAll(".timekeep-suggestion");
		expect(suggestions.length).toBe(2);
	});

	it("suggestions should be filtered based on the input value", () => {});

	it("suggestion text should be highlighted based on the matched text", () => {});

	it("focusing the input should do nothing if theres no suggestions", () => {});

	it("focusing the input should show the suggestions box if there are suggestions", () => {});

	it("should be able to retrieve the input value", () => {});

	it("should be able to reset the input value", () => {});

	it("arrow keys should be able to change the focused suggestion", () => {});

	it("enter should select the focused suggestion", () => {});

	it("escape should close the suggestions", () => {});

	it("clicking or touching outside the input container should close suggestions", () => {});

	it("nil selection should be reflected by the element attributes", () => {});

	it("suggestions updates should do nothing if the elements are not all present", () => {});

	it("selecting a suggestion should close the suggestions", () => {});

	it("clicking a suggestion should select it and close the suggestions", () => {});

	it("should render nothing if the suggestions container is missing", () => {});

	it("should not render suggestions when theres none", () => {});
});
