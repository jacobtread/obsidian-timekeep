import { removeEntry, updateEntry } from "@/timekeep";
import { TimeEntry, Timekeep } from "@/timekeep/schema";
import { App, Component } from "obsidian";
import { createObsidianIcon } from "./obsidianIcon";
import { formatEditableTimestamp, parseEditableTimestamp } from "@/utils";
import { Store } from "@/store";
import { TimekeepSettings } from "@/settings";
import { ConfirmModal } from "@/utils/confirm-modal";

/**
 * Component for a timesheet row entry that is currently
 * being edited
 */
export class TimesheetRowContentEditing extends Component {
	/** Access to the app instance */
	app: App;

	/** Access to the timekeep */
	timekeep: Store<Timekeep>;

	/** Access to the timekeep settings */
	settings: Store<TimekeepSettings>;

	/** The entry for this row */
	entry: TimeEntry;

	/** The row element */
	#rowEl: HTMLTableRowElement;

	/** Column element containing the content */
	#colEl: HTMLTableCellElement | undefined;

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
		rowEl: HTMLTableRowElement,
		app: App,
		timekeep: Store<Timekeep>,
		settings: Store<TimekeepSettings>,
		entry: TimeEntry,
		onFinishEditing: VoidFunction
	) {
		super();

		this.#rowEl = rowEl;

		this.app = app;
		this.timekeep = timekeep;
		this.settings = settings;

		this.entry = entry;
		this.onFinishEditing = onFinishEditing;
	}

	onload(): void {
		super.onload();

		const colEl = this.#rowEl.createEl("td");
		colEl.colSpan = 5;
		this.#colEl = colEl;

		const formEl = colEl.createEl("form", { cls: "timesheet-editing" });
		this.registerDomEvent(formEl, "submit", this.onSubmit.bind(this));

		const nameLabelEl = formEl.createEl("label", { text: " Name" });
		const nameInputEl = nameLabelEl.createEl("input", {
			cls: "timekeep-input",
			type: "text",
		});

		this.#nameInputEl = nameInputEl;

		const startTimeLabelEl = formEl.createEl("label", {
			text: "Start Time",
		});
		this.#startTimeLabelEl = startTimeLabelEl;

		const startTimeInputEl = startTimeLabelEl.createEl("input", {
			cls: "timekeep-input",
			type: "text",
		});
		this.#startTimeInputEl = startTimeInputEl;

		const endTimeLabelEl = formEl.createEl("label", { text: "End Time" });
		this.#endTimeLabelEl = endTimeLabelEl;

		const endTimeInputEl = endTimeLabelEl.createEl("input", {
			cls: "timekeep-input",
			type: "text",
		});
		this.#endTimeInputEl = endTimeInputEl;

		const actionsEl = formEl.createDiv({
			cls: "timesheet-editing-actions",
		});

		const saveButton = actionsEl.createEl("button", {
			cls: "timekeep-action",
		});
		saveButton.type = "submit";
		createObsidianIcon(saveButton, "edit", "text-button-icon");
		saveButton.appendText("Save");

		const cancelButton = actionsEl.createEl("button", {
			cls: "timekeep-action",
		});
		cancelButton.type = "button";
		createObsidianIcon(cancelButton, "x", "text-button-icon");
		this.registerDomEvent(cancelButton, "click", this.onFinishEditing);
		cancelButton.appendText("Cancel");

		const deleteButton = actionsEl.createEl("button", {
			cls: "timekeep-action",
		});
		deleteButton.type = "button";
		createObsidianIcon(deleteButton, "trash", "text-button-icon");
		deleteButton.appendText("Delete");

		this.registerDomEvent(
			deleteButton,
			"click",
			this.onConfirmDelete.bind(this)
		);

		const onUpdateState = this.onUpdateState.bind(this);
		const unsubscribeSettings = this.settings.subscribe(onUpdateState);
		this.register(unsubscribeSettings);
		onUpdateState();
	}

	onunload(): void {
		super.onunload();
		this.#colEl?.remove();
	}

	onUpdateState() {
		if (
			!this.#nameInputEl ||
			!this.#startTimeInputEl ||
			!this.#startTimeLabelEl ||
			!this.#endTimeInputEl ||
			!this.#endTimeLabelEl
		) {
			return;
		}

		const settings = this.settings.getState();
		const entry = this.entry;

		this.#nameInputEl.value = entry.name;

		this.#startTimeLabelEl.hidden = entry.startTime === null;
		this.#startTimeInputEl.value = entry.startTime
			? formatEditableTimestamp(entry.startTime, settings)
			: "";

		this.#endTimeLabelEl.hidden = entry.endTime === null;
		this.#endTimeInputEl.value = entry.endTime
			? formatEditableTimestamp(entry.endTime, settings)
			: "";
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

	onSubmit(event: Event) {
		if (
			!this.#nameInputEl ||
			!this.#startTimeInputEl ||
			!this.#endTimeInputEl
		) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		const name = this.#nameInputEl.value;
		const startTime = this.#startTimeInputEl.value;
		const endTime = this.#endTimeInputEl.value;

		const settings = this.settings.getState();
		const entry = this.entry;

		const newEntry = { ...entry, name };

		// Update the start and end times for non groups
		if (newEntry.subEntries === null) {
			if (entry.startTime !== null) {
				const startTimeValue = parseEditableTimestamp(
					startTime,
					settings
				);
				if (startTimeValue.isValid()) {
					newEntry.startTime = startTimeValue;
				}
			}

			if (entry.endTime !== null) {
				const endTimeValue = parseEditableTimestamp(endTime, settings);
				if (endTimeValue.isValid()) {
					newEntry.endTime = endTimeValue;
				}
			}
		}

		// Save the updated entry
		this.timekeep.setState((timekeep) => ({
			entries: updateEntry(timekeep.entries, entry.id, newEntry),
		}));

		this.onFinishEditing();
	}
}
