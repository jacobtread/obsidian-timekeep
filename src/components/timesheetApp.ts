import { App, Component } from "obsidian";

import { CustomOutputFormat } from "@/output";
import { TimekeepAutocomplete } from "@/service/autocomplete";
import { TimekeepSettings } from "@/settings";
import { Store } from "@/store";
import { Timekeep } from "@/timekeep/schema";

import { TimesheetCounters } from "./timesheetCounters";
import { TimesheetExportActions } from "./timesheetExportActions";
import { TimesheetStart } from "./timesheetStart";
import { TimesheetTable } from "./timesheetTable";

/**
 * View component for the timesheet app as a whole
 */
export class TimesheetApp extends Component {
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

	/** Callback to save the timekeep */
	handleSaveTimekeep: (value: Timekeep) => Promise<void>;

	/** Wrapper element containing the component content */
	#wrapperEl: HTMLElement | undefined;

	constructor(
		containerEl: HTMLElement,
		app: App,
		timekeep: Store<Timekeep>,
		settings: Store<TimekeepSettings>,
		customOutputFormats: Store<Record<string, CustomOutputFormat>>,
		autocomplete: TimekeepAutocomplete,
		handleSaveTimekeep: (value: Timekeep) => Promise<void>
	) {
		super();

		this.#containerEl = containerEl;

		this.app = app;
		this.timekeep = timekeep;
		this.settings = settings;
		this.customOutputFormats = customOutputFormats;
		this.autocomplete = autocomplete;

		this.handleSaveTimekeep = handleSaveTimekeep;
	}

	onunload(): void {
		super.onunload();
		this.#wrapperEl?.remove();
	}

	onload(): void {
		super.onload();

		const wrapperEl = this.#containerEl.createDiv({
			cls: "timekeep-container",
		});

		this.#wrapperEl = wrapperEl;

		const counters = new TimesheetCounters(wrapperEl, this.settings, this.timekeep);

		const start = new TimesheetStart(
			wrapperEl,
			this.app,
			this.timekeep,
			this.settings,
			this.autocomplete
		);

		const table = new TimesheetTable(wrapperEl, this.app, this.timekeep, this.settings);

		const exportActions = new TimesheetExportActions(
			wrapperEl,
			this.app,
			this.timekeep,
			this.settings,
			this.customOutputFormats
		);

		this.addChild(counters);
		this.addChild(start);
		this.addChild(table);
		this.addChild(exportActions);
	}
}
