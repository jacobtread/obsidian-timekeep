import moment from "moment";

import type { TimekeepSettings } from "@/settings";
import type { Store } from "@/store";
import type { Timekeep } from "@/timekeep/schema";

import { TimekeepAutocomplete } from "@/service/autocomplete";
import { getRunningEntry } from "@/timekeep/queries";
import { startNewEntry } from "@/timekeep/start";

import { ContentComponent } from "./contentComponent";
import { createObsidianIcon } from "./obsidianIcon";
import { TimesheetNameInput } from "./timesheetNameInput";
import { TimesheetStartEditing } from "./timesheetStartEditing";
import { TimesheetStartRunning } from "./timesheetStartRunning";

/**
 * The start section above the timesheet table
 */
export class TimesheetStart extends ContentComponent<
	TimesheetStartRunning | TimesheetStartEditing
> {
	/** Access to the timekeep */
	timekeep: Store<Timekeep>;
	/** Access to the timekeep settings */
	settings: Store<TimekeepSettings>;
	/** Access to autocomplete */
	autocomplete: TimekeepAutocomplete;

	/** Content container element */
	#contentEl: HTMLElement | undefined;

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

		const wrapperEl = this.containerEl.createDiv();
		this.wrapperEl = wrapperEl;

		const contentEl = wrapperEl.createDiv();
		this.#contentEl = contentEl;

		this.setCurrentView();

		const formEl = wrapperEl.createEl("form", { cls: "timekeep-start-area" });
		formEl.setAttribute("data-area", "start");
		this.registerDomEvent(formEl, "submit", this.onStart.bind(this));

		const nameWrapperEl = formEl.createDiv({ cls: "timekeep-name-wrapper" });

		const blockNameEl = nameWrapperEl.createEl("label", { text: "Block Name: " });
		blockNameEl.htmlFor = "timekeepBlockName";

		const blockPauseWarningEl = blockNameEl.createSpan({
			cls: "timekeep-start-node",
			text: "Starting a new task will pause the previous one",
		});

		blockPauseWarningEl.hidden = true;

		const nameInput = new TimesheetNameInput(nameWrapperEl, this.autocomplete);
		this.#nameInput = nameInput;
		this.addChild(nameInput);

		const startButton = formEl.createEl("button", {
			cls: "timekeep-start",
			title: "Start",
		});
		startButton.type = "submit";
		createObsidianIcon(startButton, "play", "button-icon");

		const onUpdate = this.onUpdate.bind(this);
		const unsubscribeTimekeep = this.timekeep.subscribe(onUpdate);
		onUpdate();

		this.register(unsubscribeTimekeep);
	}

	onUpdate() {
		this.updateRunning();

		if (this.getContent() instanceof TimesheetStartEditing) {
			this.setEditingView();
			return;
		}

		this.setCurrentView();
	}

	updateRunning() {
		if (!this.#blockPauseWarningEl || !this.#startButtonEl) return;

		const timekeep = this.timekeep.getState();
		const currentEntry = getRunningEntry(timekeep.entries);
		const isTimekeepRunning = currentEntry !== null;

		this.#blockPauseWarningEl.hidden = currentEntry === null || currentEntry.startTime === null;
		this.#startButtonEl.title = isTimekeepRunning ? "Stop and start" : "Start";
	}

	/**
	 * Switch to the editing view
	 */
	setEditingView() {
		if (!this.#contentEl) return;

		const timekeep = this.timekeep.getState();
		const currentEntry = getRunningEntry(timekeep.entries);
		if (!currentEntry) {
			return this.setContent(undefined);
		}

		this.setContent(
			new TimesheetStartEditing(
				this.#contentEl,
				this.timekeep,
				this.settings,
				currentEntry.name,
				this.setCurrentView.bind(this)
			)
		);
	}

	/**
	 * Switch to the default creation view
	 */
	setCurrentView() {
		if (!this.#contentEl) return;

		const timekeep = this.timekeep.getState();
		const currentEntry = getRunningEntry(timekeep.entries);

		if (currentEntry === null || currentEntry.startTime === null) {
			return this.setContent(undefined);
		}

		this.setContent(
			new TimesheetStartRunning(
				this.#contentEl,
				this.timekeep,
				this.settings,
				currentEntry,
				this.setEditingView.bind(this)
			)
		);
	}

	onStart(event: Event) {
		// Prevent form submission from reloading Obsidian
		event.preventDefault();
		event.stopPropagation();

		if (!this.#nameInput) return;
		const name = this.#nameInput.getValue();

		this.timekeep.setState((timekeep) => {
			const currentTime = moment();
			const entries = startNewEntry(name, currentTime, timekeep.entries);

			// Reset name input
			this.#nameInput?.resetValue();

			return {
				...timekeep,
				entries,
			};
		});
	}
}
