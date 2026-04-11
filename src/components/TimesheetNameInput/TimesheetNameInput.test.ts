// @vitest-environment happy-dom

import { beforeEach, describe, expect, it, Mock, vi } from "vitest";

import type { Store } from "@/store";

import { createMockContainer, MockVault } from "@/__mocks__/obsidian";
import { defaultSettings, type TimekeepSettings } from "@/settings";
import { createStore } from "@/store";
import * as debounceUtil from "@/utils/debounce";

import { TimesheetNameInput } from "./TimesheetNameInput";

import { TimekeepAutocomplete } from "@/service/autocomplete";
import { TimekeepRegistry } from "@/service/registry";

describe("TimesheetNameInput", () => {
	let containerEl: HTMLElement;
	let vault: MockVault;

	let settings: Store<TimekeepSettings>;
	let registry: TimekeepRegistry;
	let autocomplete: TimekeepAutocomplete;
	let debounced: Mock<typeof debounceUtil.debounced>;
	let component: TimesheetNameInput;

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

		component = new TimesheetNameInput(containerEl, autocomplete);
	});

	it("should load without error", () => {
		expect(() => component.load()).not.toThrow();
	});

	it("typing should not render suggestions when there is no data", () => {
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
		autocomplete.names.setState(["Test", "Test 2"]);

		const getFilteredSuggestions = vi.spyOn(component, "getFilteredSuggestions");
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

		// Selection focus should reset to nothing
		expect(setSuggestionFocus).toHaveBeenLastCalledWith(-1);

		// Suggestions should contain both items
		const suggestions = containerEl.querySelectorAll(".timekeep-suggestion");
		expect(suggestions.length).toBe(2);
	});

	it("suggestions should be filtered based on the input value", () => {
		autocomplete.names.setState(["Test", "Other"]);

		const getFilteredSuggestions = vi.spyOn(component, "getFilteredSuggestions");
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

		// Selection focus should reset to nothing
		expect(setSuggestionFocus).toHaveBeenLastCalledWith(-1);

		// Suggestions should contain just the matching item
		const suggestions = containerEl.querySelectorAll(".timekeep-suggestion");
		expect(suggestions.length).toBe(1);

		// Item should match
		const suggestion = suggestions.item(0);
		expect(suggestion.textContent).toBe("Test");
	});

	it("suggestion text should be highlighted based on the matched text", () => {
		autocomplete.names.setState([
			"Test",
			"Before Test After",
			"Before Test",
			"Test After",
			"Test After Test",
		]);
		component.load();

		const inputEl = containerEl.querySelector(".timekeep-name")! as HTMLInputElement;
		expect(inputEl).not.toBeNull();

		inputEl.focus();

		inputEl.value = "Test";
		inputEl.dispatchEvent(new Event("input", { bubbles: true }));

		// Suggestions should contain just the matching item
		const suggestions = containerEl.querySelectorAll(".timekeep-suggestion");
		expect(suggestions.length).toBe(5);

		for (let i = 0; i < suggestions.length; i++) {
			const suggestion = suggestions.item(i);

			switch (suggestion.textContent) {
				case "Test":
					expect(suggestion.innerHTML).toBe("<mark>Test</mark>");
					break;
				case "Before Test After":
					expect(suggestion.innerHTML).toBe(
						"Before <mark>Test</mark> Af<mark>te</mark>r"
					);
					break;
				case "Before Test":
					expect(suggestion.innerHTML).toBe("Before <mark>Test</mark>");
					break;
				case "Test After":
					expect(suggestion.innerHTML).toBe("<mark>Test</mark> Af<mark>te</mark>r");
					break;
				case "Test After Test":
					expect(suggestion.innerHTML).toBe(
						"<mark>Test</mark> Af<mark>te</mark>r <mark>Test</mark>"
					);
					break;
				default:
					throw new Error("unexpected text content");
			}
		}
	});
	it("suggestion text should be not be highlighted if matches are missing", () => {
		const getFilteredSuggestions = vi
			.spyOn(component, "getFilteredSuggestions")
			.mockReturnValue([
				{ item: "Test", refIndex: 0 },
				{ item: "Before Test After", refIndex: 1 },
			]);
		component.load();

		const inputEl = containerEl.querySelector(".timekeep-name")! as HTMLInputElement;
		expect(inputEl).not.toBeNull();

		inputEl.focus();

		inputEl.value = "Test";
		inputEl.dispatchEvent(new Event("input", { bubbles: true }));

		// Suggestions should contain just the matching item
		const suggestions = containerEl.querySelectorAll(".timekeep-suggestion");
		expect(suggestions.length).toBe(2);
		expect(getFilteredSuggestions).toHaveBeenCalled();

		for (let i = 0; i < suggestions.length; i++) {
			const suggestion = suggestions.item(i);

			switch (suggestion.textContent) {
				case "Test":
					expect(suggestion.innerHTML).toBe("Test");
					break;
				case "Before Test After":
					expect(suggestion.innerHTML).toBe("Before Test After");
					break;

				default:
					throw new Error("unexpected text content");
			}
		}
	});

	it("focusing the input should do nothing if theres no suggestions", () => {});

	it("focusing the input should show the suggestions box if there are suggestions", () => {});

	it("should be able to retrieve the input value", () => {
		autocomplete.names.setState(["Test", "Test 1"]);
		component.load();

		const inputEl = containerEl.querySelector(".timekeep-name")! as HTMLInputElement;
		expect(inputEl).not.toBeNull();

		inputEl.value = "Test";

		expect(component.getValue()).toBe("Test");
	});

	it("should get an empty string attempting to retrieve the input value before load", () => {
		expect(component.getValue()).toBe("");
	});

	it("should be able to reset the input value", () => {
		autocomplete.names.setState(["Test", "Test 1"]);
		component.load();

		const inputEl = containerEl.querySelector(".timekeep-name")! as HTMLInputElement;
		expect(inputEl).not.toBeNull();

		inputEl.value = "Test";

		expect(component.getValue()).toBe("Test");

		component.resetValue();

		expect(component.getValue()).toBe("");
		expect(inputEl.value).toBe("");
	});

	it("resetting the input value before loading should do nothing", () => {
		component.resetValue();
	});

	it("down arrow should be able to move the focused suggestion down", () => {
		autocomplete.names.setState(["Test", "Test 1"]);

		const onKeyDown = vi.spyOn(component, "onKeyDown");
		const onSelectSuggestion = vi.spyOn(component, "onSelectSuggestion");

		component.load();

		const inputEl = containerEl.querySelector(".timekeep-name")! as HTMLInputElement;
		expect(inputEl).not.toBeNull();

		inputEl.value = "Test";
		inputEl.focus();
		inputEl.dispatchEvent(new Event("focus", { bubbles: true }));
		inputEl.dispatchEvent(new Event("input", { bubbles: true }));
		inputEl.dispatchEvent(
			new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "ArrowDown" })
		);
		inputEl.dispatchEvent(
			new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "ArrowDown" })
		);
		inputEl.dispatchEvent(
			new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Enter" })
		);

		expect(onKeyDown).toHaveBeenCalledTimes(3);
		expect(onSelectSuggestion).toHaveBeenLastCalledWith("Test 1");
	});

	it("down arrow should open the suggestions when they are closed", () => {
		autocomplete.names.setState(["Test", "Test 1"]);

		const onKeyDown = vi.spyOn(component, "onKeyDown");
		const onSelectSuggestion = vi.spyOn(component, "onSelectSuggestion");
		const setSuggestionsOpen = vi.spyOn(component, "setSuggestionsOpen");

		component.load();

		const inputEl = containerEl.querySelector(".timekeep-name")! as HTMLInputElement;
		expect(inputEl).not.toBeNull();

		inputEl.value = "Test";
		inputEl.focus();
		inputEl.dispatchEvent(new Event("focus", { bubbles: true }));
		inputEl.dispatchEvent(new Event("input", { bubbles: true }));
		inputEl.dispatchEvent(
			new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Escape" })
		);

		//
		inputEl.dispatchEvent(
			new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "ArrowDown" })
		);

		expect(setSuggestionsOpen).toHaveBeenLastCalledWith(true);

		inputEl.dispatchEvent(
			new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Enter" })
		);

		expect(onKeyDown).toHaveBeenCalledTimes(3);
		expect(onSelectSuggestion).toHaveBeenLastCalledWith("Test");
	});

	it("up arrow should be able to move the focused suggestion up", () => {
		autocomplete.names.setState(["Test", "Test 1"]);

		const onKeyDown = vi.spyOn(component, "onKeyDown");
		const onSelectSuggestion = vi.spyOn(component, "onSelectSuggestion");

		component.load();

		const inputEl = containerEl.querySelector(".timekeep-name")! as HTMLInputElement;
		expect(inputEl).not.toBeNull();

		inputEl.value = "Test";
		inputEl.focus();
		inputEl.dispatchEvent(new Event("input", { bubbles: true }));
		inputEl.dispatchEvent(
			new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "ArrowDown" })
		);
		inputEl.dispatchEvent(
			new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "ArrowDown" })
		);
		inputEl.dispatchEvent(
			new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "ArrowUp" })
		);
		inputEl.dispatchEvent(
			new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Enter" })
		);

		expect(onKeyDown).toHaveBeenCalledTimes(4);
		expect(onSelectSuggestion).toHaveBeenLastCalledWith("Test");
	});

	it("enter should select the focused suggestion", () => {
		autocomplete.names.setState(["Test", "Other"]);

		const onKeyDown = vi.spyOn(component, "onKeyDown");
		const onSelectSuggestion = vi.spyOn(component, "onSelectSuggestion");

		component.load();

		const inputEl = containerEl.querySelector(".timekeep-name")! as HTMLInputElement;
		expect(inputEl).not.toBeNull();

		inputEl.value = "Test";
		inputEl.focus();
		inputEl.dispatchEvent(new Event("input", { bubbles: true }));
		inputEl.dispatchEvent(
			new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "ArrowDown" })
		);
		inputEl.dispatchEvent(
			new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Enter" })
		);

		expect(onKeyDown).toHaveBeenCalledTimes(2);
		expect(onSelectSuggestion).toHaveBeenLastCalledWith("Test");
	});

	it("enter should do nothing without a focused suggestion", () => {
		autocomplete.names.setState(["Test", "Other"]);

		const onKeyDown = vi.spyOn(component, "onKeyDown");
		const onSelectSuggestion = vi.spyOn(component, "onSelectSuggestion");

		component.load();

		const inputEl = containerEl.querySelector(".timekeep-name")! as HTMLInputElement;
		expect(inputEl).not.toBeNull();

		inputEl.value = "Test";
		inputEl.focus();
		inputEl.dispatchEvent(new Event("input", { bubbles: true }));

		inputEl.dispatchEvent(
			new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Enter" })
		);

		expect(onKeyDown).toHaveBeenCalledTimes(1);
		expect(onSelectSuggestion).not.toHaveBeenCalled();
	});

	it("enter should do nothing when the suggestions box is closed", () => {
		autocomplete.names.setState(["Test", "Test 1", "Other"]);

		const onKeyDown = vi.spyOn(component, "onKeyDown");
		const onSelectSuggestion = vi.spyOn(component, "onSelectSuggestion");
		const setSuggestionsOpen = vi.spyOn(component, "setSuggestionsOpen");
		const onClickOutside = vi.spyOn(component, "onClickOutside");

		component.load();

		const inputEl = containerEl.querySelector(".timekeep-name")! as HTMLInputElement;
		expect(inputEl).not.toBeNull();

		inputEl.value = "Test";
		inputEl.focus();
		inputEl.dispatchEvent(new Event("input", { bubbles: true }));

		inputEl.dispatchEvent(
			new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "ArrowDown" })
		);

		document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
		expect(onClickOutside).toHaveBeenCalledOnce();

		expect(setSuggestionsOpen).toHaveBeenLastCalledWith(false);

		inputEl.dispatchEvent(
			new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Enter" })
		);

		expect(onKeyDown).toHaveBeenCalledTimes(2);
		expect(onSelectSuggestion).not.toHaveBeenCalled();
	});

	it("enter should do nothing without any suggestions", () => {
		autocomplete.names.setState(["Test", "Other"]);

		const onKeyDown = vi.spyOn(component, "onKeyDown");
		const onSelectSuggestion = vi.spyOn(component, "onSelectSuggestion");

		component.load();

		const inputEl = containerEl.querySelector(".timekeep-name")! as HTMLInputElement;
		expect(inputEl).not.toBeNull();
		inputEl.dispatchEvent(
			new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Enter" })
		);

		expect(onKeyDown).toHaveBeenCalledOnce();
		expect(onSelectSuggestion).not.toHaveBeenCalled();
	});

	it("escape should close the suggestions", () => {
		autocomplete.names.setState(["Test", "Other"]);

		const onKeyDown = vi.spyOn(component, "onKeyDown");
		const setSuggestionsOpen = vi.spyOn(component, "setSuggestionsOpen");

		component.load();

		const inputEl = containerEl.querySelector(".timekeep-name")! as HTMLInputElement;
		expect(inputEl).not.toBeNull();

		inputEl.value = "Test";
		inputEl.focus();

		inputEl.dispatchEvent(
			new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Escape" })
		);

		expect(onKeyDown).toHaveBeenCalledOnce();
		expect(setSuggestionsOpen).toHaveBeenLastCalledWith(false);
	});

	it("other keys should be ignored", () => {
		autocomplete.names.setState(["Test", "Other"]);

		const onKeyDown = vi.spyOn(component, "onKeyDown");

		component.load();

		const inputEl = containerEl.querySelector(".timekeep-name")! as HTMLInputElement;
		expect(inputEl).not.toBeNull();

		inputEl.value = "Test";
		inputEl.focus();
		inputEl.dispatchEvent(new Event("input", { bubbles: true }));
		inputEl.dispatchEvent(
			new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "W" })
		);

		expect(onKeyDown).toHaveBeenCalledOnce();
	});

	it("clicking outside the input container should close suggestions", () => {
		const component = new TimesheetNameInput(containerEl, autocomplete);

		autocomplete.names.setState(["Test", "Other"]);

		const onClickOutside = vi.spyOn(component, "onClickOutside");
		const setSuggestionsOpen = vi.spyOn(component, "setSuggestionsOpen");

		component.load();

		const inputEl = containerEl.querySelector(".timekeep-name")! as HTMLInputElement;
		expect(inputEl).not.toBeNull();

		inputEl.value = "Test";
		inputEl.focus();

		document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

		expect(onClickOutside).toHaveBeenCalledOnce();
		expect(setSuggestionsOpen).toHaveBeenLastCalledWith(false);
	});

	it("clicking inside the input container should not close suggestions", () => {
		document.body.appendChild(containerEl);

		const component = new TimesheetNameInput(containerEl, autocomplete);

		autocomplete.names.setState(["Test", "Other"]);

		const onClickOutside = vi.spyOn(component, "onClickOutside");
		const setSuggestionsOpen = vi.spyOn(component, "setSuggestionsOpen");

		component.load();

		const inputEl = containerEl.querySelector(".timekeep-name")! as HTMLInputElement;
		expect(inputEl).not.toBeNull();

		inputEl.value = "Test";
		inputEl.focus();

		component.wrapperEl!.dispatchEvent(
			new MouseEvent("mousedown", { bubbles: true, cancelable: true })
		);

		expect(onClickOutside).toHaveBeenCalledOnce();
		expect(setSuggestionsOpen).not.toHaveBeenLastCalledWith(false);

		document.body.removeChild(containerEl);
	});

	it("touching outside the input container should close suggestions", () => {
		const component = new TimesheetNameInput(containerEl, autocomplete);

		autocomplete.names.setState(["Test", "Other"]);

		const onClickOutside = vi.spyOn(component, "onClickOutside");
		const setSuggestionsOpen = vi.spyOn(component, "setSuggestionsOpen");

		component.load();

		const inputEl = containerEl.querySelector(".timekeep-name")! as HTMLInputElement;
		expect(inputEl).not.toBeNull();

		inputEl.value = "Test";
		inputEl.focus();

		document.dispatchEvent(new MouseEvent("touchstart", { bubbles: true }));

		expect(onClickOutside).toHaveBeenCalledOnce();
		expect(setSuggestionsOpen).toHaveBeenLastCalledWith(false);
	});

	it("nil selection should be reflected by the element attributes", () => {});

	it("suggestions updates should do nothing if the elements are not all present", () => {});

	it("selecting a suggestion should close the suggestions", () => {});

	it("clicking a suggestion should select it and close the suggestions", () => {
		autocomplete.names.setState([
			"Test",
			"Before Test After",
			"Before Test",
			"Test After",
			"Test After Test",
		]);

		const onSelectSuggestion = vi.spyOn(component, "onSelectSuggestion");
		const onClickSuggestions = vi.spyOn(component, "onClickSuggestions");
		component.load();

		const inputEl = containerEl.querySelector(".timekeep-name")! as HTMLInputElement;
		expect(inputEl).not.toBeNull();

		inputEl.focus();

		inputEl.value = "Test";
		inputEl.dispatchEvent(new Event("input", { bubbles: true }));

		const suggestions = containerEl.querySelectorAll(".timekeep-suggestion");
		expect(suggestions.length).toBe(5);

		const suggestion = suggestions.item(0);
		suggestion.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));

		expect(onSelectSuggestion).toHaveBeenCalledWith("Test");
		expect(onClickSuggestions).toHaveBeenCalled();
	});

	it("clicking events should be ignored when outside a suggestion", () => {
		autocomplete.names.setState([
			"Test",
			"Before Test After",
			"Before Test",
			"Test After",
			"Test After Test",
		]);

		const onSelectSuggestion = vi.spyOn(component, "onSelectSuggestion");
		component.load();

		const inputEl = containerEl.querySelector(".timekeep-name")! as HTMLInputElement;
		expect(inputEl).not.toBeNull();

		inputEl.focus();

		inputEl.value = "Test";
		inputEl.dispatchEvent(new Event("input", { bubbles: true }));

		const suggestions = containerEl.querySelector(".timekeep-suggestions");
		expect(suggestions).not.toBeNull();
		suggestions!.dispatchEvent(
			new MouseEvent("mousedown", { bubbles: true, cancelable: true })
		);

		expect(onSelectSuggestion).not.toHaveBeenCalled();
	});

	it("should not render suggestions when theres none", () => {});
});
