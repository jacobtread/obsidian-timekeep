import type { App } from "obsidian";

import type { TimekeepSettings } from "@/settings";
import type { Store } from "@/store";

import { assert } from "@/utils/assert";
import { parseDateInputValue } from "@/utils/time";

import { createObsidianIcon } from "@/components/obsidianIcon";
import { ReplaceableComponent } from "@/components/ReplaceableComponent";

import { ConfirmModal } from "@/modals/ConfirmModal";

import type { TimeEntry, Timekeep } from "@/timekeep/schema";
import { removeEntry, updateEntry } from "@/timekeep/update";

/**
 * Component for a timesheet row entry that is currently
 * being edited
 */
export class TimesheetRowContentEditing extends ReplaceableComponent {
	/** Access to the app instance */
	app: App;

	/** Access to the timekeep */
	timekeep: Store<Timekeep>;

	/** Access to the timekeep settings */
	settings: Store<TimekeepSettings>;

	/** The entry for this row */
	entry: TimeEntry;

	/** Label container for the start time  */
	#startTimeLabelEl: HTMLLabelElement | undefined;
	/** Label container for the end time */
	#endTimeLabelEl: HTMLLabelElement | undefined;

	/** Input for the entry name */
	#nameInputEl: HTMLInputElement | undefined;
	/** Input for the start time */
	#startTimeInputEl: HTMLInputElement | undefined;
	/** Input for the end time */
	#endTimeInputEl: HTMLInputElement | undefined;

	/** Callback for editing finished / cancelled */
	onFinishEditing: VoidFunction;

	constructor(
		containerEl: HTMLElement,
		app: App,
		timekeep: Store<Timekeep>,
		settings: Store<TimekeepSettings>,
		entry: TimeEntry,
		onFinishEditing: VoidFunction
	) {
		super(containerEl);

		this.app = app;
		this.timekeep = timekeep;
		this.settings = settings;

		this.entry = entry;
		this.onFinishEditing = onFinishEditing;
	}

	createContainer(): HTMLElement {
		return createEl("tr", { cls: "timekeep-row" });
	}

	render(wrapperEl: HTMLElement): void {
		const colEl = wrapperEl.createEl("td");
		colEl.colSpan = 5;

		const formEl = colEl.createEl("form", { cls: "timekeep-editing" });
		this.registerDomEvent(formEl, "submit", this.onSubmit.bind(this));

		const nameLabelEl = formEl.createEl("label", {
			cls: "timekeep-input-label",
			text: "Name",
		});
		const nameInputEl = nameLabelEl.createEl("input", {
			cls: "timekeep-input",
			type: "text",
		});
		nameInputEl.name = "name";
		this.#nameInputEl = nameInputEl;

		const onValidateDates = this.onValidateDates.bind(this);

		const startTimeLabelEl = formEl.createEl("label", {
			text: "Start Time",
		});
		this.#startTimeLabelEl = startTimeLabelEl;
		const startTimeInputEl = startTimeLabelEl.createEl("input", {
			cls: "timekeep-input",
			type: "datetime-local",
		});
		startTimeInputEl.name = "start-time";
		startTimeInputEl.step = "0.001";
		this.#startTimeInputEl = startTimeInputEl;
		this.registerDomEvent(startTimeInputEl, "input", onValidateDates);

		const endTimeLabelEl = formEl.createEl("label", {
			cls: "timekeep-input-label",
			text: "End Time",
		});
		this.#endTimeLabelEl = endTimeLabelEl;
		const endTimeInputEl = endTimeLabelEl.createEl("input", {
			cls: "timekeep-input",
			type: "datetime-local",
		});
		endTimeInputEl.name = "end-time";
		endTimeInputEl.step = "0.001";
		this.#endTimeInputEl = endTimeInputEl;
		this.registerDomEvent(endTimeInputEl, "input", onValidateDates);

		const actionsEl = formEl.createDiv({
			cls: "timekeep-editing-actions",
		});

		const saveButton = actionsEl.createEl("button", {
			cls: "timekeep-action",
			attr: {
				"data-action": "save",
			},
		});
		saveButton.type = "submit";
		createObsidianIcon(saveButton, "edit", "timekeep-text-button-icon");
		saveButton.appendText("Save");

		const cancelButton = actionsEl.createEl("button", {
			cls: "timekeep-action",
			attr: {
				"data-action": "cancel",
			},
		});
		cancelButton.type = "button";
		createObsidianIcon(cancelButton, "x", "timekeep-text-button-icon");
		this.registerDomEvent(cancelButton, "click", this.onFinishEditing);
		cancelButton.appendText("Cancel");

		const deleteButton = actionsEl.createEl("button", {
			cls: "timekeep-action",
			attr: {
				"data-action": "delete",
			},
		});
		deleteButton.type = "button";
		createObsidianIcon(deleteButton, "trash", "timekeep-text-button-icon");
		deleteButton.appendText("Delete");

		this.registerDomEvent(deleteButton, "click", this.onConfirmDelete.bind(this));

		const onUpdateState = this.onUpdateState.bind(this);
		const unsubscribeSettings = this.settings.subscribe(onUpdateState);
		this.register(unsubscribeSettings);
		onUpdateState();
	}

