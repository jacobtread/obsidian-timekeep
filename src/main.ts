import type { Moment } from "moment";
import type { Vault, TFile, PluginManifest, App, TAbstractFile, Menu } from "obsidian";

import { Plugin, TFolder } from "obsidian";

import type { CustomOutputFormat } from "@/output";
import type { Store } from "@/store";

import { defaultSettings, type TimekeepSettings, legacySettingsCompatibility } from "@/settings";
import { TimekeepSettingsTab } from "@/settings-tab";
import { createStore } from "@/store";

import { TimekeepApi } from "./api";

import { TimesheetStatusBar } from "@/components/TimesheetStatusBar";

import TimekeepFileView from "@/views/TimekeepFileView";
import TimekeepMarkdownView from "@/views/TimekeepMarkdownView";

import { createNewTimekeepFile } from "@/timekeep/createNewTimekeepFile";
import type { Timekeep, TimeEntry } from "@/timekeep/schema";

import { TimekeepAutocomplete } from "@/service/autocomplete";
import { TimekeepRegistry } from "@/service/registry";

import createMerged from "@/commands/createMerged";
import exportMergedPdf from "@/commands/exportMergedPdf";
import findRunningTrackers from "@/commands/findRunningTrackers";
import insertTracker from "@/commands/insertTracker";
import newTimekeepFile from "@/commands/newTimekeepFile";
import stopAllTimekeepsCommand from "@/commands/stopAllTimekeeps";
import stopFileTimekeepsCommand from "@/commands/stopFileTimekeeps";

export default class TimekeepPlugin extends Plugin {
	/** Store containing the plugin settings */
	settingsStore: Store<TimekeepSettings> = createStore(defaultSettings);
	/** Store containing custom output formats */
	customOutputFormats: Store<Record<string, CustomOutputFormat>> = createStore({});

	/* Legacy API functions prefer using .api to access these instead */
	replaceTimekeepCodeblock: (
		timekeep: Timekeep,
		content: string,
		lineStart: number,
		lineEnd: number
	) => string;
	extractTimekeepCodeblocks: (value: string) => Timekeep[];
	isKeepRunning: (timekeep: Timekeep) => boolean;
	isEntryRunning: (entry: TimeEntry) => boolean;
	getRunningEntry: (entries: TimeEntry[]) => TimeEntry | null;
	getEntryDuration: (entry: TimeEntry, currentTime: Moment) => number;
	getTotalDuration: (entries: TimeEntry[], currentTime: Moment) => number;
	stopAllTimekeeps: (vault: Vault, currentTime: Moment) => Promise<number>;
	stopFileTimekeeps: (vault: Vault, file: TFile, currentTime: Moment) => Promise<number>;
	registerCustomOutputFormat: (id: string, format: CustomOutputFormat) => void;
	unregisterCustomOutputFormat: (id: string) => void;

	/** API access for plugin consumers */
	api: TimekeepApi;

	/** Registry of all timekeeps within the vault */
	registry: TimekeepRegistry;

	/** Name autocomplete service */
	autocomplete: TimekeepAutocomplete;

