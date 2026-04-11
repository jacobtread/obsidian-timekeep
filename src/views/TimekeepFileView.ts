import { EditableFileView, TFile, WorkspaceLeaf } from "obsidian";

import { CustomOutputFormat } from "@/output";
import { TimesheetFileSaveAdapter } from "@/save/TimesheetFileSaveAdapter";
import { TimekeepSettings } from "@/settings";
import { createStore, Store } from "@/store";

import TimekeepView from "./TimekeepView";

import { load, LoadResult } from "@/timekeep/parser";

import { TimekeepAutocomplete } from "@/service/autocomplete";

export default class TimekeepFileView extends EditableFileView {
	/** Access to the timekeep settings */
	settings: Store<TimekeepSettings>;
	/** Access to custom output formats */
	customOutputFormats: Store<Record<string, CustomOutputFormat>>;
	/** Autocomplete */
	autocomplete: TimekeepAutocomplete;

	/** Container wrapper element */
	wrapperEl: HTMLElement | undefined;

	/** Loading result for the timekeep data */
	loadResult: Store<LoadResult | null>;
	/** The timekeep view */
	timesheet: TimekeepView | undefined;

	/** Adapter for saving to the file */
	saveAdapter: TimesheetFileSaveAdapter;

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

		this.saveAdapter = new TimesheetFileSaveAdapter(this.app.vault, this.file);
	}

	onload(): void {
		super.onload();

		const wrapperEl = this.contentEl.createDiv({ cls: "timekeep-file" });
		this.wrapperEl = wrapperEl;

		this.timesheet = new TimekeepView(
			wrapperEl,
			this.app,
			this.settings,
			this.customOutputFormats,
			this.autocomplete,
			this.loadResult,
			this.saveAdapter
		);
		this.addChild(this.timesheet);
	}

	getViewType(): string {
		return "timekeep";
	}

	getDisplayText(): string {
		if (this.file) {
			return this.file.basename;
		}

		return "Timekeep";
	}

	async onLoadFile(file: TFile): Promise<void> {
		await super.onLoadFile(file);

		this.saveAdapter.file = file;
		const fileData = await this.app.vault.read(file);
		this.loadResult.setState(load(fileData));
	}
}
