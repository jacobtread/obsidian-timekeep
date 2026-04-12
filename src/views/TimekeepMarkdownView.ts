import type { App } from "obsidian";
import type { MarkdownPostProcessorContext } from "obsidian";

import { MarkdownRenderChild } from "obsidian";

import type { CustomOutputFormat } from "@/output";
import type { TimekeepSettings } from "@/settings";

import { TimesheetMarkdownSaveAdapter } from "@/save/TimesheetMarkdownSaveAdapter";
import { type Store, createStore } from "@/store";
import { EditorScrollTracker } from "@/utils/editorScrollTracker";

import TimekeepView from "./TimekeepView";

import { type LoadResult, load } from "@/timekeep/parser";

import { TimekeepAutocomplete } from "@/service/autocomplete";

export default class TimekeepMarkdownView extends MarkdownRenderChild {
	/** Obsidian app instance */
	app: App;
	/** Timekeep settings store */
	settings: Store<TimekeepSettings>;
	/** Custom output formats store */
	customOutputFormats: Store<Record<string, CustomOutputFormat>>;
	/** Autocomplete */
	autocomplete: TimekeepAutocomplete;

	/** Timekeep load result */
	loadResult: Store<LoadResult | null>;
	/** The timekeep view */
	timesheet: TimekeepView | undefined;

	/** Scroll tracking for restoring scroll after save */
	scrollTracker: EditorScrollTracker;

	/** Adapter for how the timesheet should be saved */
	saveAdapter: TimesheetMarkdownSaveAdapter;

	constructor(
		containerEl: HTMLElement,
		app: App,
		settings: Store<TimekeepSettings>,
		customOutputFormats: Store<Record<string, CustomOutputFormat>>,
		autocomplete: TimekeepAutocomplete,
		context: MarkdownPostProcessorContext,
		loadResult: LoadResult | null
	) {
		super(containerEl);
		this.app = app;
		this.settings = settings;
		this.customOutputFormats = customOutputFormats;
		this.autocomplete = autocomplete;

		this.loadResult = createStore(loadResult);

		this.scrollTracker = new EditorScrollTracker(app);
		this.saveAdapter = new TimesheetMarkdownSaveAdapter(this.app.vault, containerEl, context);
	}

	/**
	 * Create a markdown code block processor for this view
	 *
	 * @param app The app to use
	 * @param settingsStore The settings store
	 * @param customOutputFormats The custom output formats store
	 * @param autocomplete The autocomplete store
	 * @returns The markdown post processor factory
	 */
	static markdownPostProcessor(
		app: App,
		settingsStore: Store<TimekeepSettings>,
		customOutputFormats: Store<Record<string, CustomOutputFormat>>,
		autocomplete: TimekeepAutocomplete
	): (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) => void {
		return (source: string, el: HTMLElement, context: MarkdownPostProcessorContext) => {
			const loadResult = load(source);
			context.addChild(
				new TimekeepMarkdownView(
					el,
					app,
					settingsStore,
					customOutputFormats,
					autocomplete,
					context,
					loadResult
				)
			);
		};
	}

	onload(): void {
		super.onload();

		this.timesheet = new TimekeepView(
			this.containerEl,
			this.app,
			this.settings,
			this.customOutputFormats,
			this.autocomplete,
			this.loadResult,
			this.saveAdapter
		);

		// Bind save event handlers to update scroll
		this.timesheet.onBeforeSave = this.scrollTracker.save.bind(this.scrollTracker);
		this.timesheet.onAfterSave = this.scrollTracker.queueRestore.bind(this.scrollTracker);

		this.addChild(this.timesheet);
	}
}
