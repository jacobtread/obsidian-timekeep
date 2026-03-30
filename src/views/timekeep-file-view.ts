import moment from "moment";
import { EditableFileView, TFile, WorkspaceLeaf } from "obsidian";

import { Timesheet } from "@/components/timesheet";
import { TimesheetLoadError } from "@/components/timesheetLoadError";
import { CustomOutputFormat } from "@/output";
import { TimekeepAutocomplete } from "@/service/autocomplete";
import { TimekeepSettings } from "@/settings";
import { createStore, Store } from "@/store";
import { load, LoadResult } from "@/timekeep/parser";
import { stripTimekeepRuntimeData, Timekeep } from "@/timekeep/schema";

export class TimekeepFileView extends EditableFileView {
	/** Access to the timekeep settings */
	settings: Store<TimekeepSettings>;
	/** Access to custom output formats */
	customOutputFormats: Store<Record<string, CustomOutputFormat>>;
	/** Autocomplete */
	autocomplete: TimekeepAutocomplete;

	/** Loading result for the timekeep data */
	loadResult: Store<LoadResult | null>;

	wrapperEl: HTMLElement | undefined;

	/** The rendered timesheet component */
	timesheet: Timesheet | TimesheetLoadError | undefined;

	constructor(
		leaf: WorkspaceLeaf,
		settings: Store<TimekeepSettings>,
		customOutputFormats: Store<Record<string, CustomOutputFormat>>,
		autocomplete: TimekeepAutocomplete
	) {
		super(leaf);

		this.loadResult = createStore(null);

		this.settings = settings;
		this.customOutputFormats = customOutputFormats;
		this.autocomplete = autocomplete;
	}

	onload(): void {
		super.onload();

		const wrapperEl = this.contentEl.createDiv({ cls: "timekeep-file" });
		this.wrapperEl = wrapperEl;

		const render = this.render.bind(this);
		const unsubscribeLoadResult = this.loadResult.subscribe(render);
		render();
		this.register(unsubscribeLoadResult);
	}

	render() {
		if (!this.wrapperEl) {
			return;
		}

		const loadResult = this.loadResult.getState();
		if (!loadResult) return;

		if (this.timesheet) {
			this.removeChild(this.timesheet);
		}

		// Render the content
		if (loadResult.success) {
			const timekeep = loadResult.timekeep;

			const timekeepStore = createStore(timekeep);
			const saveErrorStore = createStore(false);

			const trySave = this.trySave.bind(this);

			const handleSaveTimekeep = async (timekeep: Timekeep) => {
				// Attempt to save the timekeep changes
				const result = await trySave(timekeep);

				const saveError = !result;

				// Update the save error state
				if (saveErrorStore.getState() !== saveError) {
					saveErrorStore.setState(saveError);
				}
			};

			// Subscribe to save when timekeep changes
			timekeepStore.subscribe(() => {
				void handleSaveTimekeep(timekeepStore.getState());
			});

			const timesheet = new Timesheet(
				this.wrapperEl,
				this.app,
				timekeepStore,
				saveErrorStore,
				this.settings,
				this.customOutputFormats,
				this.autocomplete,
				handleSaveTimekeep
			);

			this.addChild(timesheet);
			this.timesheet = timesheet;
		} else {
			const timesheet = new TimesheetLoadError(this.wrapperEl, loadResult.error);
			this.addChild(timesheet);
			this.timesheet = timesheet;
		}
	}

	getViewType(): string {
		return "timekeep";
	}

	getDisplayText(): string {
		return "Timekeep";
	}

	async onLoadFile(file: TFile): Promise<void> {
		await super.onLoadFile(file);

		const fileData = await this.app.vault.read(file);
		this.loadResult.setState(load(fileData));
	}

	async onUnloadFile(file: TFile): Promise<void> {
		await super.onUnloadFile(file);
	}

	/**
	 * Attempts to save the file normally, if this fails it also attempts
	 * to save a fallback file
	 *
	 * @param timekeep
	 * @returns Promise of a boolean indicating weather the save was a success
	 */
	async trySave(timekeep: Timekeep): Promise<boolean> {
		try {
			await this.save(timekeep);

			return true;
		} catch (e) {
			console.error("Failed to save timekeep", e);

			try {
				await this.saveFallback(timekeep);
			} catch (e) {
				console.error("Couldn't save timekeep fallback", e);
			}

			return false;
		}
	}

	/**
	 * Attempts to save the timekeep within the current file
	 *
	 * @param timekeep The new timekeep data to save
	 */
	async save(timekeep: Timekeep) {
		if (this.file === null) {
			return;
		}

		try {
			const stripped = stripTimekeepRuntimeData(timekeep);
			const serialized = JSON.stringify(stripped);

			await this.app.vault.modify(this.file, serialized);
		} catch (error) {
			console.error("failed to save file", error);
		}
	}

	/**
	 * Fallback saving in case writing back to the timekeep block fails,
	 * if writing back fails attempt to write to a backup temporary file
	 * using the current date time
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
	}
}
