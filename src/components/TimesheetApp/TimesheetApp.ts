import { App } from "obsidian";

import { DomComponent } from "@/components/DomComponent";
import { TimesheetCounters } from "@/components/TimesheetCounters";
import { TimesheetExportActions } from "@/components/TimesheetExportActions";
import { TimesheetRunningEntry } from "@/components/TimesheetRunningEntry";
import { TimesheetStartForm } from "@/components/TimesheetStartForm";
import { TimesheetTable } from "@/components/TimesheetTable";
import { CustomOutputFormat } from "@/output";
import { TimekeepAutocomplete } from "@/service/autocomplete";
import { TimekeepSettings } from "@/settings";
import { Store } from "@/store";
import { Timekeep } from "@/timekeep/schema";

/**
 * View component for the timesheet app as a whole
 */
export class TimesheetApp extends DomComponent {
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

	constructor(
		containerEl: HTMLElement,
		app: App,
		timekeep: Store<Timekeep>,
		settings: Store<TimekeepSettings>,
		customOutputFormats: Store<Record<string, CustomOutputFormat>>,
		autocomplete: TimekeepAutocomplete
	) {
		super(containerEl);

		this.app = app;
		this.timekeep = timekeep;
		this.settings = settings;
		this.customOutputFormats = customOutputFormats;
		this.autocomplete = autocomplete;
	}

	onload(): void {
		super.onload();

		const wrapperEl = this.containerEl.createDiv({
			cls: "timekeep-container",
		});

		this.wrapperEl = wrapperEl;

		const counters = new TimesheetCounters(wrapperEl, this.settings, this.timekeep);

		const startForm = new TimesheetStartForm(
			wrapperEl,
			this.timekeep,
			this.settings,
			this.autocomplete
		);

		const runningEntry = new TimesheetRunningEntry(wrapperEl, this.timekeep, this.settings);

		const table = new TimesheetTable(wrapperEl, this.app, this.timekeep, this.settings);

		const exportActions = new TimesheetExportActions(
			wrapperEl,
			this.app,
			this.timekeep,
			this.settings,
			this.customOutputFormats
		);

		this.addChild(counters);
		this.addChild(startForm);
		this.addChild(runningEntry);
		this.addChild(table);
		this.addChild(exportActions);
	}
}
