import type { TimekeepSettings } from "@/settings";
import type { Timekeep } from "@/timekeep/schema";
import type { Store } from "@/store";
import { type App, Component } from "obsidian";
import { getRunningEntry, updateEntry } from "@/timekeep";
import { createObsidianIcon } from "./obsidianIcon";

/**
 * The editing section for editing the currently
 * running time entry within the start section
 */
export class TimekeepStartEditing extends Component {
	/** Parent container element */
	#containerEl: HTMLElement;

	/** Access to the app instance */
	app: App;
	/** Access to the timekeep */
	timekeep: Store<Timekeep>;
	/** Access to the timekeep settings */
	settings: Store<TimekeepSettings>;

	/** Form container element */
	#formEl: HTMLElement | undefined;
	/** Name editing input element */
	#nameInputEl: HTMLInputElement | undefined;

	/** Default value for the name being edited */
	#editingName: string;

	/** Callback for when editing is finished */
	onFinishEditing: VoidFunction;

	constructor(
		containerEl: HTMLElement,

		app: App,
		timekeep: Store<Timekeep>,
		settings: Store<TimekeepSettings>,

		editingName: string,
		onFinishEditing: VoidFunction
	) {
		super();

		this.#containerEl = containerEl;

		this.app = app;
		this.timekeep = timekeep;
		this.settings = settings;

		this.#editingName = editingName;
		this.onFinishEditing = onFinishEditing;
	}

	onload(): void {
		super.onload();

		const formEl = this.#containerEl.createEl("form", {
			cls: "timekeep-start-area",
		});
		formEl.setAttribute("data-area", "start");
		this.registerDomEvent(formEl, "submit", this.onSave.bind(this));
		this.#formEl = formEl;

		const nameWrapperEl = this.#formEl.createDiv({
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

	onunload(): void {
		super.onunload();
		this.#formEl?.remove();
	}

	onSave(event: Event) {
		// Prevent form submission from reloading Obsidian
		event.preventDefault();
		event.stopPropagation();

		if (!this.#nameInputEl) return;

		const timekeep = this.timekeep.getState();
		const currentEntry = getRunningEntry(timekeep.entries);

		if (!currentEntry) return;

		const editingName = this.#nameInputEl.value;

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
