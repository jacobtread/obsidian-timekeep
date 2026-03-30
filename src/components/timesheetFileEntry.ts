import { App, Component } from "obsidian";

import { CustomOutputFormat } from "@/output";
import { TimekeepAutocomplete } from "@/service/autocomplete";
import { TimekeepSettings } from "@/settings";
import { Store } from "@/store";
import { Timekeep } from "@/timekeep/schema";
import { ConfirmModal } from "@/views/confirm-modal";

import { createObsidianIcon } from "./obsidianIcon";
import { TimesheetApp } from "./timesheetApp";

/**
 * View component for the timesheet app as a whole
 */
export class TimesheetFileEntry extends Component {
	/** Parent container element */
	#containerEl: HTMLElement;

	/** Access to the app instance */
	app: App;
	/** Access to the timekeep */
	timekeep: Store<Timekeep>;
	/** Access to the timekeep settings */
	settings: Store<TimekeepSettings>;
	/** Access to custom output formats */
	customOutputFormats: Store<Record<string, CustomOutputFormat>>;
	/** Autocomplete */
	autocomplete: TimekeepAutocomplete;

	/** Wrapper element containing the component content */
	#wrapperEl: HTMLElement | undefined;

	timesheetApp: TimesheetApp | undefined;

	onDelete: VoidFunction;

	constructor(
		containerEl: HTMLElement,

		app: App,
		timekeep: Store<Timekeep>,
		settings: Store<TimekeepSettings>,
		customOutputFormats: Store<Record<string, CustomOutputFormat>>,
		autocomplete: TimekeepAutocomplete,

		onDelete: VoidFunction
	) {
		super();

		this.#containerEl = containerEl;

		this.app = app;
		this.timekeep = timekeep;
		this.settings = settings;
		this.customOutputFormats = customOutputFormats;
		this.autocomplete = autocomplete;

		this.onDelete = onDelete;
	}

	onunload(): void {
		super.onunload();
		this.#wrapperEl?.remove();
	}

	onload(): void {
		super.onload();

		const wrapperEl = this.#containerEl.createDiv({
			cls: "timekeep-file-entry",
		});
		this.#wrapperEl = wrapperEl;

		const deleteButton = wrapperEl.createEl("button", { cls: "" });
		createObsidianIcon(deleteButton, "trash", "text-button-icon");
		deleteButton.appendText("Delete");

		this.registerDomEvent(deleteButton, "click", this.onConfirmDelete.bind(this));

		this.timesheetApp = new TimesheetApp(
			wrapperEl,
			this.app,
			this.timekeep,
			this.settings,
			this.customOutputFormats,
			this.autocomplete
		);
		this.addChild(this.timesheetApp);
	}

	onConfirmDelete() {
		const modal = new ConfirmModal(
			this.app,
			"Are you sure you want to delete this timesheet?",
			this.onConfirmedDelete.bind(this)
		);
		modal.setTitle("Confirm Delete");
		modal.open();
	}

	onConfirmedDelete(confirmed: boolean) {
		if (!confirmed) {
			return;
		}

		this.onDelete();
	}
}
