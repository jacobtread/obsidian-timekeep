import { App } from "obsidian";

import { CustomOutputFormat } from "@/output";
import { TimekeepSettings } from "@/settings";
import { Store } from "@/store";

import { ReplaceableComponent } from "../ReplaceableComponent";

import { TimesheetCounters } from "@/components/TimesheetCounters";
import { TimesheetExportActions } from "@/components/TimesheetExportActions";
import { TimesheetRunningEntry } from "@/components/TimesheetRunningEntry";
import { TimesheetStartForm } from "@/components/TimesheetStartForm";
import { TimesheetTable } from "@/components/TimesheetTable";

import { Timekeep } from "@/timekeep/schema";

import { TimekeepAutocomplete } from "@/service/autocomplete";

/**
 * View component for the timesheet app as a whole
 */
export class Timesheet extends ReplaceableComponent {
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

	createContainer(): HTMLElement {
		return createDiv({
			cls: "timekeep-container",
		});
	}

	render(wrapperEl: HTMLElement): void {
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
		this.addChild(runningEntry);
		this.addChild(startForm);
		this.addChild(table);
		this.addChild(exportActions);
	}
}