	onUpdateState() {
		assert(
			this.#nameInputEl &&
				this.#startTimeInputEl &&
				this.#startTimeLabelEl &&
				this.#endTimeInputEl &&
				this.#endTimeLabelEl,
			"Elements expected to be defined"
		);

		const entry = this.entry;

		this.#nameInputEl.value = entry.name;

		const inputFormat = "YYYY-MM-DDTHH:mm:ss";

		this.#startTimeLabelEl.hidden = entry.startTime === null;
		this.#startTimeInputEl.value = entry.startTime ? entry.startTime.format(inputFormat) : "";

		this.#endTimeLabelEl.hidden = entry.endTime === null;
		this.#endTimeInputEl.value = entry.endTime ? entry.endTime.format(inputFormat) : "";
	}

	onConfirmDelete() {
		const modal = new ConfirmModal(
			this.app,
			"Are you sure you want to delete this entry?",
			this.onConfirmedDelete.bind(this)
		);
		modal.setTitle("Confirm Delete");
		modal.open();
	}

	onConfirmedDelete(confirmed: boolean) {
		if (!confirmed) {
			return;
		}

		const entry = this.entry;

		this.timekeep.setState((timekeep) => ({
			entries: removeEntry(timekeep.entries, entry),
		}));
	}

	/**
	 * Validates that the start and end dates are valid if they are
	 * present, also applies the validation error messages
	 *
	 * @returns Whether the validation succeeded
	 */
	onValidateDates() {
		assert(
			this.#nameInputEl && this.#startTimeInputEl && this.#endTimeInputEl,
			"Expected inputs to be defined"
		);

		const startTimeEl = this.#startTimeInputEl;
		const endTimeEl = this.#endTimeInputEl;

		const entry = this.entry;

		if (entry.subEntries !== null) return { valid: true, startTime: null, endTime: null };

		const startTimeValue = this.#startTimeInputEl.value;
		const endTimeValue = this.#endTimeInputEl.value;

		let startTime: moment.Moment | null = null;
		let endTime: moment.Moment | null = null;

		let startTimeError: string | null = null;
		let endTimeError: string | null = null;

		if (entry.startTime !== null) {
			startTime = parseDateInputValue(startTimeValue);
			if (!startTime.isValid()) {
				startTime = null;
				startTimeError = "Invalid start time provided";
			}
		}

		if (entry.endTime !== null) {
			endTime = parseDateInputValue(endTimeValue);
			if (!endTime.isValid()) {
				endTime = null;
				endTimeError = "Invalid end time provided";
			}
		}

		if (startTime !== null && endTime !== null && startTime.isAfter(endTime)) {
			startTimeError = "Start time cannot be after the end time";
		}

		startTimeEl.setCustomValidity(startTimeError ?? "");
		endTimeEl.setCustomValidity(endTimeError ?? "");

		const valid = startTimeError === null && endTimeError === null;

		return { valid, startTime, endTime };
	}

	async onSubmit(event: Event) {
		assert(this.#nameInputEl, "Expected inputs to be defined");

		event.preventDefault();
		event.stopPropagation();

		const { valid, startTime, endTime } = this.onValidateDates();
		if (!valid) return;

		const name = this.#nameInputEl.value;
		const entry = this.entry;

		const newEntry = { ...entry, name };
		if (newEntry.subEntries === null) {
			if (startTime !== null) {
				newEntry.startTime = startTime;
			}

			if (endTime !== null) {
				newEntry.endTime = endTime;
			}
		}

		// Save the updated entry
		this.timekeep.setState((timekeep) => ({
			entries: updateEntry(timekeep.entries, entry.id, newEntry),
		}));

		this.onFinishEditing();
	}
}
