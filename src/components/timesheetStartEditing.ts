import type { TimekeepSettings } from "@/settings";
import type { Store } from "@/store";
import type { Timekeep } from "@/timekeep/schema";

import { getRunningEntry } from "@/timekeep/queries";
import { updateEntry } from "@/timekeep/update";
import { assert } from "@/utils/assert";

import { DomComponent } from "./domComponent";
import { createObsidianIcon } from "./obsidianIcon";

/**
 * The editing section for editing the currently
 * running time entry within the start section
 */
export class TimesheetStartEditing extends DomComponent {
	/** Access to the timekeep */
	timekeep: Store<Timekeep>;
	/** Access to the timekeep settings */
	settings: Store<TimekeepSettings>;

	/** Name editing input element */
	#nameInputEl: HTMLInputElement | undefined;

	/** Default value for the name being edited */
	#editingName: string;

	/** Callback for when editing is finished */
	onFinishEditing: VoidFunction;

	constructor(
		containerEl: HTMLElement,

		timekeep: Store<Timekeep>,
		settings: Store<TimekeepSettings>,

		editingName: string,
		onFinishEditing: VoidFunction
	) {
		super(containerEl);

		this.timekeep = timekeep;
		this.settings = settings;

		this.#editingName = editingName;
		this.onFinishEditing = onFinishEditing;
	}

	onload(): void {
		super.onload();

		const formEl = this.containerEl.createEl("form", {
			cls: "timekeep-start-area",
		});
		formEl.setAttribute("data-area", "start");
		this.registerDomEvent(formEl, "submit", this.onSave.bind(this));
		this.wrapperEl = formEl;

		const nameWrapperEl = formEl.createDiv({
			cls: "timekeep-name-wrapper",
		});

		const nameLabelEl = nameWrapperEl.createEl("label", {
			text: "Edit Name:",
		});
		nameLabelEl.htmlFor = "timekeepBlockName";

		const nameInputEl = nameWrapperEl.createEl("input", {
			cls: "timekeep-name",
			placeholder: "Example Block",
			type: "text",
			value: this.#editingName,
		});
		nameInputEl.id = "timekeepBlockName";
		this.#nameInputEl = nameInputEl;

		const saveButton = formEl.createEl("button", {
			cls: ["timekeep-start", "timekeep-start--save"],
			title: "Save",
		});
		saveButton.type = "submit";
		createObsidianIcon(saveButton, "save", "button-icon");

		const cancelButton = formEl.createEl("button", {
			cls: ["timekeep-start", "timekeep-start--close"],
			title: "Cancel ",
		});
		cancelButton.type = "button";
		createObsidianIcon(cancelButton, "x", "button-icon");
		this.registerDomEvent(cancelButton, "click", this.onFinishEditing);
	}

	onSave(event: Event) {
		// Prevent form submission from reloading Obsidian
		event.preventDefault();
		event.stopPropagation();

		const nameInputEl = this.#nameInputEl;
		assert(nameInputEl, "Name input element should be defined");

		const timekeep = this.timekeep.getState();
		const currentEntry = getRunningEntry(timekeep.entries);

		if (!currentEntry) return;

		const editingName = nameInputEl.value;

		this.timekeep.setState((timekeep) => {
			const entries = updateEntry(timekeep.entries, currentEntry.id, {
				...currentEntry,
				name: editingName,
			});

			return {
				...timekeep,
				entries,
			};
		});
	}
}
