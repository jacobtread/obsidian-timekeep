import type { App } from "obsidian";

import type { CustomOutputFormat } from "@/output";
import type { TimekeepSettings } from "@/settings";
import type { Store } from "@/store";
import type { Timekeep } from "@/timekeep/schema";

import { TimekeepAutocomplete } from "@/service/autocomplete";
import { ConfirmModal } from "@/views/confirm-modal";

import { DomComponent } from "./domComponent";
import { createObsidianIcon } from "./obsidianIcon";
import { TimesheetApp } from "./timesheetApp";

/**
 * View component for the timesheet app as a whole
 */
export class TimesheetFileEntry extends DomComponent {
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
		super(containerEl);

		this.app = app;
		this.timekeep = timekeep;
		this.settings = settings;
		this.customOutputFormats = customOutputFormats;
		this.autocomplete = autocomplete;

		this.onDelete = onDelete;
	}

	onload(): void {
		super.onload();

		const wrapperEl = this.containerEl.createDiv({
			cls: "timekeep-file-entry",
		});
		this.wrapperEl = wrapperEl;

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
