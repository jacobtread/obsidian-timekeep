import Fuse, { FuseResult } from "fuse.js";

import { TimekeepAutocomplete } from "@/service/autocomplete";
import { debounced } from "@/utils/debounce";

import { DomComponent } from "./domComponent";

export class TimesheetNameInput extends DomComponent {
	/** Access to autocomplete */
	autocomplete: TimekeepAutocomplete;

	/** Name input */
	#inputEl: HTMLInputElement | undefined;
	/** Suggestions container element */
	#suggestionsEl: HTMLDivElement | undefined;

	/** Current list of suggestions */
	#suggestions: FuseResult<string>[] = [];
	/** Whether the suggestions should be open */
	#suggestionsOpen: boolean = false;
	/** Index of the currently focused suggestion */
	#suggestionFocusIndex: number = -1;

	constructor(containerEl: HTMLElement, autocomplete: TimekeepAutocomplete) {
		super(containerEl);

		this.autocomplete = autocomplete;
	}

	onload(): void {
		super.onload();

		const wrapperEl = this.containerEl.createDiv({ cls: "timekeep-name-containers" });
		this.wrapperEl = wrapperEl;

		const inputEl = wrapperEl.createEl("input", {
			cls: "timekeep-name",
			placeholder: "Example Block",
			type: "text",
		});
		inputEl.id = "timekeepBlockName";
		inputEl.role = "combobox";
		inputEl.setAttribute("aria-expanded", "false");
		inputEl.setAttribute("aria-controls", "timekeepSuggestions");
		inputEl.setAttribute("aria-autocomplete", "list");
		this.#inputEl = inputEl;

		const suggestionsEl = wrapperEl.createDiv({ cls: "timekeep-suggestions" });
		suggestionsEl.id = "timekeepSuggestions";
		suggestionsEl.role = "listbox";
		suggestionsEl.hidden = true;
		this.#suggestionsEl = suggestionsEl;

		this.registerDomEvent(inputEl, "input", debounced(this.onDebouncedChange.bind(this), 300));

		this.registerDomEvent(inputEl, "focus", this.onFocus.bind(this));
		this.registerDomEvent(inputEl, "keydown", this.onKeyDown.bind(this));

		this.registerDomEvent(document, "mousedown", this.onClickOutside.bind(this));
		this.registerDomEvent(document, "touchstart", this.onClickOutside.bind(this), {
			passive: true,
		});

		this.registerDomEvent(suggestionsEl, "mousedown", this.onClickSuggestions.bind(this));
	}

	/**
	 * Get the current list of suggestions based on the currently
	 * typed input words
	 */
	getFilteredSuggestions(): FuseResult<string>[] {
		const autocomplete = this.autocomplete;
		const suggestions = autocomplete.names.getState();

		const value = this.getValue();
		const fuse = new Fuse(suggestions, {
			includeMatches: true,
			shouldSort: true,
			ignoreLocation: true,
			minMatchCharLength: 2,
		});
		const results = fuse.search(value);

		return results;
	}

	/**
	 * Renders the suggestion children within the suggestion container
	 * for the current available suggestions
	 */
	renderSuggestions() {
		const suggestionsEl = this.#suggestionsEl;
		if (!suggestionsEl) return;

		suggestionsEl.empty();
		const suggestions = this.#suggestions;
		if (suggestions.length < 1) return;

		for (let i = 0; i < suggestions.length; i += 1) {
			const result = suggestions[i];
			const suggestion = result.item;

			const suggestionEl = suggestionsEl.createDiv({ cls: "timekeep-suggestion" });
			suggestionEl.role = "option";
			suggestionEl.id = `timekeepSuggestion-${i}`;
			suggestionEl.setAttribute("aria-selected", "false");
			suggestionEl.setAttribute("value", suggestion);

			let lastIndex = 0;

			if (result.matches && result.matches.length > 0) {
				const match = result.matches[0];

				for (const [start, end] of match.indices) {
					if (start > lastIndex) {
						suggestionEl.appendText(suggestion.slice(lastIndex, start));
					}

					const text = suggestion.slice(start, end + 1);
					suggestionEl.createEl("mark", { text });
					lastIndex = end + 1;
				}
			}

			if (lastIndex < suggestion.length) {
				suggestionEl.appendText(suggestion.slice(lastIndex));
			}
		}
	}

	/**
	 * Handle clicking suggestion elements
	 *
	 * @param event The click event
	 */
	onClickSuggestions(event: MouseEvent) {
		const target = event.target;
		if (!(target instanceof HTMLElement)) return;
		if (!target.id.startsWith("timekeepSuggestion-")) return;
		const suggestion = target;
		const value = suggestion.getAttribute("value");
		if (!value) return;
		this.onSelectSuggestion(value);
	}

	/**
	 * Handle changes to the input value, this updates the filtered
	 * suggestions list and triggers re-rendering of the suggestions
	 */
	onDebouncedChange() {
		const suggestions = this.getFilteredSuggestions();
		this.#suggestions = suggestions;

		this.updateSuggestionsOpen();
		this.renderSuggestions();

		if (suggestions.length > 0) {
			this.setSuggestionFocus(0);
		}
	}

