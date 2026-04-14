import moment from "moment";

import type { TimekeepSettings } from "@/settings";
import type { Store } from "@/store";

import { assert } from "@/utils/assert";

import { DomComponent } from "@/components/DomComponent";
import { createObsidianIcon } from "@/components/obsidianIcon";
import { TimesheetNameInput } from "@/components/TimesheetNameInput";

import { getRunningEntry } from "@/timekeep/queries";
import type { Timekeep } from "@/timekeep/schema";
import { startNewEntry } from "@/timekeep/start";

import { TimekeepAutocomplete } from "@/service/autocomplete";

/**
 * The start section above the timesheet table
 */
export class TimesheetStartForm extends DomComponent {
	/** Access to the timekeep */
	timekeep: Store<Timekeep>;
	/** Access to the timekeep settings */
	settings: Store<TimekeepSettings>;
	/** Access to autocomplete */
	autocomplete: TimekeepAutocomplete;

	/** Name input for starting entries */
	#nameInput: TimesheetNameInput | undefined;

	/** Warning message element  */
	#blockPauseWarningEl: HTMLElement | undefined;
	/** Start button element */
	#startButtonEl: HTMLButtonElement | undefined;

	constructor(
		containerEl: HTMLElement,
		timekeep: Store<Timekeep>,
		settings: Store<TimekeepSettings>,
		autocomplete: TimekeepAutocomplete
	) {
		super(containerEl);
		this.timekeep = timekeep;
		this.settings = settings;
		this.autocomplete = autocomplete;
	}

	onload(): void {
		super.onload();

		const formEl = this.containerEl.createEl("form", { cls: "timekeep-start-area" });
		formEl.setAttribute("data-area", "start");
		this.wrapperEl = formEl;

		this.registerDomEvent(formEl, "submit", this.onStart.bind(this));

		const nameWrapperEl = formEl.createDiv({ cls: "timekeep-name-wrapper" });

		const blockNameEl = nameWrapperEl.createEl("label", { text: "Block Name: " });
		blockNameEl.htmlFor = "timekeepBlockName";

		const blockPauseWarningEl = blockNameEl.createSpan({
			cls: "timekeep-start-note",
			text: "Starting a new task will pause the previous one",
		});

		blockPauseWarningEl.hidden = true;
		this.#blockPauseWarningEl = blockPauseWarningEl;

		const nameInput = new TimesheetNameInput(nameWrapperEl, this.autocomplete);
		this.#nameInput = nameInput;
		this.addChild(nameInput);

		const startButton = formEl.createEl("button", {
			cls: "timekeep-start",
			title: "Start",
		});
		startButton.type = "submit";
		createObsidianIcon(startButton, "play", "timekeep-button-icon");
		this.#startButtonEl = startButton;

		const onUpdate = this.onUpdate.bind(this);
		this.register(this.timekeep.subscribe(onUpdate));
		onUpdate();
	}

	onUpdate() {
		const timekeep = this.timekeep.getState();
		const currentEntry = getRunningEntry(timekeep.entries);

		const blockPauseWarningEl = this.#blockPauseWarningEl;
		const startButtonEl = this.#startButtonEl;
		assert(blockPauseWarningEl && startButtonEl, "Elements should be defined");

		const isTimekeepRunning = currentEntry !== null;
		blockPauseWarningEl.hidden = currentEntry === null || currentEntry.startTime === null;
		startButtonEl.title = isTimekeepRunning ? "Stop and start" : "Start";
	}

	onStart(event: Event) {
		// Prevent form submission from reloading Obsidian
		event.preventDefault();
		event.stopPropagation();

		const nameInput = this.#nameInput;
		assert(nameInput, "Name input element should be defined");

		const name = nameInput.getValue();

		this.timekeep.setState((timekeep) => {
			const currentTime = moment();
			const entries = startNewEntry(name, currentTime, timekeep.entries);

			// Reset name input
			nameInput.resetValue();

			return {
				...timekeep,
				entries,
			};
		});
	}
}