	/** Currently loaded status bar view if present */
	#statusBarView: TimesheetStatusBar | null = null;

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest);

		const saveSettings = this.saveData.bind(this);

		const settingsStore = createStore(defaultSettings);
		const customOutputFormats = createStore({});

		// Subscribe to settings changes to save them
		settingsStore.subscribe(() => {
			void saveSettings(settingsStore.getState());
		});

		this.customOutputFormats = customOutputFormats;
		this.settingsStore = settingsStore;

		this.registry = new TimekeepRegistry(app.vault, settingsStore);
		this.autocomplete = new TimekeepAutocomplete(this.registry, settingsStore);

		// Expose new API
		const api = new TimekeepApi(
			settingsStore,
			customOutputFormats,
			this.registry,
			this.autocomplete
		);
		this.api = api;

		// Expose legacy API functions
		this.registerCustomOutputFormat = api.registerCustomOutputFormat.bind(api);
		this.unregisterCustomOutputFormat = api.unregisterCustomOutputFormat.bind(api);
		this.replaceTimekeepCodeblock = api.parser.replaceTimekeepCodeblock;
		this.extractTimekeepCodeblocks = api.parser.extractTimekeepCodeblocks;
		this.isKeepRunning = api.queries.isKeepRunning;
		this.isEntryRunning = api.queries.isEntryRunning;
		this.getRunningEntry = api.queries.getRunningEntry;
		this.getEntryDuration = api.queries.getEntryDuration;
		this.getTotalDuration = api.queries.getTotalDuration;
		this.stopAllTimekeeps = api.stopAllTimekeeps;
		this.stopFileTimekeeps = api.stopFileTimekeeps;
	}

	async onload(): Promise<void> {
		const loadedSettings = await this.loadSettings();
		this.settingsStore.setState(loadedSettings);
		this.addSettingTab(new TimekeepSettingsTab(this.app, this));

		this.addChild(this.autocomplete);

		const onLoadStatusBar = this.onLoadStatusBar.bind(this);
		this.settingsStore.subscribe(onLoadStatusBar);
		onLoadStatusBar();

		// Hook ready event
		this.app.workspace.onLayoutReady(this.onReady.bind(this));

		// Register code block processing
		const codeBlockProcessor = TimekeepMarkdownView.markdownPostProcessor(
			this.app,
			this.settingsStore,
			this.customOutputFormats,
			this.autocomplete
		);
		const markdownPostProcessor = this.registerMarkdownCodeBlockProcessor(
			"timekeep",
			codeBlockProcessor
		);

		// Set high priority sort order
		markdownPostProcessor.sortOrder = -100;

		// Register commands
		this.addCommand(insertTracker());
		this.addCommand(findRunningTrackers(this.app, this.registry, this.settingsStore));
		this.addCommand(createMerged(this.app, this.registry, this.settingsStore));
		this.addCommand(exportMergedPdf(this.app, this.registry, this.settingsStore));
		this.addCommand(stopAllTimekeepsCommand(this.app));
		this.addCommand(stopFileTimekeepsCommand(this.app));
		this.addCommand(newTimekeepFile(this.app));

		// Custom timekeep file format
		this.registerView("timekeep", (leaf) => {
			return new TimekeepFileView(
				leaf,
				this.settingsStore,
				this.customOutputFormats,
				this.autocomplete
			);
		});

		this.registerExtensions(["timekeep"], "timekeep");

		this.app.workspace.on("file-menu", this.onFileMenu.bind(this));
	}

	private onFileMenu(menu: Menu, parent: TAbstractFile) {
		if (!(parent instanceof TFolder)) return;

		const folder = parent;

		menu.addItem((item) => {
			item.setTitle("New Timekeep")
				.setIcon("clock")
				.onClick(async () => {
					await createNewTimekeepFile(this.app, folder);
				});
		});
	}

	private onReady() {
		// Initialize the registry (Only after the layout is ready and the vault is loaded)
		this.addChild(this.registry);
	}

	private async loadSettings(): Promise<TimekeepSettings> {
		const loadedData = await this.loadData();
		const loadedSettings: TimekeepSettings = Object.assign({}, defaultSettings, loadedData);
		legacySettingsCompatibility(loadedSettings);
		return loadedSettings;
	}

	private onLoadStatusBar() {
		if (this.#statusBarView) {
			this.removeChild(this.#statusBarView);
			this.#statusBarView = null;
		}

		const settings = this.settingsStore.getState();
		if (!settings.statusBarEnabled) return;

		const containerEl = this.addStatusBarItem();
		const statusBarView = new TimesheetStatusBar(containerEl, this.app, this.registry);
		this.addChild(statusBarView);
		this.#statusBarView = statusBarView;
	}
}