	/**
	 * Handle clicks and close the suggestion box if they are
	 * outside of the container
	 *
	 * @param event The click / touch event
	 */
	onClickOutside(event: MouseEvent | TouchEvent) {
		if (
			!(event.target instanceof Node) ||
			(this.wrapperEl && !this.wrapperEl.contains(event.target))
		) {
			this.setSuggestionsOpen(false);
		}
	}

	/**
	 * Handle input focus, this should open the suggestions
	 * box if it is not already open
	 */
	onFocus() {
		this.setSuggestionsOpen(true);
	}

	/**
	 * Handle keyboard events for selecting the suggestion
	 * items using the keyboard
	 *
	 * @param event The keyboard event
	 */
	onKeyDown(event: KeyboardEvent) {
		const suggestionsEl = this.#suggestionsEl;
		if (!suggestionsEl) return;

		const suggestionsOpen = !(suggestionsEl.hidden ?? false);

		if (!suggestionsOpen && event.key === "ArrowDown") {
			this.setSuggestionsOpen(true);
			this.setSuggestionFocus(0);
			return;
		}

		switch (event.key) {
			case "ArrowDown": {
				event.preventDefault();

				const focusIndex = this.#suggestionFocusIndex;
				const nextFocusIndex = Math.min(focusIndex + 1, this.#suggestions.length - 1);
				this.setSuggestionFocus(nextFocusIndex);

				break;
			}

			case "ArrowUp": {
				event.preventDefault();

				const focusIndex = this.#suggestionFocusIndex;
				const prevFocusIndex = Math.max(focusIndex - 1, 0);
				this.setSuggestionFocus(prevFocusIndex);

				break;
			}

			case "Enter": {
				const focusIndex = this.#suggestionFocusIndex;
				if (focusIndex >= 0) {
					event.preventDefault();
					const suggestion = this.#suggestions[focusIndex];
					if (suggestion) {
						this.onSelectSuggestion(suggestion.item);
					}
				}
				break;
			}

			case "Escape": {
				this.setSuggestionsOpen(false);
				break;
			}

			default:
				break;
		}
	}

	/**
	 * Clamps the current suggestion focus index to be within
	 * the current suggestion bounds
	 */
	clampSuggestionFocus() {
		if (this.#suggestions.length > 0) {
			const focusIndex = this.#suggestionFocusIndex;
			const newFocusIndex =
				focusIndex === -1 ? 0 : Math.min(focusIndex, this.#suggestions.length - 1);

			this.setSuggestionFocus(newFocusIndex);
		} else {
			this.setSuggestionFocus(-1);
		}
	}

	/**
	 * Set the focused suggestion index within the drop down menu.
	 *
	 * @param index The index that is focused
	 */
	setSuggestionFocus(index: number) {
		this.#suggestionFocusIndex = index;

		const inputEl = this.#inputEl;
		const suggestionsEl = this.#suggestionsEl;
		if (!suggestionsEl || !inputEl) return;

		const children = suggestionsEl.querySelectorAll(".timekeep-suggestion");
		for (let i = 0; i < children.length; i++) {
			const child = children.item(i);

			const selected = index === i;
			child.setAttribute("aria-selected", String(selected));

			// Bring the suggestion element into view if its selected
			if (selected) {
				child.scrollIntoView({
					block: "nearest",
				});
			}
		}

		// Update the input aria-activedescendant for screen readers
		if (index === -1) {
			inputEl.removeAttribute("aria-activedescendant");
		} else {
			inputEl.setAttribute(
				"aria-activedescendant",
				`timekeepSuggestion-${this.#suggestionFocusIndex}`
			);
		}
	}

	/**
	 * Set the open state of the suggestions box
	 *
	 * @param value The open state of the box
	 */
	setSuggestionsOpen(value: boolean) {
		this.#suggestionsOpen = value;
		this.updateSuggestionsOpen();
	}

	/**
	 * Updates the open state of the suggestion box to actually show or
	 * hide the element, this is to ensure an empty suggestion box is
	 * not shown
	 */
	updateSuggestionsOpen() {
		const inputEl = this.#inputEl;
		const suggestionsEl = this.#suggestionsEl;
		if (!inputEl || !suggestionsEl) return;

		// Force closed state if theres no suggestions
		const open = this.#suggestions.length < 1 ? false : this.#suggestionsOpen;

		suggestionsEl.hidden = !open;
		inputEl.setAttribute("aria-expanded", String(open));

		// Update the focus
		this.clampSuggestionFocus();
	}

	/**
	 * Handle selecting a suggestion value, this updates the
	 * current input value to match the suggestion
	 *
	 * @param value The suggestion value
	 */
	onSelectSuggestion(value: string) {
		if (this.#inputEl) {
			this.#inputEl.value = value;
		}

		this.setSuggestionsOpen(false);
		this.setSuggestionFocus(-1);
	}

	/**
	 * Getter for the name input value
	 *
	 * @returns The name value
	 */
	getValue(): string {
		return this.#inputEl?.value ?? "";
	}

	/**
	 * Reset the name input value to an empty string
	 */
	resetValue() {
		if (!this.#inputEl) return;
		this.#inputEl.value = "";
	}
}
