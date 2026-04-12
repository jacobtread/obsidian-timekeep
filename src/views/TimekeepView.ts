import moment from "moment";
import { Notice, type App } from "obsidian";

import type { CustomOutputFormat } from "@/output";
import type { TimesheetSaveAdapter } from "@/save/TimesheetSaveAdapter";
import type { TimekeepSettings } from "@/settings";

import { createStore, type Store } from "@/store";

import { ContentComponent } from "@/components/ContentComponent";
import { EmptyComponent } from "@/components/EmptyComponent";
import { Timesheet } from "@/components/Timesheet";
import { TimesheetLoadError } from "@/components/TimesheetLoadError";
import { TimesheetSaveError } from "@/components/TimesheetSaveError";

import type { LoadResult } from "@/timekeep/parser";
import { defaultTimekeep, stripTimekeepRuntimeData, type Timekeep } from "@/timekeep/schema";

import { TimekeepAutocomplete } from "@/service/autocomplete";

export default class TimekeepView extends ContentComponent<
	Timesheet | TimesheetLoadError | TimesheetSaveError | EmptyComponent
> {
	/** Access to the obsidian app */
	app: App;
	/** Access to the timekeep settings */
	settings: Store<TimekeepSettings>;
	/** Access to custom output formats */
	customOutputFormats: Store<Record<string, CustomOutputFormat>>;
	/** Autocomplete */
	autocomplete: TimekeepAutocomplete;

	/** Loading result for the timekeep data */
	loadResult: Store<LoadResult | null>;
	/** Store for the timekeep state */
	timekeep: Store<Timekeep>;
	/** Store for save error state */
	saveError: Store<boolean>;

	/** Adapter for how the timesheet should be saved */
	saveAdapter: TimesheetSaveAdapter;

	onBeforeSave: VoidFunction | undefined;
	onAfterSave: VoidFunction | undefined;

	constructor(
		containerEl: HTMLElement,
		app: App,
		settings: Store<TimekeepSettings>,
		customOutputFormats: Store<Record<string, CustomOutputFormat>>,
		autocomplete: TimekeepAutocomplete,
		loadResult: Store<LoadResult | null>,
		saveAdapter: TimesheetSaveAdapter
	) {
		super(containerEl);

		this.app = app;

		this.loadResult = loadResult;
		this.timekeep = createStore(defaultTimekeep());
		this.saveError = createStore(false);

		this.settings = settings;
		this.customOutputFormats = customOutputFormats;
		this.autocomplete = autocomplete;

		this.saveAdapter = saveAdapter;
	}

	onload(): void {
		super.onload();

		this.saveAdapter.onLoad();

		const onUpdateContent = this.onUpdateContent.bind(this);

		this.register(this.loadResult.subscribe(onUpdateContent));
		this.register(this.saveError.subscribe(onUpdateContent));

		onUpdateContent();
	}

	onunload(): void {
		super.onunload();
		this.saveAdapter.onUnload();
	}

	onUpdateContent() {
		const saveError = this.saveError.getState();
		const loadResult = this.loadResult.getState();

		if (!loadResult) {
			return this.setContent(new EmptyComponent(this.containerEl));
		}

		if (saveError) {
			this.setContent(new TimesheetSaveError(this.containerEl, this.timekeep));
		} else if (loadResult.success) {
			const timekeep = loadResult.timekeep;
			this.timekeep.setState(timekeep);

			this.register(this.timekeep.subscribe(this.onSave.bind(this)));

			this.setContent(
				new Timesheet(
					this.containerEl,
					this.app,
					this.timekeep,
					this.settings,
					this.customOutputFormats,
					this.autocomplete
				)
			);
		} else {
			this.setContent(new TimesheetLoadError(this.containerEl, loadResult.error));
		}
	}

	async onSave() {
		if (this.onBeforeSave) this.onBeforeSave();

		const timekeep = this.timekeep.getState();

		try {
			await this.saveAdapter.onSave(timekeep);

			// Clear error state on success
			if (this.saveError.getState()) {
				this.saveError.setState(false);
			}
		} catch (e) {
			console.error("Failed to save timekeep", e);

			try {
				const fileName = await this.saveFallback(timekeep);
				new Notice(`Failed to save timekeep, backup saved to: ${fileName}`);
			} catch (e) {
				console.error("Couldn't save timekeep fallback", e);
				new Notice("Failed to save timekeep and unable to save fallback file");
			}

			this.saveError.setState(true);
		} finally {
			if (this.onAfterSave) this.onAfterSave();
		}
	}

	/**
	 * Fallback handling if saving the timekeep through the regular
	 * adapter fails:
	 *
	 * Write a backup to a temporary file using the current date and
	 * time in the file name
	 *
	 * @param timekeep The timekeep to save
	 */
	async saveFallback(timekeep: Timekeep) {
		// Fallback in case of write failure, attempt to write to another file
		const backupFileName = `timekeep-write-backup-${moment().format("YYYY-MM-DD HH-mm-ss")}.json`;

		// Write to the backup file
		await this.app.vault.create(
			backupFileName,
			JSON.stringify(stripTimekeepRuntimeData(timekeep))
		);

		return backupFileName;
	}
}
