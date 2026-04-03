import type { App } from "obsidian";

import moment from "moment";

import type { TimekeepSettings } from "@/settings";
import type { Store } from "@/store";
import type { TimeEntry, Timekeep } from "@/timekeep/schema";

import { getPathToEntry } from "@/timekeep/queries";
import { stopRunningEntries } from "@/timekeep/update";
import { formatTimestamp } from "@/utils/time";

import { DomComponent } from "./domComponent";
import { createObsidianIcon } from "./obsidianIcon";

/**
 * The "Running" timer section of the timesheet start are
 */
export class TimesheetStartRunning extends DomComponent {
	/** Access to the app instance */
	app: App;
	/** Access to the timekeep */
	timekeep: Store<Timekeep>;
	/** Access to the timekeep settings */
	settings: Store<TimekeepSettings>;

	/** Element to display the formatted start time */
	#timeValueEl: HTMLSpanElement | undefined;
	/** Element to render the entry path within */
	#pathEl: HTMLSpanElement | undefined;

	/** The current running entry */
	entry: TimeEntry;

	/** Callback to start editing the current entry */
	onStartEditing: VoidFunction;

	constructor(
		containerEl: HTMLElement,

		app: App,
		timekeep: Store<Timekeep>,
		settings: Store<TimekeepSettings>,

		entry: TimeEntry,

		onStartEditing: VoidFunction
	) {
		super(containerEl);

		this.app = app;
		this.timekeep = timekeep;
		this.settings = settings;

		this.entry = entry;
		this.onStartEditing = onStartEditing;
	}

	onload(): void {
		super.onload();

		const formEl = this.containerEl.createEl("form", {
			cls: "timekeep-start-area",
		});
		formEl.setAttribute("data-area", "running");
		this.wrapperEl = formEl;
		this.registerDomEvent(formEl, "submit", this.onStop.bind(this));

		const nameWrapperEl = formEl.createDiv({
			cls: ["active-entry", "timekeep-name-wrapper"],
		});

		const runningSpanEl = nameWrapperEl.createSpan();
		runningSpanEl.createEl("b", { text: "Currently Running: " });

		const detailsEl = nameWrapperEl.createDiv({ cls: "active-entry__details" });
		const detailsNameEl = detailsEl.createSpan({
			cls: "active-entry__name",
		});
		detailsNameEl.createEl("b", { text: "Name: " });
		detailsNameEl.appendText(" ");

		const pathEl = detailsNameEl.createSpan({
			cls: "timekeep-path-to-entry",
		});
		this.#pathEl = pathEl;

		const timeEl = detailsEl.createSpan({ cls: "active-entry__name" });
		timeEl.createEl("b", { text: "Started at: " });

		const timeValueEl = timeEl.createSpan();
		this.#timeValueEl = timeValueEl;

		const editButton = formEl.createEl("button", {
			cls: ["timekeep-start", "timekeep-start--edit"],
			title: "Edit",
		});
		editButton.type = "button";
		createObsidianIcon(editButton, "edit", "button-icon");
		this.registerDomEvent(editButton, "click", this.onStartEditing);

		const stopButton = formEl.createEl("button", {
			cls: ["timekeep-start", "timekeep-start--stop"],
			title: "Stop",
		});
		stopButton.type = "submit";
		createObsidianIcon(stopButton, "stop-circle", "button-icon");

		const onUpdate = this.onUpdate.bind(this);

		const unsubscribeTimekeep = this.timekeep.subscribe(onUpdate);
		const unsubscribeSettings = this.settings.subscribe(onUpdate);

		onUpdate();

		this.register(() => {
			unsubscribeSettings();
			unsubscribeTimekeep();
		});
	}

	/**
	 * Handles updates that occur when either the timekeep data changes
	 * or the settings change
	 */
	onUpdate() {
		if (!this.#timeValueEl || !this.#pathEl) return;

		const currentEntry = this.entry;
		if (!currentEntry.startTime) return;

		const timekeep = this.timekeep.getState();
		const settings = this.settings.getState();

		this.#timeValueEl.textContent = formatTimestamp(currentEntry.startTime, settings);

		// Clear existing path
		this.#pathEl.empty();

		const pathToEntry = getPathToEntry(timekeep.entries, currentEntry);
		if (pathToEntry && pathToEntry.length > 0) {
			for (let i = 0; i < pathToEntry.length; i++) {
				const path = pathToEntry[i];
				const text = `${path.name} ${i < pathToEntry.length - 1 ? " >" : ""}`;
				this.#pathEl.createSpan({ text });
			}
		}
	}

	onStop(event: Event) {
		// Prevent form submission from reloading Obsidian
		event.preventDefault();
		event.stopPropagation();

		this.timekeep.setState((timekeep) => {
			const currentTime = moment();

			return {
				...timekeep,
				entries: stopRunningEntries(timekeep.entries, currentTime),
			};
		});
	}
}
