import type { App } from "obsidian";

import type { CustomOutputFormat } from "@/output";
import type { TimekeepSettings } from "@/settings";
import type { Store } from "@/store";

import { ContentComponent } from "@/components/ContentComponent";
import { TimesheetApp } from "@/components/TimesheetApp";
import { TimesheetSaveError } from "@/components/TimesheetSaveError";

import type { Timekeep } from "@/timekeep/schema";

import { TimekeepAutocomplete } from "@/service/autocomplete";

/**
 * Wrapper component for the timesheet app that handles
 * display error messages when saving fails
 */
export class Timesheet extends ContentComponent<TimesheetApp | TimesheetSaveError> {
	/** Access to the app instance */
	app: App;
	/** Access to the timekeep */
	timekeep: Store<Timekeep>;
	/** Store for save error state */
	saveError: Store<boolean>;
	/** Access to the timekeep settings */
	settings: Store<TimekeepSettings>;
	/** Access to custom output formats */
	customOutputFormats: Store<Record<string, CustomOutputFormat>>;
	/** Autocomplete */
	autocomplete: TimekeepAutocomplete;

	/** Callback to save the timekeep */
	handleSaveTimekeep: (value: Timekeep) => Promise<void>;

	constructor(
		containerEl: HTMLElement,
		app: App,
		timekeep: Store<Timekeep>,
		saveError: Store<boolean>,
		settings: Store<TimekeepSettings>,
		customOutputFormats: Store<Record<string, CustomOutputFormat>>,
		autocomplete: TimekeepAutocomplete,
		handleSaveTimekeep: (value: Timekeep) => Promise<void>
	) {
		super(containerEl);

		this.app = app;
		this.timekeep = timekeep;
		this.saveError = saveError;
		this.settings = settings;
		this.customOutputFormats = customOutputFormats;
		this.autocomplete = autocomplete;
		this.handleSaveTimekeep = handleSaveTimekeep;
	}

	onload(): void {
		super.onload();

		const render = this.update.bind(this);
		const unsubscribeSaveError = this.saveError.subscribe(render);
		this.register(unsubscribeSaveError);
		render();
	}

	update() {
		const saveError = this.saveError.getState();
		if (saveError) {
			this.setContent(
				new TimesheetSaveError(this.containerEl, this.timekeep, this.handleSaveTimekeep)
			);
		} else {
			this.setContent(
				new TimesheetApp(
					this.containerEl,
					this.app,
					this.timekeep,
					this.settings,
					this.customOutputFormats,
					this.autocomplete
				)
			);
		}
	}
}
